import React, { useState, useRef } from 'react';
import LegalAnalyzerView from './LegalAnalyzerView';
import { extractTextFromPDF } from '../utils/pdfUtils';

const LegalAnalyzer = () => {
  // State
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  
  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Use Environment Variable
  const WORKER_URL = import.meta.env.VITE_ENV_WORKER_URL;

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setError('');
    setFile(uploadedFile);
    setLoading(true);

    try {
      if (uploadedFile.type === 'application/pdf') {
        const extractedText = await extractTextFromPDF(uploadedFile);
        setText(extractedText);
      } else if (uploadedFile.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setText(e.target.result);
        reader.readAsText(uploadedFile);
      } else {
        setError('Unsupported file format. Please upload PDF or TXT.');
      }
    } catch (err) {
      setError('Error reading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeContract = async () => {
    if (!text) {
      setError('No document content found.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: `Analyze this legal document and return valid JSON (no markdown) with these keys: summary, documentType, parties, keyTerms, obligations, risks, recommendations, expiryDate, jurisdiction. \n\nDocument:\n${text}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      content = content.replace(/```json|```/g, '').trim();
      
      setAnalysis(JSON.parse(content));
      setActiveTab('results');
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please check the console or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (userMessage) => {
    if (!text) {
      setChatHistory(prev => [...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: "Please upload a legal document first before asking questions." }
      ]);
      return;
    }

    setChatLoading(true);
    
    // Optimistically add user message
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);

    try {
      // Enhanced system prompt with context
      const systemPrompt = `You are an expert legal assistant specializing in contract analysis. Your role is to help users understand their legal documents by answering questions clearly and professionally.

IMPORTANT INSTRUCTIONS:
- Answer based SPECIFICALLY on the contract text provided below
- Use markdown formatting for better readability (bold, lists, headings)
- Be precise and cite specific clauses when relevant
- If information isn't in the contract, clearly state that
- Use professional but accessible language
- Break down complex legal terms into simple explanations
- When listing items, use bullet points or numbered lists
- Highlight key terms and important phrases in **bold**

${analysis ? `ANALYZED DOCUMENT SUMMARY:
- Document Type: ${analysis.documentType || 'Not specified'}
- Parties: ${analysis.parties?.join(', ') || 'Not identified'}
- Key Terms: ${analysis.keyTerms?.map(t => `${t.term}: ${t.definition}`).join('; ') || 'None'}
- Jurisdiction: ${analysis.jurisdiction || 'Not specified'}

` : ''}CONTRACT TEXT:
${text.substring(0, 8000)}${text.length > 8000 ? '...(truncated)' : ''}

Answer the user's question about this contract:`;

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 1500,
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemPrompt },
            ...newHistory.map(msg => ({ role: msg.role, content: msg.content }))
          ]
        })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content || "I couldn't process that request.";

      setChatHistory(prev => [...prev, { role: 'assistant', content: botReply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error connecting to the AI. Please try again." 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-analysis.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setFile(null);
    setText('');
    setAnalysis(null);
    setChatHistory([]);
    setActiveTab('upload');
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
    />
  );
};

export default LegalAnalyzer;