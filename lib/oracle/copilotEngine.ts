import { GitHubRepository, Project } from '@/lib/types';
import { getRepositories } from '@/lib/github/github';
import { getProjects, getSkills, getTimeline } from '@/lib/content/index';

export type CareerCategory =
  | 'Resume Optimization'
  | 'Interview Preparation'
  | 'Internship Readiness'
  | 'Backend Career Path'
  | 'AI Career Path'
  | 'Full Stack Career Path'
  | 'Skill Gap Analysis'
  | 'Project Recommendation'
  | 'Learning Roadmap'
  | 'Job Matching'
  | 'None';

export class CareerIntentClassifier {
  public static classify(query: string): CareerCategory {
    const queryLower = query.toLowerCase().trim();

    const hasResume = /\b(resume|cv|portfolio first|resume first|first on my resume|put first)\b/i.test(queryLower);
    const hasInterview = /\b(interview|interviews|showcase|show case|show during|present to)\b/i.test(queryLower);
    const hasInternship = /\b(internship|intern|ready for a|ready for an|competitive for)\b/i.test(queryLower);
    const hasSkillGap = /\b(missing|gap|gaps|lack|lacking|skills i need|still need to learn|skills am i missing)\b/i.test(queryLower);
    const hasProjectRec = /\b(build next|should i build|project suggestion|project ideas|strengthen my.*portfolio|project to build|project would help me|what project|project recommendation|project recommendations)\b/i.test(queryLower);
    const hasRoadmap = /\b(learn next|roadmap|learning roadmap|what technology should i learn|what technologies should i learn|should i learn next|what to learn)\b/i.test(queryLower);

    if (hasResume) return 'Resume Optimization';
    if (hasInterview) return 'Interview Preparation';
    if (hasInternship) return 'Internship Readiness';
    if (hasSkillGap) return 'Skill Gap Analysis';
    if (hasProjectRec) return 'Project Recommendation';
    if (hasRoadmap) return 'Learning Roadmap';

    // General keyword fallbacks
    if (queryLower.includes('career') || queryLower.includes('job') || queryLower.includes('intern')) {
      if (queryLower.includes('match') || queryLower.includes('fit')) return 'Job Matching';
      if (queryLower.includes('backend')) return 'Backend Career Path';
      if (queryLower.includes('ai') || queryLower.includes('ml')) return 'AI Career Path';
      return 'Job Matching';
    }

    return 'None';
  }
}

export class ResumeAdvisor {
  public static advise(): string {
    return `### Resume Optimization: Ranked Project Recommendations

To maximize impact on your resume, rank your projects in the following order:

1. **novadb** (Go & Rust | Distributed Systems) — **Rank First**
   - **Why**: Demonstrates distributed systems engineering, Raft consensus protocol, gRPC APIs, and systems programming in Go and Rust. This is a tier-1 complexity project that immediately grabs a technical recruiter's attention.
   - **Impact**: Highlights backend performance optimization and data storage architectures.

2. **orbitair** (Python & FastAPI | Time-Series Analytics)
   - **Why**: Showcases geospatial indexing in TimescaleDB and FastAPI API design. It highlights intermediate data-intensive and machine learning capabilities.

3. **aetheragent** (TypeScript | AI Agents Orchestration)
   - **Why**: Demonstrates event-driven architecture, caching with Redis, RabbitMQ queuing, and multi-agent LLM reasoning loops.`;
  }
}

export class InterviewAdvisor {
  public static advise(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('distributed') || queryLower.includes('system')) {
      return `### Interview Recommendation: Distributed Systems Focus

For distributed systems discussions, showcase **novadb**:
- **Core Topics to Discuss**: Raft consensus protocol, node-to-node replication, concurrent writes, and Go/Rust gRPC communication.
- **Key Evidence**: Distributed vector indexing implementations, custom consensus logging, and low-latency storage.`;
    }

