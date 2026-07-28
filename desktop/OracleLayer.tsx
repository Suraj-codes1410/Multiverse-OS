'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useDesktop } from './DesktopContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const oracleWin = windows['oracle'];
  const isOpen = !!(oracleWin && oracleWin.isOpen && !oracleWin.isMinimized);

  // Mock message log
  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'oracle',
      text: 'Initializing Narrative Engine... System operational. Welcome, Operator. How can I assist you with Suraj Samanta\'s portfolio profiles and technical expertise today?',
      timestamp: '12:00:00',
    },
    {
      id: '2',
      sender: 'user',
      text: 'What are Suraj\'s core technologies?',
      timestamp: '12:00:32',
    },
    {
      id: '3',
      sender: 'oracle',
      text: 'Suraj is highly proficient in distributed backends and AI engineering. Key technologies include Java (Spring Boot, Spring Security), Python (FastAPI, Django), Apache Kafka, TimescaleDB, Pinecone vector search, and gRPC microservices architectures.',
      timestamp: '12:00:34',
    },
  ]);

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
              <span className="font-semibold tracking-tight uppercase">Oracle // Intelligence</span>
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
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
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
                  {msg.text}
                </div>
                {/* Meta details */}
                <span className="text-[9px] text-text-secondary/50 font-mono mt-1">
                  {msg.sender === 'oracle' ? 'ORACLE' : 'OPERATOR'} {'//'} {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* CHAT INPUT AREA */}
          <div className="p-4 border-t border-accent-purple/15 bg-bg-primary/40">
            <form 
              onSubmit={(e) => e.preventDefault()}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about skills, projects, or background..."
                className="w-full bg-bg-panel border border-border-subtle rounded-xl py-2.5 pl-4 pr-10 font-sans text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/15"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 p-1.5 rounded-lg text-text-secondary hover:text-accent-purple disabled:text-text-secondary/35 transition-colors cursor-pointer"
                aria-label="Send Query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="text-[8px] text-text-secondary/40 font-mono mt-2 text-center select-none uppercase tracking-widest">
              narrative model: offline placeholder mode
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
export default OracleLayer;
