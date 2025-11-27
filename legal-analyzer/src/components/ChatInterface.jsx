import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Copy, ThumbsUp, ThumbsDown, Brain, AlertTriangle, Scale } from 'lucide-react';

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

export default ChatInterface;