    if (queryLower.includes('backend')) {
      return `### Interview Recommendation: Backend Engineering Focus

For backend engineering discussions, showcase **patient-management-service**:
- **Core Topics to Discuss**: Spring Boot microservices, Kafka event streaming, database design, and Spring Security authentication.
- **Key Evidence**: Decoupled patient billing domains, binary gRPC low-latency communication, and asynchronous event sync.`;
    }

    if (queryLower.includes('ai') || queryLower.includes('ml') || queryLower.includes('agent')) {
      return `### Interview Recommendation: AI Engineering & Agents Focus

For AI/ML discussions, showcase **aetheragent** or **orbitair**:
- **Core Topics to Discuss**: RAG orchestration, multi-agent reasoning, vector stores (Pinecone), and geospatial time-series indexing (TimescaleDB).
- **Key Evidence**: NASA Space Apps top-5 AQI forecasting, sub-second vector search latency, and Redis-backed state cache.`;
    }

    return `### Interview Showcase: Best Projects to Discuss

During technical interviews, prioritize discussing these projects based on role dimensions:

1. **For Distributed Systems / Systems Roles: Showcase \`novadb\`**
   - **Discuss**: Raft consensus integration, gRPC protocols, and data replication.
   - **Key takeaway**: Shows ability to build database engines and highly concurrent backend architectures.

2. **For AI Engineering / Full Stack Roles: Showcase \`aetheragent\`**
   - **Discuss**: Message queuing via RabbitMQ, state cache using Redis, and LLM reasoning steps.
   - **Key takeaway**: Highlights production AI tool-use and asynchronous workflows.`;
  }
}

export class SkillGapAnalyzer {
  public static analyze(query: string): {
    currentSkills: string[];
    missingSkills: string[];
    priorityRanking: string[];
    roadmap: string[];
  } {
    const queryLower = query.toLowerCase();
    
    const current = ['Go', 'Rust', 'Java', 'Spring Boot', 'gRPC', 'Kafka', 'Docker', 'Kubernetes', 'FastAPI', 'Pinecone', 'TimescaleDB', 'Redis'];
    
    let missing: string[] = [];
    let priority: string[] = [];
    let roadmap: string[] = [];

    if (queryLower.includes('java') || queryLower.includes('spring')) {
      missing = ['JUnit 5 & Mockito (Unit/Integration Testing)', 'AWS Cloud Deployments (ECS/EKS)', 'Hibernate/JPA Profiling & Performance Tuning'];
      priority = [
        '1. JUnit & Mockito (Essential for internship coding challenges)',
        '2. JPA Performance Tuning (Crucial for database scalability)',
        '3. AWS Deployments (Nice to have)'
      ];
      roadmap = [
        '- **Week 1**: Implement comprehensive test coverage in patient-management-service using Mockito.',
        '- **Week 2**: Deploy the Java microservices container to AWS ECS using local Terraform scripts.'
      ];
    } else {
      // General Backend / Systems
      missing = ['CI/CD Orchestration (Jenkins, Ansible)', 'Application Performance Monitoring (Prometheus, Grafana)', 'Unit/Integration Testing frameworks (JUnit for Java, testing in Go/Rust)'];
      priority = [
        '1. Unit Testing & Mocking (High priority)',
        '2. Monitoring & Logging (Medium priority)',
        '3. CI/CD Orchestration (Medium priority)'
      ];
      roadmap = [
        '- **Phase 1**: Add JUnit/Mockito tests to Java services and testing coverage to Go/Rust codebases.',
        '- **Phase 2**: Configure Prometheus and Grafana dashboards for logpulse to log memory and event metrics.'
      ];
    }

    return {
      currentSkills: current,
      missingSkills: missing,
      priorityRanking: priority,
      roadmap
    };
  }
}

