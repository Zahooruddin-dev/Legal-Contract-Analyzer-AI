import React, { useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

const ChatInterface = ({ chatHistory, onSendMessage, loading }) => {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = inputRef.current.value.trim();
    if (!msg) return;
    onSendMessage(msg);
    inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Legal Assistant</h3>
          <p className="text-xs text-slate-400">Ask questions about your uploaded document</p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-slate-500 mt-20 px-6">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>I have read your document.</p>
            <p className="text-sm">Ask me about clauses, termination rights, or specific definitions.</p>
          </div>
        )}
        
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-green-400" />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span className="ml-2 text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-800/50 border-t border-slate-700">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ex: What is the termination notice period?"
            disabled={loading}
            className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;