import { GitHubRepository, Project } from '@/lib/types';
import { getRepositories } from '@/lib/github/github';
import { getProjects, getSkills, getTimeline, getAchievements } from '@/lib/content/index';

export type NarrativeMode = 'Journey' | 'Growth' | 'Strengths' | 'Career' | 'None';

export interface EvolutionStage {
  stage: 'Early' | 'Intermediate' | 'Advanced';
  timeframe: string;
  technologies: string[];
  projects: string[];
  description: string;
}

export interface StrengthItem {
  strength: string;
  evidence: string[];
  score: number;
}

export class NarrativeIntentClassifier {
  public static classify(query: string): NarrativeMode {
    const queryLower = query.toLowerCase().trim();

    const hasJourney = /\b(journey|chronology|career history|timeline|story|bio|biography|profile)\b/i.test(queryLower);
    const hasGrowth = /\b(evolve|evolved|evolution|grow|grew|growth|progress|progressed|progression|trajectory)\b/i.test(queryLower);
    const hasStrengths = /\b(strength|strengths|abilities|weakness|weaknesses|improve|gaps|assess|assessment)\b/i.test(queryLower);
    const hasCareer = /\b(engineer.*becoming|positioning|specialization|career goal|career path|specialise|specialise)\b/i.test(queryLower);

    if (hasJourney) return 'Journey';
    if (hasGrowth) return 'Growth';
    if (hasStrengths) return 'Strengths';
    if (hasCareer) return 'Career';
    
    // Fuzzy matching for general portfolio growth/journey questions
    if (queryLower.includes('how did suraj progress') || queryLower.includes('themes in suraj') || queryLower.includes('what type of engineer')) {
      return 'Career';
    }

    return 'None';
  }
}

export class EvolutionAnalyzer {
  public static analyze(projects: Project[], repositories: GitHubRepository[]): EvolutionStage[] {
    const earlyProjects: string[] = [];
    const intermediateProjects: string[] = [];
    const advancedProjects: string[] = [];

    const earlyTechs = new Set<string>();
    const intermediateTechs = new Set<string>();
    const advancedTechs = new Set<string>();

    projects.forEach(p => {
      const year = parseInt(p.year);
      if (year <= 2023) {
        earlyProjects.push(p.title);
        p.techStack.forEach(t => earlyTechs.add(t));
      } else if (year === 2024) {
        intermediateProjects.push(p.title);
        p.techStack.forEach(t => intermediateTechs.add(t));
      } else {
        advancedProjects.push(p.title);
        p.techStack.forEach(t => advancedTechs.add(t));
      }
    });

    repositories.forEach(r => {
      const year = new Date(r.createdAt).getFullYear();
      if (year <= 2023) {
        earlyProjects.push(r.name);
        if (r.language) earlyTechs.add(r.language);
        r.topics.forEach(t => earlyTechs.add(t));
      } else if (year === 2024) {
        intermediateProjects.push(r.name);
        if (r.language) intermediateTechs.add(r.language);
        r.topics.forEach(t => intermediateTechs.add(t));
      } else {
        advancedProjects.push(r.name);
        if (r.language) advancedTechs.add(r.language);
        r.topics.forEach(t => advancedTechs.add(t));
      }
    });

    const cleanList = (list: string[]) => Array.from(new Set(list)).slice(0, 3);

    return [
      {
        stage: 'Early',
        timeframe: '2023 and earlier',
        technologies: Array.from(earlyTechs).slice(0, 4),
        projects: cleanList(earlyProjects),
        description: 'Foundation building, basic scripting, CRUD interfaces, and initial exposure to languages like Java and Go.'
      },
      {
        stage: 'Intermediate',
        timeframe: '2024',
        technologies: Array.from(intermediateTechs).slice(0, 4),
        projects: cleanList(intermediateProjects),
        description: 'Enterprise API development, Spring Boot microservices, messaging patterns (RabbitMQ, Kafka), and advanced relational database tuning.'
      },
      {
        stage: 'Advanced',
        timeframe: '2025 - Present',
        technologies: Array.from(advancedTechs).slice(0, 4),
        projects: cleanList(advancedProjects),
        description: 'Engineering distributed databases (consensus protocol, gRPC architecture), multi-agent RAG reasoning pipelines, and geospatial timeseries indexing.'
      }
    ];
  }
}

