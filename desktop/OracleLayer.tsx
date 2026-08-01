'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useDesktop } from './DesktopContext';
import { motion, AnimatePresence } from 'framer-motion';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface ChatMessage {
  id: string;
  sender: 'oracle' | 'user';
  text: string;
  timestamp: string;
}

/**
 * OracleLayer renders the AI Conversational Assistant sidebar panel.
 * Connects to DesktopState and slides out when the 'oracle' window is opened.
 */
export function OracleLayer() {
  const { windows, closeWindow } = useDesktop();
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const oracleWin = windows['oracle'];
  const isOpen = !!(oracleWin && oracleWin.isOpen && !oracleWin.isMinimized);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'oracle',
      text: "Initializing Narrative Engine... System operational. Welcome, Operator. How can I assist you with Suraj Samanta's portfolio profiles and technical expertise today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'oracle',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'oracle',
            text: `Oracle connection failed: ${data.message || 'Unknown error'}`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'oracle',
          text: 'Failed to contact Oracle network services.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0.9 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.9 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="complementary"
          aria-label="Oracle Assistant Sidebar Drawer"
          className="absolute inset-y-0 right-0 z-[500] pointer-events-auto border-l border-accent-purple/20 bg-bg-panel w-96 max-w-full flex flex-col shadow-2xl box-border pt-10"
        >
          {/* HEADER */}
          <div className="h-14 px-4 border-b border-accent-purple/15 bg-accent-purple/5 flex items-center justify-between font-sans font-medium text-xs select-none">
            <div className="flex items-center gap-2 text-accent-purple">
              <Sparkles className="w-4 h-4 text-accent-purple" />
              <span className="font-semibold tracking-tight uppercase">
                Oracle // Intelligence
              </span>
            </div>

            {/* Close sidebar */}
            <button
              onClick={() => closeWindow('oracle')}
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover transition-colors cursor-pointer"
              aria-label="Close Oracle Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CHAT CHRONOLOGY */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4 font-sans text-xs scrollbar-thin select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'self-end items-end'
                    : 'self-start items-start'
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl leading-relaxed shadow-sm text-text-primary border ${
                    msg.sender === 'user'
                      ? 'bg-accent-purple/10 border-accent-purple/20 rounded-tr-none text-text-primary'
                      : 'bg-bg-primary/60 border-border-subtle/40 rounded-tl-none text-text-primary'
                  }`}
                >
                  {msg.sender === 'oracle' ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
                {/* Meta details */}
                <span className="text-[9px] text-text-secondary/50 font-mono mt-1">
                  {msg.sender === 'oracle' ? 'ORACLE' : 'OPERATOR'} {'//'}{' '}
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-accent-purple font-mono pl-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Oracle is thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* CHAT INPUT AREA */}
          <div className="p-4 border-t border-accent-purple/15 bg-bg-primary/40">
            <form
              onSubmit={handleSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about skills, projects, or background..."
                className="w-full bg-bg-panel border border-border-subtle rounded-xl py-2.5 pl-4 pr-10 font-sans text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/15"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-1.5 rounded-lg text-text-secondary hover:text-accent-purple disabled:text-text-secondary/35 transition-colors cursor-pointer"
                aria-label="Send Query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[8px] text-text-secondary/40 font-mono mt-2 text-center select-none uppercase tracking-widest">
              narrative model: active openrouter link
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
export default OracleLayer;
