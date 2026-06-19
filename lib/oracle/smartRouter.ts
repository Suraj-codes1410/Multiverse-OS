import { GitHubRepository, Project } from '@/lib/types';
import { getRepositories } from '@/lib/github/github';
import { getProjects } from '@/lib/content/index';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export type QueryIntentCategory =
  | 'Repository Metadata'
  | 'Technology Lookup'
  | 'Portfolio Statistics'
  | 'Relationship Queries'
  | 'General Knowledge'
  | 'Recruiter Insight'
  | 'Repository Summary';

export interface ClassificationResult {
  category: QueryIntentCategory;
  confidence: number;
  extractedEntities: {
    repositories: string[];
    technologies: string[];
    concepts: string[];
  };
}

export class QueryIntentClassifier {
  public static classify(
    query: string,
    repositories: GitHubRepository[],
    projects: Project[]
  ): ClassificationResult {
    const queryLower = query.toLowerCase().trim();

    // 1. Extract repository and project entities matching name/ID
    const repoAndProjNames = new Set<string>();
    repositories.forEach(r => repoAndProjNames.add(r.name.toLowerCase()));
    projects.forEach(p => {
      repoAndProjNames.add(p.id.toLowerCase());
      if (p.githubRepository) {
        repoAndProjNames.add(p.githubRepository.name.toLowerCase());
      }
    });

    const matchedRepos = Array.from(repoAndProjNames).filter(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'i');
      return regex.test(queryLower);
    });

    // 2. Extract technology entities
    const matchedTechs: string[] = [];
    const knownTechs = new Set([
      'fastapi', 'spring boot', 'springboot', 'kafka', 'docker', 'go', 'golang', 'rust', 'typescript', 'javascript', 
      'python', 'java', 'redis', 'mysql', 'postgresql', 'postgres', 'mongodb', 'elasticsearch', 'react', 'next.js', 
      'nextjs', 'django', 'grpc', 'websockets', 'websocket', 'timescaledb', 'pinecone', 'html', 'css', 'kubernetes', 
      'rabbitmq', 'spring security', 'hibernate', 'express', 'nestjs', 'angular', 'vue', 'tailwind', 'tailwindcss', 
      'flask', 'cassandra', 'sqlite', 'neo4j', 'pytorch', 'github actions', 'jenkins', 'ansible', 'terraform', 
      'prometheus', 'grafana'
    ]);

    // Dynamic addition of languages/topics/techStack
    repositories.forEach(r => {
      if (r.language) knownTechs.add(r.language.toLowerCase());
      r.topics.forEach(t => knownTechs.add(t.toLowerCase()));
    });
    projects.forEach(p => {
      p.techStack.forEach(t => {
        knownTechs.add(t.toLowerCase());
      });
    });

    knownTechs.forEach(tech => {
      const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(queryLower)) {
        matchedTechs.push(tech);
      }
    });

    const uniqueTechs = Array.from(new Set(matchedTechs));
    const niceCasedTechs = uniqueTechs.map(tech => {
      for (const r of repositories) {
        if (r.language && r.language.toLowerCase() === tech) return r.language;
        const topicMatch = r.topics.find(t => t.toLowerCase() === tech);
        if (topicMatch) return topicMatch;
      }
      for (const p of projects) {
        const techMatch = p.techStack.find(t => t.toLowerCase() === tech);
        if (techMatch) return techMatch;
      }
      if (tech === 'fastapi') return 'FastAPI';
      if (tech === 'springboot') return 'Spring Boot';
      if (tech === 'spring boot') return 'Spring Boot';
      if (tech === 'next.js') return 'Next.js';
      if (tech === 'nextjs') return 'Next.js';
      return tech.charAt(0).toUpperCase() + tech.slice(1);
    });

    // 3. Classification logic
    let category: QueryIntentCategory = 'General Knowledge';
    let confidence = 0.5;

    // A. Portfolio Statistics
    const statRegex = /\b(how many|number of|total count|count of|most popular|most common|most used)\b/i;
    const statKeywords = ['repos', 'repository', 'repositories', 'project', 'projects', 'skill', 'skills', 'achievement', 'achievements', 'technology', 'technologies', 'languages'];
    const isStatQuery = statRegex.test(queryLower) && statKeywords.some(kw => queryLower.includes(kw));

    // B. Repository Metadata (excluding statistics)
    const metaRegex = /\b(newest|latest|recent|updated|created|creation|description|homepage|stars|forks|url|link|github link|github url|technology|technologies|language|languages|tech|stack|framework|frameworks|tool|tools)\b/i;
    const isMetaQuery = metaRegex.test(queryLower) && (queryLower.includes('repo') || queryLower.includes('repository') || matchedRepos.length > 0);

    // C. Technology Lookup
    const techLookupRegex = /\b(which|what|find|list|show|get)\b.*\b(repo|repository|repositories|project|projects|codebase|codebases)\b.*\b(use|using|built with|written in|develop|framework|database|language|library)\b/i;
    const isTechLookupQuery = (
      techLookupRegex.test(queryLower) ||
      (/\b(which|what)\b.*\b(use|using|built with|written in|uses|utilize|utilizes)\b/i.test(queryLower) && niceCasedTechs.length > 0) ||
      (/\b(repo|repository|repositories|project|projects)\b.*\b(with|using)\b.*\b(fastapi|springboot|spring boot|kafka|docker|rust|go|python|java|typescript)\b/i.test(queryLower)) ||
      (queryLower.includes('which repositories use') || queryLower.includes('which projects use') || queryLower.includes('which repository uses'))
    );

    // D. Relationship Queries
    const relRegex = /\b(related to|relationship|connect|link between)\b/i;
    const isRelQuery = relRegex.test(queryLower) || (queryLower.includes('how is') && queryLower.includes('related to')) || (queryLower.includes('how does') && queryLower.includes('connect to'));

    // E. Repository Summary
    const sumRegex = /\b(summarize|summary|what does|explain|tell me about|about)\b/i;
    const isSumQuery = sumRegex.test(queryLower) && matchedRepos.length > 0 && !isMetaQuery;

    // F. Recruiter Insight
    const recruitKeywords = ['project demonstrates', 'experience with', 'recommend a project', 'best project for', 'evidence of', 'skills in', 'candidate', 'recruiter', 'hire', 'strongest technical skills', 'hired for', 'why should suraj be hired'];
    const isRecruiterQuery = recruitKeywords.some(kw => queryLower.includes(kw)) || (queryLower.includes('project') && queryLower.includes('demonstrates')) || (queryLower.includes('strongest') && queryLower.includes('skills')) || (queryLower.includes('why') && queryLower.includes('hired')) || (queryLower.includes('why') && queryLower.includes('hire'));

    if (isStatQuery) {
      category = 'Portfolio Statistics';
      confidence = 0.95;
    } else if (isMetaQuery && !isStatQuery) {
      category = 'Repository Metadata';
      confidence = 0.95;
    } else if (isTechLookupQuery) {
      category = 'Technology Lookup';
      confidence = 0.95;
    } else if (isRelQuery && (matchedRepos.length > 0 || niceCasedTechs.length > 0)) {
      category = 'Relationship Queries';
      confidence = 0.90;
    } else if (isSumQuery) {
      category = 'Repository Summary';
      confidence = 0.90;
    } else if (isRecruiterQuery) {
      category = 'Recruiter Insight';
      confidence = 0.85;
    } else {
      if (queryLower.includes('what is') || queryLower.includes('what are') || queryLower.includes('compare')) {
        category = 'General Knowledge';
        confidence = 0.90;
      } else {
        category = 'General Knowledge';
        confidence = 0.50;
      }
    }

    return {
      category,
      confidence,
      extractedEntities: {
        repositories: matchedRepos,
        technologies: Array.from(new Set(niceCasedTechs)),
        concepts: []
      }
    };
  }
}