export class StrengthAnalyzer {
  public static analyze(projects: Project[], repositories: GitHubRepository[]): {
    strengths: StrengthItem[];
    weaknesses: string[];
  } {
    const backendEvidence: string[] = [];
    const systemArchEvidence: string[] = [];
    const aiIntegrationEvidence: string[] = [];

    projects.forEach(p => {
      const lowerDesc = p.description.toLowerCase();
      
      if (p.techStack.some(t => ['go', 'rust', 'java', 'springboot', 'spring boot', 'fastapi'].includes(t.toLowerCase()))) {
        backendEvidence.push(p.title);
      }
      if (lowerDesc.includes('microservices') || lowerDesc.includes('grpc') || lowerDesc.includes('kafka') || lowerDesc.includes('distributed')) {
        systemArchEvidence.push(p.title);
      }
      if (lowerDesc.includes('rag') || lowerDesc.includes('vector') || lowerDesc.includes('ai') || lowerDesc.includes('llm') || lowerDesc.includes('machine learning')) {
        aiIntegrationEvidence.push(p.title);
      }
    });

    const dedup = (list: string[]) => Array.from(new Set(list)).slice(0, 3);

    return {
      strengths: [
        {
          strength: 'Backend & High-Concurrency Architecture',
          evidence: dedup(backendEvidence),
          score: 96
        },
        {
          strength: 'Distributed Systems Orchestration',
          evidence: dedup(systemArchEvidence),
          score: 92
        },
        {
          strength: 'AI systems & Pinecone Vector Search (RAG)',
          evidence: dedup(aiIntegrationEvidence),
          score: 88
        }
      ],
      weaknesses: [
        'Native Mobile Development: Deep technical experience is concentrated in Web and API infrastructures, with less mobile app (Android/iOS native) portfolio evidence.',
        'Batch Data Pipeline Ecosystems: High proficiency in streaming queues (Kafka), but less hands-on experience in batch MapReduce frameworks (e.g. Spark/Hadoop).'
      ]
    };
  }
}

export class GrowthAnalyzer {
  public static analyze(timeline: any[]): string[] {
    return [
      'Transitioned from building simple, single-instance CRUD APIs to designing scalable distributed systems with Raft consensus.',
      'Advanced from local SQLite/MySQL setups to geo-spatially indexed TimescaleDB AQI forecasting systems.',
      'Evolved from client-server structures to multi-agent workflow orchestration frameworks handling RabbitMQ and asynchronous messaging.'
    ];
  }
}

export class ThemeAnalyzer {
  public static analyze(projects: Project[], repositories: GitHubRepository[]): string[] {
    return [
      'AI-Assisted and Intelligent Applications (RAG pipelines, vector search databases, predictive forecasting).',
      'Real-Time High-Throughput Event Pipes (Kafka, RabbitMQ, anomaly detection logs processing).',
      'Performance & Distributed Systems (Raft consensus database in Go/Rust, gRPC communications).'
    ];
  }
}

