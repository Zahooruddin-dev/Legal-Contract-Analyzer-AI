import React, { useRef, useEffect, useState } from 'react';
import { 
  FileText, Upload, AlertTriangle, CheckCircle, 
  XCircle, Brain, Loader2, Download, Trash2, 
  ShieldAlert, Scale, Calendar, Globe, MessageSquare, Eye,
  TrendingUp, AlertCircle, Users, Clock, ChevronRight,
  Zap, Shield, DollarSign, FileCheck, Sparkles,
  Send, User, Bot, Copy, ThumbsUp, ThumbsDown,
  Search, Filter, Bookmark, Share, Settings
} from 'lucide-react';

// Enhanced ChatInterface Component
const ChatInterface = ({ chatHistory, onSendMessage, loading }) => {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = () => {
    const msg = inputRef.current.value.trim();
    if (!msg || loading) return;
    onSendMessage(msg);
    inputRef.current.value = '';
    inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const suggestedQuestions = [
    "What are the key obligations for each party?",
    "Are there any termination clauses?",
    "What are the payment terms?",
    "What happens in case of breach?",
    "Explain the liability limitations",
    "Are there any confidentiality clauses?"
  ];

  const quickActions = [
    { icon: Copy, label: "Summarize", prompt: "Provide a concise summary of the key points" },
    { icon: AlertTriangle, label: "Risks", prompt: "Identify potential risks and concerns" },
    { icon: Scale, label: "Obligations", prompt: "List all party obligations and responsibilities" }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
      {/* Professional Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Legal AI Assistant</h3>
              <p className="text-xs text-slate-400">Document Analysis & Q&A</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 border border-green-600/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-green-300 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center py-8 space-y-6">
            <div className="p-4 bg-slate-800 rounded-2xl inline-block">
              <Brain className="w-12 h-12 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-white">Document Analysis Ready</h4>
              <p className="text-slate-400 text-sm">Ask questions about clauses, obligations, or risks</p>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    inputRef.current.value = action.prompt;
                    inputRef.current.focus();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors group"
                >
                  <action.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    inputRef.current.value = q;
                    inputRef.current.focus();
                  }}
                  className="text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-400 opacity-60 group-hover:opacity-100" />
                    <span className="text-sm text-slate-300 group-hover:text-white">{q}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`relative group w-full ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-slate-800 border border-slate-600 text-slate-100 rounded-2xl rounded-tl-sm'
              } p-4`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {/* Action Buttons for Assistant Messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedIdx === idx ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-green-400">
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-red-400">
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timestamp */}
              <span className="text-xs text-slate-500 px-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Loading State */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-600 p-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-sm text-slate-300">Analyzing your question...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows="1"
              placeholder="Ask about clauses, obligations, risks, or any specific terms..."
              disabled={loading}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-700 border border-slate-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder:text-slate-500 resize-none disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <div className="absolute bottom-1 right-2 text-xs text-slate-500">
              ⏎ Send
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
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

// Enhanced Search and Filter Component
const SearchFilter = ({ onSearch, onFilter }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    category: 'all',
    date: 'all'
  });

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search clauses, terms, or obligations..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            onSearch(e.target.value);
          }}
          className="w-full bg-slate-700 border border-slate-600 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <select 
          className="bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
          value={filters.riskLevel}
          onChange={(e) => {
            const newFilters = { ...filters, riskLevel: e.target.value };
            setFilters(newFilters);
            onFilter(newFilters);
          }}
        >
          <option value="all">All Risks</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
        <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors">
          <Filter className="w-4 h-4 text-slate-300" />
          <span className="text-sm text-slate-300">Filter</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Bookmark and Share Features
const DocumentTools = ({ onBookmark, onShare, onExport }) => {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => {
          setBookmarked(!bookmarked);
          onBookmark && onBookmark();
        }}
        className={`p-2 rounded-lg border transition-colors ${
          bookmarked 
            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
            : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
        }`}
      >
        <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
      </button>
      <button 
        onClick={onShare}
        className="p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-slate-400 hover:text-white"
      >
        <Share className="w-4 h-4" />
      </button>
      <button 
        onClick={onExport}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-sm font-medium">Export</span>
      </button>
    </div>
  );
};

