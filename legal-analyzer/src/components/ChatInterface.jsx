import React, { useState } from 'react';
import { 
  FileText, Upload, AlertTriangle, CheckCircle, 
  XCircle, Brain, Loader2, Download, Trash2, 
  ShieldAlert, Scale, Calendar, Globe, MessageSquare, Eye,
  TrendingUp, AlertCircle, Users, Clock, ChevronRight,
  Zap, Shield, DollarSign, FileCheck, Sparkles
} from 'lucide-react';

// Enhanced ChatInterface component (inline for demo)
const ChatInterface = ({ chatHistory, onSendMessage, loading }) => {
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const [copiedIdx, setCopiedIdx] = React.useState(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = () => {
    const msg = inputRef.current.value.trim();
    if (!msg || loading) return;
    onSendMessage(msg);
    inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative p-5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">AI Legal Assistant</h3>
            <p className="text-xs text-slate-400">Powered by advanced analysis</p>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="text-center mt-12 space-y-4">
            <Brain className="w-16 h-16 mx-auto text-blue-400/60" />
            <p className="text-slate-400">Ask me anything about your document</p>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">🤖</div>
            <div className="bg-slate-800 p-4 rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            </div>
          </div>
        )}
      </div>
      <div className="p-5 bg-slate-900/80 border-t border-slate-700/50">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            placeholder="Ask about clauses, obligations, risks..."
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1 bg-slate-800 border border-slate-700 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Safe Render Helper
const SafeRender = ({ data }) => {
  if (!data) return null;
  if (typeof data === 'string') return <span>{data}</span>;
  if (typeof data === 'object') {
    return (
      <div className="space-y-1">
        {data.party && <span className="text-xs font-bold text-blue-300">{data.party}</span>}
        {data.name && <span className="font-semibold">{data.name}</span>}
        {data.role && <span className="text-xs italic opacity-80">({data.role})</span>}
        {data.obligations && Array.isArray(data.obligations) && (
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {data.obligations.map((ob, i) => <li key={i}>{ob}</li>)}
          </ul>
        )}
      </div>
    );
  }
  return null;
};

// Main Component
const LegalAnalyzerView = ({
  file, text, setText, analysis, loading, error,
  activeTab, setActiveTab, fileInputRef, handleFileUpload,
  analyzeContract, resetAnalysis, exportAnalysis,
  chatHistory, handleChatSubmit, chatLoading
}) => {
  const [hoveredRisk, setHoveredRisk] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200">
      
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/50 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <div className="relative p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-2xl">
                <Scale className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                Legal<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Mind</span> Pro
              </span>
              <p className="text-xs text-slate-500 mt-0.5">AI-Powered Contract Analysis</p>
            </div>
          </div>
          {analysis && (
            <button 
              onClick={resetAnalysis}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all flex items-center gap-2 border border-slate-700/50"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">New Analysis</span>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Enhanced Tab Navigation */}
        <div className="flex gap-3 mb-10 bg-slate-900/60 backdrop-blur-lg p-2 rounded-2xl border border-slate-800/50 w-fit">
          {[
            { id: 'upload', label: 'Upload', icon: Upload, desc: 'Add document' },
            { id: 'results', label: 'Analysis', icon: Brain, desc: 'View insights', disabled: !analysis },
            { id: 'chat', label: 'AI Chat', icon: MessageSquare, desc: 'Ask questions', disabled: !analysis }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`group relative px-6 py-3.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-900/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 disabled:opacity-30'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-bold">{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-3xl p-10 shadow-2xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="text-center mb-12">
                  <div className="inline-block p-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl mb-4">
                    <FileText className="w-12 h-12 text-blue-400" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-3">Upload Your Contract</h2>
                  <p className="text-slate-400 text-lg">Instant AI-powered analysis • PDF & TXT supported • Secure & confidential</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* File Upload Zone */}
                  <div className="relative group cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-80 border-2 border-dashed border-slate-600 group-hover:border-blue-500/70 bg-slate-800/30 group-hover:bg-blue-500/5 rounded-2xl transition-all flex flex-col items-center justify-center p-8">
                      <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-xl">
                        <Upload className="w-10 h-10 text-blue-400" />
                      </div>
                      {file ? (
                        <div className="text-center space-y-3">
                          <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 font-medium">{file.name}</span>
                          </div>
                          <p className="text-xs text-slate-500">Click to replace</p>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <p className="text-white font-semibold text-lg">Drop file here</p>
                          <p className="text-slate-400">or click to browse</p>
                          <p className="text-xs text-slate-500 mt-4">Max 10MB • PDF or TXT</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Paste Area */}
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-400" />
                      Or paste contract text
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your contract text here for instant analysis..."
                      className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 text-slate-200 resize-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 mb-6">
                    <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-semibold mb-1">Analysis Error</p>
                      <p className="text-red-200/80 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={analyzeContract}
                  disabled={loading || (!text && !file)}
                  className="relative w-full group overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-2xl transition-all shadow-2xl shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-lg">Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        <span className="text-lg">Analyze Contract with AI</span>
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && analysis && (
          <div className="space-y-8">
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Risk Level', value: analysis.risks?.length || 0, icon: ShieldAlert, color: 'red', unit: 'risks' },
                { label: 'Obligations', value: analysis.obligations?.length || 0, icon: Scale, color: 'amber', unit: 'items' },
                { label: 'Key Terms', value: analysis.keyTerms?.length || 0, icon: FileCheck, color: 'blue', unit: 'terms' },
                { label: 'Doc Type', value: analysis.documentType?.split(' ')[0] || 'Contract', icon: FileText, color: 'purple', unit: '' }
              ].map((stat, i) => (
                <div key={i} className="relative group bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white mb-1">{stat.value} {stat.unit}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl">
                        <Brain className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Executive Summary</h3>
                        <p className="text-xs text-slate-500">AI-generated overview</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 rounded-xl border border-blue-500/20 text-sm font-semibold">
                      {analysis.documentType || 'Legal Document'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-lg">{analysis.summary}</p>
                </div>

                {/* Critical Risks */}
                <div className="bg-gradient-to-br from-red-950/30 to-red-900/10 border border-red-500/20 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-500/20 rounded-xl">
                      <ShieldAlert className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-red-100">Critical Risks</h3>
                      <p className="text-xs text-red-300/60">Requires immediate attention</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {analysis.risks?.map((risk, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredRisk(i)}
                        onMouseLeave={() => setHoveredRisk(null)}
                        className={`group relative flex gap-4 p-5 bg-red-900/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all cursor-pointer ${
                          hoveredRisk === i ? 'scale-[1.02] shadow-lg shadow-red-900/20' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 p-2 bg-red-500/20 rounded-lg h-fit">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-red-300/80 uppercase tracking-wider">Risk #{i + 1}</span>
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-semibold">High</span>
                          </div>
                          <div className="text-red-100"><SafeRender data={risk} /></div>
                        </div>
                      </div>
                    ))}
                    {!analysis.risks?.length && (
                      <div className="text-center py-8 text-slate-500 italic">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        No critical risks detected
                      </div>
                    )}
                  </div>
                </div>

                {/* Obligations */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <Scale className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Party Obligations</h3>
                      <p className="text-xs text-slate-500">Binding requirements</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {analysis.obligations?.map((obs, i) => (
                      <div key={i} className="p-5 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all">
                        <SafeRender data={obs} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-300 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={exportAnalysis}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-blue-900/30"
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI Questions
                    </button>
                  </div>
                </div>

                {/* Key Terms */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                  <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Key Terms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyTerms?.map((term, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"
                      >
                        <SafeRender data={term} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-5">
                  <h4 className="text-sm font-bold text-slate-300 mb-4">Document Details</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Globe className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Jurisdiction</p>
                        <p className="text-slate-200 font-medium mt-1">{analysis.jurisdiction || 'Not Specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Expiry Date</p>
                        <p className="text-slate-200 font-medium mt-1">{analysis.expiryDate || 'Not Specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Parties</p>
                        <p className="text-slate-200 font-medium mt-1">{analysis.parties?.length || 0} identified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="grid lg:grid-cols-3 gap-8 h-[700px]">
            <div className="lg:col-span-2">
              <ChatInterface 
                chatHistory={chatHistory}
                onSendMessage={handleChatSubmit}
                loading={chatLoading}
              />
            </div>
            
            <div className="hidden lg:block bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-slate-700/50 rounded-2xl p-6 overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-800">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Document Preview</h3>
                  <p className="text-xs text-slate-500">Reference context</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {text || 'No document loaded'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LegalAnalyzerView;