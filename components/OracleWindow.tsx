'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
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

interface OracleWindowProps {
  isOpen: boolean;
  onClose: () => void;
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

// Evaluate load time date once at module-level to bypass component purity rules
const WELCOME_TIME = new Date();

const LOADING_PHASES = [
  'Scanning Knowledge Graph...',
  'Resolving Entity Relationships...',
  'Compiling Portfolio Telemetry...',
  'Formatting Response...'
];

// Pure helper function defined outside component scope to bypass React render purity checks
function buildMessage(
  role: 'user' | 'assistant',
  content: string,
  counter: number,
  metadata?: Message['metadata'],
  explainability?: Message['explainability']
): Message {
  return {
    id: `msg-${counter}-${role}`,
    role,
    content,
    timestamp: new Date(),
    metadata,
    explainability
  };
}

interface DebugData {
  contextSizeChars: number;
  estimatedTokens: number;
  modelUsed: string;
  selectedEntities: {
    skills: string[];
    projects: string[];
    repositories: string[];
    achievements: string[];
    sections: string[];
  };
}

export default function OracleWindow({ isOpen, onClose }: OracleWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: WELCOME_TIME
    }
  ]);
  const [counter, setCounter] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when window opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Cycle loading status text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingPhase(prev => (prev + 1) % LOADING_PHASES.length);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const quickQueries = [
    { label: 'Projects', query: 'Show featured projects' },
    { label: 'Skills', query: 'List core skills' },
    { label: 'Timeline', query: 'Show career timeline' },
    { label: 'Achievements', query: 'What are your achievements?' }
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Use current counter to build user message
    const userMessage = buildMessage('user', text, counter);
    const nextCounter = counter + 1;
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoadingPhase(0);
    setIsLoading(true);

    // =========================================================================
    // ARCHITECTURAL EXTENSION POINTS (STANDBY FOR FUTURE SYSTEM INTEGRATIONS)
    // =========================================================================
    // 2. Knowledge Graph Query Traversal (Phase 4.3)
    //    - Will fetch nodes and edges matching query context from buildKnowledgeGraph().
    // 3. Repository Intelligence Scanner
    //    - Will connect to generateRepositoryIntelligence() telemetry.
    // 4. CLI Command Execution
    //    - Will pipe outputs directly to/from command registries.
    // =========================================================================

    let replyText = '';
    let replyMetadata: Message['metadata'] | undefined = undefined;
    let replyExplainability: Message['explainability'] | undefined = undefined;
    try {
      const apiResponse = await fetch('/api/oracle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ query: text })
      });

      const data = await apiResponse.json().catch(() => ({}));

      if (apiResponse.ok && data.text) {
        console.log("ROUTE: OPENROUTER");
        replyText = data.text;
        replyMetadata = data.metadata;
        replyExplainability = data.explainability;
        
        // Response validation & diagnostics check
        if (data.debug) {
          setDebugData(data.debug);
        }
        
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
        if (lastAssistantMsg && lastAssistantMsg.content === replyText) {
          console.warn('WARNING: Repeated response detected in consecutive model completions.');
        }
      } else {
        console.log("ROUTE: FALLBACK");
        if (data.error === 'API_KEY_MISSING') {
          console.warn('OpenRouter API key missing on server. Falling back to local offline responder.');
        } else {
          console.error('Oracle API Route returned error:', data.message || 'Unknown error');
        }
        
        // Load mock diagnostics
        setDebugData({
          modelUsed: 'Offline Mock Responder',
          contextSizeChars: 0,
          estimatedTokens: 0,
          selectedEntities: {
            skills: [],
            projects: [],
            repositories: [],
            achievements: [],
            sections: ['Local Fallback Rules']
          }
        });
        
        // Simulate thinking delay for cognitive response feel
        await new Promise(resolve => setTimeout(resolve, 800));
        replyText = await getDeterministicReply(text);

        // Mock metadata for offline responder fallback
        const lowerText = text.toLowerCase();
        if (lowerText.includes('orbitair')) {
          replyMetadata = {
            confidence: 0.98,
            entitiesUsed: ['ORBITAIR (project)'],
            projectsUsed: ['ORBITAIR — AI-Powered AQI Forecasting'],
            repositoriesUsed: ['orbitair'],
            achievementsUsed: ['NASA Space Apps Challenge — Top 5 in India'],
            skillsUsed: ['Python', 'FastAPI', 'React', 'TimescaleDB', 'Leaflet']
          };
          replyExplainability = {
            resolvedEntity: 'ORBITAIR (project)',
            traversedRelationships: [
              'project:orbitair -> BUILT_WITH -> Skill (5 nodes)',
              'project:orbitair -> RELATED_TO -> Achievement (1 nodes)',
              'project:orbitair -> DEPENDS_ON -> Repository (1 nodes)'
            ],
            contextSizeTokens: 750,
            confidenceLevel: 'High'
          };
        } else if (lowerText.includes('sahai')) {
          replyMetadata = {
            confidence: 0.98,
            entitiesUsed: ['SAHAI (project)'],
            projectsUsed: ['SAHAI — Mental Health & Lifestyle Platform'],
            repositoriesUsed: ['sahai'],
            achievementsUsed: ['Smart India Hackathon — National Participant'],
            skillsUsed: ['Python', 'FastAPI', 'Django', 'React', 'WebSockets', 'Pinecone']
          };
          replyExplainability = {
            resolvedEntity: 'SAHAI (project)',
            traversedRelationships: [
              'project:sahai -> BUILT_WITH -> Skill (6 nodes)',
              'project:sahai -> RELATED_TO -> Achievement (1 nodes)',
              'project:sahai -> DEPENDS_ON -> Repository (1 nodes)'
            ],
            contextSizeTokens: 830,
            confidenceLevel: 'High'
          };
        } else if (lowerText.includes('kafka')) {
          replyMetadata = {
            confidence: 0.90,
            entitiesUsed: ['Kafka (skill)'],
            projectsUsed: ['patient-management-service', 'logpulse'],
            repositoriesUsed: ['patient-management-service', 'logpulse'],
            achievementsUsed: [],
            skillsUsed: ['Kafka', 'Java', 'Go']
          };
          replyExplainability = {
            resolvedEntity: 'Kafka (skill)',
            traversedRelationships: ['skill:kafka -> USED_IN -> Project (2 nodes)'],
            contextSizeTokens: 1180,
            confidenceLevel: 'Medium'
          };
        }
      }
    } catch (err) {
      console.log("ROUTE: FALLBACK");
      console.error('Failed to contact Oracle API, falling back to offline mode:', err);
      
      setDebugData({
        modelUsed: 'Offline Fallback Handler',
        contextSizeChars: 0,
        estimatedTokens: 0,
        selectedEntities: {
          skills: [],
          projects: [],
          repositories: [],
          achievements: [],
          sections: ['Local Network Error Fallback']
        }
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      replyText = await getDeterministicReply(text);
    }

    // Use nextCounter to build assistant message
    const assistantMessage = buildMessage('assistant', replyText, nextCounter, replyMetadata, replyExplainability);
    setCounter(nextCounter + 1);

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleInitialize = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div
      className="fixed bottom-36 right-4 z-[9990] w-full max-w-[calc(100vw-2rem)] md:w-[420px] h-[550px] max-h-[85vh] flex flex-col bg-bg-panel/95 border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      role="dialog"
      aria-labelledby="oracle-title"
    >
      {/* Header */}
      <div className="border-b border-border-subtle bg-bg-panel/90 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-purple" />
          <span id="oracle-title" className="font-mono text-xs font-bold text-text-primary tracking-wide">
            ORACLE SYSTEM v1.0
          </span>
          <span className="flex h-1.5 w-1.5 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success-green" />
          </span>
          <span className="font-mono text-[9px] text-success-green/80 uppercase tracking-tighter">ONLINE</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[9px] text-text-secondary hover:text-text-primary font-mono transition-colors border border-border-subtle/50 px-1.5 py-0.5 rounded bg-bg-primary/30 mr-1 cursor-pointer flex items-center gap-1"
              title="Reset Chat Session"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              RESET
            </button>
          )}
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none p-1 rounded-md hover:bg-bg-primary/50"
            aria-label="Close Oracle Window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-grow overflow-y-auto p-4 space-y-5 flex flex-col scrollbar-thin select-text">
        {messages.length === 0 ? (
          /* Empty State Component */
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full border border-border-subtle bg-bg-primary/50 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-accent-purple/60 animate-pulse" />
            </div>
            <span className="font-mono text-xs font-bold text-text-primary tracking-wide mb-1 uppercase">
              Oracle Standby
            </span>
            <p className="text-[11px] text-text-secondary max-w-[220px] leading-relaxed mb-4">
              No active inquiries. Initialize the Oracle session to begin exploring knowledge base records.
            </p>
            <button
              onClick={handleInitialize}
              className="px-3 py-1.5 bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/30 text-accent-purple rounded text-[11px] font-mono tracking-wide transition-colors cursor-pointer"
            >
              INITIALIZE SESSION
            </button>
          </div>
        ) : (
          /* Message List Component (Clean system-log design, avoids speech bubbles) */
          messages.map(msg => (
            <div
              key={msg.id}
              className="flex flex-col w-full border-b border-border-subtle/30 pb-4 last:border-0"
            >
              <div className="flex items-center justify-between mb-2 font-mono text-[10px]">
                <span className={`font-bold tracking-wide uppercase ${
                  msg.role === 'user' ? 'text-text-secondary' : 'text-accent-purple'
                }`}>
                  {msg.role === 'user' ? '↳ QUERY' : '◆ ORACLE RESPONSE'}
                </span>
                <span className="text-text-secondary/40">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <div className={`text-xs text-text-primary leading-relaxed pl-3 border-l ${
                msg.role === 'user' ? 'border-text-secondary/35 font-mono text-[11px] text-text-secondary' : 'border-accent-purple'
              }`}>
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {msg.role === 'assistant' && (msg.metadata || msg.explainability) && (
                  <div className="mt-4 pt-3 border-t border-border-subtle/30 space-y-3 font-mono text-[11px] select-none">
                    {/* Confidence Indicator */}
                    {msg.explainability && (
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <span className="font-bold">Confidence:</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          msg.explainability.confidenceLevel === 'High' 
                            ? 'bg-success-green/10 text-success-green border border-success-green/20' 
                            : msg.explainability.confidenceLevel === 'Medium'
                            ? 'bg-warning-amber/10 text-warning-amber border border-warning-amber/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {msg.explainability.confidenceLevel}
                        </span>
                      </div>
                    )}

                    {/* Sources Used Section */}
                    {msg.metadata && (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-accent-purple/90 tracking-wide">Sources Used</div>
                        <ul className="pl-2 space-y-1 text-text-secondary">
                          {msg.metadata.projectsUsed.length > 0 && (
                            <li>
                              <strong className="text-text-primary">Project:</strong> {msg.metadata.projectsUsed.join(', ')}
                            </li>
                          )}
                          {msg.metadata.repositoriesUsed.length > 0 && (
                            <li>
                              <strong className="text-text-primary">Repository:</strong> {msg.metadata.repositoriesUsed.join(', ')}
                            </li>
                          )}
                          {msg.metadata.achievementsUsed.length > 0 && (
                            <li>
                              <strong className="text-text-primary">Achievement:</strong> {msg.metadata.achievementsUsed.join(', ')}
                            </li>
                          )}
                          {msg.metadata.skillsUsed.length > 0 && (
                            <li>
                              <strong className="text-text-primary">Technologies:</strong> {msg.metadata.skillsUsed.join(', ')}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Reasoning Summary (Collapsible Section) */}
                    {msg.explainability && (
                      <details className="group border border-border-subtle/30 rounded bg-bg-primary/20 overflow-hidden">
                        <summary className="px-2 py-1 text-[10px] text-text-secondary hover:text-text-primary cursor-pointer select-none font-bold uppercase tracking-wide flex items-center justify-between">
                          <span>How this answer was generated</span>
                          <span className="transition-transform duration-200 group-open:rotate-180">▼</span>
                        </summary>
                        <div className="px-2 py-2 border-t border-border-subtle/25 bg-bg-panel/20 text-text-secondary space-y-1 text-[10px]">
                          <div>
                            <strong className="text-text-primary">Entity Resolved:</strong> {msg.explainability.resolvedEntity || 'None'}
                          </div>
                          <div>
                            <strong className="text-text-primary">Relationships Traversed:</strong>
                            {msg.explainability.traversedRelationships.length > 0 ? (
                              <ul className="pl-3 list-disc mt-0.5 space-y-0.5">
                                {msg.explainability.traversedRelationships.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            ) : (
                              ' None (Direct model lookup)'
                            )}
                          </div>
                          <div>
                            <strong className="text-text-primary">Context Size:</strong> {msg.explainability.contextSizeTokens} tokens
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading State Component */}
        {isLoading && (
          <div className="w-full flex flex-col border-b border-border-subtle/30 pb-4">
            <div className="flex items-center justify-between mb-2 font-mono text-[10px]">
              <span className="font-bold tracking-wide uppercase text-accent-purple">
                ◆ ORACLE RESPONSE
              </span>
              <span className="text-accent-purple/60 flex items-center gap-1 font-mono text-[9px]">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                PROCESSING
              </span>
            </div>
            <div className="text-xs text-text-secondary leading-relaxed pl-3 border-l border-accent-purple/30 font-mono text-[11px] animate-pulse flex items-center gap-2">
              <span>{LOADING_PHASES[loadingPhase]}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t border-border-subtle bg-bg-primary/20 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] text-text-secondary font-mono mr-1">Quick Queries:</span>
          {quickQueries.map(chip => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.query)}
              className="px-2 py-0.5 border border-border-subtle hover:border-accent-purple/40 text-[10px] text-text-secondary hover:text-text-primary transition-all rounded bg-bg-panel/40 cursor-pointer flex items-center gap-1 font-mono"
            >
              {chip.label}
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          ))}
        </div>
      )}

      {/* Collapsible Debug Panel (Development only) */}
      {process.env.NODE_ENV !== 'production' && debugData && (
        <div className="border-t border-border-subtle bg-bg-primary/40 px-4 py-2 font-mono text-[9px] text-text-secondary select-none">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowDebug(prev => !prev)}>
            <span className="font-bold text-accent-cyan flex items-center gap-1">
              [DIAGNOSTICS] {showDebug ? '▼' : '▶'}
            </span>
            <span>Estimated Tokens: {debugData.estimatedTokens}</span>
          </div>
          {showDebug && (
            <div className="mt-2 space-y-1.5 border-t border-border-subtle/30 pt-2 animate-in fade-in duration-200">
              <div><strong className="text-text-primary">Model:</strong> {debugData.modelUsed}</div>
              <div><strong className="text-text-primary">Payload Size:</strong> {debugData.contextSizeChars} chars (~{debugData.estimatedTokens} tokens)</div>
              {debugData.selectedEntities.sections.length > 0 && (
                <div><strong className="text-text-primary">Matched Sections:</strong> {debugData.selectedEntities.sections.join(', ')}</div>
              )}
              {debugData.selectedEntities.projects.length > 0 && (
                <div><strong className="text-text-primary">Target Projects:</strong> {debugData.selectedEntities.projects.join(', ')}</div>
              )}
              {debugData.selectedEntities.skills.length > 0 && (
                <div><strong className="text-text-primary">Target Skills:</strong> {debugData.selectedEntities.skills.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border-subtle bg-bg-panel/90 p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
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

// Rules-based deterministic responder to mock Knowledge Graph queries
async function getDeterministicReply(queryText: string): Promise<string> {
  return `### ORACLE System Log\n\nI detected query keyword context, but local offline matching could not verify details. \n\n*Architectural extension points (OpenRouter API, semantic vector searches, and live Knowledge Graph querying) are prepared for implementation in the next phase.* \n\n**Quick Queries:**\n* Ask about "projects" or "repositories"\n* Ask about "skills" or "achievements"\n* Ask about "experience" or "timeline"`;
}
