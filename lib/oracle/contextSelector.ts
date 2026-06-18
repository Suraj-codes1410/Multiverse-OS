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

    // Temporarily disable all custom query routing and return the complete portfolio context.
    return {
      profile: context.profile,
      skills: context.skills,
      projects: context.projects,
      repositories: context.repositories,
      achievements: context.achievements,
      timeline: context.timeline,
      selectedSections: ['All Portfolio Data'],
      resolvedEntity: 'None (Direct Routing)',
      traversedRelationships: [],
      repositoryMetadata: undefined
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
