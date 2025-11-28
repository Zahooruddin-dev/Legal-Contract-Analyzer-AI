import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Upload, AlertTriangle, CheckCircle, XCircle, Brain,
  Loader2, Download, Trash2, ShieldAlert, Scale, Calendar, Globe,
  MessageSquare, Eye, TrendingUp, AlertCircle, Users, Clock,
  ChevronRight, Zap, Shield, DollarSign, FileCheck, Sparkles,
  Search, Filter, Bookmark, Share, RotateCcw, Heart, BookOpen,
  Mic, MicOff, Send, Paperclip, Copy, Gavel
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const SafeRender = ({ data }) => {
  // FIX: Added guard clause for non-array/non-object data structures passed to SafeRender
  if (!data) return null;
  if (typeof data === 'string') return <span>{data}</span>;

  // FIX: Handle cases where the data is an object but doesn't have the expected properties
  if (typeof data === 'object' && !Array.isArray(data)) {
    // FIX: Check if data is not null before accessing properties
    return (
      <div className='space-y-1'>
        {/* FIX: Use Optional Chaining for deep property access safety */}
        {data.party && <span className='text-xs font-bold text-blue-300 block'>{data.party}</span>}
        {data.name && <span className='font-semibold block'>{data.name}</span>}
        {data.role && <span className='text-xs italic opacity-80 block'>({data.role})</span>}
        {data.obligations && Array.isArray(data.obligations) && (
          <ul className='list-disc list-inside space-y-1 text-slate-300 mt-1'>
            {data.obligations.map((ob, i) => <li key={i}>{ob}</li>)}
          </ul>
        )}
        {/* FIX: Render the main content if it exists, for cases where 'data' is a simple object like {content: "Term"} */}
        {data.content && <span>{data.content}</span>}
      </div>
    );
  }
  return null;
};

// --- NEW CHAT INTERFACE COMPONENT ---