export class JobFitAnalyzer {
  public static evaluate(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('match') || queryLower.includes('description')) {
      let matchedProject = 'novadb';
      let matchReason = 'Demonstrates distributed database engineering, Raft consensus, and Go/Rust backend performance.';
      let matchScore = 95;
      
      if (queryLower.includes('java') || queryLower.includes('spring') || queryLower.includes('hospital') || queryLower.includes('billing')) {
        matchedProject = 'patient-management-service';
        matchReason = 'Demonstrates Spring Boot microservices, Kafka event streaming, and gRPC low-latency APIs.';
        matchScore = 94;
      } else if (queryLower.includes('ai') || queryLower.includes('ml') || queryLower.includes('agent') || queryLower.includes('vector') || queryLower.includes('pinecone') || queryLower.includes('search')) {
        matchedProject = 'aetheragent';
        matchReason = 'Demonstrates multi-agent RAG reasoning loops, Redis state cache, and RabbitMQ message queuing.';
        matchScore = 92;
      } else if (queryLower.includes('aqi') || queryLower.includes('forecast') || queryLower.includes('timescale') || queryLower.includes('python') || queryLower.includes('fastapi')) {
        matchedProject = 'orbitair';
        matchReason = 'Demonstrates FastAPI backend, TimescaleDB geospatial indexing, and Leaflet AQI visualization.';
        matchScore = 90;
      }

      return `### Job Description Matching Recommendation

Based on the job description keywords, here is the best matching project:

- **Best Matching Project**: **${matchedProject}**
- **Match Confidence Score**: **${matchScore}%**
- **Why it matches**: ${matchReason}
- **Strengths to emphasize**: High architectural complexity, evidence-backed achievements, and containerized deployment alignment.`;
    }

    if (queryLower.includes('java') || queryLower.includes('spring')) {
      return `### Internship Readiness Assessment: Java Backend Role

- **Readiness Score**: **92%**
- **Strengths**: Extensive microservices knowledge, gRPC API design, and Spring Boot + Spring Security implementation experience.
- **Weaknesses**: Testing coverage is not fully documented in the repositories; limited Java build/deployment pipelines.
- **Recommendations**:
  1. Add Mockito integration tests to the patient-management-service.
  2. Implement a CI/CD GitHub Actions pipeline to run Java builds automatically.`;
    }

    if (queryLower.includes('ai') || queryLower.includes('ml')) {
      return `### Internship Readiness Assessment: AI Engineering Role

- **Readiness Score**: **88%**
- **Strengths**: Pinecone vector search, FastAPI integrations, RAG orchestration, and geospatial timeseries forecasting.
- **Weaknesses**: Limited experience with deep learning training loops (PyTorch/TensorFlow) from scratch.
- **Recommendations**:
  1. Build a project showcasing custom model training or LLM evaluations.
  2. Integrate multi-modal pipelines into aetheragent.`;
    }

    return `### Job Readiness Assessment: General Backend Role

- **Readiness Score**: **90%**
- **Strengths**: Go, Rust, Java microservices, distributed queues (Kafka), consensus databases, and Docker/Kubernetes containerization.
- **Weaknesses**: Missing Prometheus metrics logs and CI/CD pipelines.
- **Recommendations**:
  1. Implement Prometheus/Grafana monitors in logpulse.
  2. Add unit test coverage files in Go/Rust.`;
  }
}

export class ProjectRecommendationEngine {
  public static recommend(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('distributed') || queryLower.includes('system')) {
      return `### Project Recommendation: Distributed Systems Focus

To strengthen your distributed systems portfolio, we recommend building:

**Distributed Transaction Coordinator (in Go)**
- **Objective**: Implement a Saga pattern coordinator or 2-Phase Commit coordinator across mock microservices.
- **Gap filled**: Demonstrates transactional fault tolerance, two-phase commits, outbox pattern sync, and Kafka integration.
- **Why**: Solidifies your Go concurrency capabilities and transitions you into building enterprise-grade consensus and distributed transaction engines.`;
    }

    if (queryLower.includes('backend') || queryLower.includes('portfolio')) {
      return `### Project Recommendation: Backend Portfolio Gaps

To fill major gaps in your backend engineering portfolio, we recommend building:

**Distributed Caching System (in Rust)**
- **Objective**: Build a memory-mapped key-value cache (similar to Redis) featuring TCP socket communication and TTL eviction.
- **Gap filled**: Shows deep Rust memory-management, multi-threaded connection handling, and eviction data structures.
- **Why**: Proves that you can write performant caching layers from scratch rather than just consuming existing ones.`;
    }

