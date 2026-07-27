import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, X, Bot } from 'lucide-react';

export const AICoach = () => {
  const { activeTab, userProfile, todayLog, waterIntake, currentTotals, apiBase, translations, lang } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'coach', content: 'Hi! I am your AI coach. Ask me anything about your current nutrition goals!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const dict = translations[lang] || translations.en;

  // Auto scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const query = inputMsg.trim();
    if (!query) return;

    setInputMsg('');
    const userEntry = { role: 'user', content: query };
    const updatedHistory = [...chatHistory, userEntry];
    setChatHistory(updatedHistory);
    setIsTyping(true);

    try {
      const res = await fetch(`${apiBase}/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          context: {
            activeTab: activeTab,
            userProfile: userProfile,
            todayLog: todayLog,
            waterIntake: waterIntake,
            totals: currentTotals(),
            burnedCal: currentTotals().burned_cal || 0
          }
        })
      });

      if (!res.ok) throw new Error('AI Coach response failed');
      const data = await res.json();

      setIsTyping(false);
      if (data.reply) {
        setChatHistory(prev => [...prev, { role: 'coach', content: data.reply }]);
      } else {
        throw new Error('AI Coach empty response');
      }
    } catch (err) {
      setIsTyping(false);
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'coach', 
          content: 'Unable to connect to AI Coach. Please check your network connection or server API key.',
          isError: true
        }
      ]);
    }
  };

  // Convert text markers (like **bold** or newlines) into jsx safely
  const formatText = (text) => {
    // Split by newlines first
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Replace **text** with strong tags
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const elements = parts.map((part, pIdx) => {
        // odd elements are the ones captured inside **
        if (pIdx % 2 !== 0) {
          return <strong key={pIdx} className="font-extrabold text-slate-100">{part}</strong>;
        }
        // Replace *text* with em tags
        const italicParts = part.split(/\*(.*?)\*/g);
        return italicParts.map((subPart, sIdx) => {
          if (sIdx % 2 !== 0) {
            return <em key={sIdx} className="italic text-slate-300">{subPart}</em>;
          }
          return subPart;
        });
      });

      return (
        <span key={idx}>
          {elements}
          {idx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Orb Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white z-40" 
        title="Ask AI Coach"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Floating Chat Overlay Panel */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 w-[90%] max-w-[360px] h-[400px] glass rounded-2xl border border-slate-800/80 flex flex-col z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-bold text-sm text-slate-200">AI Coach</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Panel */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 thin-scroll text-xs flex flex-col">
            {chatHistory.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl border leading-relaxed max-w-[85%] ${
                    isUser 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 self-end text-right ml-8 font-medium' 
                      : msg.isError 
                        ? 'bg-red-950/20 border-red-900/30 text-red-400 mr-8 self-start'
                        : 'bg-slate-900/60 border-slate-800 mr-8 self-start text-slate-300'
                  }`}
                >
                  {!isUser && index > 0 && <Bot className="w-3.5 h-3.5 text-emerald-400 mb-1" />}
                  {formatText(msg.content)}
                </div>
              );
            })}

            {/* Typing bouncing dots */}
            {isTyping && (
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 mr-8 flex items-center gap-1 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask anything about today's log..." 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-grow rounded-xl bg-slate-950/80 border border-slate-800 px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none" 
            />
            <button 
              type="submit" 
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
