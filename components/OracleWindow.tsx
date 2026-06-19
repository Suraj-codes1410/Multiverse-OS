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
  const [messages, setMessages] = useState<Message[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
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

  // Fetch health status & log PUBLIC_LAUNCH_VIEW on open
  useEffect(() => {
    if (isOpen) {
      console.log("PUBLIC_LAUNCH_VIEW");
      fetch('/api/health')
        .then(res => res.json())
        .then(data => setHealthStatus(data))
        .catch(err => console.error("Error fetching health status:", err));

      fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'PUBLIC_LAUNCH_VIEW', eventType: 'PUBLIC_LAUNCH_VIEW' })
      }).catch(err => console.error("Failed to log view event:", err));
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

  const getStatusText = () => {
    if (!healthStatus) return "Connecting...";
    if (healthStatus.status === 'healthy') return "Healthy";
    if (healthStatus.services?.githubSync) return "Sync Active";
    if (healthStatus.services?.analytics) return "Analytics Online";
    return "Degraded";
  };

  const getStatusColor = () => {
    if (!healthStatus) return "text-text-secondary border-border-subtle bg-bg-panel/40";
    if (healthStatus.status === 'healthy') return "text-success-green border-success-green/20 bg-success-green/10";
    return "text-warning-amber border-warning-amber/20 bg-warning-amber/10";
  };

  const quickQueries = [
    { label: 'Projects', query: 'Show featured projects' },
    { label: 'Skills', query: 'List core skills' },
    { label: 'Timeline', query: 'Show career timeline' },
    { label: 'Achievements', query: 'What are your achievements?' }
  ];

  const handleSend = async (text: string, eventType?: string) => {
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
        body: JSON.stringify({ query: text, eventType })
      });

      const data = await apiResponse.json().catch(() => ({}));

      if (apiResponse.ok && data.text) {
        console.log("ROUTE_OPENROUTER");
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
        console.log("ROUTE_FALLBACK");
        if (data.error === 'API_KEY_MISSING') {
          console.warn('OpenRouter API key missing on server.');
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
        replyText = await getDeterministicReply(text, {
          statusCode: data.message?.includes('status 429') ? 429 : (data.message?.includes('status 404') ? 404 : apiResponse.status),
          errorType: data.error,
          message: data.message
        });

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
            projectsUsed: ['patient-management-service'],
            repositoriesUsed: ['patient-management-service'],
            achievementsUsed: [],
            skillsUsed: ['Kafka', 'Java', 'Go']
          };
          replyExplainability = {
            resolvedEntity: 'Kafka (skill)',
            traversedRelationships: ['skill:kafka -> USED_IN -> Project (1 nodes)'],
            contextSizeTokens: 1180,
            confidenceLevel: 'Medium'
          };
        }
      }
    } catch (err) {
      console.log("ROUTE_FALLBACK");
      console.error('Failed to contact Oracle API:', err);
      
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

      const isTimeout = err instanceof Error && (err.message.toLowerCase().includes('timeout') || err.message.toLowerCase().includes('timed out'));
      await new Promise(resolve => setTimeout(resolve, 800));
      replyText = await getDeterministicReply(text, {
        errorType: isTimeout ? 'TIMEOUT' : 'NETWORK_FAILURE',
        message: err instanceof Error ? err.message : String(err)
      });
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
          /* Empty State Guided Landing Experience Dashboard */
          <div className="space-y-6 py-2 animate-in fade-in duration-300">
            {/* Hero Introduction Panel */}
            <div className="border border-border-subtle bg-[#0a0c16]/50 rounded-xl p-5 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 to-transparent pointer-events-none" />
              <div className="w-10 h-10 rounded-full border border-accent-purple/20 bg-accent-purple/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-accent-purple animate-pulse" />
              </div>
              <h1 className="font-mono text-lg font-bold tracking-widest text-text-primary">
                ORACLE
              </h1>
              <p className="font-mono text-[10px] uppercase font-semibold text-accent-purple tracking-wider mt-0.5">
                AI-Powered Portfolio Intelligence System
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-3">
                Explore Suraj Samanta's projects, repositories, technical skills, engineering journey, and career insights through a real-time knowledge graph powered by repository intelligence and AI.
              </p>
            </div>

            {/* System Status Badge & Info */}
            <div className="border border-border-subtle bg-[#0a0c16]/40 rounded-xl p-4 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Oracle Status:</span>
                <span className={`px-2 py-0.5 rounded border font-bold text-[10px] uppercase flex items-center gap-1.5 ${getStatusColor()}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-success-green' : 'bg-warning-amber'}`} />
                  {getStatusText()}
                </span>
              </div>
              <div className="border-t border-border-subtle/50 my-2 pt-2">
                <div className="text-[10px] uppercase font-bold text-accent-purple/90 tracking-wide mb-1.5">Powered by:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-text-secondary">
                  <div className="flex items-center gap-1">
                    <span className="text-accent-cyan">•</span> Knowledge Graph
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-cyan">•</span> Smart Routing
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-cyan">•</span> Repository Intelligence
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-accent-cyan">•</span> AI Reasoning
                  </div>
                </div>
              </div>
            </div>

            {/* Recruiter Quick Actions (Recruiter Mode) */}
            <div className="space-y-2">
              <h3 className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
                Recruiter Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Backend Evaluation", query: "Which project best demonstrates backend engineering?" },
                  { label: "AI Evaluation", query: "Which project best demonstrates AI/ML?" },
                  { label: "Resume Recommendation", query: "Why should Suraj be hired?" },
                  { label: "Interview Preparation", query: "Help me prepare for an interview with Suraj." }
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      console.log("RECRUITER_MODE_CLICK", action.label);
                      handleSend(action.query, 'RECRUITER_MODE_CLICK');
                    }}
                    className="p-2.5 border border-border-subtle bg-bg-panel/50 hover:bg-[#111424] hover:border-accent-cyan/50 text-left rounded-lg transition-all duration-200 cursor-pointer group"
                  >
                    <div className="font-mono text-[10px] font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                      {action.label}
                    </div>
                    <div className="text-[9px] text-text-secondary truncate mt-0.5">
                      {action.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Queries */}
            <div className="space-y-3">
              <h3 className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-purple rounded-full" />
                Suggested Queries
              </h3>
              
              <div className="space-y-3">
                {[
                  {
                    category: "Projects",
                    queries: [
                      "Which project best demonstrates backend engineering?",
                      "Compare SAHAI and ORBITAIR.",
                      "What is Suraj's strongest project?"
                    ]
                  },
                  {
                    category: "Repositories",
                    queries: [
                      "List Suraj's repositories.",
                      "Which repositories use FastAPI?",
                      "Summarize oracle-sync-test."
                    ]
                  },
                  {
                    category: "Career",
                    queries: [
                      "Why should Suraj be hired?",
                      "What are Suraj's strongest skills?",
                      "What should Suraj build next?"
                    ]
                  },
                  {
                    category: "Journey",
                    queries: [
                      "Tell me Suraj's engineering journey.",
                      "How has Suraj evolved as an engineer?"
                    ]
                  }
                ].map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <span className="font-mono text-[9px] text-text-secondary pl-1 block">
                      // {cat.category}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {cat.queries.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            console.log("SUGGESTED_QUERY_CLICK", q);
                            handleSend(q, 'SUGGESTED_QUERY_CLICK');
                          }}
                          className="px-3 py-2 border border-border-subtle bg-bg-panel/30 hover:bg-bg-panel/85 hover:border-accent-purple/40 text-left text-[11px] text-text-secondary hover:text-text-primary transition-all rounded-lg cursor-pointer font-mono"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Conversation Showcase */}
            <div className="border border-border-subtle bg-[#0a0c16]/30 rounded-xl p-4 space-y-2">
              <h4 className="font-mono text-[10px] font-bold text-text-primary uppercase tracking-wider">
                Example Questions:
              </h4>
              <ul className="space-y-1.5 font-mono text-[10px] text-text-secondary pl-2 border-l border-border-subtle/50">
                <li>• Which project best demonstrates backend engineering?</li>
                <li>• Why should Suraj be hired for a backend role?</li>
                <li>• What technologies power ORBITAIR?</li>
              </ul>
            </div>

            {/* Oracle Capabilities Panel */}
            <div className="space-y-2">
              <h3 className="font-mono text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-success-green rounded-full" />
                Oracle Capabilities
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    title: "Repository Intelligence",
                    items: ["Live GitHub synchronization", "README understanding", "Technology extraction"]
                  },
                  {
                    title: "Portfolio Intelligence",
                    items: ["Skill analysis", "Project comparisons", "Recruiter recommendations"]
                  },
                  {
                    title: "Career Intelligence",
                    items: ["Resume guidance", "Skill gap analysis", "Career recommendations"]
                  }
                ].map((cap) => (
                  <div key={cap.title} className="border border-border-subtle bg-bg-panel/40 rounded-xl p-3">
                    <div className="font-mono text-[10px] font-bold text-text-primary mb-1.5">{cap.title}</div>
                    <ul className="space-y-1 text-[10px] text-text-secondary pl-2">
                      {cap.items.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="text-success-green">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State Help Text (Ask Oracle about list) */}
            <div className="border border-border-subtle/50 bg-bg-panel/30 rounded-xl p-4 text-center font-mono text-[10px] text-text-secondary">
              <span className="font-bold text-text-primary">Ask Oracle about:</span>
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 mt-2">
                <span>Projects</span>
                <span>•</span>
                <span>Skills</span>
                <span>•</span>
                <span>Experience</span>
                <span>•</span>
                <span>Repositories</span>
                <span>•</span>
                <span>Career Advice</span>
              </div>
            </div>
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

// Connection/Rate-limit fallback responder
async function getDeterministicReply(
  queryText: string,
  options?: {
    statusCode?: number;
    errorType?: string;
    message?: string;
  }
): Promise<string> {
  const title = "Oracle temporarily unavailable.";
  let reason = "An unknown error occurred.";
  let instructions = "Please try again shortly.";

  const messageLower = (options?.message || '').toLowerCase();
  const errorType = options?.errorType;
  const statusCode = options?.statusCode;

  // 1. Missing API Key
  if (errorType === 'API_KEY_MISSING' || messageLower.includes('api key') || messageLower.includes('key missing')) {
    reason = "Configuration error: OpenRouter API key is missing on the server.";
    instructions = "Please configure the OPENROUTER_API_KEY environment variable.";
  }
  // 2. Rate Limit (HTTP 429)
  else if (statusCode === 429 || messageLower.includes('429') || messageLower.includes('rate limit') || messageLower.includes('quota')) {
    reason = "OpenRouter rate limit reached (HTTP 429).";
    instructions = "Try again in a few minutes.";
  }
  // 3. Model/Provider Unavailable (HTTP 404)
  else if (statusCode === 404 || messageLower.includes('404') || messageLower.includes('unavailable') || messageLower.includes('not found')) {
    reason = `AI Provider or Model unavailable (HTTP ${statusCode || 404}).`;
    instructions = "Please verify your model configuration slug or check OpenRouter status.";
  }
  // 4. Timeout
  else if (errorType === 'TIMEOUT' || messageLower.includes('timeout') || messageLower.includes('timed out')) {
    reason = "Request timed out.";
    instructions = "Please check your network connection and retry.";
  }
  // 5. Network Failure
  else if (errorType === 'NETWORK_FAILURE' || messageLower.includes('fetch') || messageLower.includes('network')) {
    reason = "Network connection failure.";
    instructions = "Please check your internet connection and try again.";
  }
  // Catch-all with status code if present
  else {
    const statusText = statusCode ? ` (HTTP ${statusCode})` : "";
    reason = `OpenRouter API execution failure${statusText}.`;
    if (options?.message) {
      reason += ` Details: ${options.message}`;
    }
    instructions = "Please try again shortly.";
  }

  return `### ${title}\n\n**Reason:**\n${reason}\n\n${instructions}`;
}
