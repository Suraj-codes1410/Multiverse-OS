/**
 * Oracle Entity Recognition Layer (Phase 4.4A)
 */

export interface Entity {
  id: string;
  name: string;
  type: 'project' | 'skill' | 'achievement' | string;
  aliases: string[];
}

export interface IAliasMapping {
  alias: string;
  entityId: string;
}

export class AliasMapping implements IAliasMapping {
  constructor(public alias: string, public entityId: string) {}
}

export class EntityRegistry {
  private entities: Map<string, Entity> = new Map();
  private aliasMappings: AliasMapping[] = [];

  constructor() {
    // Register the three key project entities with their aliases as per requirements
    this.register({
      id: 'orbitair',
      name: 'ORBITAIR',
      type: 'project',
      aliases: ['orbitair', 'air quality project', 'nasa project', 'nasa space apps']
    });

    this.register({
      id: 'sahai',
      name: 'SAHAI',
      type: 'project',
      aliases: ['sahai', 'mental health platform', 'sih project', 'smart india hackathon']
    });

    this.register({
      id: 'patient-management-service',
      name: 'Patient Management Service',
      type: 'project',
      aliases: ['patient management service', 'hospital system', 'billing system']
    });
  }

  /**
   * Registers a new entity and updates the internal alias mapping table.
   */
  public register(entity: Entity): void {
    const normalizedEntity = {
      ...entity,
      aliases: entity.aliases.map(a => a.toLowerCase().trim())
    };
    this.entities.set(entity.id, normalizedEntity);

    // Populate Alias Mappings
    normalizedEntity.aliases.forEach(alias => {
      this.aliasMappings.push(new AliasMapping(alias, entity.id));
    });
    // Also map the entity name as an alias
    const nameLower = entity.name.toLowerCase().trim();
    if (!normalizedEntity.aliases.includes(nameLower)) {
      this.aliasMappings.push(new AliasMapping(nameLower, entity.id));
    }
  }

  public getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  public getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  public getAliasMappings(): AliasMapping[] {
    return this.aliasMappings;
  }
}

export interface ResolutionResult {
  entity: Entity;
  confidence: number;
  matchType: 'exact' | 'alias' | 'partial' | 'fuzzy';
  matchedQuerySegment?: string;
}

export class EntityResolver {
  private registry: EntityRegistry;

  constructor(registry?: EntityRegistry) {
    this.registry = registry || new EntityRegistry();
  }

