import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Send, User, Bot, Loader2, Sparkles, Copy, ThumbsUp, 
  ThumbsDown, Brain, AlertTriangle, Scale, FileText, 
  Download, Search, RotateCcw, Heart, Bookmark, Mic, 
  MicOff, ChevronDown, ChevronUp 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';

const ChatInterface = ({ 
  chatHistory = [], // Default to empty array
  onSendMessage, 
  loading, 
  documentText, 
  analysis, 
  onRegenerate, 
  onCitationClick, 
  onHighlightCitation 
}) => {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [contextInfo, setContextInfo] = useState({ hasDoc: false, hasAnalysis: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [templates, setTemplates] = useState([
    { name: "Key Obligations", content: "What are the key obligations for each party?" },
    { name: "Risks & Liabilities", content: "Identify potential risks and liabilities." },
    { name: "Payment Terms", content: "Explain the payment terms and conditions." },
    { name: "Termination Clauses", content: "What are the termination clauses?" }
  ]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, searchResults, currentSearchIndex, loading]);

  useEffect(() => {
    setContextInfo({
      hasDoc: !!documentText && documentText.length > 0,
      hasAnalysis: !!analysis
    });
  }, [documentText, analysis]);

  const performSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results = [];
    // Safe check for chatHistory
    (chatHistory || []).forEach((msg, idx) => {
      if (!msg || !msg.content) return;
      const content = msg.content.toLowerCase();
      const query = searchQuery.toLowerCase();
      if (content.includes(query)) {
        results.push({ idx, content: msg.content });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, chatHistory]);

  useEffect(() => {
    performSearch();
  }, [searchQuery, performSearch]);

  const handleSearchNext = () => {
    if (searchResults.length === 0) return;
    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    const resultElement = document.getElementById(`chat-message-${searchResults[nextIndex].idx}`);
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSearchPrev = () => {
    if (searchResults.length === 0) return;
    const prevIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    setCurrentSearchIndex(prevIndex);
    const resultElement = document.getElementById(`chat-message-${searchResults[prevIndex].idx}`);
    if (resultElement) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  const exportChat = (format) => {
    // FIX: Safer mapping that filters out undefined messages
    const content = (chatHistory || [])
      .filter(msg => msg && msg.role && msg.content)
      .map(msg => `[${msg.role.toUpperCase()}] ${msg.content}`)
      .join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    saveAs(blob, `chat-history-${new Date().toISOString().split('T')[0]}.txt`);
  };

  const saveFavorite = (question) => {
    if (!favorites.some(fav => fav.question === question)) {
      setFavorites([...favorites, {
        id: Date.now(),
        question,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const useFavorite = (question) => {
    inputRef.current.value = question;
    inputRef.current.focus();
  };

  const useTemplate = (content) => {
    inputRef.current.value = content;
    inputRef.current.focus();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      setShowVoiceInput(false);
    } else {
      setShowVoiceInput(true);
      setIsListening(true);
      // Mock voice recognition
      setTimeout(() => {
        const mockRecognizedText = "What are the key obligations in this contract?";
        inputRef.current.value = mockRecognizedText;
        setIsListening(false);
        setShowVoiceInput(false);
      }, 2000);
    }
  };

  const suggestedQuestions = [
    "What are the key obligations?",
    "Identify termination clauses",
    "What are the payment terms?",
    "Explain liability limitations",
    "List defined terms"
  ];

  const quickActions = [
    { icon: Copy, label: "Summarize", prompt: "Provide a concise summary of the key points" },
    { icon: AlertTriangle, label: "Risks", prompt: "Identify potential risks and concerns" },
    { icon: Scale, label: "Obligations", prompt: "List all party obligations and responsibilities" }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Legal Assistant</h3>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${contextInfo.hasDoc ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
               <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                 {contextInfo.hasDoc ? 'Context Active' : 'Idle'}
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Search Toggle */}
          <div className="relative group">
            <div className={`flex items-center transition-all duration-300 ${searchQuery ? 'w-48 opacity-100' : 'w-8 opacity-100'}`}>
                {searchQuery ? (
                    <div className="relative w-full">
                        <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-600 text-white pl-8 pr-16 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 text-xs"
                        autoFocus
                        />
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        {searchResults.length > 0 && (
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 bg-slate-800 rounded p-0.5">
                                <button onClick={handleSearchPrev} className="p-0.5 hover:bg-slate-700 rounded"><ChevronUp className="w-3 h-3 text-slate-400" /></button>
                                <button onClick={handleSearchNext} className="p-0.5 hover:bg-slate-700 rounded"><ChevronDown className="w-3 h-3 text-slate-400" /></button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setSearchQuery(' ')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                )}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>
          
          <button onClick={() => exportChat('text')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export">
            <Download className="w-4 h-4" />
          </button>
          
          <button onClick={() => setShowFavorites(!showFavorites)} className={`p-2 hover:bg-slate-700 rounded-lg transition-colors ${showFavorites ? 'text-red-400 bg-slate-700' : 'text-slate-400 hover:text-white'}`}>
            <Heart className="w-4 h-4" fill={showFavorites ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Suggested / Templates / Favorites Area */}
      {(showSuggestedQuestions || showTemplates || showFavorites) && (
        <div className="bg-slate-800/50 border-b border-slate-700 backdrop-blur-sm flex-shrink-0 animate-in slide-in-from-top-2">
          {showSuggestedQuestions && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Suggested Questions</h4>
                <button onClick={() => setShowSuggestedQuestions(false)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      inputRef.current.value = q;
                      inputRef.current.focus();
                    }}
                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-full transition-all text-xs text-slate-300 flex items-center gap-2 group"
                  >
                    <Sparkles className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showFavorites && favorites.length > 0 && (
             <div className="p-3 border-t border-slate-700/50">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Saved Queries</h4>
                <div className="flex flex-wrap gap-2">
                    {favorites.map(fav => (
                        <button key={fav.id} onClick={() => useFavorite(fav.question)} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white">
                            {fav.question}
                        </button>
                    ))}
                </div>
             </div>
          )}
        </div>
      )}

      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
        {(!chatHistory || chatHistory.length === 0) && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black/20 ring-1 ring-white/5">
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">
              {contextInfo.hasDoc ? 'Analysis Ready' : 'Upload Document'}
            </h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              {contextInfo.hasDoc 
                ? 'Your document has been processed. You can now ask specific questions about clauses, risks, or definitions.'
                : 'Upload a legal document to the left to begin the AI analysis and chat session.'
              }
            </p>

            {contextInfo.hasDoc && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      inputRef.current.value = action.prompt;
                      inputRef.current.focus();
                      handleSubmit();
                    }}
                    className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/30 rounded-xl transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        
        {chatHistory && chatHistory.map((msg, idx) => {
          // FIX: Defensive check to prevent crash if message is malformed
          if (!msg) return null;

          return (
            <div 
              key={idx} 
              id={`chat-message-${idx}`}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-300" />
                )}
              </div>

              <div className={`flex-1 max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`relative w-full p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-p:leading-6 prose-headings:text-slate-200 prose-a:text-blue-400 hover:prose-a:text-blue-300">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  
                  {/* Actions Footer for Assistant Messages */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => handleCopy(msg.content, idx)} className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-700 rounded text-[10px] font-medium text-slate-400 hover:text-white transition-colors">
                        <Copy className="w-3 h-3" />
                        {copiedIdx === idx ? 'Copied' : 'Copy'}
                      </button>
                      <div className="h-3 w-px bg-slate-700 mx-1"></div>
                      <button 
                        onClick={() => onRegenerate && onRegenerate(idx)}
                        className="flex items-center gap-1.5 px-2 py-1 hover:bg-slate-700 rounded text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Regenerate
                      </button>
                      <div className="flex-1"></div>
                      <div className="flex gap-1">
                        <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-green-400"><ThumbsUp className="w-3 h-3" /></button>
                        <button className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-red-400"><ThumbsDown className="w-3 h-3" /></button>
                      </div>
                    </div>
                  )}
                </div>
                
                <span className="text-[10px] text-slate-500 mt-1.5 px-1 font-medium select-none">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs font-medium text-slate-400">Processing legal context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex-shrink-0 z-20">
        <div className="relative flex items-end gap-2 bg-slate-800/50 border border-slate-700 rounded-xl p-2 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
           {/* Voice Button */}
           <button 
            onClick={toggleVoiceInput}
            disabled={loading || !contextInfo.hasDoc}
            className={`p-2 rounded-lg transition-all flex-shrink-0 h-10 w-10 flex items-center justify-center ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <textarea
            ref={inputRef}
            rows="1"
            placeholder={contextInfo.hasDoc 
              ? "Ask about liabilities, specific clauses, or definitions..." 
              : "Waiting for document upload..."}
            disabled={loading || !contextInfo.hasDoc}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-white text-sm py-2.5 focus:ring-0 placeholder:text-slate-500 resize-none disabled:opacity-50 scrollbar-hide"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          <button 
            onClick={handleSubmit}
            disabled={loading || !contextInfo.hasDoc}
            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 h-10 w-10 flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        
        {isListening && (
           <p className="text-xs text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
              Listening...
           </p>
        )}
        
        <p className="text-[10px] text-center text-slate-600 mt-3 font-medium">
          AI can make mistakes. Please verify critical legal information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;