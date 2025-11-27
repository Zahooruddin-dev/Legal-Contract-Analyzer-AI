import React from 'react';
import { 
  FileText, Upload, AlertTriangle, CheckCircle, 
  XCircle, Brain, Loader2, Download, Trash2, 
  ShieldAlert, Scale, Calendar, Globe, MessageSquare, Eye 
} from 'lucide-react';
import ChatInterface from './ChatInterface';

// --- Safe Render Helper ---
const SafeRender = ({ data }) => {
  if (!data) return null;
  if (typeof data === 'string') return <span>{data}</span>;
  if (typeof data === 'object') {
    return (
      <div className="flex flex-col gap-1">
        {data.party && <span className="text-xs font-bold uppercase tracking-wider opacity-70 text-blue-300">{data.party}</span>}
        {data.name && <span className="font-semibold">{data.name}</span>}
        {data.role && <span className="text-xs italic opacity-80">({data.role})</span>}
        {data.obligations && (
          Array.isArray(data.obligations) ? (
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300">
              {data.obligations.map((obs, i) => <li key={i}>{obs}</li>)}
            </ul>
          ) : <p>{data.obligations}</p>
        )}
      </div>
    );
  }
  return null;
};

// --- Main View ---
const LegalAnalyzerView = ({
  file,
  text,
  setText,
  analysis,
  loading,
  error,
  activeTab,
  setActiveTab,
  fileInputRef,
  handleFileUpload,
  analyzeContract,
  resetAnalysis,
  exportAnalysis,
  chatHistory,
  handleChatSubmit,
  chatLoading
}) => {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200 font-sans">
      
      {/* Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Legal<span className="text-blue-500">Mind</span> Pro</span>
          </div>
          {analysis && (
            <button onClick={resetAnalysis} className="text-sm text-slate-400 hover:text-white flex items-center transition-colors">
              <Trash2 className="w-4 h-4 mr-2" /> Start Over
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Interface */}
        <main className="grid grid-cols-1 gap-8">
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-1 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 w-full md:w-fit">
            {[
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'results', label: 'Analysis', icon: Brain, disabled: !analysis },
              { id: 'chat', label: 'AI Assistant', icon: MessageSquare, disabled: !analysis }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-3">Upload Contract</h2>
                  <p className="text-slate-400">Supported formats: PDF, TXT (OCR enabled)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* File Drop */}
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-64 border-2 border-dashed border-slate-700 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 rounded-2xl transition-all flex flex-col items-center justify-center text-center p-6">
                      <div className="p-4 rounded-full bg-slate-800 group-hover:scale-110 transition-transform mb-4 shadow-lg">
                        <Upload className="w-8 h-8 text-blue-400" />
                      </div>
                      {file ? (
                        <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-full border border-green-500/20 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-200 font-medium">Drag & drop or click</p>
                          <p className="text-xs text-slate-500 mt-2">Maximum file size: 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Paste */}
                  <div className="flex flex-col h-64">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Or paste contract text here..."
                      className="flex-1 bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-200">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  onClick={analyzeContract}
                  disabled={loading || (!text && !file)}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing Document...</>
                  ) : (
                    <><Brain className="w-5 h-5 mr-2" /> Analyze Contract</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Left Column: Summary & Stats */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Executive Summary</h3>
                    <span className="text-xs bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20">
                      {analysis.documentType || 'Legal Document'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Risks - High Priority */}
                <div className="bg-red-900/5 border border-red-500/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-red-100 mb-4 flex items-center">
                    <ShieldAlert className="w-5 h-5 mr-2 text-red-400" />
                    Critical Risks
                  </h3>
                  <div className="space-y-3">
                    {analysis.risks?.map((risk, i) => (
                      <div key={i} className="flex gap-3 bg-red-900/10 p-3 rounded-lg border border-red-500/10">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-red-100 text-sm"><SafeRender data={risk} /></span>
                      </div>
                    ))}
                    {!analysis.risks?.length && <p className="text-slate-500 italic">No critical risks detected.</p>}
                  </div>
                </div>

                {/* Obligations */}
                <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-amber-400" />
                    Obligations
                  </h3>
                  <div className="grid gap-3">
                    {analysis.obligations?.map((obs, i) => (
                      <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                        <SafeRender data={obs} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Metadata & Details */}
              <div className="space-y-6">
                 {/* Quick Actions */}
                 <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
                  <button onClick={exportAnalysis} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg flex items-center justify-center transition-colors">
                    <Download className="w-4 h-4 mr-2" /> Export Report
                  </button>
                </div>

                {/* Key Terms */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Key Terms</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyTerms?.map((term, i) => (
                      <span key={i} className="bg-slate-900/80 text-blue-200 text-xs px-3 py-1.5 rounded-md border border-slate-700">
                        <SafeRender data={term} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Jurisdiction</p>
                    <div className="flex items-center text-slate-200 mt-1">
                      <Globe className="w-4 h-4 mr-2 text-blue-400" />
                      {analysis.jurisdiction || 'Not Specified'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Expiry</p>
                    <div className="flex items-center text-slate-200 mt-1">
                      <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                      {analysis.expiryDate || 'Not Specified'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[600px]">
              {/* Chat Interface */}
              <div className="lg:col-span-2">
                <ChatInterface 
                  chatHistory={chatHistory} 
                  onSendMessage={handleChatSubmit} 
                  loading={chatLoading} 
                />
              </div>

              {/* Document Reference Preview */}
              <div className="hidden lg:block bg-slate-900/30 border border-slate-800 rounded-xl p-4 overflow-hidden flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                   <Eye className="w-4 h-4 text-blue-400" />
                   <h3 className="font-semibold text-slate-300">Document Context</h3>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <p className="text-xs text-slate-500 font-mono whitespace-pre-wrap leading-relaxed">
                     {text}
                   </p>
                 </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default LegalAnalyzerView;