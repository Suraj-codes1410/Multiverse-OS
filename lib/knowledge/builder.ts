import { getPortfolio, getSkills, getExperience, getAchievements, getProjects, getTimeline } from '../data';
import { getRepositories } from '../github/github';
import { KnowledgeGraph } from './graph';

export async function buildKnowledgeGraph(): Promise<KnowledgeGraph> {
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
        originalData: project
      }
    });
  });

  // 4. Add Repository Nodes
  repositories.forEach(repo => {
    const repoId = makeId('repository', repo.name);
    graph.addNode({
      id: repoId,
      type: 'Repository',
      label: repo.name,
      properties: {
        description: repo.description || 'GitHub Code Repository',
        url: repo.htmlUrl,
        language: repo.language || 'TypeScript',
        starsCount: repo.starsCount,
        originalData: repo
      }
    });
  });

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
    
    // Link from skill-specific projects list
    if (skill.relatedProjects) {
      skill.relatedProjects.forEach(projId => {
        const projectId = makeId('project', projId);
        if (graph.getNode(projectId)) {
          graph.addRelationship({
            sourceId: projectId,
            targetId: skillId,
            type: 'BUILT_WITH',
            properties: { description: `Project uses skill: ${skill.name}` }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: projectId,
            type: 'USES',
            properties: { description: `Skill is applied in project: ${projId}` }
          });
        }
      });
    }
  });

  projects.forEach(project => {
    const projectId = makeId('project', project.id);
    
    // Link from project techStack tags
    if (project.techStack) {
      project.techStack.forEach(tech => {
        const skillId = makeId('skill', tech);
        if (graph.getNode(skillId)) {
          graph.addRelationship({
            sourceId: projectId,
            targetId: skillId,
            type: 'BUILT_WITH',
            properties: { description: `Project uses technology: ${tech}` }
          });
          graph.addRelationship({
            sourceId: skillId,
            targetId: projectId,
            type: 'USES',
            properties: { description: `Technology is utilized in: ${project.title}` }
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
        }
      });
    }
  });

  // 4. Achievements <-> Timeline Events (ACHIEVED_AT)
  achievements.forEach(ach => {
    const achId = makeId('achievement', ach.title);
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

  return graph;
}
