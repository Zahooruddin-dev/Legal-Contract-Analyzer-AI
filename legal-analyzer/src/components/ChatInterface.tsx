import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Users, Gavel, Loader2, Send, Paperclip,
  RotateCcw, Sparkles
} from 'lucide-react';

const SuggestedQuery = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 px-3 py-1.5 rounded-full transition-colors"
  >
    {text}
  </button>
);

const MessageBubble = ({ message, onRegenerate, index }) => {
  const isUser = message.role === 'user';
  
  const formatContent = (text) => {
    if (!text) return text;
    
    let formatted = text;
    
    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert `code` to <code>
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-1.5 py-0.5 rounded text-xs">$1</code>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4">$1</li>');
    formatted = formatted.replace(/(<li class="ml-4">.*<\/li>)/s, '<ol class="list-decimal ml-4 space-y-1">$1</ol>');
    
    // Convert bullet lists
    formatted = formatted.replace(/^[-•]\s(.+)$/gm, '<li class="ml-4">$1</li>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-slate-700'
      }`}>
        {isUser ? <Users className="w-4 h-4 text-white" /> : <Gavel className="w-4 h-4 text-blue-300" />}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
          }`}
          dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
        />
        
        {/* Timestamp / Meta */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 mt-1 px-1">
            {isUser ? 'You' : 'AI Legal Assistant'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {!isUser && (
            <button 
              onClick={() => onRegenerate(index)}
              title="Regenerate"
              className="text-[10px] text-slate-500 mt-1 hover:text-blue-400 transition-colors"
            >
              <RotateCcw className='w-3 h-3' />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingIndicator = () => (
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
);

const ChatHeader = ({ onRegenerateLast, loading, chatHistory }) => {
  const canRegenerate = !loading && 
    chatHistory.length > 0 && 
    chatHistory[chatHistory.length - 1]?.role === 'assistant';

  return (
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
      
      <button 
        onClick={onRegenerateLast}
        disabled={!canRegenerate}
        title="Regenerate Last Response" 
        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
};

const ChatInput = ({ input, setInput, onSend, loading }) => {
  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
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
              handleSubmit();
            }
          }}
          placeholder="Ask a legal question about this contract..."
          className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:ring-0 resize-none py-2 max-h-32 text-sm"
          rows={1}
          style={{ minHeight: '40px' }}
        />
        
        <button 
          onClick={handleSubmit}
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
  );
};

const EmptyState = ({ onSuggestedQuery }) => (
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
      <SuggestedQuery text="Summarize the indemnity clause" onClick={onSuggestedQuery} />
      <SuggestedQuery text="What are the termination conditions?" onClick={onSuggestedQuery} />
      <SuggestedQuery text="List all defined terms" onClick={onSuggestedQuery} />
    </div>
  </div>
);

const ChatInterface = ({ 
  chatHistory = [], 
  onSendMessage, 
  loading = false, 
  onRegenerate 
}) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = (message) => {
    const finalMessage = message || input;
    if (!finalMessage.trim()) return;
    
    onSendMessage(finalMessage);
    if (!message) setInput('');
  };

  const handleRegenerateLast = () => {
    const lastAssistantIndex = chatHistory.length - 1;
    if (lastAssistantIndex >= 0 && chatHistory[lastAssistantIndex].role === 'assistant') {
      onRegenerate(lastAssistantIndex);
    }
  };

  const handleSuggestedQuery = (text) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden relative">
      <ChatHeader 
        onRegenerateLast={handleRegenerateLast}
        loading={loading}
        chatHistory={chatHistory}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.length === 0 ? (
          <EmptyState onSuggestedQuery={handleSuggestedQuery} />
        ) : (
          chatHistory.map((message, index) => (
            <MessageBubble 
              key={index}
              message={message}
              onRegenerate={onRegenerate}
              index={index}
            />
          ))
        )}
        
        {loading && <LoadingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput 
        input={input}
        setInput={setInput}
        onSend={handleSend}
        loading={loading}
      />
    </div>
  );
};

export default ChatInterface;