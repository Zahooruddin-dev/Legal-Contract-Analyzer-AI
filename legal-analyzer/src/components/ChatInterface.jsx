import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatInterface = ({ chatHistory, onSendMessage, loading }) => {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

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
    "What happens in case of breach?"
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Enhanced Header with Gradient */}
      <div className="relative p-5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 border-b border-slate-700/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">AI Legal Assistant</h3>
            <p className="text-xs text-slate-400 mt-0.5">Powered by advanced document analysis</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-300 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="text-center mt-12 px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <Bot className="relative w-16 h-16 mx-auto text-blue-400/60" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-semibold text-white">Ready to Assist</h4>
              <p className="text-slate-400">I've analyzed your document. Ask me anything about:</p>
            </div>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 gap-3 max-w-xl mx-auto mt-8">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    inputRef.current.value = q;
                    inputRef.current.focus();
                  }}
                  className="group text-left p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{q}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Avatar */}
            <div className={`relative flex-shrink-0 ${msg.role === 'user' ? 'self-end' : ''}`}>
              <div className={`absolute inset-0 blur-lg rounded-full ${
                msg.role === 'user' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`} />
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`relative group w-full ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md' 
                  : 'bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-100 rounded-2xl rounded-tl-md'
              } p-4 shadow-xl`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {/* Action Buttons for Assistant Messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors text-xs text-slate-300 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedIdx === idx ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-green-400">
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Timestamp */}
              <span className="text-xs text-slate-500 px-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl rounded-tl-md flex items-center gap-3 shadow-xl">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-slate-300">Analyzing your question...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
          <div className="relative flex items-end gap-3">
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
                className="w-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-white pl-5 pr-5 py-4 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              <div className="absolute bottom-2 right-3 text-xs text-slate-500">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="relative group p-4 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Send className="w-5 h-5 relative" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;