import { getPortfolio, getSkills, getExperience, getAchievements, getProjects, getTimeline } from '../data';
import { getRepositories } from '../github/github';
import { KnowledgeGraph } from './graph';
import { classifyRepository } from '../github/classification';
import { GitHubRepository } from '../types';
import { RepositoryContentAnalyzer } from '../github/repositoryContentAnalyzer';
import { RelationshipDiscoveryService } from './relationshipDiscoveryService';

let cachedGraph: KnowledgeGraph | null = null;

export async function buildKnowledgeGraph(forceRebuild = false): Promise<KnowledgeGraph> {
  if (cachedGraph && !forceRebuild) {
    return cachedGraph;
  }
  const graph = new KnowledgeGraph();

  // 1. Fetch all datasets
  const portfolio = getPortfolio();
  const projects = await getProjects();
  const skills = getSkills();
  const experience = getExperience();
  const achievements = getAchievements();
  const timeline = getTimeline();
  const repositories = await getRepositories();

  // Helper function to generate standard IDs
  const makeId = (type: string, key: string) => {
    return `${type.toLowerCase()}:${key.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
  };

  // ==========================================
  // A. CREATE NODES
  // ==========================================

  // 1. Add Education Node (from Portfolio)
  if (portfolio.education) {
    const edu = portfolio.education;
    const eduId = makeId('education', `${edu.degree}-${edu.institution}`);
    graph.addNode({
      id: eduId,
      type: 'Education',
      label: `${edu.degree} at ${edu.institution}`,
      properties: {
        description: `Pursuing ${edu.degree} at ${edu.institution}. Expected Graduation: ${edu.expectedGraduation}. CGPA: ${edu.cgpa}`,
        institution: edu.institution,
        degree: edu.degree,
        year: edu.expectedGraduation,
        originalData: edu
      }
    });
  }

  // 2. Add Skill Nodes
  skills.forEach(skill => {
    const skillId = makeId('skill', skill.name);
    graph.addNode({
      id: skillId,
      type: 'Skill',
      label: skill.name,
      properties: {
        description: skill.description,
        category: skill.category,
        level: skill.level,
        originalData: skill
      }
    });
  });

  // 3. Add Project Nodes
  projects.forEach(project => {
    const projectId = makeId('project', project.id);
    graph.addNode({
      id: projectId,
      type: 'Project',
      label: project.title,
      properties: {
        description: project.description,
        url: project.githubUrl || project.liveUrl,
        year: project.year,
        category: project.subtitle,
        architecturePattern: project.intelligence?.architectureAnalysis?.architecturePattern || 'Monolith',
        complexityRating: project.intelligence?.complexityAnalysis?.overallRating || 'Beginner',
        complexityScore: project.intelligence?.complexityAnalysis?.totalScore || 0,
        originalData: project
      }
    });
  });

  // 4. Add Repository Nodes
  for (const repo of repositories) {
    const repoId = makeId('repository', repo.name);
    const contentAnalysis = await RepositoryContentAnalyzer.analyze(repo);
    graph.addNode({
      id: repoId,
      type: 'Repository',
      label: repo.name,
      properties: {
        description: repo.description || 'GitHub Code Repository',
        url: repo.htmlUrl,
        language: repo.language || 'TypeScript',
        starsCount: repo.starsCount,
        originalData: repo,
        repositorySummary: contentAnalysis.summary,
        extractedData: contentAnalysis.extractedData
      }
    });

    // Link extracted technologies to Repository node in the graph
    contentAnalysis.extractedData.technologies.forEach(tech => {
      const skillId = makeId('skill', tech);
      
      // Ensure the skill node exists
      if (!graph.getNode(skillId)) {
        graph.addNode({
          id: skillId,
          type: 'Skill',
          label: tech,
          properties: {
            description: `${tech} technology extracted dynamically.`,
            category: 'Tools',
            level: 'Advanced',
            originalData: {
              name: tech,
              category: 'Tools',
              level: 'Advanced',
              description: `${tech} technology extracted dynamically.`,
              relatedProjects: []
            }
          }
        });
      }

      // Add relationships
      graph.addRelationship({
        sourceId: repoId,
        targetId: skillId,
        type: 'USES',
        properties: {
          description: `Repository utilizes technology: ${tech}`
        }
      });
      graph.addRelationship({
        sourceId: skillId,
        targetId: repoId,
        type: 'RELATED_TO',
        properties: {
          description: `Technology ${tech} is utilized in repository: ${repo.name}`
        }
      });
    });
  }

  // 5. Add Experience Nodes
  experience.forEach(exp => {
    const expId = makeId('experience', `${exp.company}-${exp.role}`);
    graph.addNode({
      id: expId,
      type: 'Experience',
      label: `${exp.role} at ${exp.company}`,
      properties: {
        description: exp.description,
        company: exp.company,
        role: exp.role,
        date: `${exp.startDate} - ${exp.endDate}`,
        originalData: exp
      }
    });
  });

  // 6. Add Achievement Nodes
  achievements.forEach(ach => {
    const achId = makeId('achievement', ach.title);
    graph.addNode({
      id: achId,
      type: 'Achievement',
      label: ach.title,
      properties: {
        description: ach.description,
        year: ach.year,
        originalData: ach
      }
    });
  });

  // 7. Add Timeline Event Nodes
  timeline.forEach(event => {
    const eventId = makeId('timeline', event.id);
    graph.addNode({
      id: eventId,
      type: 'Timeline Event',
      label: event.title,
      properties: {
        description: event.description,
        date: event.date,
        year: event.year,
        category: event.type,
        originalData: event
      }
    });
  });

  // ==========================================
  // B. CREATE RELATIONSHIPS (Edges)
  // ==========================================

  // 1. Projects <-> Skills (BUILT_WITH / USES)
  skills.forEach(skill => {
    const skillId = makeId('skill', skill.name);
    
    // Link from skill-specific projects list (from skills.json)
    if (skill.relatedProjects) {
      skill.relatedProjects.forEach(projId => {
        const projectId = makeId('project', projId);
        if (graph.getNode(projectId)) {
          graph.addRelationship({
            sourceId: projectId,
            targetId: skillId,
            type: 'BUILT_WITH',
            properties: { description: `Project is built with skill: ${skill.name}` }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: projectId,
            type: 'USES',
            properties: { description: `Skill is used in project: ${projId}` }
          });
        }
      });
    }
  });

  projects.forEach(project => {
    const projectId = makeId('project', project.id);
    
    // Link from project techStack tags (from projects.json)
    if (project.techStack) {
      project.techStack.forEach(tech => {
        const skillId = makeId('skill', tech);
        if (graph.getNode(skillId)) {
          graph.addRelationship({
            sourceId: projectId,
            targetId: skillId,
            type: 'BUILT_WITH',
            properties: { description: `Project is built with technology: ${tech}` }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: projectId,
            type: 'USES',
            properties: { description: `Technology is used in: ${project.title}` }
          });
        }
      });
    }

    // Link from repository intelligence detected technologies (dynamic extraction & knowledge graph integration)
    if (project.intelligence && project.intelligence.technologyProfile) {
      const profile = project.intelligence.technologyProfile;
      Object.entries(profile.categories).forEach(([category, techs]) => {
        techs.forEach(tech => {
          const skillId = makeId('skill', tech);
          
          // Dynamically create Skill node if it doesn't exist in the graph
          if (!graph.getNode(skillId)) {
            let skillCategory: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'AI / ML' | 'Tools' = 'Tools';
            if (category === 'Backend') skillCategory = 'Backend';
            else if (category === 'Frontend') skillCategory = 'Frontend';
            else if (category === 'Database') skillCategory = 'Database';
            else if (category === 'AI / ML') skillCategory = 'AI / ML';
            else if (category === 'Visualization') skillCategory = 'Frontend';
            else if (category === 'Messaging' || category === 'RPC') skillCategory = 'Backend';
            else if (category === 'Containerization') skillCategory = 'Tools';

            graph.addNode({
              id: skillId,
              type: 'Skill',
              label: tech,
              properties: {
                description: `${tech} technology extracted dynamically.`,
                category: skillCategory,
                level: 'Advanced',
                originalData: {
                  name: tech,
                  category: skillCategory,
                  level: 'Advanced',
                  description: `${tech} technology extracted dynamically.`,
                  relatedProjects: []
                }
              }
            });
          }

          graph.addRelationship({
            sourceId: projectId,
            targetId: skillId,
            type: 'BUILT_WITH',
            properties: { 
              description: `Repository intelligence detected technology: ${tech} (Category: ${category})`,
              role: category
            }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: projectId,
            type: 'USES',
            properties: { 
              description: `Technology ${tech} is used in: ${project.title} (Category: ${category})`,
              role: category
            }
          });

          // Link to Repository node if it exists
          let repoName = project.id;
          if (project.githubRepository) {
            repoName = project.githubRepository.name;
          } else if (project.githubUrl) {
            const parts = project.githubUrl.split('/');
            repoName = parts[parts.length - 1] || project.id;
          }
          const repoId = makeId('repository', repoName);
          if (graph.getNode(repoId)) {
            graph.addRelationship({
              sourceId: repoId,
              targetId: skillId,
              type: 'USES',
              properties: { 
                description: `Repository utilizes technology: ${tech} (Category: ${category})`,
                role: category
              }
            });
            graph.addRelationship({
              sourceId: skillId,
              targetId: repoId,
              type: 'RELATED_TO',
              properties: { 
                description: `Technology ${tech} is utilized in repository: ${repoName}`,
                role: category
              }
            });
          }
        });
      });
    }
  });

  // 1b. Skills <-> Technologies/Skills (RELATED_TO)
  skills.forEach(skill => {
    const skillId = makeId('skill', skill.name);
    if (skill.relatedTechnologies) {
      skill.relatedTechnologies.forEach(techName => {
        const targetSkillId = makeId('skill', techName);
        if (graph.getNode(targetSkillId)) {
          graph.addRelationship({
            sourceId: skillId,
            targetId: targetSkillId,
            type: 'RELATED_TO',
            properties: { description: `Technology relation: ${skill.name} is related to ${techName}` }
          });
          graph.addRelationship({
            sourceId: targetSkillId,
            targetId: skillId,
            type: 'RELATED_TO',
            properties: { description: `Technology relation: ${techName} is related to ${skill.name}` }
          });
        }
      });
    }
  });

  // 2. Projects <-> Repositories (RELATED_TO / DEPENDS_ON)
  projects.forEach(project => {
    const projectId = makeId('project', project.id);
    
    // Match linked GitHubRepository
    let repoName = project.id;
    if (project.githubRepository) {
      repoName = project.githubRepository.name;
    } else if (project.githubUrl) {
      const parts = project.githubUrl.split('/');
      repoName = parts[parts.length - 1] || project.id;
    }

    const repoId = makeId('repository', repoName);
    if (graph.getNode(repoId)) {
      graph.addRelationship({
        sourceId: projectId,
        targetId: repoId,
        type: 'RELATED_TO',
        properties: { description: `Project links to code repository: ${repoName}` }
      });
      graph.addRelationship({
        sourceId: projectId,
        targetId: repoId,
        type: 'DEPENDS_ON',
        properties: { description: `Project code resides in repository: ${repoName}` }
      });
      graph.addRelationship({
        sourceId: repoId,
        targetId: projectId,
        type: 'RELATED_TO',
        properties: { description: `Repository contains source code for project: ${project.title}` }
      });

      // Technology links are now handled in B.1 dynamically via technology profiles.

      // Link repository node to achievements associated with this project context
      achievements.forEach(ach => {
        const achId = makeId('achievement', ach.title);
        
        const titleMatches = ach.title.toLowerCase().includes(project.title.toLowerCase()) || 
                             ach.title.toLowerCase().includes(project.id.toLowerCase());
        const descMatches = ach.description.toLowerCase().includes(project.title.toLowerCase()) || 
                            ach.description.toLowerCase().includes(project.id.toLowerCase());
                            
        if (titleMatches || descMatches) {
          graph.addRelationship({
            sourceId: repoId,
            targetId: achId,
            type: 'RELATED_TO',
            properties: { description: `Repository contains source code for achievement: ${ach.title}` }
          });
          graph.addRelationship({
            sourceId: achId,
            targetId: repoId,
            type: 'RELATED_TO',
            properties: { description: `Achievement references code repository: ${repoName}` }
          });
        }
      });
    }
  });

  // 3. Experience <-> Skills (USES)
  experience.forEach(exp => {
    const expId = makeId('experience', `${exp.company}-${exp.role}`);
    if (exp.technologies) {
      exp.technologies.forEach(tech => {
        const skillId = makeId('skill', tech);
        if (graph.getNode(skillId)) {
          graph.addRelationship({
            sourceId: expId,
            targetId: skillId,
            type: 'USES',
            properties: { description: `Professional role used: ${tech}` }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: expId,
            type: 'RELATED_TO',
            properties: { description: `Technology is utilized in professional role: ${exp.role} at ${exp.company}` }
          });
        }
      });
    }
  });

  // 4. Achievements <-> Projects / Timeline Events / Technologies (ACHIEVED_AT / RELATED_TO)
  achievements.forEach(ach => {
    const achId = makeId('achievement', ach.title);

    // Connect achievements to projects dynamically based on text matches
    projects.forEach(project => {
      const projectId = makeId('project', project.id);
      
      const titleMatches = ach.title.toLowerCase().includes(project.title.toLowerCase()) || 
                           ach.title.toLowerCase().includes(project.id.toLowerCase());
      const descMatches = ach.description.toLowerCase().includes(project.title.toLowerCase()) || 
                          ach.description.toLowerCase().includes(project.id.toLowerCase());
                          
      if (titleMatches || descMatches) {
        graph.addRelationship({
          sourceId: projectId,
          targetId: achId,
          type: 'RELATED_TO',
          properties: { description: `Project is associated with achievement: ${ach.title}` }
        });
        graph.addRelationship({
          sourceId: achId,
          targetId: projectId,
          type: 'RELATED_TO',
          properties: { description: `Achievement was earned in project: ${project.title}` }
        });

        // Inherit project technologies/skills to the achievement relationship
        if (project.techStack) {
          project.techStack.forEach(tech => {
            const skillId = makeId('skill', tech);
            if (graph.getNode(skillId)) {
              graph.addRelationship({
                sourceId: achId,
                targetId: skillId,
                type: 'RELATED_TO',
                properties: { description: `Achievement involved technology via project context: ${tech}` }
              });
              graph.addRelationship({
                sourceId: skillId,
                targetId: achId,
                type: 'RELATED_TO',
                properties: { description: `Technology is referenced in achievement via project: ${ach.title}` }
              });
            }
          });
        }
        if (project.intelligence && project.intelligence.technologies) {
          project.intelligence.technologies.forEach(tech => {
            const skillId = makeId('skill', tech);
            if (graph.getNode(skillId)) {
              graph.addRelationship({
                sourceId: achId,
                targetId: skillId,
                type: 'RELATED_TO',
                properties: { description: `Achievement involved technology via project repository intelligence: ${tech}` }
              });
              graph.addRelationship({
                sourceId: skillId,
                targetId: achId,
                type: 'RELATED_TO',
                properties: { description: `Technology is referenced in achievement via repo intelligence: ${ach.title}` }
              });
            }
          });
        }
      }
    });

    // Connect achievements directly to skills/technologies mentioned in achievements text
    skills.forEach(skill => {
      const skillId = makeId('skill', skill.name);
      const skillMentioned = ach.title.toLowerCase().includes(skill.name.toLowerCase()) || 
                             ach.description.toLowerCase().includes(skill.name.toLowerCase());
      if (skillMentioned) {
        graph.addRelationship({
          sourceId: achId,
          targetId: skillId,
          type: 'RELATED_TO',
          properties: { description: `Achievement text references technology: ${skill.name}` }
        });
        graph.addRelationship({
          sourceId: skillId,
          targetId: achId,
          type: 'RELATED_TO',
          properties: { description: `Technology is associated with achievement: ${ach.title}` }
        });
      }
    });

    timeline.forEach(event => {
      const eventId = makeId('timeline', event.id);
      const isMatch = event.title.toLowerCase().includes(ach.title.toLowerCase()) ||
                      ach.title.toLowerCase().includes(event.title.toLowerCase()) ||
                      (event.type === 'achievement' && event.year === ach.year);
      if (isMatch) {
        graph.addRelationship({
          sourceId: achId,
          targetId: eventId,
          type: 'ACHIEVED_AT',
          properties: { description: `Achievement was recognized at timeline milestone: ${event.title}` }
        });
      }
    });
  });

  // 5. Timeline Events <-> Projects / Education / Achievements (RELATED_TO / PARTICIPATED_IN)
  timeline.forEach(event => {
    const eventId = makeId('timeline', event.id);
    
    // Connect to projects mentioned or linked
    projects.forEach(project => {
      const projectId = makeId('project', project.id);
      const isRelated = event.title.toLowerCase().includes(project.title.toLowerCase()) ||
                        event.description.toLowerCase().includes(project.title.toLowerCase()) ||
                        (event.relatedLink && event.relatedLink.includes(project.id));
      if (isRelated) {
        graph.addRelationship({
          sourceId: eventId,
          targetId: projectId,
          type: 'RELATED_TO',
          properties: { description: `Timeline milestone corresponds to project: ${project.title}` }
        });
      }
    });

    // Connect hackathons to achievements
    if (event.type === 'hackathon') {
      achievements.forEach(ach => {
        const achId = makeId('achievement', ach.title);
        const isHackathonAch = ach.title.toLowerCase().includes(event.title.toLowerCase()) ||
                               event.title.toLowerCase().includes(ach.title.toLowerCase());
        if (isHackathonAch) {
          graph.addRelationship({
            sourceId: eventId,
            targetId: achId,
            type: 'RELATED_TO',
            properties: { description: `Hackathon participation yielded: ${ach.title}` }
          });
          graph.addRelationship({
            sourceId: achId,
            targetId: eventId,
            type: 'PARTICIPATED_IN',
            properties: { description: `Achievement gained through hackathon: ${event.title}` }
          });
        }
      });
    }

    // Connect education events to the education node
    if (event.type === 'education' && portfolio.education) {
      const edu = portfolio.education;
      const eduId = makeId('education', `${edu.degree}-${edu.institution}`);
      if (graph.getNode(eduId)) {
        graph.addRelationship({
          sourceId: eventId,
          targetId: eduId,
          type: 'RELATED_TO',
          properties: { description: `Education timeline event linked to academic program` }
        });
      }
    }
  });

  // 8. Post-processing: Re-classify repositories using the complete Knowledge Graph context!
  const repoNodes = graph.getNodesByType('Repository');
  repoNodes.forEach(node => {
    const repo = node.properties.originalData as GitHubRepository;
    if (repo) {
      const matchingProject = projects.find(p => p.githubRepository?.name.toLowerCase() === repo.name.toLowerCase());
      const intel = matchingProject?.intelligence;
      
      const finalClassifications = classifyRepository(repo, intel, graph);
      
      node.properties.classifications = finalClassifications;
      repo.classifications = finalClassifications;

      // Attach architecture analysis property to the Repository node
      if (intel?.architectureAnalysis) {
        node.properties.architecturePattern = intel.architectureAnalysis.architecturePattern;
        node.properties.communication = intel.architectureAnalysis.communication;
        node.properties.security = intel.architectureAnalysis.security;
        node.properties.dataLayer = intel.architectureAnalysis.dataLayer;
      }

      // Attach complexity analysis property to the Repository node
      if (intel?.complexityAnalysis) {
        node.properties.complexityRating = intel.complexityAnalysis.overallRating;
        node.properties.complexityScore = intel.complexityAnalysis.totalScore;
      }
    }
  });

  // Automatically discover and construct the relationship graph
  RelationshipDiscoveryService.discoverAll(graph);

  cachedGraph = graph;
  return graph;
}

export function getCachedKnowledgeGraph(): KnowledgeGraph | null {
  return cachedGraph;
}

export function setCachedKnowledgeGraph(graph: KnowledgeGraph): void {
  cachedGraph = graph;
}

export function invalidateKnowledgeGraphCache(): void {
  cachedGraph = null;
}
