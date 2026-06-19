import { getProjects } from '../data';
import { getRepositories } from './github';
import { buildKnowledgeGraph } from '../knowledge/builder';

export interface RankedProject {
  projectTitle: string;
  projectId: string;
  rank: number;
  score: number;
  evidence: string[];
  technologies: string[];
  repositoryName: string;
  repositoryUrl: string;
  rationale: string;
}

export interface DimensionRanking {
  dimension: string;
  rankings: RankedProject[];
}

export type RankingDimension =
  | 'Backend Engineering'
  | 'Distributed Systems'
  | 'AI/ML'
  | 'Full Stack'
  | 'Scalability'
  | 'Architecture Complexity';

export class ProjectRankingService {
  /**
   * Scores and ranks projects across the six core dimensions.
   */
  static async getRankings(): Promise<DimensionRanking[]> {
    const projects = await getProjects();
    const repositories = await getRepositories();
    const graph = await buildKnowledgeGraph();

    const dimensions: RankingDimension[] = [
      'Backend Engineering',
      'Distributed Systems',
      'AI/ML',
      'Full Stack',
      'Scalability',
      'Architecture Complexity'
    ];

    return Promise.all(dimensions.map(async dim => {
      const rankings = await Promise.all(projects.map(async project => {
        // Find matching repo
        let repoName = project.id;
        if (project.githubRepository) {
          repoName = project.githubRepository.name;
        } else if (project.githubUrl) {
          const parts = project.githubUrl.split('/');
          repoName = parts[parts.length - 1] || project.id;
        }

        const repo = repositories.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        const repoNodeId = `repository:${repoName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
        const repoNode = graph.getNode(repoNodeId);
        
        const summary = repoNode?.properties.repositorySummary as any;
        const extractedData = repoNode?.properties.extractedData as any;

        // Combine project techStack and parsed technologies
        const techStack = new Set<string>();
        if (project.techStack) project.techStack.forEach(t => techStack.add(t));
        if (summary?.TechnologyStack) summary.TechnologyStack.forEach((t: string) => techStack.add(t));
        if (extractedData?.technologies) extractedData.technologies.forEach((t: string) => techStack.add(t));
        if (repo?.language) techStack.add(repo.language);

        const techArray = Array.from(techStack);
        const textToAnalyze = `${project.title} ${project.subtitle} ${project.description} ${project.problem} ${project.solution} ${project.architecture} ${repo?.description || ''} ${extractedData?.readmeContent || ''}`.toLowerCase();

        let score = 0;
        const evidence: string[] = [];
        let rationale = '';

        switch (dim) {
          case 'Backend Engineering':
            // Languages
            if (techArray.includes('Java')) { score += 20; evidence.push('Java Language Platform'); }
            if (techArray.includes('Go')) { score += 18; evidence.push('Go Programming Language'); }
            if (techArray.includes('Rust')) { score += 18; evidence.push('Rust Programming Language'); }
            if (techArray.includes('Python')) { score += 12; evidence.push('Python Scripting'); }
            // Frameworks
            if (textToAnalyze.includes('spring boot') || textToAnalyze.includes('springboot')) { score += 25; evidence.push('Spring Boot Framework'); }
            if (textToAnalyze.includes('fastapi')) { score += 20; evidence.push('FastAPI Async Framework'); }
            if (textToAnalyze.includes('django')) { score += 20; evidence.push('Django MVC Web Framework'); }
            if (textToAnalyze.includes('spring security')) { score += 15; evidence.push('Spring Security & OAuth2'); }
            if (textToAnalyze.includes('hibernate') || textToAnalyze.includes('jpa')) { score += 15; evidence.push('Hibernate ORM / Spring Data JPA'); }
            // Data/API
            if (textToAnalyze.includes('grpc')) { score += 15; evidence.push('gRPC RPC Protocols'); }
            if (textToAnalyze.includes('postgresql') || textToAnalyze.includes('mysql') || textToAnalyze.includes('timescaledb') || textToAnalyze.includes('database')) {
              score += 15;
              evidence.push('Relational / Structured Persistence (SQL)');
            }
            if (textToAnalyze.includes('rbac') || textToAnalyze.includes('authorization') || textToAnalyze.includes('authentication')) {
              score += 10;
              evidence.push('Role-Based Access Controls');
            }

            if (score > 60) {
              rationale = `Demonstrates industrial backend architecture patterns using robust frameworks like Spring Boot/FastAPI, strong database schemas, security integration, and low-latency API contracts.`;
            } else if (score > 30) {
              rationale = `Implements basic server logic, CRUD services, and persistent database mappings.`;
            } else {
              rationale = `Features minimal backend presence or is primarily a helper service.`;
            }
            break;

          case 'Distributed Systems':
            if (textToAnalyze.includes('kafka')) { score += 25; evidence.push('Apache Kafka Event Bus'); }
            if (textToAnalyze.includes('rabbitmq')) { score += 20; evidence.push('RabbitMQ Message Broker'); }
            if (textToAnalyze.includes('redis')) { score += 15; evidence.push('Redis Memory Caching & Geospatial Queries'); }
            if (textToAnalyze.includes('raft') || textToAnalyze.includes('consensus')) { score += 25; evidence.push('Raft Consensus Replication'); }
            if (textToAnalyze.includes('grpc') || textToAnalyze.includes('protobuf')) { score += 15; evidence.push('gRPC/Protobuf Binary Serialization'); }
            if (textToAnalyze.includes('microservice') || textToAnalyze.includes('microservices')) { score += 20; evidence.push('De-coupled Microservice Architecture'); }
            if (textToAnalyze.includes('distributed database') || textToAnalyze.includes('vector database')) { score += 25; evidence.push('Distributed Vector Engine Core'); }
            if (textToAnalyze.includes('websocket') || textToAnalyze.includes('websockets')) { score += 10; evidence.push('WebSockets Duplex Communication'); }

            if (score > 60) {
              rationale = `Exhibits complex distributed architecture patterns, addressing partition tolerance, event consistency, consensus replication, and asynchronous communication streams.`;
            } else if (score > 30) {
              rationale = `Coordinates basic event messages or cache nodes across services.`;
            } else {
              rationale = `Single-process design with standard client-server communication.`;
            }
            break;

          case 'AI/ML':
            if (textToAnalyze.includes('pytorch')) { score += 25; evidence.push('PyTorch Anomaly Detection'); }
            if (textToAnalyze.includes('tensorflow')) { score += 25; evidence.push('TensorFlow Model Optimization'); }
            if (textToAnalyze.includes('rag') || textToAnalyze.includes('retrieval-augmented')) { score += 25; evidence.push('Retrieval-Augmented Generation (RAG)'); }
            if (textToAnalyze.includes('pinecone') || textToAnalyze.includes('vector similarity')) { score += 20; evidence.push('Pinecone High-Dimensional Vector DB'); }
            if (textToAnalyze.includes('vector database') || textToAnalyze.includes('similarity search')) { score += 20; evidence.push('Similarity Search Indexes'); }
            if (textToAnalyze.includes('forecasting') || textToAnalyze.includes('predictive')) { score += 15; evidence.push('Predictive Air Quality Forecasting Models'); }
            if (textToAnalyze.includes('llm') || textToAnalyze.includes('agent') || textToAnalyze.includes('openai') || textToAnalyze.includes('gemini')) { score += 20; evidence.push('LLM Agent Orchestrations'); }

            if (score > 60) {
              rationale = `Advanced intelligence layer implementation integrating vector spaces, vector embeddings search, predictive forecasting models, RAG pipelines, or multi-agent orchestration.`;
            } else if (score > 30) {
              rationale = `Uses third-party cognitive model endpoints or applies basic statistical regression analysis.`;
            } else {
              rationale = `No machine learning or artificial intelligence features.`;
            }
            break;

          case 'Full Stack':
            // Frontend indicators
            let feScore = 0;
            if (techArray.includes('React')) { feScore += 20; evidence.push('React Library UI'); }
            if (techArray.includes('Next.js')) { feScore += 20; evidence.push('Next.js Server-Side Framework'); }
            if (textToAnalyze.includes('tailwind')) { feScore += 10; evidence.push('TailwindCSS Styling'); }
            if (textToAnalyze.includes('leaflet') || textToAnalyze.includes('map')) { feScore += 10; evidence.push('Interactive Leaflet Mapping'); }
            if (textToAnalyze.includes('websocket')) { feScore += 10; evidence.push('WebSockets UI Connection'); }

            // Backend indicators
            let beScore = 0;
            if (techArray.includes('Spring Boot') || textToAnalyze.includes('spring boot')) { beScore += 15; evidence.push('Spring Boot Backend'); }
            if (techArray.includes('FastAPI') || textToAnalyze.includes('fastapi')) { beScore += 15; evidence.push('FastAPI API Engine'); }
            if (techArray.includes('Django') || textToAnalyze.includes('django')) { beScore += 15; evidence.push('Django Backend'); }
            if (textToAnalyze.includes('postgresql') || textToAnalyze.includes('mysql') || textToAnalyze.includes('database')) { beScore += 15; evidence.push('SQL Data Layer'); }

            score = feScore + beScore;
            if (feScore > 0 && beScore > 0) {
              score += 30; // Integration bonus
              evidence.push('Bidirectional Full Stack Integration');
            }

            if (score > 60) {
              rationale = `Provides a complete end-to-end full stack system with modern web frontends linked dynamically to robust database structures and backends.`;
            } else if (score > 30) {
              rationale = `Implements basic templates, simple views, or minor state updates on the frontend.`;
            } else {
              rationale = `Strictly headless backend service or specialized command-line tool.`;
            }
            break;

          case 'Scalability':
            if (techArray.includes('Go')) { score += 20; evidence.push('Go High-Concurrency Runtime'); }
            if (techArray.includes('Rust')) { score += 20; evidence.push('Rust Systems Execution Layer'); }
            if (textToAnalyze.includes('kafka')) { score += 25; evidence.push('Partitioned Kafka Brokers'); }
            if (textToAnalyze.includes('timescaledb') || textToAnalyze.includes('hypertables')) { score += 20; evidence.push('TimescaleDB Geospatial Hypertables'); }
            if (textToAnalyze.includes('100,000') || textToAnalyze.includes('100k') || textToAnalyze.includes('high-throughput') || textToAnalyze.includes('ingestion')) {
              score += 25;
              evidence.push('100,000+ events/sec Ingestion Pipeline Design');
            }
            if (textToAnalyze.includes('raft') || textToAnalyze.includes('concurrency') || textToAnalyze.includes('horizontal')) {
              score += 20;
              evidence.push('Horizontal Partitioning / Scaling Techniques');
            }

            if (score > 60) {
              rationale = `Designed to scale vertically and horizontally, handling high-throughput event streaming, rapid geospatial partitioning, or distributed consensus indices.`;
            } else if (score > 30) {
              rationale = `Demonstrates basic performance tuning or cache buffering patterns.`;
            } else {
              rationale = `Designed for low-load single user/client scenarios.`;
            }
            break;

          case 'Architecture Complexity':
            const complexityRating = project.intelligence?.complexityAnalysis?.overallRating || 
                                     summary?.ComplexityIndicators?.includes('Documented Architecture Pattern') ? 'Advanced' : 'Intermediate';
            
            if (complexityRating === 'Advanced') { score += 35; evidence.push('Advanced Rating Profile'); }
            else if (complexityRating === 'Intermediate') { score += 20; evidence.push('Intermediate Rating Profile'); }
            else { score += 10; }

            const indicators = summary?.ComplexityIndicators || [];
            indicators.forEach((ind: string) => {
              score += 8;
              evidence.push(ind);
            });

            if (textToAnalyze.includes('microservices') || textToAnalyze.includes('microservice')) { score += 15; evidence.push('Microservice Architecture Pattern'); }
            if (textToAnalyze.includes('distributed engine') || textToAnalyze.includes('raft') || textToAnalyze.includes('vector database')) { score += 15; evidence.push('Distributed Database Engine Patterns'); }

            if (score > 60) {
              rationale = `High structural complexity involving multi-service topologies, polyglot environments, advanced consensus mechanisms, or time-series partitions.`;
            } else if (score > 35) {
              rationale = `Standard modular structure with clear layers and simple inter-process dependencies.`;
            } else {
              rationale = `Simple application pattern with minimal integrations.`;
            }
            break;
        }

        // Limit score to max 100
        const finalScore = Math.min(score, 100);

        return {
          projectTitle: project.title,
          projectId: project.id,
          rank: 0, // Assigned later after sorting
          score: finalScore,
          evidence,
          technologies: techArray,
          repositoryName: repo?.name || repoName,
          repositoryUrl: repo?.htmlUrl || project.githubUrl || '',
          rationale
        };
      }));

      // Sort and assign ranks
      const sortedRankings = rankings
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }));

      return {
        dimension: dim,
        rankings: sortedRankings
      };
    }));
  }
}