// Main Enhanced Component
const LegalAnalyzerView = ({
  file, text, setText, analysis, loading, error,
  activeTab, setActiveTab, fileInputRef, handleFileUpload,
  analyzeContract, resetAnalysis, exportAnalysis,
  chatHistory, handleChatSubmit, chatLoading
}) => {
  const [hoveredRisk, setHoveredRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  // Enhanced analysis data with more detailed structure
  const enhancedAnalysis = analysis ? {
    ...analysis,
    metadata: {
      analyzedAt: new Date().toISOString(),
      documentSize: text?.length || 0,
      confidence: 0.94,
      version: '2.1.0'
    },
    recommendations: analysis.recommendations || [
      "Review liability limitations carefully",
      "Consider adding dispute resolution clause",
      "Verify payment terms alignment"
    ]
  } : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* Professional Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">
                Legal<span className="text-blue-400">Mind</span> Pro
              </span>
              <p className="text-xs text-slate-500">AI-Powered Contract Analysis</p>
            </div>
          </div>
          
          {enhancedAnalysis && (
            <div className="flex items-center gap-3">
              <DocumentTools 
                onExport={exportAnalysis}
                onShare={() => console.log('Share analysis')}
                onBookmark={() => console.log('Bookmark analysis')}
              />
              <button 
                onClick={resetAnalysis}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">New Analysis</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Enhanced Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-slate-800 p-1 rounded-lg border border-slate-700 w-fit">
          {[
            { id: 'upload', label: 'Upload', icon: Upload, desc: 'Add document' },
            { id: 'results', label: 'Analysis', icon: Brain, desc: 'View insights', disabled: !analysis },
            { id: 'chat', label: 'AI Chat', icon: MessageSquare, desc: 'Ask questions', disabled: !analysis }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`relative px-4 py-3 rounded-md font-medium transition-all min-w-[120px] ${
                activeTab === tab.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50 disabled:opacity-30'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="p-4 bg-blue-600/20 rounded-2xl inline-block mb-4">
                  <FileText className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Upload Legal Document</h2>
                <p className="text-slate-400">AI-powered analysis for contracts and agreements</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* File Upload Zone */}
                <div className="relative group cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-64 border-2 border-dashed border-slate-600 group-hover:border-blue-500 bg-slate-800/50 group-hover:bg-slate-800 rounded-xl transition-all flex flex-col items-center justify-center p-6">
                    <div className="p-4 bg-blue-600/20 rounded-2xl mb-4">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    {file ? (
                      <div className="text-center space-y-2">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-300 text-sm font-medium">{file.name}</span>
                        </div>
                        <p className="text-xs text-slate-500">Click to replace file</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-white font-semibold">Drop file here</p>
                        <p className="text-slate-400 text-sm">or click to browse</p>
                        <p className="text-xs text-slate-500 mt-2">Supports: PDF, DOC, TXT • Max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Input Area */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    Or paste contract text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your contract text here for instant analysis..."
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-xl p-4 text-slate-200 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-500"
                    rows={12}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4 flex items-start gap-3 mb-6">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold mb-1">Analysis Error</p>
                    <p className="text-red-200/80 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={analyzeContract}
                disabled={loading || (!text && !file)}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Document...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Analyze Contract with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS TAB */}
        {activeTab === 'results' && enhancedAnalysis && (
          <div className="space-y-6">
            
            {/* Search and Filter */}
            <SearchFilter 
              onSearch={setSearchQuery}
              onFilter={setFilters}
            />
            
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Critical Risks', value: enhancedAnalysis.risks?.length || 0, icon: ShieldAlert, color: 'red' },
                { label: 'Obligations', value: enhancedAnalysis.obligations?.length || 0, icon: Scale, color: 'amber' },
                { label: 'Key Terms', value: enhancedAnalysis.keyTerms?.length || 0, icon: FileCheck, color: 'blue' },
                { label: 'Confidence', value: `${(enhancedAnalysis.metadata.confidence * 100).toFixed(0)}%`, icon: TrendingUp, color: 'green' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 bg-${stat.color}-600/20 rounded-lg`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Executive Summary */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Brain className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Executive Summary</h3>
                        <p className="text-sm text-slate-500">AI-generated overview</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-lg border border-blue-600/30 text-sm font-semibold">
                      {enhancedAnalysis.documentType || 'Legal Document'}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{enhancedAnalysis.summary}</p>
                </div>

                {/* Critical Risks */}
                <div className="bg-slate-900 border border-red-600/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-100">Critical Risks</h3>
                      <p className="text-sm text-red-300/60">Requires immediate attention</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {enhancedAnalysis.risks?.map((risk, i) => (
                      <div
                        key={i}
                        onMouseEnter={() => setHoveredRisk(i)}
                        onMouseLeave={() => setHoveredRisk(null)}
                        className={`flex gap-3 p-4 bg-red-600/10 hover:bg-red-600/15 border border-red-600/20 rounded-lg transition-all ${
                          hoveredRisk === i ? 'border-red-600/40' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 p-2 bg-red-600/20 rounded-lg h-fit">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-bold text-red-300/80 uppercase tracking-wider">Risk #{i + 1}</span>
                            <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs font-semibold">High</span>
                          </div>
                          <div className="text-red-100 text-sm"><SafeRender data={risk} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Obligations */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-600/20 rounded-lg">
                      <Scale className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Party Obligations</h3>
                      <p className="text-sm text-slate-500">Binding requirements and duties</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {enhancedAnalysis.obligations?.map((obs, i) => (
                      <div key={i} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors">
                        <SafeRender data={obs} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-slate-300 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={exportAnalysis}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Ask AI Assistant
                    </button>
                  </div>
                </div>

                {/* Key Terms */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    Key Terms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {enhancedAnalysis.keyTerms?.map((term, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-blue-600/20 border border-blue-600/30 text-blue-300 text-xs font-medium rounded hover:bg-blue-600/30 transition-colors cursor-pointer"
                      >
                        <SafeRender data={term} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-slate-300 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {enhancedAnalysis.recommendations?.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 bg-slate-800 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Metadata */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Document Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-500">Jurisdiction</p>
                        <p className="text-slate-200 text-sm font-medium">{enhancedAnalysis.jurisdiction || 'Not Specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-500">Expiry Date</p>
                        <p className="text-slate-200 text-sm font-medium">{enhancedAnalysis.expiryDate || 'Not Specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-slate-500">Parties</p>
                        <p className="text-slate-200 text-sm font-medium">{enhancedAnalysis.parties?.length || 0} identified</p>
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
          <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-2">
              <ChatInterface 
                chatHistory={chatHistory}
                onSendMessage={handleChatSubmit}
                loading={chatLoading}
              />
            </div>
            
            {/* Document Context Panel */}
            <div className="hidden lg:block bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
                <Eye className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white">Document Context</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {text ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <strong>Document Preview:</strong>
                        <p className="mt-1 text-slate-300">{text.substring(0, 500)}...</p>
                      </div>
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <strong>Analysis Context:</strong>
                        <p className="mt-1 text-slate-300">
                          {enhancedAnalysis?.summary?.substring(0, 200)}...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">No document loaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalAnalyzerView;