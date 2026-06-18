import { SelectedContext } from './contextSelector';

export interface OracleSources {
  projectsUsed: string[];
  repositoriesUsed: string[];
  skillsUsed: string[];
  achievementsUsed: string[];
  entitiesUsed: string[];
  confidence: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  resolvedEntity: string;
  traversedRelationships: string[];
  contextSizeTokens: number;
}

export class EvidenceCollector {
  /**
   * Aggregates matched entities from selected context and determines query source attribution.
   */
  public static collect(
    selected: SelectedContext & { resolvedEntity: string; traversedRelationships: string[] },
    contextSizeChars: number
  ): OracleSources {
    const projectsUsed = selected.projects.map(p => p.title);
    const repositoriesUsed = selected.repositories.map(r => r.name);
    const skillsUsed = selected.skills.map(s => s.name);
    const achievementsUsed = selected.achievements.map(a => a.title);
    
    const entitiesUsed: string[] = [];
    if (selected.resolvedEntity && selected.resolvedEntity !== 'None (General/Fallback Mode)') {
      entitiesUsed.push(selected.resolvedEntity);
    }

    // Determine confidence scoring based on matching type
    // Direct match: 95-100%
    // Relationship traversal: 80-95%
    // Indirect inference: 60-80%
    let confidence = 0.75; // Baseline Indirect inference
    let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Low';

    if (selected.resolvedEntity && selected.resolvedEntity !== 'None (General/Fallback Mode)') {
      if (selected.traversedRelationships.length > 0) {
        // Traversed relationships in the graph (80-95%)
        confidence = 0.90;
        confidenceLevel = 'Medium';
      } else {
        // Direct entity match (95-100%)
        confidence = 0.98;
        confidenceLevel = 'High';
      }
    } else if (projectsUsed.length > 0 || skillsUsed.length > 0) {
      // Indirect inference fallback (60-80%)
      confidence = 0.75;
      confidenceLevel = 'Low';
    } else {
      // General technical knowledge (highly accurate built-in model data)
      confidence = 0.95;
      confidenceLevel = 'High';
    }

    const contextSizeTokens = Math.round(contextSizeChars / 4);

    return {
      projectsUsed,
      repositoriesUsed,
      skillsUsed,
      achievementsUsed,
      entitiesUsed,
      confidence,
      confidenceLevel,
      resolvedEntity: selected.resolvedEntity,
      traversedRelationships: selected.traversedRelationships,
      contextSizeTokens
    };
  }
}

export class SourceAttributionService {
  /**
   * Returns source attribution evidence and confidence metadata.
   */
  public getSources(
    selected: SelectedContext & { resolvedEntity: string; traversedRelationships: string[] },
    contextSizeChars: number
  ): OracleSources {
    return EvidenceCollector.collect(selected, contextSizeChars);
  }
}
