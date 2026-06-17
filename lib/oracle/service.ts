import { OracleContextBuilder } from './builder';
import { 
  OracleContext, 
  CandidateProfile, 
  TechnicalSkillContext, 
  ProjectContext, 
  RepositoryContext, 
  AchievementContext, 
  TimelineContext, 
  TechnologyRelationshipContext, 
  RepositoryRelationshipContext 
} from './types';

export class ContextService {
  private static instance: ContextService | null = null;
  private cachedContext: OracleContext | null = null;
  private builder: OracleContextBuilder;

  private constructor() {
    this.builder = new OracleContextBuilder();
  }

  public static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService();
    }
    return ContextService.instance;
  }

  /**
   * Returns the cached structured Oracle context, or builds and caches it on first call.
   */
  async getContext(): Promise<OracleContext> {
    if (!this.cachedContext) {
      this.cachedContext = await this.builder.build();
    }
    return this.cachedContext;
  }

  /**
   * Forces rebuild of the portfolio context, updating cached state.
   */
  async refreshContext(): Promise<OracleContext> {
    this.cachedContext = await this.builder.build();
    return this.cachedContext;
  }

  /**
   * Retrieves Candidate Profile context
   */
  async getCandidateProfile(): Promise<CandidateProfile> {
    const context = await this.getContext();
    return context.profile;
  }

  /**
   * Retrieves Technical Skills context
   */
  async getTechnicalSkills(): Promise<TechnicalSkillContext[]> {
    const context = await this.getContext();
    return context.skills;
  }

  /**
   * Retrieves Projects context
   */
  async getProjects(): Promise<ProjectContext[]> {
    const context = await this.getContext();
    return context.projects;
  }

  /**
   * Retrieves Repositories context
   */
  async getRepositories(): Promise<RepositoryContext[]> {
    const context = await this.getContext();
    return context.repositories;
  }

  /**
   * Retrieves Achievements context
   */
  async getAchievements(): Promise<AchievementContext[]> {
    const context = await this.getContext();
    return context.achievements;
  }

  /**
   * Retrieves Timeline context
   */
  async getTimeline(): Promise<TimelineContext[]> {
    const context = await this.getContext();
    return context.timeline;
  }

  /**
   * Retrieves Technology Relationships context
   */
  async getTechnologyRelationships(): Promise<TechnologyRelationshipContext[]> {
    const context = await this.getContext();
    return context.technologyRelationships;
  }

  /**
   * Retrieves Repository Relationships context
   */
  async getRepositoryRelationships(): Promise<RepositoryRelationshipContext[]> {
    const context = await this.getContext();
    return context.repositoryRelationships;
  }
}

// Export a singleton instance of the service
export const contextService = ContextService.getInstance();
export default contextService;
