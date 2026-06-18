import { OracleContext, ProjectContext, RepositoryContext, TechnicalSkillContext, AchievementContext, TimelineContext } from './types';
import { EntityResolver } from './entityResolver';
import { GraphTraversalService } from './graphTraversal';
import { TechnologyLookupService } from '../github/technologyIndex';
import { RepositoryComparisonService } from '../github/repositoryComparison';
import { RecruiterInsightService } from '../github/recruiterInsights';

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
  private static entityResolver = new EntityResolver();
  private static traversalService = new GraphTraversalService();
  private static techLookupService = new TechnologyLookupService();
  private static comparisonService = new RepositoryComparisonService();
  private static recruiterInsightService = new RecruiterInsightService();
  private static isInitialized = false;

  private static async ensureInitialized() {
    if (!this.isInitialized) {
      await this.traversalService.init();
      await this.techLookupService.init();
      this.isInitialized = true;
    }
  }

  /**
   * Selects and curates only the relevant context components based on entity resolution and graph traversal.
   */
  static async select(
    query: string, 
    context: OracleContext
  ): Promise<SelectedContext & { resolvedEntity: string; traversedRelationships: string[]; repositoryMetadata?: string }> {
    await this.ensureInitialized();
    const queryClean = query.toLowerCase().trim();

    // 0. Pre-LLM Structured Repository Intelligence Layer
    let repositoryMetadata = '';
    const selectedSkills: TechnicalSkillContext[] = [];
    const selectedProjects: ProjectContext[] = [];
    const selectedRepositories: RepositoryContext[] = [];
    const selectedAchievements: AchievementContext[] = [];
    const selectedTimeline: TimelineContext[] = [];
    const selectedSections: string[] = [];

    // A. Check for Repository Comparisons (e.g. "Compare SAHAI and ORBITAIR")
    const containsCompare = queryClean.includes('compare') || queryClean.includes('comparison') || queryClean.includes('versus') || queryClean.includes(' vs ');
    if (containsCompare) {
      const repos = context.repositories.map(r => r.name.toLowerCase());
      const matchedRepos = repos.filter(name => queryClean.includes(name));
      if (matchedRepos.length >= 2) {
        const comp = await this.comparisonService.compare(matchedRepos[0], matchedRepos[1]);
        if (comp) {
          repositoryMetadata += `### STRUCTURED REPOSITORY COMPARISON\n`;
          repositoryMetadata += `- **Target A:** ${comp.repoA.name} (${comp.repoA.category}, Architecture: ${comp.repoA.architecture}, Complexity: ${comp.repoA.complexityScore})\n`;
          repositoryMetadata += `- **Target B:** ${comp.repoB.name} (${comp.repoB.category}, Architecture: ${comp.repoB.architecture}, Complexity: ${comp.repoB.complexityScore})\n`;
          repositoryMetadata += `- **Shared Technologies:** ${comp.sharedTechnologies.join(', ')}\n`;
          repositoryMetadata += `- **Unique to ${comp.repoA.name}:** ${comp.differences.repoAOnlyTechnologies.join(', ')}\n`;
          repositoryMetadata += `- **Unique to ${comp.repoB.name}:** ${comp.differences.repoBOnlyTechnologies.join(', ')}\n`;
          repositoryMetadata += `- **Strengths ${comp.repoA.name}:** ${comp.strengths.repoA.join(', ')}\n`;
          repositoryMetadata += `- **Strengths ${comp.repoB.name}:** ${comp.strengths.repoB.join(', ')}\n`;
          repositoryMetadata += `- **Primary Use Case ${comp.repoA.name}:** ${comp.useCases.repoA}\n`;
          repositoryMetadata += `- **Primary Use Case ${comp.repoB.name}:** ${comp.useCases.repoB}\n\n`;

          selectedSections.push('Structured Comparison');

          // Pre-populate compared entities
          const projA = context.projects.find(p => p.id.toLowerCase() === matchedRepos[0]);
          const projB = context.projects.find(p => p.id.toLowerCase() === matchedRepos[1]);
          if (projA) selectedProjects.push(projA);
          if (projB) selectedProjects.push(projB);
          
          const repoA = context.repositories.find(r => r.name.toLowerCase() === matchedRepos[0]);
          const repoB = context.repositories.find(r => r.name.toLowerCase() === matchedRepos[1]);
          if (repoA) selectedRepositories.push(repoA);
          if (repoB) selectedRepositories.push(repoB);
        }
      }
    }

    // B. Check for Recruiter Insights (e.g. "Which project demonstrates distributed systems?")
    const recruiterInsight = await this.recruiterInsightService.getInsight(query);
    if (recruiterInsight) {
      repositoryMetadata += `### STRUCTURED RECRUITER INSIGHT RECOMMENDATION\n`;
      repositoryMetadata += `- **Topic:** ${recruiterInsight.topic}\n`;
      repositoryMetadata += `- **Recommended Repository:** ${recruiterInsight.recommendedRepository}\n`;
      repositoryMetadata += `- **Evidence:** ${recruiterInsight.evidence.join(', ')}\n`;
      repositoryMetadata += `- **Rationale:** ${recruiterInsight.rationale}\n\n`;

      selectedSections.push('Structured Recruiter Insight');

      const matchedProj = context.projects.find(p => p.id.toLowerCase() === recruiterInsight.recommendedRepository.toLowerCase());
      if (matchedProj) selectedProjects.push(matchedProj);

      const matchedRepo = context.repositories.find(r => r.name.toLowerCase() === recruiterInsight.recommendedRepository.toLowerCase());
      if (matchedRepo) selectedRepositories.push(matchedRepo);
    }

    // C. Check for Technology Inverted Lookup (e.g. "Which repositories use FastAPI?")
    const isLookupQuery = queryClean.includes('which') || queryClean.includes('show') || queryClean.includes('list') || queryClean.includes('find') || queryClean.includes('use');
    if (isLookupQuery) {
      const lookupResult = await this.techLookupService.lookup(query);
      if (lookupResult && lookupResult.length > 0) {
        repositoryMetadata += `### STRUCTURED TECHNOLOGY REVERSE LOOKUP\n`;
        repositoryMetadata += `- Mapped Query Result: The following repositories are verified to utilize the matched technology: ${lookupResult.join(', ')}.\n\n`;

        selectedSections.push('Structured Tech Lookup');

        lookupResult.forEach(repoName => {
          const matchedRepo = context.repositories.find(r => r.name.toLowerCase() === repoName.toLowerCase());
          if (matchedRepo) selectedRepositories.push(matchedRepo);

          const matchedProj = context.projects.find(p => p.id.toLowerCase() === repoName.toLowerCase());
          if (matchedProj) selectedProjects.push(matchedProj);
        });
      }
    }

    // 1. Entity Resolution Layer
    const resolved = this.entityResolver.resolve(query);
    
    if (resolved) {
      const entity = resolved.entity;
      const entityId = entity.id;
      const entityType = entity.type;

      const traversedRelationships: string[] = [];

      if (entityType === 'project') {
        const projNodeId = `project:${entityId}`;
        selectedSections.push('Resolved Project');

        // Fetch primary project context
        const proj = context.projects.find(p => p.id.toLowerCase() === entityId);
        if (proj) selectedProjects.push(proj);

        // Traverse skills/technologies
        const skills = this.traversalService.getProjectSkills(projNodeId);
        skills.forEach(s => {
          const matchedSkill = context.skills.find(sk => sk.name.toLowerCase() === s.label.toLowerCase());
          if (matchedSkill) selectedSkills.push(matchedSkill);
        });
        if (skills.length > 0) {
          selectedSections.push('Project Technologies');
          traversedRelationships.push(`project:${entityId} -> BUILT_WITH -> Skill (${skills.length} nodes)`);
        }

        // Traverse achievements
        const achievements = this.traversalService.getProjectAchievements(projNodeId);
        achievements.forEach(a => {
          const matchedAch = context.achievements.find(ach => ach.title.toLowerCase() === a.label.toLowerCase());
          if (matchedAch) selectedAchievements.push(matchedAch);
        });
        if (achievements.length > 0) {
          selectedSections.push('Project Achievements');
          traversedRelationships.push(`project:${entityId} -> RELATED_TO -> Achievement (${achievements.length} nodes)`);
        }

        // Traverse repositories
        const repos = this.traversalService.getProjectRepositories(projNodeId);
        repos.forEach(r => {
          const matchedRepo = context.repositories.find(rep => rep.name.toLowerCase() === r.label.toLowerCase());
          if (matchedRepo) selectedRepositories.push(matchedRepo);
        });
        if (repos.length > 0) {
          selectedSections.push('Project Repository');
          traversedRelationships.push(`project:${entityId} -> DEPENDS_ON -> Repository (${repos.length} nodes)`);
        }

        // Match timeline milestones linked to project
        context.timeline.forEach(yearGroup => {
          const matchingMilestones = yearGroup.milestones.filter(m => {
            const mtitle = m.title.toLowerCase();
            return proj ? mtitle.includes(proj.title.toLowerCase()) : false;
          });
          if (matchingMilestones.length > 0) {
            selectedTimeline.push({
              year: yearGroup.year,
              milestones: matchingMilestones
            });
          }
        });
        if (selectedTimeline.length > 0) {
          selectedSections.push('Project Timeline Milestones');
        }
      } 
      else if (entityType === 'skill' || entityType === 'technology') {
        const skillNodeId = `skill:${entityId}`;
        selectedSections.push('Resolved Skill');

        // Fetch primary skill context
        const skill = context.skills.find(s => s.name.toLowerCase() === entityId);
        if (skill) selectedSkills.push(skill);

        // Traverse related projects
        const projects = this.traversalService.getSkillProjects(skillNodeId);
        projects.forEach(p => {
          const matchedProj = context.projects.find(proj => 
            proj.id.toLowerCase() === p.id.split(':').slice(1).join(':').toLowerCase() || 
            proj.title.toLowerCase() === p.label.toLowerCase()
          );
          if (matchedProj) selectedProjects.push(matchedProj);
        });
        if (projects.length > 0) {
          selectedSections.push('Related Projects');
          traversedRelationships.push(`skill:${entityId} -> USED_IN -> Project (${projects.length} nodes)`);
        }

        // Fetch repositories associated with those projects
        selectedProjects.forEach(p => {
          const matchedRepo = context.repositories.find(r => 
            r.name.toLowerCase() === p.id.toLowerCase() || 
            (p.associatedRepositoryName && r.name.toLowerCase() === p.associatedRepositoryName.toLowerCase())
          );
          if (matchedRepo) selectedRepositories.push(matchedRepo);
        });
        if (selectedRepositories.length > 0) {
          selectedSections.push('Project Repositories');
        }
      }

      // Check if we populated any content. If so, return it!
      if (selectedProjects.length > 0 || selectedSkills.length > 0) {
        return {
          profile: context.profile,
          skills: Array.from(new Set(selectedSkills)),
          projects: Array.from(new Set(selectedProjects)),
          repositories: Array.from(new Set(selectedRepositories)),
          achievements: Array.from(new Set(selectedAchievements)),
          timeline: Array.from(new Set(selectedTimeline)),
          selectedSections,
          resolvedEntity: `${entity.name} (${entity.type})`,
          traversedRelationships,
          repositoryMetadata: repositoryMetadata || undefined
        };
      }
    }

    // 2. Fallback to existing keyword-based selection if no entity resolved

    const matches = (keywords: string[]) => keywords.some(kw => queryClean.includes(kw));

    // Detect target projects
    const wantsOrbitair = matches(['orbitair', 'orbit', 'aqi', 'air quality', 'pollution', 'forecasting']);
    const wantsSahai = matches(['sahai', 'mental health', 'lifestyle', 'therapist', 'chat', 'mood']);
    const wantsPatient = matches(['patient', 'hospital', 'billing', 'clinical', 'patient-management-service', 'microservices']);

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

    // Detect target skills and categories
    const wantsBackend = matches(['backend', 'java', 'python', 'go', 'rust', 'spring', 'django', 'fastapi', 'grpc', 'kafka', 'vector', 'database', 'sql']);
    const wantsFrontend = matches(['frontend', 'react', 'typescript', 'javascript', 'nextjs', 'css', 'html', 'ui', 'interface']);
    const wantsAi = matches(['ai', 'ml', 'machine learning', 'artificial intelligence', 'rag', 'pinecone', 'model']);
    const wantsCloud = matches(['cloud', 'docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'deployment']);

    context.skills.forEach(s => {
      const scat = s.category.toLowerCase();
      const sname = s.name.toLowerCase();

      const isTechMentioned = queryClean.includes(sname);
      
      const isCatMatch = 
        (wantsBackend && (scat.includes('backend') || scat.includes('database'))) ||
        (wantsFrontend && scat.includes('frontend')) ||
        (wantsAi && (scat.includes('ai') || scat.includes('ml'))) ||
        (wantsCloud && (scat.includes('cloud') || scat.includes('tools')));

      const isProjectSkill = selectedProjects.some(p => 
        p.techStack.some(t => t.toLowerCase() === sname)
      );

      if (isTechMentioned || isCatMatch || isProjectSkill) {
        selectedSkills.push(s);
      }
    });

    // Detect repositories
    context.repositories.forEach(r => {
      const rname = r.name.toLowerCase();
      const isRepoNameMatch = queryClean.includes(rname);
      const isProjectRepo = selectedProjects.some(p => 
        p.associatedRepositoryName?.toLowerCase() === rname ||
        p.id.toLowerCase() === rname
      );
      const isSkillRepo = selectedSkills.some(s => 
        r.topics.some(t => t.toLowerCase() === s.name.toLowerCase()) ||
        (r.language && r.language.toLowerCase() === s.name.toLowerCase())
      );

      if (isRepoNameMatch || isProjectRepo || isSkillRepo) {
        selectedRepositories.push(r);
      }
    });

    // Detect achievements
    const wantsAchievements = matches(['achievement', 'award', 'hackathon', 'nasa', 'sih', 'smart india', 'delhi', 'prize', 'compete']);
    context.achievements.forEach(a => {
      const isAchievementMatch = 
        wantsAchievements || 
        queryClean.includes(a.title.toLowerCase()) ||
        selectedProjects.some(p => a.associatedProjects.some(ap => ap.toLowerCase().includes(p.title.toLowerCase())));

      if (isAchievementMatch) {
        selectedAchievements.push(a);
      }
    });

    // Detect timeline
    const wantsTimeline = matches(['timeline', 'history', 'career', 'milestone', 'education', 'degree', 'graduation', 'college', 'school']);
    if (wantsTimeline) {
      selectedTimeline.push(...context.timeline);
    } else {
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

    // Default Fallback Selection (Minimal Fallback for General Knowledge Mode)
    if (selectedSkills.length === 0 && selectedProjects.length === 0 && selectedRepositories.length === 0 && selectedAchievements.length === 0) {
      selectedSections.push('Profile (Minimal Fallback)');
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
      selectedSections,
      resolvedEntity: 'None (General/Fallback Mode)',
      traversedRelationships: [],
      repositoryMetadata: repositoryMetadata || undefined
    };
  }

  /**
   * Compresses the selected context entities and formats them as a clean, highly readable Markdown prompt text.
   */
  static compressAndFormat(selected: SelectedContext & { repositoryMetadata?: string }): string {
    let output = '';

    if (selected.repositoryMetadata) {
      output += `${selected.repositoryMetadata}\n`;
    }

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
