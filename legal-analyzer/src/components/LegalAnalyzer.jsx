// src/components/LegalAnalyzer.jsx
import React, { useState, useRef, useEffect } from 'react';
import LegalAnalyzerView from './LegalAnalyzerView';
import { extractTextFromPDF } from '../utils/pdfUtils';

const LegalAnalyzer = () => {
  // === Session Management ===
  const getSessionId = () => {
    let id = localStorage.getItem('legal_session_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('legal_session_id', id);
    }
    return id;
  };
  const sessionId = getSessionId();

  // === State ===
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [documentId, setDocumentId] = useState(null); // NEW: track current doc
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef(null);

  // === Backend URL ===
  const API_URL = 'https://legal-backend.mzkhan886.workers.dev';

  // === Load existing session on mount ===
  useEffect(() => {
    const loadSession = async () => {
      const savedDocId = localStorage.getItem('current_document_id');
      if (savedDocId) {
        setDocumentId(savedDocId);

        // Load document text
        try {
          const docRes = await fetch(`${API_URL}/document/${savedDocId}?session_id=${sessionId}`);
          if (docRes.ok) {
            const doc = await docRes.json();
            setText(doc.text);
          }

          // Load analysis
          const analysisRes = await fetch(`${API_URL}/analysis/${savedDocId}?session_id=${sessionId}`);
          if (analysisRes.ok) {
            const ana = await analysisRes.json();
            setAnalysis(ana.json_); // your backend returns json_
          }

          // Load chat
          const chatRes = await fetch(`${API_URL}/chat/${savedDocId}?session_id=${sessionId}`);
          if (chatRes.ok) {
            const history = await chatRes.json();
            setChatHistory(history);
          }

          setActiveTab('chat'); // or 'results'
        } catch (err) {
          console.error('Failed to load session', err);
        }
      }
    };

    loadSession();
  }, []);

  // === File Upload ===
  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setError('');
    setFile(uploadedFile);
    setLoading(true);

    try {
      let extractedText = '';
      if (uploadedFile.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(uploadedFile);
      } else if (uploadedFile.type === 'text/plain') {
        const reader = new FileReader();
        const result = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsText(uploadedFile);
        });
        extractedText = result;
      } else {
        setError('Unsupported file format. Please upload PDF or TXT.');
        return;
      }

      setText(extractedText);

      // ✅ Save to backend
      const uploadRes = await fetch(`${API_URL}/upload-document?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          file_name: uploadedFile.name,
          file_type: uploadedFile.type,
        }),
      });

      if (!uploadRes.ok) throw new Error('Failed to save document');
      const { document_id } = await uploadRes.json();
      setDocumentId(document_id);
      localStorage.setItem('current_document_id', document_id);

    } catch (err) {
      setError('Error reading or saving file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Analyze Document ===
  const analyzeContract = async () => {
    if (!text || !documentId) {
      setError('No document to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      // Simulate your existing AI call (you can keep this as-is)
      const aiRes = await fetch(import.meta.env.VITE_ENV_WORKER_URL || 'https://api.cloudflare.com/client/v4/accounts/.../ai/run/@cf/meta/llama-3.1-8b-instruct', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer YOUR_API_TOKEN', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          temperature: 0.2,
          messages: [{
            role: 'user',
            content: `Analyze this legal document and return valid JSON (no markdown) with these keys: summary, documentType, parties, keyTerms, obligations, risks, recommendations, expiryDate, jurisdiction.\n\nDocument:\n${text}`
          }]
        })
      });

      if (!aiRes.ok) throw new Error(`AI Error: ${aiRes.status}`);
      const data = await aiRes.json();
      let content = data.choices?.[0]?.message?.content || '';
      content = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(content);
      setAnalysis(parsed);

      // ✅ Save analysis to backend
      await fetch(`${API_URL}/analyze?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, analysis: parsed }),
      });

      setActiveTab('results');

    } catch (err) {
      console.error(err);
      setError('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Chat Submit ===
  const handleChatSubmit = async (userMessage) => {
    if (!text || !documentId) {
      setChatHistory(prev => [...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "Please upload and analyze a document first." }
      ]);
      return;
    }

    setChatLoading(true);
    const newUserMsg = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newUserMsg]);

    // ✅ Save user message
    await fetch(`${API_URL}/chat?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, role: 'user', content: userMessage }),
    });

    try {
      const systemPrompt = `You are an expert legal assistant... (keep your existing prompt)`;

      const aiRes = await fetch(import.meta.env.VITE_ENV_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 1500,
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!aiRes.ok) throw new Error(`AI Error: ${aiRes.status}`);
      const data = await aiRes.json();
      const botReply = data.choices?.[0]?.message?.content || "I couldn't process that request.";

      const newBotMsg = { role: 'assistant', content: botReply };
      setChatHistory(prev => [...prev, newBotMsg]);

      // ✅ Save AI reply
      await fetch(`${API_URL}/chat?session_id=${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId, role: 'assistant', content: botReply }),
      });

    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = { role: 'assistant', content: "Sorry, I had an issue. Please try again." };
      setChatHistory(prev => [...prev, errorMsg]);
      // Still save error? Optional.
    } finally {
      setChatLoading(false);
    }
  };

  // === Regenerate ===
  const onRegenerate = async (messageIndex) => {
    if (!chatHistory || messageIndex < 0 || messageIndex >= chatHistory.length) return;

    const userMsgIndex = messageIndex - 1;
    const userMsg = chatHistory[userMsgIndex];
    if (!userMsg || userMsg.role !== 'user') return;

    // Remove AI message
    const newHistory = [...chatHistory];
    newHistory.splice(messageIndex, 1);
    setChatHistory(newHistory);

    // Re-run with same user message
    await handleChatSubmit(userMsg.content);
  };

  // === Favorites ===
  const saveFavorite = async (query) => {
    await fetch(`${API_URL}/favorite?session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    // Optional: refetch favorites in LegalAnalyzerView
  };

  const loadFavorites = async () => {
    const res = await fetch(`${API_URL}/favorites?session_id=${sessionId}`);
    const favs = await res.json();
    return favs;
  };

  // === Other Handlers (unchanged) ===
  const onCitationClick = (start, end) => {
    console.log(`Citation clicked: ${start}-${end}`);
  };

  const onHighlightCitation = (start, end) => {
    console.log(`Highlighting: ${start}-${end}`);
  };

  const exportAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-analysis-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setFile(null);
    setText('');
    setAnalysis(null);
    setChatHistory([]);
    setDocumentId(null);
    setActiveTab('upload');
    localStorage.removeItem('current_document_id');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <LegalAnalyzerView
      file={file}
      text={text}
      setText={setText}
      analysis={analysis}
      loading={loading}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      fileInputRef={fileInputRef}
      handleFileUpload={handleFileUpload}
      analyzeContract={analyzeContract}
      resetAnalysis={resetAnalysis}
      exportAnalysis={exportAnalysis}
      chatHistory={chatHistory}
      handleChatSubmit={handleChatSubmit}
      chatLoading={chatLoading}
      onRegenerate={onRegenerate}
      onCitationClick={onCitationClick}
      onHighlightCitation={onHighlightCitation}
      // NEW: pass session-aware functions
      saveFavorite={saveFavorite}
      loadFavorites={loadFavorites}
      sessionId={sessionId}
    />
  );
};

export default LegalAnalyzer;