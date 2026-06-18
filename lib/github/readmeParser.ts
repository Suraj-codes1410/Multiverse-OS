export interface ExtractedReadmeData {
  readmeContent: string;
  technologies: string[];
  features: string[];
  architectureDescriptions: string[];
  usageInstructions: string[];
}

export class ReadmeParser {
  static parse(readme: string): ExtractedReadmeData {
    const lines = readme.split('\n');
    
    const features: string[] = [];
    const architectureDescriptions: string[] = [];
    const usageInstructions: string[] = [];
    const technologies: string[] = [];

    let currentSection: 'features' | 'architecture' | 'usage' | 'tech' | null = null;
    let sectionLines: string[] = [];

    const flushSection = () => {
      if (!currentSection) return;
      
      const content = sectionLines.join('\n').trim();
      if (content) {
        if (currentSection === 'features') {
          features.push(content);
        } else if (currentSection === 'architecture') {
          architectureDescriptions.push(content);
        } else if (currentSection === 'usage') {
          usageInstructions.push(content);
        } else if (currentSection === 'tech') {
          technologies.push(content);
        }
      }
      sectionLines = [];
      currentSection = null;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#')) {
        flushSection();
        const headingText = trimmed.replace(/^#+\s+/, '').toLowerCase();
        
        if (headingText.includes('feature')) {
          currentSection = 'features';
        } else if (headingText.includes('architecture') || headingText.includes('component') || headingText.includes('design')) {
          currentSection = 'architecture';
        } else if (
          headingText.includes('get started') || 
          headingText.includes('quick start') || 
          headingText.includes('run') || 
          headingText.includes('install') || 
          headingText.includes('usage') || 
          headingText.includes('prerequisite')
        ) {
          currentSection = 'usage';
        } else if (headingText.includes('tech') || headingText.includes('stack') || headingText.includes('tool') || headingText.includes('language')) {
          currentSection = 'tech';
        } else {
          currentSection = null;
        }
      } else {
        if (currentSection) {
          sectionLines.push(line);
        }
      }
    }
    flushSection();

    const extractListItems = (contentBlocks: string[]): string[] => {
      const items: string[] = [];
      contentBlocks.forEach(block => {
        const lines = block.split('\n');
        lines.forEach(line => {
          const match = line.trim().match(/^[-*+]\s+(.*)$/) || line.trim().match(/^\d+\.\s+(.*)$/);
          if (match) {
            const cleaned = match[1].replace(/\*\*/g, '').replace(/`/g, '').trim();
            if (cleaned) items.push(cleaned);
          } else {
            const cleaned = line.trim().replace(/\*\*/g, '').replace(/`/g, '').trim();
            if (cleaned && cleaned.length > 5 && cleaned.length < 150 && !cleaned.startsWith('#') && !cleaned.startsWith('|')) {
              items.push(cleaned);
            }
          }
        });
      });
      return items;
    };

    const parsedFeatures = extractListItems(features);
    const parsedUsage = usageInstructions.length > 0 ? usageInstructions : [];
    const parsedArchitecture = architectureDescriptions.length > 0 ? architectureDescriptions : [];

    const techItemsSet = new Set<string>();
    const knownTechs = [
      'Spring Boot', 'Kafka', 'gRPC', 'Docker', 'FastAPI', 'Django', 'React', 'WebSockets', 'MySQL', 
      'Pinecone', 'TimescaleDB', 'Leaflet', 'Hibernate', 'Spring Security', 'Redis', 'Go', 'Rust', 
      'TypeScript', 'RabbitMQ', 'Next.js', 'Vite', 'PostgreSQL', 'MongoDB', 'Python', 'Java', 'TailwindCSS',
      'HTML', 'CSS', 'JavaScript', 'PyTorch', 'Elasticsearch', 'Kubernetes'
    ];

    knownTechs.forEach(tech => {
      const regex = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(readme)) {
        techItemsSet.add(tech);
      }
    });

    if (technologies.length > 0) {
      technologies.forEach(techBlock => {
        const lines = techBlock.split('\n');
        lines.forEach(line => {
          if (line.includes('|')) {
            const parts = line.split('|').map(p => p.trim());
            parts.forEach(part => {
              knownTechs.forEach(tech => {
                if (part.toLowerCase() === tech.toLowerCase()) {
                  techItemsSet.add(tech);
                }
              });
            });
          } else {
            knownTechs.forEach(tech => {
              if (line.toLowerCase().includes(tech.toLowerCase())) {
                techItemsSet.add(tech);
              }
            });
          }
        });
      });
    }

    return {
      readmeContent: readme,
      technologies: Array.from(techItemsSet),
      features: parsedFeatures.length > 0 ? parsedFeatures : [],
      architectureDescriptions: parsedArchitecture,
      usageInstructions: parsedUsage
    };
  }
}
