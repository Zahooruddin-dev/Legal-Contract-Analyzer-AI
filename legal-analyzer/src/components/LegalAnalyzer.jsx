import React, { useState, useRef } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, XCircle, Brain, Loader2, Download, Trash2 } from 'lucide-react';

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
    } else if (uploadedFile.type === 'application/pdf') {
      setText('PDF file uploaded. Click "Analyze Contract" to process.');
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

      if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const base64Data = await base64Promise;

        const pdfResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'document',
                    source: {
                      type: 'base64',
                      media_type: 'application/pdf',
                      data: base64Data
                    }
                  },
                  {
                    type: 'text',
                    text: 'Extract all text from this PDF document.'
                  }
                ]
              }
            ]
          })
        });

        if (!pdfResponse.ok) {
          throw new Error(`PDF extraction failed: ${pdfResponse.status}`);
        }

        const pdfData = await pdfResponse.json();
        documentContent = pdfData.content[0].text;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `You are an expert legal analyst. Analyze the following contract/legal document and provide a comprehensive analysis in JSON format with these sections:

1. summary: Brief overview of the document
2. documentType: Type of legal document
3. parties: Array of parties involved
4. keyTerms: Array of important terms and conditions
5. obligations: Array of obligations for each party
6. risks: Array of potential risks or red flags
7. recommendations: Array of recommendations
8. expiryDate: Contract expiration date if mentioned
9. jurisdiction: Legal jurisdiction if mentioned

Document to analyze:

${documentContent}

Respond ONLY with valid JSON, no markdown formatting or backticks.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let analysisText = data.content[0].text;
      
      analysisText = analysisText.replace(/```json|```/g, '').trim();
      
      const parsedAnalysis = JSON.parse(analysisText);
      setAnalysis(parsedAnalysis);
      setActiveTab('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Analysis failed: ${err.message}`);
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
    link.download = `contract-analysis-${Date.now()}.json`;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">AI Legal Analyzer</h1>
          </div>
          <p className="text-blue-200">Powered by Claude AI - Analyze contracts and legal documents instantly</p>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg mb-6 p-1 flex gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-slate-700/50'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Document
          </button>
          <button
            onClick={() => setActiveTab('results')}
            disabled={!analysis}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              activeTab === 'results' && analysis
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Analysis Results
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <div className="mb-6">
              <label className="block text-blue-200 font-medium mb-3">Upload Contract (PDF or TXT)</label>
              <div className="border-2 border-dashed border-blue-500/50 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-200 mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-blue-300/70">PDF or TXT files only</p>
                </label>
                {file && (
                  <div className="mt-4 flex items-center justify-center text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-blue-200 font-medium mb-3">Or Paste Contract Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your contract or legal document text here..."
                className="w-full h-64 bg-slate-900/50 border border-blue-500/30 rounded-lg p-4 text-white placeholder-blue-300/50 focus:border-blue-400 focus:outline-none resize-none"
              />
            </div>

            {error && (
              <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={analyzeContract}
                disabled={loading || (!text && !file)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Analyze Contract
                  </>
                )}
              </button>
              {(file || text || analysis) && (
                <button
                  onClick={resetAnalysis}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Reset
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && analysis && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={exportAnalysis}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </button>
            </div>

            {/* Summary */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-400" />
                Summary
              </h2>
              <p className="text-blue-100 leading-relaxed">{analysis.summary}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded p-3">
                  <p className="text-blue-300 text-sm">Document Type</p>
                  <p className="text-white font-semibold">{analysis.documentType}</p>
                </div>
                {analysis.jurisdiction && (
                  <div className="bg-slate-900/50 rounded p-3">
                    <p className="text-blue-300 text-sm">Jurisdiction</p>
                    <p className="text-white font-semibold">{analysis.jurisdiction}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Parties */}
            {analysis.parties && analysis.parties.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Parties Involved</h2>
                <div className="space-y-2">
                  {analysis.parties.map((party, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded p-3 text-blue-100">
                      {party}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms */}
            {analysis.keyTerms && analysis.keyTerms.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Key Terms & Conditions</h2>
                <div className="space-y-3">
                  {analysis.keyTerms.map((term, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded p-4 flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-100">{term}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Obligations */}
            {analysis.obligations && analysis.obligations.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Obligations</h2>
                <div className="space-y-3">
                  {analysis.obligations.map((obligation, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded p-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-100">{obligation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {analysis.risks && analysis.risks.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl border-2 border-red-500/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <XCircle className="w-6 h-6 mr-2 text-red-400" />
                  Potential Risks & Red Flags
                </h2>
                <div className="space-y-3">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className="bg-red-900/20 border border-red-500/30 rounded p-4 flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-red-100">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4">Recommendations</h2>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-slate-900/50 rounded p-4 flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-100">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalAnalyzer;