import { OracleContext, ProjectContext, RepositoryContext, TechnicalSkillContext, AchievementContext, TimelineContext } from './types';

export interface SelectedContext {
  profile: OracleContext['profile'];
  skills: TechnicalSkillContext[];
  projects: ProjectContext[];
  repositories: RepositoryContext[];
  achievements: AchievementContext[];
  timeline: TimelineContext[];
  selectedSections: string[];
}

export class OracleContextSelector {
  /**
   * Selects and curates only the relevant context components based on query keywords.
   */
  static select(query: string, context: OracleContext): SelectedContext {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Initialize empty collections
    const selectedSkills: TechnicalSkillContext[] = [];
    const selectedProjects: ProjectContext[] = [];
    const selectedRepositories: RepositoryContext[] = [];
    const selectedAchievements: AchievementContext[] = [];
    const selectedTimeline: TimelineContext[] = [];
    const selectedSections: string[] = [];

    // Helper checking for keywords
    const matches = (keywords: string[]) => keywords.some(kw => normalizedQuery.includes(kw));

    // 1. Detect target projects
    const wantsOrbitair = matches(['orbitair', 'orbit', 'aqi', 'air quality', 'pollution', 'forecasting']);
    const wantsSahai = matches(['sahai', 'mental health', 'lifestyle', 'therapist', 'chat', 'mood']);
    const wantsPatient = matches(['patient', 'hospital', 'billing', 'clinical', 'patient-management-service', 'microservices']);

    const projectMatch = wantsOrbitair || wantsSahai || wantsPatient;

    // Filter projects
    context.projects.forEach(p => {
      const pid = p.id.toLowerCase();
      const isTarget = 
        (wantsOrbitair && pid.includes('orbitair')) ||
        (wantsSahai && pid.includes('sahai')) ||
        (wantsPatient && pid.includes('patient'));

      if (isTarget) {
        selectedProjects.push(p);
      }
    });

    // 2. Detect target skills and categories
    const wantsBackend = matches(['backend', 'java', 'python', 'go', 'rust', 'spring', 'django', 'fastapi', 'grpc', 'kafka', 'vector', 'database', 'sql']);
    const wantsFrontend = matches(['frontend', 'react', 'typescript', 'javascript', 'nextjs', 'css', 'html', 'ui', 'interface']);
    const wantsAi = matches(['ai', 'ml', 'machine learning', 'artificial intelligence', 'rag', 'pinecone', 'model']);
    const wantsCloud = matches(['cloud', 'docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'deployment']);

    const categoryMatch = wantsBackend || wantsFrontend || wantsAi || wantsCloud;

    context.skills.forEach(s => {
      const scat = s.category.toLowerCase();
      const sname = s.name.toLowerCase();

      // Direct matches by tech name
      const isTechMentioned = normalizedQuery.includes(sname);
      
      // Category matches
      const isCatMatch = 
        (wantsBackend && (scat.includes('backend') || scat.includes('database'))) ||
        (wantsFrontend && scat.includes('frontend')) ||
        (wantsAi && (scat.includes('ai') || scat.includes('ml'))) ||
        (wantsCloud && (scat.includes('cloud') || scat.includes('tools')));

      // Project dependency match (select skills that are in selected projects' techStacks)
      const isProjectSkill = selectedProjects.some(p => 
        p.techStack.some(t => t.toLowerCase() === sname)
      );

      if (isTechMentioned || isCatMatch || isProjectSkill) {
        selectedSkills.push(s);
      }
    });

    // 3. Detect target repositories
    context.repositories.forEach(r => {
      const rname = r.name.toLowerCase();
      
      // Match by keyword
      const isRepoNameMatch = normalizedQuery.includes(rname);
      
      // Match by association with selected projects
      const isProjectRepo = selectedProjects.some(p => 
        p.associatedRepositoryName?.toLowerCase() === rname ||
        p.id.toLowerCase() === rname
      );

      // Match by association with selected skills topics
      const isSkillRepo = selectedSkills.some(s => 
        r.topics.some(t => t.toLowerCase() === s.name.toLowerCase()) ||
        (r.language && r.language.toLowerCase() === s.name.toLowerCase())
      );

      if (isRepoNameMatch || isProjectRepo || isSkillRepo) {
        selectedRepositories.push(r);
      }
    });

    // 4. Detect achievements
    const wantsAchievements = matches(['achievement', 'award', 'hackathon', 'nasa', 'sih', 'smart india', 'delhi', 'prize', 'compete']);
    context.achievements.forEach(a => {
      const isAchievementMatch = 
        wantsAchievements || 
        normalizedQuery.includes(a.title.toLowerCase()) ||
        selectedProjects.some(p => a.associatedProjects.some(ap => ap.toLowerCase().includes(p.title.toLowerCase())));

      if (isAchievementMatch) {
        selectedAchievements.push(a);
      }
    });

    // 5. Detect timeline
    const wantsTimeline = matches(['timeline', 'history', 'career', 'milestone', 'education', 'degree', 'graduation', 'college', 'school']);
    if (wantsTimeline) {
      selectedTimeline.push(...context.timeline);
    } else {
      // Pull only timeline groups containing matching milestones
      context.timeline.forEach(yearGroup => {
        const matchingMilestones = yearGroup.milestones.filter(m => {
          const mtitle = m.title.toLowerCase();
          const isProjectMilestone = selectedProjects.some(p => mtitle.includes(p.title.toLowerCase()));
          const isAchievementMilestone = selectedAchievements.some(a => mtitle.includes(a.title.toLowerCase()));
          return isProjectMilestone || isAchievementMilestone;
        });

        if (matchingMilestones.length > 0) {
          selectedTimeline.push({
            year: yearGroup.year,
            milestones: matchingMilestones
          });
        }
      });
    }

    // 6. Default Fallback Selection if nothing matched (e.g. general "Who are you?")
    if (selectedSkills.length === 0 && selectedProjects.length === 0 && selectedRepositories.length === 0 && selectedAchievements.length === 0) {
      // Pick featured projects
      selectedProjects.push(...context.projects.filter(p => p.featured));
      // Pick top skills
      selectedSkills.push(...context.skills.filter(s => s.level === 'Advanced'));
      // Pick featured repositories
      selectedRepositories.push(...context.repositories.filter(r => r.starsCount > 20));
      selectedSections.push('Profile (Default Fallback)', 'Top Skills', 'Featured Projects', 'Popular Repositories');
    } else {
      if (selectedSkills.length > 0) selectedSections.push('Relevant Skills');
      if (selectedProjects.length > 0) selectedSections.push('Relevant Projects');
      if (selectedRepositories.length > 0) selectedSections.push('Relevant Repositories');
      if (selectedAchievements.length > 0) selectedSections.push('Relevant Achievements');
      if (selectedTimeline.length > 0) selectedSections.push('Relevant Milestones');
    }

    return {
      profile: context.profile,
      skills: Array.from(new Set(selectedSkills)),
      projects: Array.from(new Set(selectedProjects)),
      repositories: Array.from(new Set(selectedRepositories)),
      achievements: Array.from(new Set(selectedAchievements)),
      timeline: Array.from(new Set(selectedTimeline)),
      selectedSections
    };
  }

  /**
   * Compresses the selected context entities and formats them as a clean, highly readable Markdown prompt text.
   */
  static compressAndFormat(selected: SelectedContext): string {
    let output = '';

    // 1. Candidate Profile
    output += `### CANDIDATE PROFILE\n`;
    output += `Name: ${selected.profile.name}\n`;
    output += `Title: ${selected.profile.title}\n`;
    output += `Bio: ${selected.profile.bio}\n`;
    output += `Location: ${selected.profile.location}\n`;
    output += `Education: ${selected.profile.education.degree} at ${selected.profile.education.institution} (CGPA: ${selected.profile.education.cgpa}, Expected Graduation: ${selected.profile.education.expectedGraduation})\n\n`;

    // 2. Technical Skills
    if (selected.skills.length > 0) {
      output += `### RELEVANT TECHNICAL SKILLS\n`;
      selected.skills.forEach(s => {
        output += `- **${s.name}** (${s.category} - ${s.level}): ${s.description}\n`;
      });
      output += `\n`;
    }

    // 3. Projects
    if (selected.projects.length > 0) {
      output += `### RELEVANT PROJECTS\n`;
      selected.projects.forEach(p => {
        output += `- **${p.title}** (${p.year})\n`;
        output += `  Summary: ${p.subtitle}. ${p.description}\n`;
        output += `  Technologies: ${p.techStack.join(', ')}\n`;
        if (p.problem && p.problem !== 'No manual problem statement defined. Synced dynamically from GitHub repository.') {
          output += `  Problem Statement: ${p.problem}\n`;
          output += `  Solution Provided: ${p.solution}\n`;
        }
        if (p.githubUrl) {
          output += `  Repository Link: ${p.githubUrl}\n`;
        }
      });
      output += `\n`;
    }

    // 4. Repositories
    if (selected.repositories.length > 0) {
      output += `### RELEVANT REPOSITORIES\n`;
      selected.repositories.forEach(r => {
        output += `- **${r.name}** (${r.language || 'TypeScript'})\n`;
        output += `  Description: ${r.description || 'GitHub Code Repository'}\n`;
        if (r.topics && r.topics.length > 0) {
          output += `  Topics: ${r.topics.join(', ')}\n`;
        }
        if (r.intelligence) {
          output += `  Category: ${r.intelligence.projectCategory}, Pattern: ${r.intelligence.architecturePattern}, Complexity Rating: ${r.intelligence.complexityRating}\n`;
        }
        output += `  Stars: ${r.starsCount}, Forks: ${r.forksCount}, Link: ${r.url}\n`;
      });
      output += `\n`;
    }

    // 5. Achievements
    if (selected.achievements.length > 0) {
      output += `### RELEVANT ACHIEVEMENTS\n`;
      selected.achievements.forEach(a => {
        output += `- **${a.title}** (${a.year}): ${a.description}\n`;
      });
      output += `\n`;
    }

    // 6. Timeline Milestones
    if (selected.timeline.length > 0) {
      output += `### RELEVANT TIMELINE MILESTONES\n`;
      selected.timeline.forEach(t => {
        output += `- **${t.year}**:\n`;
        t.milestones.forEach(m => {
          output += `  * [${m.type}] ${m.title}: ${m.description}\n`;
        });
      });
      output += `\n`;
    }

    return output.trim();
  }
}
