'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from './NavigationProvider';
import { Send, Sparkles, Mic, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function OracleLayer() {
  const { activeTab, setActiveTab } = useNavigation();
  const isOpen = activeTab === 'oracle';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am Oracle, Suraj's automated technical companion. Ask me anything about his systems experience, projects, or background.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text })
      });

      const data = await response.json().catch(() => ({}));
      
      let replyText = "I encountered a processing issue. Please try again.";
      if (response.ok && data.text) {
        replyText = data.text;
      } else if (data.message) {
        replyText = `Oracle API Fallback: ${data.message}`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Network issue. Operating in degraded fallback mode.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Listen to home screen query chip event
  useEffect(() => {
    const handleHomeQuery = (e: Event) => {
      const query = (e as CustomEvent).detail;
      if (query) {
        handleSend(query);
      }
    };
    window.addEventListener('oracleQuery', handleHomeQuery);
    return () => window.removeEventListener('oracleQuery', handleHomeQuery);
  }, [messages]);

  const handleVoiceTap = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSend("What are Suraj's core microservice technologies?");
    }, 2500);
  };

  const suggestions = [
    "Core Technologies",
    "Open Source Work",
    "Contact Info",
    "Availability Status"
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 bg-bg-panel z-[450] flex flex-col pt-9"
    >
      {/* HEADER */}
      <header className="h-13 border-b border-border-subtle/30 px-5 flex items-center justify-between select-none flex-shrink-0 bg-bg-panel/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse" />
          <span className="text-xs font-sans font-semibold tracking-tight text-text-primary uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-accent-cyan" /> ORACLE NARRATIVE
          </span>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="text-[10px] font-mono text-accent-cyan px-2.5 py-1 rounded bg-accent-cyan/8 border border-accent-cyan/15 hover:bg-accent-cyan/15 transition-colors cursor-pointer"
        >
          CLOSE
        </button>
      </header>

      {/* MESSAGES CHRONOLOGY */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 font-sans text-xs scrollbar-none pb-20 select-text">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={`flex gap-3 max-w-[85%] ${
                isUser ? 'self-end flex-row-reverse' : 'self-start'
              }`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${
                isUser 
                  ? 'bg-accent-cyan/8 border-accent-cyan/20 text-accent-cyan' 
                  : 'bg-white border-window-border text-text-secondary'
              }`}>
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                    <rect x="5" y="7" width="14" height="11" rx="4" fill="#FFFFFF" stroke="#6A6D70" strokeWidth="1.5" />
                    <rect x="8" y="10" width="8" height="4" rx="1.5" fill="#2B2D2F" />
                    <circle cx="10" cy="12" r="0.75" fill="#E06A3F" />
                    <circle cx="14" cy="12" r="0.75" fill="#E06A3F" />
                    <path d="M10 15C10.5 15.5 11.2 15.7 12 15.7C12.8 15.7 13.5 15.5 14 15" stroke="#6A6D70" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              {/* Msg Bubble */}
              <div className="flex flex-col">
                <div
                  className={`p-3 rounded-2xl leading-relaxed shadow-sm text-[11px] border ${
                    isUser
                      ? 'bg-accent-cyan/8 border-accent-cyan/15 text-text-primary rounded-tr-none'
                      : 'bg-white border-window-border/50 text-text-primary rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                <span className={`text-[8px] font-mono text-text-secondary/40 mt-1 ${isUser ? 'self-end' : 'self-start'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="self-start flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-white border border-window-border flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 animate-spin">
                <circle cx="12" cy="12" r="10" stroke="#border-subtle" strokeWidth="2" fill="none" />
                <path d="M12 2C6.48 2 2 6.48 2 12" stroke="#E06A3F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-window-border/50 text-[10px] font-mono text-text-secondary animate-pulse">
              ORACLE_THINKING // ANALYZING_CODEBASE...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA OPTIMIZED FOR TOUCH */}
      <div className="p-4 border-t border-border-subtle/30 bg-bg-panel/90 backdrop-blur-md absolute bottom-0 inset-x-0 z-50">
        
        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3.5 scrollbar-none select-none -mx-2 px-2">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(`Tell me about Suraj's ${chip.toLowerCase()}`)}
                className="px-3 py-1.5 rounded-full bg-white border border-window-border/80 text-[10px] text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/35 transition-all flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Micro Pulsing Indicator on Voice Listening Mode */}
          <button
            onClick={handleVoiceTap}
            className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-accent-cyan text-white border-transparent animate-pulse shadow-[0_0_12px_rgba(224,106,63,0.35)]'
                : 'bg-white text-text-secondary border-window-border/80 hover:text-accent-cyan active:scale-95'
            }`}
            aria-label="Activate voice search placeholder"
          >
            <Mic className="w-4 h-4" />
          </button>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex-1 relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : "Ask about skills, projects..."}
              className="w-full bg-white border border-window-border rounded-xl py-2.5 pl-3.5 pr-10 font-sans text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-cyan/40 focus:ring-1 focus:ring-accent-cyan/15 shadow-sm"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 p-1.5 rounded-lg text-text-secondary hover:text-accent-cyan disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

export default OracleLayer;