export class DirectAnswerService {
  public static async getDirectResponse(
    query: string,
    classification: ClassificationResult,
    repositories: GitHubRepository[],
    projects: Project[]
  ): Promise<string | null> {
    const queryLower = query.toLowerCase().trim();
    const { category, extractedEntities } = classification;

    if (category === 'Repository Metadata') {
      // 1. Newest repository query
      if (queryLower.includes('newest') || queryLower.includes('latest') || queryLower.includes('recent')) {
        const sorted = [...repositories].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (sorted.length > 0) {
          const repo = sorted[0];
          return `Suraj's newest repository is **${repo.name}** (Full Name: \`${repo.fullName}\`).

- **Description**: ${repo.description || 'No description provided.'}
- **Primary Language**: ${repo.language || 'N/A'}
- **Created At**: ${new Date(repo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- **Last Updated**: ${new Date(repo.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- **Stars**: ⭐ ${repo.starsCount} | **Forks**: 🍴 ${repo.forksCount}
- **GitHub Link**: [${repo.name}](${repo.htmlUrl})`;
        }
      }

      // 2. Updated recently
      if (queryLower.includes('updated recently') || queryLower.includes('recently updated') || queryLower.includes('last updated')) {
        const sorted = [...repositories].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        if (sorted.length > 0) {
          const lines = sorted.slice(0, 3).map((repo, i) => {
            return `${i + 1}. **[${repo.name}](${repo.htmlUrl})** (Last updated: ${new Date(repo.updatedAt).toLocaleDateString()}) - ${repo.description || 'No description'}`;
          });
          return `### Recently Updated Repositories

Here are Suraj's most recently updated repositories:

${lines.join('\n')}`;
        }
      }

      // 3. Count of repositories
      if (queryLower.includes('how many') || queryLower.includes('number of') || queryLower.includes('count')) {
        return `Suraj has **${repositories.length}** repositories in his portfolio.

Here is a list of his repositories:
${repositories.map(r => `- **[${r.name}](${r.htmlUrl})** - ${r.description || 'No description'}`).join('\n')}`;
      }

      // 3.5. Specific repository technologies/languages details
      if (extractedEntities.repositories.length > 0 && (queryLower.includes('tech') || queryLower.includes('tool') || queryLower.includes('language') || queryLower.includes('framework') || queryLower.includes('database') || queryLower.includes('libraries') || queryLower.includes('use') || queryLower.includes('built with') || queryLower.includes('written in'))) {
        const targetName = extractedEntities.repositories[0].toLowerCase();
        
        // Find repo
        const repo = repositories.find(r => r.name.toLowerCase() === targetName);
        // Find project
        const project = projects.find(p => p.id.toLowerCase() === targetName);

        if (repo || project) {
          const name = project?.title || repo?.name || targetName;
          const techStack = project 
            ? project.techStack 
            : (repo ? [repo.language || '', ...repo.topics] : []).filter(Boolean);
          
          const uniqueTechs = Array.from(new Set(techStack));

          return `### Technologies used in **${name}**:

${uniqueTechs.map(tech => `- **${tech}**`).join('\n')}`;
        }
      }

      // 4. Specific repository details
      if (extractedEntities.repositories.length > 0) {
        const targetName = extractedEntities.repositories[0].toLowerCase();
        const repo = repositories.find(r => r.name.toLowerCase() === targetName);
        if (repo) {
          return `### Repository: ${repo.name}

- **Description**: ${repo.description || 'No description provided.'}
- **Primary Language**: ${repo.language || 'N/A'}
- **Stars**: ⭐ ${repo.starsCount} | **Forks**: 🍴 ${repo.forksCount}
- **Created**: ${new Date(repo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- **Last Updated**: ${new Date(repo.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
- **GitHub Link**: [${repo.name}](${repo.htmlUrl})`;
        }
      }
    }

    if (category === 'Technology Lookup') {
      if (extractedEntities.technologies.length > 0) {
        const tech = extractedEntities.technologies[0];
        const matchedRepos = repositories.filter(r => 
          (r.language && r.language.toLowerCase() === tech.toLowerCase()) ||
          r.topics.some(t => t.toLowerCase() === tech.toLowerCase()) ||
          (r.description && r.description.toLowerCase().includes(tech.toLowerCase()))
        );

        const matchedProjects = projects.filter(p =>
          p.techStack.some(t => t.toLowerCase() === tech.toLowerCase()) ||
          p.description.toLowerCase().includes(tech.toLowerCase())
        );

        if (matchedRepos.length > 0 || matchedProjects.length > 0) {
          let responseText = `### Technology: ${tech}

Here are the repositories and projects in Suraj's portfolio that utilize **${tech}**:`;

          if (matchedRepos.length > 0) {
            responseText += `\n\n#### Repositories (${matchedRepos.length})\n`;
            responseText += matchedRepos.map(r => `- **[${r.name}](${r.htmlUrl})** - ${r.description || 'No description'}`).join('\n');
          }

          if (matchedProjects.length > 0) {
            responseText += `\n\n#### Projects (${matchedProjects.length})\n`;
            responseText += matchedProjects.map(p => `- **${p.title}** - ${p.description}`).join('\n');
          }

          return responseText;
        } else {
          return `I do not have information in the local Knowledge Graph about any repositories or projects using **${tech}**.`;
        }
      }
    }

    if (category === 'Portfolio Statistics') {
      if (queryLower.includes('repo') || queryLower.includes('repos') || queryLower.includes('repository') || queryLower.includes('repositories')) {
        return `Suraj has **${repositories.length}** repositories in his portfolio.

Here is a list of his repositories:
${repositories.map(r => `- **[${r.name}](${r.htmlUrl})** - ${r.description || 'No description'}`).join('\n')}`;
      }

      if (queryLower.includes('project')) {
        return `Suraj has **${projects.length}** projects in his portfolio.

Here is a list of his projects:
${projects.map(p => `- **${p.title}**: ${p.description}`).join('\n')}`;
      }

      if (queryLower.includes('technologies') || queryLower.includes('language') || queryLower.includes('tech')) {
        const techCounts: { [key: string]: number } = {};
        repositories.forEach(r => {
          if (r.language) {
            const lang = r.language;
            techCounts[lang] = (techCounts[lang] || 0) + 1;
          }
          r.topics.forEach(t => {
            const topic = t.toLowerCase();
            techCounts[topic] = (techCounts[topic] || 0) + 1;
          });
        });
        projects.forEach(p => {
          p.techStack.forEach(t => {
            const tech = t.toLowerCase();
            techCounts[tech] = (techCounts[tech] || 0) + 1;
          });
        });

        const sortedTechs = Object.entries(techCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);

        return `### Most Frequent Technologies

Here are the most frequently used technologies across Suraj's repositories and projects:

${sortedTechs.map(([tech, count]) => `- **${tech.charAt(0).toUpperCase() + tech.slice(1)}** (used in ${count} places)`).join('\n')}`;
      }
    }

    if (category === 'Relationship Queries') {
      if (extractedEntities.repositories.length > 0 && extractedEntities.technologies.length > 0) {
        const repoName = extractedEntities.repositories[0];
        const techName = extractedEntities.technologies[0];

        try {
          const graph = await buildKnowledgeGraph();
          const repoId = `repository:${repoName.toLowerCase()}`;
          const skillId = `skill:${techName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

          const repoNode = graph.getNode(repoId);
          const skillNode = graph.getNode(skillId);

          if (repoNode && skillNode) {
            const neighbors = graph.getNeighbors(repoId, 'both');
            const directRel = neighbors.find(n => n.node.id === skillId);

            if (directRel) {
              return `According to the local Knowledge Graph, **${repoName}** is related to **${techName}**:
- **${repoName}** (Repository) is connected to **${techName}** (Skill) via a **${directRel.relationship.type}** relationship (${directRel.relationship.properties?.description || 'No further description'}).`;
            }

            const path = graph.findPath(repoId, skillId);
            if (path && path.length > 0) {
              const pathway = path.map(node => `[${node.type.toUpperCase()}] ${node.label}`).join(' ➔ ');
              return `According to the local Knowledge Graph, **${repoName}** is connected to **${techName}** via the following semantic pathway:
${pathway}`;
            }
          }
        } catch (e) {
          console.error("Failed to traverse knowledge graph for relationship query:", e);
        }

        // Direct lookup fallback if not fully registered in the graph
        const repo = repositories.find(r => r.name.toLowerCase() === repoName.toLowerCase());
        if (repo) {
          const isBuiltWith = repo.language?.toLowerCase() === techName.toLowerCase();
          const isTopic = repo.topics.some(t => t.toLowerCase() === techName.toLowerCase());
          const isDesc = repo.description?.toLowerCase().includes(techName.toLowerCase());

          if (isBuiltWith || isTopic || isDesc) {
            let details = '';
            if (isBuiltWith) details = `It is written primarily in **${repo.language}**.`;
            else if (isTopic) details = `It has the topic **${techName}** attached to it on GitHub.`;
            else if (isDesc) details = `Its description mentions **${techName}**.`;

            return `According to GitHub Repository Metadata, **${repoName}** is related to **${techName}**:
- ${details}`;
          }
        }
      }
    }

    if (category === 'Repository Summary') {
      if (extractedEntities.repositories.length > 0) {
        const targetName = extractedEntities.repositories[0].toLowerCase();
        
        // Find project
        const project = projects.find(p => p.id.toLowerCase() === targetName);
        // Find repo
        const repo = repositories.find(r => r.name.toLowerCase() === targetName);

        if (project) {
          return `### Project: ${project.title}

**Overview**: ${project.description}

**Problem**: ${project.problem}
**Solution**: ${project.solution}
**Architecture**: ${project.architecture}
**Tech Stack**: ${project.techStack.join(', ')}
**Status**: ${project.status}

${project.githubUrl ? `- **GitHub Link**: [${project.title}](${project.githubUrl})` : ''}`;
        } else if (repo) {
          return `### Repository: ${repo.name}

**Description**: ${repo.description || 'No description provided.'}
**Primary Language**: ${repo.language || 'N/A'}
**Stars**: ⭐ ${repo.starsCount} | **Forks**: 🍴 ${repo.forksCount}
**Last Updated**: ${new Date(repo.updatedAt).toLocaleDateString()}
- **GitHub Link**: [${repo.name}](${repo.htmlUrl})`;
        }
      }
    }

    if (category === 'Recruiter Insight') {
      const narrativeKeywords = ['summary', 'pitch', 'narrative', 'write a', 'generate an', 'pitch me', 'synthesize', 'interview pitch', 'explain in detail', 'conversational'];
      const needsNarrative = narrativeKeywords.some(kw => queryLower.includes(kw));

      if (needsNarrative) {
        return null; // Cascades to model route
      }

      // Check specific static evaluations
      if (queryLower.includes('strongest technical skills') || queryLower.includes('strongest skills') || queryLower.includes('top skills') || queryLower.includes('technical skills')) {
        console.log("RECRUITER_DIRECT_RESPONSE");
        console.log("No OpenRouter call required.");
        return `### Suraj's Strongest Technical Skills

Based on portfolio telemetry, here are Suraj's advanced technical skills categorized by domain:

- **Backend Development**: Go, Rust, Java, Spring Boot, gRPC, REST APIs, Microservices
- **Databases & Cache**: PostgreSQL, MySQL, TimescaleDB, Redis, Elasticsearch
- **Tools & Infrastructure**: Kafka, Docker, Kubernetes, RabbitMQ, Git, GitHub Actions

All skills are backed by direct implementation evidence across active repositories.`;
      }

      if (queryLower.includes('hired for a backend role') || queryLower.includes('hired for backend') || (queryLower.includes('why should') && queryLower.includes('backend')) || queryLower.includes('hired for a backend position')) {
        console.log("RECRUITER_DIRECT_RESPONSE");
        console.log("No OpenRouter call required.");
        return `### Hiring Rationale: Backend Engineering Role

Suraj Samanta is highly qualified for a Backend Engineering position based on the following evidence:

1. **Key Implementations**:
   - **Distributed Databases**: Engineered **novadb**, a high-performance vector database in Go and Rust with gRPC and Raft consensus.
   - **Microservices & Messaging**: Developed a microservices system using **Spring Boot**, **gRPC**, and **Kafka** (patient-management-service).
   - **High-Throughput Pipelines**: Built a log processing pipeline in Go handling **100,000+ events per second** (logpulse).
2. **Core Competencies**: High-concurrency system design, distributed consensus mechanisms, performance optimization.
3. **Core Tech Stack**: Go, Rust, Java, Spring Boot, gRPC, Kafka, Docker, Kubernetes.`;
      }

      // Fallback: query RecruiterInsightEngine for matches
      const { RecruiterInsightEngine } = await import('@/lib/github/recruiterInsightEngine');
      const recruiterInsight = await RecruiterInsightEngine.evaluateQuery(query);
      if (recruiterInsight) {
        console.log("RECRUITER_DIRECT_RESPONSE");
        console.log("No OpenRouter call required.");

        let responseText = `### Recruiter Recommendation: ${recruiterInsight.bestDimensionMatched}\n\n`;
        responseText += `Based on portfolio rankings, the primary project demonstrating **${recruiterInsight.bestDimensionMatched}** is **${recruiterInsight.recommendedProject.projectTitle}** (Score: ${recruiterInsight.recommendedProject.score}/100).\n\n`;

        responseText += `#### Top Ranked Projects for ${recruiterInsight.bestDimensionMatched}:\n`;
        recruiterInsight.rankings.forEach(rank => {
          responseText += `- **${rank.projectTitle}** (Score: ${rank.score}/100)
  * Technologies: ${rank.technologies.join(', ')}
  * Evidence: ${rank.evidence.join(', ')}
  * Rationale: ${rank.rationale}\n`;
        });

        return responseText;
      }
    }

    return null;
  }
}

export class SmartRouter {
  public static async route(
    query: string,
    repositoryName?: string
  ): Promise<{ directResponse: string | null; category: QueryIntentCategory; directAnswerAvailable: boolean }> {
    const repositories = await getRepositories();
    const projects = await getProjects();

    const classification = QueryIntentClassifier.classify(query, repositories, projects);

    if (
      classification.category === 'Repository Metadata' ||
      classification.category === 'Technology Lookup' ||
      classification.category === 'Portfolio Statistics' ||
      classification.category === 'Relationship Queries' ||
      classification.category === 'Repository Summary' ||
      classification.category === 'Recruiter Insight'
    ) {
      const response = await DirectAnswerService.getDirectResponse(
        query,
        classification,
        repositories,
        projects
      );

      if (response) {
        if (classification.category !== 'Recruiter Insight') {
          console.log("SMART_ROUTE");
          console.log(`Category: ${classification.category}`);
          console.log("\nDIRECT_RESPONSE");
          console.log("No OpenRouter call required.");
        }
        return {
          directResponse: response,
          category: classification.category,
          directAnswerAvailable: true
        };
      }
    }

    if (classification.category === 'Recruiter Insight') {
      console.log("RECRUITER_MODEL_ROUTE");
      console.log("OpenRouter");
    } else {
      console.log("MODEL_ROUTE");
      console.log("OpenRouter");
    }
    return {
      directResponse: null,
      category: classification.category,
      directAnswerAvailable: false
    };
  }
}