  /**
   * Resolves a query string to the most relevant entity using exact, alias, partial, and fuzzy matching.
   */
  public resolve(query: string): ResolutionResult | null {
    if (!query || !query.trim()) return null;

    const queryClean = query.toLowerCase().trim();
    const queryTokens = this.tokenize(queryClean);
    if (queryTokens.length === 0) return null;

    const candidates: ResolutionResult[] = [];

    // 1. Exact / Alias Match
    // If the query is an exact match for an entity name or registered alias
    for (const mapping of this.registry.getAliasMappings()) {
      if (queryClean === mapping.alias) {
        const entity = this.registry.getEntity(mapping.entityId);
        if (entity) {
          candidates.push({
            entity,
            confidence: 1.0,
            matchType: 'exact',
            matchedQuerySegment: mapping.alias
          });
        }
      }
    }

    // 2. Phrase/Alias Substring Match
    // If the query contains a multi-word alias exactly as a phrase
    if (candidates.length === 0) {
      for (const mapping of this.registry.getAliasMappings()) {
        const aliasTokens = this.tokenize(mapping.alias);
        if (aliasTokens.length > 0) {
          const matchedSegment = this.findContiguousSubsegment(queryTokens, aliasTokens);
          if (matchedSegment) {
            const entity = this.registry.getEntity(mapping.entityId);
            if (entity) {
              // Confidence scales with the length of the matched alias relative to the query
              const confidence = 0.85 + 0.15 * (aliasTokens.length / queryTokens.length);
              candidates.push({
                entity,
                confidence,
                matchType: 'alias',
                matchedQuerySegment: matchedSegment
              });
            }
          }
        }
      }
    }

    // 3. Partial Token Match
    // If any key tokens match part of the entity name or aliases
    if (candidates.length === 0) {
      for (const entity of this.registry.getAllEntities()) {
        const entityNameTokens = this.tokenize(entity.name.toLowerCase());
        
        // Check for direct token overlap with name
        const overlap = entityNameTokens.filter(t => queryTokens.includes(t));
        if (overlap.length > 0) {
          const confidence = 0.5 * (overlap.length / entityNameTokens.length);
          candidates.push({
            entity,
            confidence,
            matchType: 'partial',
            matchedQuerySegment: overlap.join(' ')
          });
        }
      }
    }

    // 4. Fuzzy Match (Damerau-Levenshtein Distance)
    // If the query tokens have a typo but are very close to entity names/aliases
    if (candidates.length === 0) {
      const threshold = 0.7; // 70% similarity minimum
      for (const mapping of this.registry.getAliasMappings()) {
        const aliasTokens = this.tokenize(mapping.alias);
        
        if (aliasTokens.length === 1) {
          // Compare single word aliases to each word in the query
          const target = aliasTokens[0];
          for (const word of queryTokens) {
            const similarity = this.calculateSimilarity(word, target);
            if (similarity >= threshold) {
              const entity = this.registry.getEntity(mapping.entityId);
              if (entity) {
                candidates.push({
                  entity,
                  confidence: 0.75 * similarity,
                  matchType: 'fuzzy',
                  matchedQuerySegment: word
                });
              }
            }
          }
        } else if (aliasTokens.length > 1 && queryTokens.length >= aliasTokens.length) {
          // Compare multi-word aliases to sliding windows in the query
          for (let i = 0; i <= queryTokens.length - aliasTokens.length; i++) {
            const windowTokens = queryTokens.slice(i, i + aliasTokens.length);
            const windowStr = windowTokens.join(' ');
            const similarity = this.calculateSimilarity(windowStr, mapping.alias);
            if (similarity >= threshold) {
              const entity = this.registry.getEntity(mapping.entityId);
              if (entity) {
                candidates.push({
                  entity,
                  confidence: 0.8 * similarity,
                  matchType: 'fuzzy',
                  matchedQuerySegment: windowStr
                });
              }
            }
          }
        }
      }
    }

    if (candidates.length === 0) return null;

    // Sort by confidence score descending, then by name length descending to pick the most specific match
    candidates.sort((a, b) => {
      if (Math.abs(a.confidence - b.confidence) < 0.001) {
        return (b.matchedQuerySegment?.length || 0) - (a.matchedQuerySegment?.length || 0);
      }
      return b.confidence - a.confidence;
    });

    return candidates[0];
  }

  /**
   * Helper to clean punctuation and tokenize a string.
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /**
   * Checks if subTokens exists contiguously in targetTokens. Returns the matched string segment if found.
   */
  private findContiguousSubsegment(targetTokens: string[], subTokens: string[]): string | null {
    if (subTokens.length === 0 || targetTokens.length < subTokens.length) return null;
    
    for (let i = 0; i <= targetTokens.length - subTokens.length; i++) {
      let match = true;
      for (let j = 0; j < subTokens.length; j++) {
        if (targetTokens[i + j] !== subTokens[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return targetTokens.slice(i, i + subTokens.length).join(' ');
      }
    }
    return null;
  }

  /**
   * Calculates string similarity between 0.0 and 1.0 based on Damerau-Levenshtein Distance.
   */
  private calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.damerauLevenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private damerauLevenshteinDistance(s1: string, s2: string): number {
    const d: number[][] = [];
    const len1 = s1.length;
    const len2 = s2.length;

    for (let i = 0; i <= len1; i++) {
      d[i] = [];
      d[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      d[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,       // Deletion
          d[i][j - 1] + 1,       // Insertion
          d[i - 1][j - 1] + cost // Substitution
        );

        if (
          i > 1 &&
          j > 1 &&
          s1.charAt(i - 1) === s2.charAt(j - 2) &&
          s1.charAt(i - 2) === s2.charAt(j - 1)
        ) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost); // Transposition
        }
      }
    }
    return d[len1][len2];
  }
}
