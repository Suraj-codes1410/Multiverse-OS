'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  GitBranch, 
  Cpu, 
  BookOpen, 
  Award, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  Workflow,
  Sparkles,
  Link2,
  Bookmark
} from 'lucide-react';
import Container from './Container';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import { KnowledgeNode, KnowledgeRelationship, NodeType } from '@/lib/knowledge/types';
import { KnowledgeGraph } from '@/lib/knowledge/graph';

interface KnowledgeExplorerClientProps {
  initialNodes: KnowledgeNode[];
  initialRelationships: KnowledgeRelationship[];
}

const NODE_TYPES: (NodeType | 'All')[] = [
  'All',
  'Project',
  'Skill',
  'Repository',
  'Achievement',
  'Experience',
  'Education',
  'Timeline Event'
];

export default function KnowledgeExplorerClient({ 
  initialNodes, 
  initialRelationships 
}: KnowledgeExplorerClientProps) {
  // Reconstruct graph locally on client to reuse pathfinding and query methods
  const graph = useMemo(() => {
    const g = new KnowledgeGraph();
    initialNodes.forEach(n => g.addNode(n));
    initialRelationships.forEach(r => g.addRelationship(r));
    return g;
  }, [initialNodes, initialRelationships]);

  // States
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    initialNodes.find(n => n.id === 'project:orbitair')?.id || initialNodes[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<NodeType | 'All'>('All');
  
  // Pathfinder states
  const [pathStartId, setPathStartId] = useState('');
  const [pathEndId, setPathEndId] = useState('');
  const [pathResult, setPathResult] = useState<KnowledgeNode[] | null>(null);
  const [pathError, setPathError] = useState('');

  // Selected node metadata
  const selectedNode = useMemo(() => {
    return graph.getNode(selectedNodeId);
  }, [graph, selectedNodeId]);

  // Neighbors for selected node
  const neighbors = useMemo(() => {
    if (!selectedNodeId) return [];
    return graph.getNeighbors(selectedNodeId, 'both');
  }, [graph, selectedNodeId]);

  // Filtered and searched nodes list
  const filteredNodes = useMemo(() => {
    let nodes = graph.getNodes();
    
    if (activeTypeFilter !== 'All') {
      nodes = nodes.filter(n => n.type === activeTypeFilter);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(node => {
        if (node.label.toLowerCase().includes(query)) return true;
        if (node.type.toLowerCase().includes(query)) return true;
        if (node.properties.description && String(node.properties.description).toLowerCase().includes(query)) return true;
        return false;
      });
    }

    // Sort alphabetically by label
    return [...nodes].sort((a, b) => a.label.localeCompare(b.label));
  }, [graph, activeTypeFilter, searchQuery]);

  // Node type badges styling helper
  const getTypeBadgeStyles = (type: NodeType) => {
    switch (type) {
      case 'Project': return { color: 'cyan' as const, icon: Cpu };
      case 'Skill': return { color: 'purple' as const, icon: Sparkles };
      case 'Repository': return { color: 'green' as const, icon: GitBranch };
      case 'Achievement': return { color: 'amber' as const, icon: Award };
      case 'Experience': return { color: 'default' as const, icon: Briefcase };
      case 'Education': return { color: 'default' as const, icon: BookOpen };
      case 'Timeline Event': return { color: 'default' as const, icon: Calendar };
      default: return { color: 'default' as const, icon: Bookmark };
    }
  };

  const getIconColorClass = (color: 'cyan' | 'purple' | 'green' | 'amber' | 'default') => {
    switch (color) {
      case 'cyan': return 'text-accent-cyan';
      case 'purple': return 'text-accent-purple';
      case 'green': return 'text-success-green';
      case 'amber': return 'text-warning-amber';
      default: return 'text-text-secondary';
    }
  };

  // Traces path in client graph
  const handleTracePath = () => {
    setPathError('');
    setPathResult(null);

    if (!pathStartId || !pathEndId) {
      setPathError('SELECT_START_AND_END_NODES');
      return;
    }
    if (pathStartId === pathEndId) {
      setPathError('START_AND_END_NODES_MUST_DIFFER');
      return;
    }

    const path = graph.findPath(pathStartId, pathEndId);
    if (path) {
      setPathResult(path);
    } else {
      setPathError('NO_DIRECT_PATH_FOUND_BETWEEN_NODES');
    }
  };

  // Group neighbors by type
  const groupedNeighbors = useMemo(() => {
    const groups: { [key in NodeType]?: { node: KnowledgeNode; rel: KnowledgeRelationship }[] } = {};
    neighbors.forEach(item => {
      const type = item.node.type;
      if (!groups[type]) groups[type] = [];
      groups[type]?.push({ node: item.node, rel: item.relationship });
    });
    return groups;
  }, [neighbors]);

  return (
    <div className="flex-grow py-8 font-mono text-xs sm:text-sm text-text-secondary select-none">
      <Container>
        {/* Header Block */}
        <div className="border border-border-subtle bg-bg-panel/40 p-6 md:p-8 rounded-xl mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Workflow className="w-4 h-4 text-accent-cyan" />
              <span className="text-[10px] tracking-widest text-accent-cyan uppercase">
                SYSTEM_PORTFOLIO // KNOWLEDGE_GRAPH_EXPLORER
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase text-text-primary tracking-tight mb-2">
              Knowledge Explorer
            </h1>
            <p className="text-xs text-text-secondary leading-relaxed font-sans max-w-2xl font-light">
              Explore semantic mappings across academic credentials, hackathon achievements, source code repositories, technical skills, and professional histories. Click items to browse relationships.
            </p>
          </div>
        </div>

        {/* Pathfinder Sandbox Panel */}
        <Card hoverable={false} className="border-border-subtle bg-bg-panel/30 mb-8 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2">
            <Workflow className="w-4 h-4 text-accent-purple" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              PATHFINDER_SANDBOX // COMPUTE_RELATIONSHIP_VECTORS
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4 font-sans text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-text-secondary mb-1.5">&gt; START_NODE</label>
              <select 
                value={pathStartId}
                onChange={e => setPathStartId(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer text-xs"
              >
                <option value="">SELECT SOURCE NODE</option>
                {initialNodes.map(n => (
                  <option key={n.id} value={n.id}>[{n.type.toUpperCase()}] {n.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-text-secondary mb-1.5">&gt; TARGET_NODE</label>
              <select 
                value={pathEndId}
                onChange={e => setPathEndId(e.target.value)}
                className="w-full bg-bg-primary border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-cyan cursor-pointer text-xs"
              >
                <option value="">SELECT TARGET NODE</option>
                {initialNodes.map(n => (
                  <option key={n.id} value={n.id}>[{n.type.toUpperCase()}] {n.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Button onClick={handleTracePath} variant="primary" size="sm" className="w-full uppercase">
                Trace Connections
              </Button>
            </div>
          </div>

          {/* Pathfinder output */}
          {pathError && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 font-mono text-xs uppercase select-text">
              ERR: {pathError}
            </div>
          )}

          {pathResult && (
            <div className="p-4 bg-bg-primary/50 border border-border-subtle rounded-lg select-text overflow-x-auto">
              <span className="text-accent-cyan font-bold block mb-3 font-mono text-[10px] uppercase">&gt; COMPUTED_CONNECTION_PATHWAY:</span>
              <div className="flex flex-wrap items-center gap-3 font-sans text-xs">
                {pathResult.map((node, idx) => {
                  const nodeConf = getTypeBadgeStyles(node.type);
                  return (
                    <React.Fragment key={node.id}>
                      <button 
                        onClick={() => setSelectedNodeId(node.id)}
                        className="flex items-center gap-1.5 bg-bg-panel border border-border-subtle px-3 py-1.5 rounded-lg hover:border-accent-cyan hover:shadow-[0_0_8px_rgba(0,242,254,0.15)] transition-all cursor-pointer select-none"
                      >
                        <nodeConf.icon className={`w-3.5 h-3.5 ${getIconColorClass(nodeConf.color)}`} />
                        <span className="text-text-primary font-semibold font-mono">{node.label}</span>
                        <Badge color={nodeConf.color} className="text-[8px] font-mono leading-none">{node.type.toUpperCase()}</Badge>
                      </button>
                      
                      {idx < pathResult.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-text-secondary flex-shrink-0 animate-pulse" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Search & Nodes Index */}
          <div className="space-y-6">
            <Card hoverable={false} className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary mb-4 border-b border-border-subtle/40 pb-2">
                INDEX_DIRECTORY
              </h3>
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-secondary" />
                <input 
                  type="text"
                  placeholder="SEARCH_NODES_OR_PROPERTIES..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-primary border border-border-subtle rounded-lg pl-9 pr-4 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/20 placeholder-text-secondary/50 uppercase"
                />
              </div>

              {/* Filters list */}
              <div className="flex flex-wrap gap-1.5 mb-4 max-h-[140px] overflow-y-auto pr-1">
                {NODE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveTypeFilter(type)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase transition-all border cursor-pointer ${
                      activeTypeFilter === type 
                        ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30' 
                        : 'bg-transparent text-text-secondary border-border-subtle hover:border-border-bright'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Scrollable Node Selection List */}
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-2 select-none border-t border-border-subtle/30 pt-3">
                {filteredNodes.length > 0 ? (
                  filteredNodes.map(node => {
                    const nodeConf = getTypeBadgeStyles(node.type);
                    const isSelected = node.id === selectedNodeId;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-bg-panel border-accent-cyan shadow-[0_0_10px_rgba(0,242,254,0.1)] text-text-primary'
                            : 'bg-transparent border-border-subtle/50 text-text-secondary hover:bg-bg-panel/30 hover:border-border-subtle'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <nodeConf.icon className={`w-3.5 h-3.5 flex-shrink-0 ${getIconColorClass(nodeConf.color)}`} />
                          <span className="font-semibold truncate text-xs">{node.label}</span>
                        </div>
                        <Badge color={nodeConf.color} className="text-[8px] font-mono leading-none flex-shrink-0 uppercase">{node.type}</Badge>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-text-secondary/50 italic font-mono uppercase">
                    No matching index files found
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Columns: Selected Node Dossier details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedNode ? (
              <>
                {/* Dossier Meta Details */}
                <Card hoverable={false} className="border-border-subtle bg-bg-panel/30 p-6 relative overflow-hidden select-text">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle/50 pb-4 mb-4 select-none">
                    <div className="flex items-center gap-3">
                      {React.createElement(getTypeBadgeStyles(selectedNode.type).icon, {
                        className: `w-5 h-5 ${getIconColorClass(getTypeBadgeStyles(selectedNode.type).color)}`
                      })}
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-text-primary uppercase tracking-tight leading-none mb-1">
                          {selectedNode.label}
                        </h2>
                        <span className="text-[9px] text-text-secondary uppercase tracking-widest block font-mono">
                          ID: {selectedNode.id}
                        </span>
                      </div>
                    </div>
                    <Badge color={getTypeBadgeStyles(selectedNode.type).color} className="text-[10px] uppercase font-mono px-3 py-1">
                      {selectedNode.type}
                    </Badge>
                  </div>

                  {/* Properties table */}
                  <div className="space-y-4 font-sans text-xs sm:text-sm">
                    {selectedNode.properties.description && (
                      <div>
                        <span className="font-mono text-[10px] text-accent-cyan uppercase block mb-1 select-none">&gt; DESCRIPTION</span>
                        <p className="text-text-secondary leading-relaxed font-light select-text">
                          {String(selectedNode.properties.description)}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle/30 font-mono text-[11px] select-text">
                      {Object.entries(selectedNode.properties).map(([key, val]) => {
                        if (key === 'description' || key === 'originalData' || val === undefined || val === null || val === '') return null;
                        
                        // Handle links
                        if (key === 'url' && typeof val === 'string') {
                          return (
                            <div key={key} className="bg-bg-primary/30 border border-border-subtle/50 p-2.5 rounded-lg">
                              <span className="text-text-secondary block text-[9px] uppercase select-none mb-0.5">SOURCE_LINK:</span>
                              <a href={val} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline flex items-center gap-1 font-semibold truncate">
                                <Link2 className="w-3 h-3 flex-shrink-0" /> {val}
                              </a>
                            </div>
                          );
                        }

                        return (
                          <div key={key} className="bg-bg-primary/30 border border-border-subtle/50 p-2.5 rounded-lg">
                            <span className="text-text-secondary block text-[9px] uppercase select-none mb-0.5">{key}:</span>
                            <span className="text-text-primary font-bold">{String(val)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Node Relationships Directory */}
                <Card hoverable={false} className="p-6">
                  <div className="flex items-center gap-2 mb-6 border-b border-border-subtle/50 pb-2 select-none">
                    <Workflow className="w-4 h-4 text-accent-cyan" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                      RELATIONSHIPS_DIRECTORY // ACTIVE_SEMANTIC_EDGES
                    </h2>
                  </div>

                  {neighbors.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(groupedNeighbors).map(([type, items]) => {
                        if (!items || items.length === 0) return null;
                        const typeStyle = getTypeBadgeStyles(type as NodeType);
                        return (
                          <div key={type} className="space-y-2">
                            <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest border-l-2 border-border-bright pl-2 select-none">
                              {type.toUpperCase() === 'SKILL' ? 'TECHNOLOGIES / SKILLS' : `${type.toUpperCase()}S`}
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {items.map(({ node, rel }) => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedNodeId(node.id)}
                                  className="w-full flex flex-col items-start p-3 bg-bg-primary/30 border border-border-subtle hover:border-accent-cyan hover:shadow-[0_0_10px_rgba(0,242,254,0.1)] transition-all rounded-lg text-left cursor-pointer group"
                                >
                                  <div className="flex items-center justify-between w-full mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                      <typeStyle.icon className={`w-3.5 h-3.5 flex-shrink-0 ${getIconColorClass(typeStyle.color)}`} />
                                      <span className="text-xs font-bold text-text-primary group-hover:text-accent-cyan transition-colors truncate font-sans">
                                        {node.label}
                                      </span>
                                    </div>
                                    <Badge color="purple" variant="outline" className="text-[8px] font-mono px-1 uppercase tracking-tight py-0 leading-none">
                                      {rel.type}
                                    </Badge>
                                  </div>
                                  {rel.properties?.description && (
                                    <span className="text-[10px] text-text-secondary leading-normal font-sans font-light truncate w-full">
                                      {rel.properties.description}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-text-secondary/50 italic font-mono uppercase select-none">
                      No semantic connections registered for this node
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <div className="border border-dashed border-border-subtle bg-bg-panel/10 p-12 text-center rounded-xl text-text-secondary/50 italic font-mono uppercase select-none">
                No active dossier loaded. Select an index item from the directory list.
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