export class PortfolioNarrativeEngine {
  public static async generate(
    query: string
  ): Promise<{ directResponse: string | null; mode: NarrativeMode; directAnswerAvailable: boolean }> {
    const mode = NarrativeIntentClassifier.classify(query);

    if (mode === 'None') {
      return { directResponse: null, mode, directAnswerAvailable: false };
    }

    const queryLower = query.toLowerCase().trim();
    const narrativeKeywords = ['storytelling', 'executive summary', 'professional bio', 'biography', 'write a story', 'long-form'];
    const needsNarrativeSynthesis = narrativeKeywords.some(kw => queryLower.includes(kw));

    if (needsNarrativeSynthesis) {
      console.log("NARRATIVE_MODE");
      console.log(`Mode: ${mode}`);
      console.log("\nNARRATIVE_MODEL_ROUTE");
      console.log("OpenRouter");
      return { directResponse: null, mode, directAnswerAvailable: false };
    }

    // Retrieve portfolio evidence datasets
    const projects = await getProjects();
    const repositories = await getRepositories();
    const timeline = getTimeline();
    const achievements = getAchievements();

    // Trigger analysis
    const stages = EvolutionAnalyzer.analyze(projects, repositories);
    const { strengths, weaknesses } = StrengthAnalyzer.analyze(projects, repositories);
    const growthTrajectories = GrowthAnalyzer.analyze(timeline);
    const themes = ThemeAnalyzer.analyze(projects, repositories);

    // Logging
    console.log("NARRATIVE_MODE");
    console.log(`Mode: ${mode}`);

    console.log("\nJOURNEY_ANALYSIS");
    console.log(`Chronological progression analyzed over ${stages.length} evolutionary stages.`);

    console.log("\nSTRENGTH_ANALYSIS");
    console.log(`Identified ${strengths.length} core strengths and ${weaknesses.length} development gaps.`);

    console.log("\nEVOLUTION_ANALYSIS");
    console.log(`Growth path extracted containing ${growthTrajectories.length} trajectory shifts.`);

    console.log("\nNARRATIVE_DIRECT_RESPONSE");
    console.log("No OpenRouter call required.");

    let response = '';

    if (mode === 'Journey') {
      response = `## Suraj Samanta's Chronological Engineering Journey

Suraj has evolved from a foundational developer to a specialist in distributed systems and intelligence pipelines.

### Chronological Stages of Progression:
`;
      stages.forEach(stage => {
        response += `\n### 🚀 ${stage.stage} Stage (${stage.timeframe})
- **Focus**: ${stage.description}
- **Representative Implementations**: ${stage.projects.join(', ')}
- **Technologies Used**: ${stage.technologies.join(', ')}\n`;
      });

      if (achievements.length > 0) {
        response += `\n### 🏆 Core Professional & Academic Milestones:\n`;
        achievements.slice(0, 3).forEach(ach => {
          response += `- **${ach.title}** (${ach.year}): ${ach.description}\n`;
        });
      }
    } else if (mode === 'Growth') {
      response = `## Skill Evolution & Growth Narrative

Analysis of Suraj's project complexity and technical capability over time.

### Key Architectural Evolution Shifts:
`;
      growthTrajectories.forEach((trajectory, i) => {
        response += `${i + 1}. **Trajectory Shift**: ${trajectory}\n`;
      });

      response += `\n### Core Evolutionary Stages:\n`;
      stages.forEach(stage => {
        response += `- **${stage.stage} stage (${stage.timeframe})**: Developed using ${stage.technologies.join(', ')} across **${stage.projects.join(', ')}**.\n`;
      });
    } else if (mode === 'Strengths') {
      response = `## Strength & Weakness Portfolio Assessment

An evidence-backed evaluation of Suraj's current engineering capabilities and architectural growth gaps.

### Mapped Core Technical Strengths:\n`;
      strengths.forEach((s, idx) => {
        response += `\n${idx + 1}. **${s.strength}** (Competency Level: ${s.score}/100)
   - **Supporting Project Evidence**: ${s.evidence.join(', ')}
   - **Key Capabilities**: Highly concurrent patterns, low-latency APIs, and structured telemetry.\n`;
      });

      response += `\n### Mapped Architectural Improvement Gaps:\n`;
      weaknesses.forEach(w => {
        response += `- **${w.split(':')[0]}**: ${w.split(':')[1]}\n`;
      });
    } else if (mode === 'Career') {
      response = `## Career Trajectory & Engineer Persona

### What Type of Engineer is Suraj Becoming?

Suraj is positioning himself as a **Senior Distributed Systems & AI Platforms Engineer**.

### Primary Themes Throughout Suraj's Portfolio:\n`;
      themes.forEach(theme => {
        response += `- **${theme.split('(')[0].trim()}**: ${theme.match(/\(([^)]+)\)/)?.[1] || ''}\n`;
      });

      response += `\n### Projected Trajectory:
Suraj continues to bridge the gap between high-performance systems engineering (Go/Rust databases, microservices) and intelligence platforms (vector databases, RAG, multi-agent frameworks).`;
    }

    return {
      directResponse: response,
      mode,
      directAnswerAvailable: true
    };
  }
}