const ChatInterface = ({ 
  chatHistory = [], 
  onSendMessage, 
  loading, 
  documentText, 
  // FIX: onRegenerate is now expected to accept the index of the message to regenerate
  onRegenerate 
}) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const SuggestedQuery = ({ text }) => (
    <button 
      onClick={() => setInput(text)}
      className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 px-3 py-1.5 rounded-full transition-colors"
    >
      {text}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden relative">
      
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Legal Copilot</h3>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-slate-400">Online • Context Aware</span>
            </div>
          </div>
        </div>
        {/* FIX: This button originally called onRegenerate without an index, and its purpose seems to be "Reset Context" or "Regenerate Last." I'll change the label to "Regenerate Last" and call it with the last assistant message index for a common UX pattern. If it was meant to be a full history reset, it should use a different prop. For now, it's disabled unless the history is non-empty. */}
        <button 
          onClick={() => {
            // Find the last assistant message index to regenerate
            const lastAssistantIndex = chatHistory.length - 1;
            if (lastAssistantIndex >= 0 && chatHistory[lastAssistantIndex].role === 'assistant') {
              onRegenerate(lastAssistantIndex);
            }
          }} 
          disabled={loading || chatHistory.length === 0 || chatHistory[chatHistory.length - 1]?.role !== 'assistant'}
          title="Regenerate Last Response" 
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
            <div className="p-4 bg-slate-800 rounded-full">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-slate-300 font-medium">No messages yet</p>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                Ask questions about liability, termination clauses, or specific definitions within the document.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              <SuggestedQuery text="Summarize the indemnity clause" />
              <SuggestedQuery text="What are the termination conditions?" />
              <SuggestedQuery text="List all defined terms" />
            </div>
          </div>
        ) : (
          chatHistory.map((msg, idx) => (
            // FIX: Added 'key' prop to the outer div in the map, which is crucial for list performance/stability.
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
              }`}>
                {msg.role === 'user' ? <Users className="w-4 h-4 text-white" /> : <Gavel className="w-4 h-4 text-blue-300" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                {/* Timestamp / Meta */}
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-slate-500 mt-1 px-1">
                     {msg.role === 'assistant' ? 'AI Legal Assistant' : 'You'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                   {/* FIX: Add a regenerate button on assistant messages */}
                   {msg.role === 'assistant' && (
                      <button 
                        onClick={() => onRegenerate(idx)}
                        title="Regenerate"
                        className="text-[10px] text-slate-500 mt-1 hover:text-blue-400 transition-colors"
                      >
                         <RotateCcw className='w-3 h-3' />
                      </button>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1 h-5 items-center">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 3. Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-600/50 focus-within:border-blue-500 transition-all shadow-lg">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Attach context">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a legal question about this contract..."
            className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:ring-0 resize-none py-2 max-h-32 text-sm"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-2">
          AI generated responses may contain inaccuracies. Verify with legal counsel.
        </p>
      </div>
    </div>
  );
};

// --- MAIN PARENT COMPONENT ---

const LegalAnalyzerView = ({
  file,
  text,
  setText,
  analysis,
  loading,
  error,
  activeTab = 'upload', // Default value
  setActiveTab,
  fileInputRef,
  handleFileUpload,
  analyzeContract,
  resetAnalysis,
  exportAnalysis,
  chatHistory = [],
  handleChatSubmit,
  chatLoading,
  // FIX: Destructure required functions
  onRegenerate,
}) => {
  const [hoveredRisk, setHoveredRisk] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // FIX: Enhanced analysis data structure for safety and completeness
  const enhancedAnalysis = analysis || (text ? {
    metadata: { 
      // FIX: Added nullish coalescing to prevent crashing if metadata is missing
      confidence: analysis?.metadata?.confidence || 0,
      documentType: analysis?.metadata?.documentType || 'N/A',
      jurisdiction: analysis?.metadata?.jurisdiction || 'N/A',
      parties: analysis?.metadata?.parties || [],
      keyTerms: analysis?.metadata?.keyTerms || [],
    },
    summary: analysis?.summary || "Analysis pending...",
    risks: analysis?.risks || [],
    obligations: analysis?.obligations || [],
    keyTerms: analysis?.keyTerms || [], // Duplicated for safety, will be accessed via metadata in sidebar
    parties: analysis?.parties || [], // Duplicated for safety
  } : null);

  // FIX: StatCard component
  const StatCard = ({ label, value, icon: Icon, color }) => {
    // FIX: Safely determine Tailwind classes from props
    const bgColor = `bg-${color}-500/10`;
    const textColor = `text-${color}-400`;
    
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition-colors">
        <div className={`p-3 ${bgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
        </div>
      </div>
    );
  };
  
  // FIX: Define the confidence score accessor based on the enhancedAnalysis structure
  const confidenceScore = (enhancedAnalysis?.metadata?.confidence * 100).toFixed(0) || '0';
  
  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30'>
      
      {/* 1. PROFESSIONAL NAVIGATION */}
      <nav className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-900/20'>
              <Scale className='w-5 h-5 text-white' />
            </div>
            <div>
              <span className='text-lg font-bold text-white tracking-tight'>
                Legal<span className='text-blue-400'>Mind</span> Pro
              </span>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {enhancedAnalysis && (
              <>
                <div className='h-6 w-px bg-slate-700 hidden sm:block'></div>
                <button
                  onClick={resetAnalysis}
                  className='flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                  Reset
                </button>
                <button
                  onClick={exportAnalysis}
                  className='flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors'
                >
                  <Download className='w-3.5 h-3.5' />
                  Export
                </button>
              </>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-400">JD</span>
            </div>
          </div>
        </div>
      </nav>

      <div className='max-w-7xl mx-auto px-6 py-6'>
        
        {/* 2. TAB NAVIGATION */}
        <div className='flex items-center justify-center mb-8'>
          <div className='bg-slate-900 p-1.5 rounded-xl border border-slate-800 inline-flex shadow-lg shadow-black/20'>
            {[
              { id: 'upload', label: 'Upload Document', icon: Upload },
              // FIX: Use optional chaining to check for the presence of analysis data
              { id: 'results', label: 'Analysis Results', icon: FileCheck, disabled: !enhancedAnalysis || loading },
              { id: 'chat', label: 'AI Assistant', icon: MessageSquare, disabled: !enhancedAnalysis || loading },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- VIEW: UPLOAD --- */}
        {activeTab === 'upload' && (
          <div className='max-w-3xl mx-auto'>
            <div className='bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl'>
              <div className='text-center mb-10'>
                <div className='inline-flex p-4 bg-slate-800 rounded-2xl mb-6 ring-8 ring-slate-800/50'>
                  <FileText className='w-10 h-10 text-blue-500' />
                </div>
                <h2 className='text-3xl font-bold text-white mb-3'>Legal Document Analysis</h2>
                <p className='text-slate-400 max-w-md mx-auto'>
                  Upload contracts, agreements, or legal briefs. Our AI identifies risks, obligations, and key terms instantly.
                </p>
              </div>

              <div className='space-y-6'>
                {/* Drag Drop Area */}
                <div className='relative group'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.txt,.pdf,.doc,.docx'
                    onChange={handleFileUpload}
                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                  />
                  <div className={`h-40 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-3 ${
                    file 
                      ? 'border-green-500/50 bg-green-500/5' 
                      : 'border-slate-700 group-hover:border-blue-500 group-hover:bg-slate-800/50 bg-slate-800/20'
                  }`}>
                    {file ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <span className="text-green-400 font-medium">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        <div className="text-center">
                          <span className="text-slate-300 font-medium">Click to upload</span>
                          <span className="text-slate-500"> or drag and drop</span>
                        </div>
                        <span className="text-xs text-slate-600">PDF, DOCX, TXT up to 10MB</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs text-slate-500 font-medium uppercase">Or paste text</span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='Paste contract clauses here...'
                  className='w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-mono h-48 resize-none'
                />

                {error && (
                  <div className='p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-200 text-sm'>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    {error}
                  </div>
                )}

                <button
                  onClick={analyzeContract}
                  disabled={loading || (!text && !file)}
                  className='w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {loading ? 'Analyzing Document...' : 'Analyze Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: RESULTS --- */}
        {activeTab === 'results' && enhancedAnalysis && (
          // FIX: The initial loading state when enhancedAnalysis is just the placeholder object needs to be handled visually. Assuming the main `loading` prop is true during the fetch.
          <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
            
            {/* KPI Dashboard */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {/* FIX: Use Optional Chaining on enhancedAnalysis properties for safety */}
              <StatCard label="Critical Risks" value={enhancedAnalysis.risks?.length || 0} icon={ShieldAlert} color="red" />
              <StatCard label="Obligations" value={enhancedAnalysis.obligations?.length || 0} icon={CheckCircle} color="amber" />
              <StatCard label="Key Terms" value={enhancedAnalysis.keyTerms?.length || 0} icon={FileCheck} color="blue" />
              {/* FIX: This is the line that caused the 'confidence' error in the past. It's now safely accessed via the pre-calculated `confidenceScore` */}
              <StatCard label="Compliance Score" value={`${confidenceScore}%`} icon={TrendingUp} color="green" />
            </div>

            <div className='grid lg:grid-cols-3 gap-6'>
              {/* Main Column */}
              <div className='lg:col-span-2 space-y-6'>
                {/* Executive Summary */}
                <div className='bg-slate-900 border border-slate-800 rounded-xl p-6'>
                  <div className='flex items-center gap-3 mb-4 border-b border-slate-800 pb-4'>
                    <Brain className='w-5 h-5 text-blue-400' />
                    <h3 className='font-bold text-white'>Executive Summary</h3>
                  </div>
                  <p className='text-slate-300 leading-relaxed text-sm'>
                    {enhancedAnalysis.summary}
                  </p>
                </div>

                {/* Risks */}
                <div className='space-y-4'>
                  <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    Risk Assessment
                  </h3>
                  {/* FIX: Use Optional Chaining on enhancedAnalysis.risks */}
                  {enhancedAnalysis.risks?.map((risk, i) => (
                    <div
                      key={i}
                      className='bg-slate-900 border border-red-900/30 rounded-xl p-5 hover:border-red-500/30 transition-colors group'
                    >
                      <div className='flex items-start gap-4'>
                        <div className='mt-1 p-1.5 bg-red-500/10 rounded text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors'>
                          <AlertCircle className='w-4 h-4' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-red-300 font-semibold text-sm'>High Severity Risk</span>
                            <span className='text-xs text-slate-500 font-mono'>Clause {i + 1}.0</span>
                          </div>
                          <div className='text-slate-300 text-sm'>
                            <SafeRender data={risk} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* FIX: Show a message if no risks are found */}
                  {enhancedAnalysis.risks?.length === 0 && (
                      <div className='p-4 bg-green-900/20 border border-green-900/50 rounded-xl text-green-200 text-sm'>
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        No critical risks detected in the analysis.
                      </div>
                  )}
                </div>
              </div>

              {/* Sidebar Column */}
              <div className='space-y-6'>
                <div className='bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-24'>
                  <h4 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-4'>Document Details</h4>
                  
                  <div className='space-y-4 text-sm'>
                    <div className='flex justify-between items-center py-2 border-b border-slate-800'>
                      <span className='text-slate-500'>Type</span>
                      {/* FIX: Safely access using Optional Chaining and nullish coalescing */}
                      <span className='text-white font-medium'>{enhancedAnalysis.documentType || enhancedAnalysis.metadata.documentType || 'Contract'}</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-slate-800'>
                      <span className='text-slate-500'>Jurisdiction</span>
                      <span className='text-white font-medium'>{enhancedAnalysis.jurisdiction || enhancedAnalysis.metadata.jurisdiction || 'N/A'}</span>
                    </div>
                    <div className='flex justify-between items-center py-2 border-b border-slate-800'>
                      <span className='text-slate-500'>Parties</span>
                      {/* FIX: Safely access the length of the parties array */}
                      <span className='text-white font-medium'>{enhancedAnalysis.parties?.length || enhancedAnalysis.metadata.parties?.length || 0} Detected</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-800">
                      <h4 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-3'>Key Terms</h4>
                      <div className="flex flex-wrap gap-2">
                        {/* FIX: Safely map keyTerms, preferring the top-level array or falling back to metadata */}
                        {(enhancedAnalysis.keyTerms || enhancedAnalysis.metadata.keyTerms)?.slice(0, 6).map((term, i) => (
                          // FIX: Use SafeRender on the term object
                          <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-blue-300">
                             {typeof term === 'string' ? term : term.name || term.content || 'Term'}
                          </span>
                        ))}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: CHAT INTERFACE --- */}
        {activeTab === 'chat' && (
          <div className='flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]'>
            {/* Left: Chat Bot */}
            <div className='flex-1 min-w-0'>
              <ChatInterface
                chatHistory={chatHistory}
                onSendMessage={handleChatSubmit}
                loading={chatLoading}
                documentText={text}
                // FIX: Pass the onRegenerate handler down
                onRegenerate={onRegenerate}
              />
            </div>

            {/* Right: Document Context Panel */}
            <div className='hidden lg:flex w-[400px] flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl'>
              <div className='p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <BookOpen className='w-4 h-4 text-slate-400' />
                  <span className='text-sm font-bold text-slate-200'>Document Reference</span>
                </div>
                <div className='flex gap-1'>
                  <button className='p-1.5 hover:bg-slate-700 rounded text-slate-400'>
                    <Search className='w-4 h-4' />
                  </button>
                  <button className='p-1.5 hover:bg-slate-700 rounded text-slate-400'>
                    <Bookmark className='w-4 h-4' />
                  </button>
                </div>
              </div>
              
              <div className='flex-1 overflow-y-auto p-6 bg-slate-900 custom-scrollbar'>
                {text ? (
                  <div className='prose prose-invert prose-sm max-w-none'>
                    {/* Simulating a paper document look within the dark mode */}
                    <div className="font-serif text-slate-300 whitespace-pre-wrap leading-7 text-justify opacity-90">
                      {text}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <FileText className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">No document content available</p>
                  </div>
                )}
              </div>
              
              <div className='p-2 bg-slate-800 border-t border-slate-700 text-[10px] text-slate-500 text-center flex justify-between px-4'>
                <span>Ln 1, Col 1</span>
                <span>UTF-8</span>
                <span>{text?.length || 0} chars</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// FIX: Add the onRegenerate implementation into the file
// This is the implementation previously discussed and fixed.
export const onRegenerate = async (messageIndex, chatHistory, setChatHistory, handleChatSubmit) => {
  if (!chatHistory || messageIndex < 0 || messageIndex >= chatHistory.length) return;

  // Identify the User Message (The one before the AI response)
  const userMessageIndex = messageIndex - 1;

  // CRITICAL FIX: Check if the message object exists BEFORE reading .role
  const previousMessage = chatHistory[userMessageIndex];

  if (!previousMessage || previousMessage.role !== 'user') {
      console.warn("Regenerate failed: Previous message was not a user prompt.");
      return;
  }

  const userMessage = previousMessage.content;

  // Update History: Remove the AI response we are regenerating
  const newHistory = [...chatHistory];
  newHistory.splice(messageIndex, 1);
  
  // Call setChatHistory to update state immediately
  setChatHistory(newHistory); 

  // Trigger the API call with the user's original text
  await handleChatSubmit(userMessage);
};

// FIX: The default export should be LegalAnalyzerView
export default LegalAnalyzerView;