'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence: number;
    entitiesUsed: string[];
    projectsUsed: string[];
    repositoriesUsed: string[];
    achievementsUsed: string[];
    skillsUsed: string[];
  };
  explainability?: {
    resolvedEntity: string;
    traversedRelationships: string[];
    contextSizeTokens: number;
    confidenceLevel: 'High' | 'Medium' | 'Low';
  };
}

const WELCOME_MESSAGE = `ORACLE ONLINE

I can help you explore:
- Projects
- Repositories
- Skills
- Achievements
- Experience
- GitHub Activity
- Knowledge Graph`;

const LOADING_PHASES = [
  'Scanning Knowledge Graph...',
  'Resolving Entity Relationships...',
  'Compiling Portfolio Telemetry...',
  'Formatting Response...',
];

export default function OracleAppContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [counter, setCounter] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data))
      .catch((err) => console.error('Error fetching health status:', err));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % LOADING_PHASES.length);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async (text: string, eventType?: string) => {
    if (!text.trim()) return;

    window.dispatchEvent(new CustomEvent('oracleQuery', { detail: text }));

    const userMessage: Message = {
      id: `msg-${counter}-user`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    const nextCounter = counter + 1;

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoadingPhase(0);
    setIsLoading(true);

    let replyText = '';
    let replyMetadata: Message['metadata'] | undefined = undefined;
    let replyExplainability: Message['explainability'] | undefined = undefined;
    try {
      const apiResponse = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache, no-store',
        },
        body: JSON.stringify({ query: text, eventType }),
      });

      const data = await apiResponse.json().catch(() => ({}));

      if (apiResponse.ok && data.text) {
        replyText = data.text;
        replyMetadata = data.metadata;
        replyExplainability = data.explainability;
        if (data.debug) {
          setDebugData(data.debug);
        }
      } else {
        setDebugData({
          modelUsed: 'Offline Mock Responder',
          contextSizeChars: 0,
          estimatedTokens: 0,
          selectedEntities: {
            skills: [],
            projects: [],
            repositories: [],
            achievements: [],
            sections: ['Local Fallback Rules'],
          },
        });

        await new Promise((resolve) => setTimeout(resolve, 800));
        replyText = await getDeterministicReply(text, {
          statusCode: data.message?.includes('status 429')
            ? 429
            : data.message?.includes('status 404')
              ? 404
              : apiResponse.status,
          errorType: data.error,
          message: data.message,
        });
      }
    } catch (err) {
      setDebugData({
        modelUsed: 'Offline Fallback Handler',
        contextSizeChars: 0,
        estimatedTokens: 0,
        selectedEntities: {
          skills: [],
          projects: [],
          repositories: [],
          achievements: [],
          sections: ['Local Network Error Fallback'],
        },
      });

      const isTimeout =
        err instanceof Error &&
        (err.message.toLowerCase().includes('timeout') ||
          err.message.toLowerCase().includes('timed out'));
      await new Promise((resolve) => setTimeout(resolve, 800));
      replyText = await getDeterministicReply(text, {
        errorType: isTimeout ? 'TIMEOUT' : 'NETWORK_FAILURE',
        message: err instanceof Error ? err.message : String(err),
      });
    }

    const assistantMessage: Message = {
      id: `msg-${nextCounter}-assistant`,
      role: 'assistant',
      content: replyText,
      timestamp: new Date(),
      metadata: replyMetadata,
      explainability: replyExplainability,
    };
    setCounter(nextCounter + 1);
    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-panel/40 select-text overflow-hidden font-sans text-xs">
      {/* Messages Viewport */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-thin bg-bg-primary/20">
        {messages.length === 0 ? (
          <div className="space-y-4 py-2 animate-in fade-in duration-300">
            {/* Intro panel */}
            <div className="border border-border-subtle bg-bg-primary/45 rounded-xl p-4 text-center relative overflow-hidden">
              <div className="w-7 h-7 rounded-full border border-accent-purple/20 bg-accent-purple/10 flex items-center justify-center mx-auto mb-2 select-none">
                <Sparkles className="w-3.5 h-3.5 text-accent-purple animate-pulse" />
              </div>
              <h4 className="font-mono text-xs font-bold tracking-widest text-text-primary uppercase">
                ORACLE
              </h4>
              <p className="font-mono text-[9px] uppercase font-semibold text-accent-purple tracking-wider mt-0.5 animate-pulse">
                AI-Powered Portfolio Intelligence
              </p>
              <p className="text-[11px] text-[#3A3D40] leading-relaxed mt-2 select-text">
                Ask questions about Suraj's projects, repositories, skills, and
                experience. Powered by local intelligence, semantic graph
                routing, and offline failovers.
              </p>
            </div>

            {/* Recruiter Evaluation Panel */}
            <div className="space-y-1.5">
              <h5 className="font-mono text-[9px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-1 h-1 bg-accent-cyan rounded-full animate-pulse" />
                Recruiter Mode: Quick Evaluations
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'Backend Engineering',
                    query:
                      'Which project best demonstrates backend engineering?',
                  },
                  {
                    label: 'AI Engineering',
                    query: 'Which project best demonstrates AI/ML?',
                  },
                  {
                    label: 'Resume Review',
                    query: 'Why should Suraj be hired?',
                  },
                  {
                    label: 'Project Recs',
                    query: "What is Suraj's strongest project?",
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() =>
                      handleSend(action.query, 'RECRUITER_MODE_CLICK')
                    }
                    className="p-2 border border-border-subtle bg-bg-panel/40 hover:bg-bg-panel-hover/50 hover:border-accent-cyan/50 text-left rounded-lg transition-all duration-200 cursor-pointer group"
                  >
                    <div className="font-mono text-[9px] font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                      {action.label}
                    </div>
                    <div className="text-[8px] text-text-secondary truncate mt-0.5 select-none">
                      Evaluate credentials
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Queries */}
            <div className="space-y-1.5">
              <h5 className="font-mono text-[9px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-1 h-1 bg-accent-purple rounded-full" />
                Suggested Starter Queries
              </h5>
              <div className="flex flex-col gap-1.5">
                {[
                  'Which project best demonstrates backend engineering?',
                  'Compare SAHAI and ORBITAIR.',
                  'Why should Suraj be hired for a backend role?',
                  "Tell me Suraj's engineering journey.",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q, 'SUGGESTED_QUERY_CLICK')}
                    className="px-2.5 py-1.5 border border-border-subtle bg-bg-panel/40 hover:bg-bg-panel-hover/50 hover:border-accent-purple/40 text-left text-[10px] text-text-secondary hover:text-text-primary transition-all rounded-lg cursor-pointer font-mono"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset / Actions in Empty state */}
            <button
              onClick={() =>
                handleSend('Hello Oracle, please introduce yourself.')
              }
              className="w-full py-1.5 border border-border-subtle bg-bg-panel/40 hover:bg-bg-panel text-center text-[10px] font-mono rounded-lg transition-all text-text-secondary cursor-pointer"
            >
              INITIALIZE_ORACLE_LINK
            </button>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex flex-col w-full border-b border-border-subtle/30 pb-3 last:border-0"
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-[9px] select-none">
                <span
                  className={`font-bold tracking-wide uppercase ${msg.role === 'user' ? 'text-text-secondary' : 'text-accent-purple'}`}
                >
                  {msg.role === 'user' ? '↳ QUERY' : '◆ ORACLE RESPONSE'}
                </span>
                <span className="text-text-secondary/40">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={`pl-2.5 border-l ${msg.role === 'user' ? 'border-text-secondary/35 font-mono text-[10px] text-text-secondary' : 'border-accent-purple'}`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {msg.role === 'assistant' &&
                  (msg.metadata || msg.explainability) && (
                    <div className="mt-3 pt-2.5 border-t border-border-subtle/30 space-y-2.5 font-mono text-[10px] select-none text-text-secondary">
                      {msg.explainability && (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">Confidence:</span>
                          <span
                            className={`px-1 rounded text-[8px] font-bold ${
                              msg.explainability.confidenceLevel === 'High'
                                ? 'bg-success-green/10 text-success-green border border-success-green/20'
                                : 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20'
                            }`}
                          >
                            {msg.explainability.confidenceLevel}
                          </span>
                        </div>
                      )}
                      {msg.metadata && (
                        <div className="space-y-0.5">
                          <div className="text-[9px] uppercase font-bold text-accent-purple/90 tracking-wide">
                            Sources Used
                          </div>
                          <ul className="pl-1.5 space-y-0.5 text-text-secondary/90">
                            {msg.metadata.projectsUsed.length > 0 && (
                              <li>
                                <strong>Project:</strong>{' '}
                                {msg.metadata.projectsUsed.join(', ')}
                              </li>
                            )}
                            {msg.metadata.repositoriesUsed.length > 0 && (
                              <li>
                                <strong>Repository:</strong>{' '}
                                {msg.metadata.repositoriesUsed.join(', ')}
                              </li>
                            )}
                            {msg.metadata.skillsUsed.length > 0 && (
                              <li>
                                <strong>Skills:</strong>{' '}
                                {msg.metadata.skillsUsed.slice(0, 4).join(', ')}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="px-4 py-2 border-t border-border-subtle bg-bg-panel/40 flex items-center gap-2 select-none text-[10px] font-mono text-accent-purple">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{LOADING_PHASES[loadingPhase]}</span>
        </div>
      )}

      {/* Debug console switcher */}
      {debugData && (
        <div className="px-4 py-1.5 border-t border-border-subtle bg-bg-panel/20 flex justify-between select-none">
          <button
            onClick={() => setShowDebug((prev) => !prev)}
            className="text-[9px] font-mono text-text-secondary hover:text-accent-purple transition-colors cursor-pointer"
          >
            {showDebug ? 'HIDE_DIAGNOSTICS' : 'SHOW_DIAGNOSTICS'}
          </button>
          <span className="text-[9px] font-mono text-text-secondary/40">
            Model: {debugData.modelUsed}
          </span>
        </div>
      )}

      {showDebug && debugData && (
        <div className="px-4 py-2 border-t border-border-subtle bg-[#0e101a] text-accent-cyan font-mono text-[9px] space-y-1 select-text max-h-24 overflow-y-auto">
          <div>CONTEXT_SIZE: {debugData.contextSizeChars} chars</div>
          {debugData.selectedEntities.projects.length > 0 && (
            <div>
              TARGET_PROJECTS: {debugData.selectedEntities.projects.join(', ')}
            </div>
          )}
          {debugData.selectedEntities.skills.length > 0 && (
            <div>
              TARGET_SKILLS:{' '}
              {debugData.selectedEntities.skills.slice(0, 5).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Input controls form */}
      <div className="border-t border-border-subtle bg-bg-panel/90 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Oracle..."
          className="flex-grow bg-bg-primary/50 border border-border-subtle rounded-lg px-3 py-2 text-xs focus:outline-none text-text-primary focus:border-accent-purple/50 placeholder:text-text-secondary/50 font-mono transition-colors"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="flex items-center justify-center p-2 rounded-lg border border-accent-purple/35 text-accent-purple hover:bg-accent-purple/15 hover:border-accent-purple transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          aria-label="Send query"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Fallback deterministic replies
async function getDeterministicReply(
  queryText: string,
  options?: any
): Promise<string> {
  const title = 'Oracle temporarily unavailable.';
  let reason = 'An unknown error occurred.';
  let instructions = 'Please try again shortly.';

  const messageLower = (options?.message || '').toLowerCase();
  const errorType = options?.errorType;
  const statusCode = options?.statusCode;

  if (errorType === 'API_KEY_MISSING' || messageLower.includes('api key')) {
    reason =
      'Configuration error: OpenRouter API key is missing on the server.';
    instructions =
      'Please configure the OPENROUTER_API_KEY environment variable.';
  } else if (statusCode === 429 || messageLower.includes('rate limit')) {
    reason = 'OpenRouter rate limit reached (HTTP 429).';
    instructions = 'Try again in a few minutes.';
  } else if (statusCode === 404 || messageLower.includes('not found')) {
    reason = `AI Provider or Model unavailable (HTTP ${statusCode || 404}).`;
    instructions = 'Verify your model config slug.';
  } else if (errorType === 'TIMEOUT' || messageLower.includes('timeout')) {
    reason = 'Request timed out.';
    instructions = 'Check network connection and retry.';
  } else {
    reason = `OpenRouter API connection issue. Details: ${options?.message || 'unknown failure'}`;
  }

  return `### ${title}\n\n**Reason:**\n${reason}\n\n${instructions}`;
}