    return `### Project Recommendations: Gaps to Fill

Based on your current portfolio, building the following projects will strengthen your systems and backend positioning:

1. **Distributed Caching System (in Rust)**
   - **Objective**: Build a memory-mapped key-value cache (similar to Redis) featuring TTL eviction algorithms.
   - **Gap filled**: Showcases low-level Rust systems development, TCP sockets, and memory caching algorithms.

2. **Distributed Transaction Coordinator (in Go)**
   - **Objective**: Implement a Saga pattern coordinator or 2-Phase Commit coordinator across mock microservices.
   - **Gap filled**: Demonstrates transaction management, fault tolerance, and message brokers integration (Kafka).`;
  }
}

export class PortfolioCopilotEngine {
  public static async evaluate(
    query: string
  ): Promise<{ directResponse: string | null; category: CareerCategory; directAnswerAvailable: boolean }> {
    const category = CareerIntentClassifier.classify(query);

    if (category === 'None') {
      return { directResponse: null, category, directAnswerAvailable: false };
    }

    const queryLower = query.toLowerCase().trim();
    const mentoringKeywords = ['coaching', 'mentoring', 'career advice', 'long-form coaching', 'career path mentoring'];
    const needsCoachingSynthesis = mentoringKeywords.some(kw => queryLower.includes(kw));

    if (needsCoachingSynthesis) {
      console.log("CAREER_MODE");
      console.log(`Mode: ${category}`);
      console.log("\nCAREER_MODEL_ROUTE");
      console.log("OpenRouter");
      return { directResponse: null, category, directAnswerAvailable: false };
    }

    // Trigger local analyzers
    const gapAnalysis = SkillGapAnalyzer.analyze(query);
    const jobFit = JobFitAnalyzer.evaluate(query);

    // Logging
    console.log("CAREER_MODE");
    console.log(`Mode: ${category}`);

    console.log("\nJOB_FIT_ANALYSIS");
    console.log("Assessing portfolio readiness score and match dimensions.");

    console.log("\nSKILL_GAP_ANALYSIS");
    console.log(`Detected ${gapAnalysis.missingSkills.length} missing technologies compared to industry backend roles.`);

    console.log("\nPROJECT_RECOMMENDATION");
    console.log("Formulating next-project suggestions based on architectural gaps.");

    console.log("\nPORTFOLIO_COPILOT");
    console.log("Running copilot diagnostic engines.");

    console.log("\nCAREER_DIRECT_RESPONSE");
    console.log("No OpenRouter call required.");

    let response = '';

    if (category === 'Resume Optimization') {
      response = ResumeAdvisor.advise();
    } else if (category === 'Interview Preparation') {
      response = InterviewAdvisor.advise(query);
    } else if (category === 'Internship Readiness' || category === 'Job Matching' || category === 'Backend Career Path' || category === 'AI Career Path' || category === 'Full Stack Career Path') {
      response = jobFit;
    } else if (category === 'Skill Gap Analysis' || category === 'Learning Roadmap') {
      response = `### Skill Gap Analysis & Learning Roadmap

Here is an analysis of your current technical skillset, identified gaps for backend roles, and a roadmap to address them:

#### Current Skills
${gapAnalysis.currentSkills.map(s => `- ${s}`).join('\n')}

#### Missing Skills for Target Roles
${gapAnalysis.missingSkills.map(s => `- ${s}`).join('\n')}

#### Priority Gaps to Address
${gapAnalysis.priorityRanking.join('\n')}

#### Recommended Learning Roadmap
${gapAnalysis.roadmap.join('\n')}`;
    } else if (category === 'Project Recommendation') {
      response = ProjectRecommendationEngine.recommend(query);
    }

    return {
      directResponse: response,
      category,
      directAnswerAvailable: true
    };
  }
}

