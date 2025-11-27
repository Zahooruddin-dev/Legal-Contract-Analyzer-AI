import React, { useState, useRef } from 'react';
import LegalAnalyzerView from './LegalAnalyzerView';

const LegalAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setError('');
    setFile(uploadedFile);

    if (uploadedFile.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target.result);
      reader.readAsText(uploadedFile);
    } else {
      // Fallback for non-txt files (e.g., PDF placeholders)
      setText(`[${uploadedFile.type}] uploaded. Click "Analyze Contract" to attempt processing.`);
    }
  };

  const analyzeContract = async () => {
    if (!text && !file) {
      setError('Please upload a document or paste text first.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      let documentContent = text;

      // If no text in textarea and file exists, read the file explicitly
      if (!documentContent && file) {
        const fileReader = new FileReader();
        documentContent = await new Promise((resolve, reject) => {
          fileReader.onload = (e) => resolve(e.target.result);
          fileReader.onerror = reject;
          fileReader.readAsText(file);
        });
      }

      // YOUR CLOUDFLARE WORKER URL
      const WORKER_URL = import.meta.env.VITE_ENV_WORKER_URL;

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_tokens: 4000,
          temperature: 0.2,
          top_p: 0.8,
          messages: [
            {
              role: 'user',
              content: `You are an expert legal analyst. Analyze the following contract/legal document and provide a comprehensive analysis in JSON format with these sections:

1. summary: Brief overview of the document (string)
2. documentType: Type of legal document (string)
3. parties: Array of parties involved (strings or objects with name/role)
4. keyTerms: Array of important terms (strings)
5. obligations: Array of obligations (strings or objects with party/obligations)
6. risks: Array of potential risks (strings)
7. recommendations: Array of recommendations (strings)
8. expiryDate: Expiration date or "N/A" (string)
9. jurisdiction: Jurisdiction or "Unknown" (string)

Document to analyze:

${documentContent}

Respond ONLY with valid JSON. No markdown.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      let analysisText = data.choices?.[0]?.message?.content || '';
      if (!analysisText) throw new Error('No content in response');
      
      // Clean up markdown if AI adds it despite instructions
      analysisText = analysisText.replace(/```json|```/g, '').trim();
      
      const parsedAnalysis = JSON.parse(analysisText);
      setAnalysis(parsedAnalysis);
      setActiveTab('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;
    const dataStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `legal-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setFile(null);
    setText('');
    setAnalysis(null);
    setError('');
    setActiveTab('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Pass everything to the View
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
    />
  );
};

export default LegalAnalyzer;