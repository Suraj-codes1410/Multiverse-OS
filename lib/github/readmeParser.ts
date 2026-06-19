export interface ExtractedReadmeData {
  readmeContent: string;
  technologies: string[]; // Flattened list of all detected technologies for legacy compat
  languages: string[];
  frameworks: string[];
  databases: string[];
  features: string[];
  architectureDescriptions: string[];
}

export class ReadmeParser {
  private static LANGUAGES = [
    'Go', 'Rust', 'TypeScript', 'JavaScript', 'Python', 'Java', 'HTML', 'CSS', 'C++', 'C', 'Shell', 'SQL'
  ];

  private static FRAMEWORKS = [
    'Spring Boot', 'FastAPI', 'Django', 'React', 'Next.js', 'Vite', 'TailwindCSS', 
    'Hibernate', 'Spring Security', 'Express', 'NestJS', 'Angular', 'Vue', 'Leaflet', 
    'WebSockets', 'gRPC'
  ];

  private static DATABASES = [
    'Pinecone', 'TimescaleDB', 'Redis', 'MySQL', 'PostgreSQL', 'MongoDB', 'Elasticsearch'
  ];

  static parse(readme: string): ExtractedReadmeData {
    // 1. If README is unavailable, return empty lists
    if (readme === 'No README content available.' || !readme.trim()) {
      return {
        readmeContent: readme,
        technologies: [],
        languages: [],
        frameworks: [],
        databases: [],
        features: [],
        architectureDescriptions: []
      };
    }

    const languages: string[] = [];
    const frameworks: string[] = [];
    const databases: string[] = [];

    // Search text for matches - never infer from repo name!
    this.LANGUAGES.forEach(lang => {
      const regex = new RegExp(`\\b${lang.replace('+', '\\+')}\\b`, 'i');
      if (regex.test(readme)) {
        languages.push(lang);
      }
    });

    this.FRAMEWORKS.forEach(fw => {
      const regex = new RegExp(`\\b${fw.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(readme)) {
        frameworks.push(fw);
      }
    });

    this.DATABASES.forEach(db => {
      const regex = new RegExp(`\\b${db}\\b`, 'i');
      if (regex.test(readme)) {
        databases.push(db);
      }
    });

    // Flatten for legacy compatibility
    const technologies = Array.from(new Set([...languages, ...frameworks, ...databases]));

    // 2. Parse features & architecture sections from markdown
    const features: string[] = [];
    const architectureDescriptions: string[] = [];
    const lines = readme.split('\n');

    let currentSection: 'features' | 'architecture' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) {
        const heading = trimmed.replace(/^#+\s+/, '').toLowerCase();
        if (heading.includes('feature') || heading.includes('capability') || heading.includes('what it does')) {
          currentSection = 'features';
        } else if (heading.includes('architecture') || heading.includes('design') || heading.includes('component')) {
          currentSection = 'architecture';
        } else {
          currentSection = null;
        }
      } else if (trimmed) {
        if (currentSection === 'features') {
          // Parse bullet points
          const match = trimmed.match(/^[-*+]\s+(.*)$/) || trimmed.match(/^\d+\.\s+(.*)$/);
          if (match) {
            features.push(match[1].replace(/\*\*/g, '').replace(/`/g, '').trim());
          }
        } else if (currentSection === 'architecture') {
          architectureDescriptions.push(trimmed);
        }
      }
    }

    return {
      readmeContent: readme,
      technologies,
      languages,
      frameworks,
      databases,
      features,
      architectureDescriptions
    };
  }
}
