import githubConfig from '../../data/github-config.json';

function getFsAndPath() {
  if (typeof window === 'undefined') {
    try {
      const fs = eval('require')('fs');
      const path = eval('require')('path');
      const cachePath = path.join(process.cwd(), 'data/github-readme-cache.json');
      return { fs, path, cachePath };
    } catch (e) {
      console.error('ReadmeFetcher: Failed to load fs/path dynamically on server:', e);
    }
  }
  return { fs: null, path: null, cachePath: '' };
}

export class ReadmeFetcher {
  private static MOCK_READMES: Record<string, string> = {
    'patient-management-service': `# Patient Management Service\n\nA hospital billing and microservices system designed for high reliability and event-driven coordination.\n\n## System Architecture\nThe system consists of independent microservices built with **Spring Boot** communicating over **gRPC** for low latency and **Kafka** for asynchronous messaging.\n\n### Key Components\n* **Patient Billing Service**: Manages accounts and invoices.\n* **Notification Engine**: Consumes Kafka events to send billing updates.\n* **Staff Portal**: RBAC-isolated administration interface.`,
    sahai: `# SAHAI — Mental Health & Lifestyle Platform\n\nAn intelligent, full-stack mental health platform engineered with Django, FastAPI, and React.\n\n## Key Features\n* **RAG-powered Assistant**: Fast retrieval-augmented generation using Pinecone.\n* **Real-time Chat**: Bi-directional client-therapist chat rooms via WebSockets.\n* **Appointment Scheduler**: Resilient Django-based calendar management.`,
    orbitair: `# ORBITAIR — AI-Powered AQI Forecasting\n\nA geospatial forecasting platform that indexes satellite and local sensor data to predict air quality.\n\n## Features\n* **Geospatial Ingestion**: Integrates NASA TEMPO satellite and EPA/OpenAQ sensor feeds.\n* **High-Volume Time-Series**: Backed by TimescaleDB hypertables.\n* **Explainable AI Dashboard**: Beautiful React map rendering pollution forecasts.`
  };

  static async fetch(repoName: string): Promise<string> {
    const normalizedName = repoName.toLowerCase().trim();
    const { fs, cachePath } = getFsAndPath();

    // 1. Try to read from cache first, but only if it's not a placeholder
    if (fs && cachePath && fs.existsSync(cachePath)) {
      try {
        const content = fs.readFileSync(cachePath, 'utf8');
        const cache = JSON.parse(content);
        if (cache && cache[normalizedName]) {
          const cachedValue = cache[normalizedName];
          if (!cachedValue.includes("No README.md content was retrieved") && 
              !cachedValue.includes("No README content available") && 
              !cachedValue.includes("Failed to fetch README")) {
            return cachedValue;
          }
        }
      } catch (e) {
        console.error('ReadmeFetcher: Failed to parse cache:', e);
      }
    }

    // 2. If sync is disabled in environment, return mock or "No README content available."
    if (process.env.ENABLE_GITHUB_SYNC === 'false') {
      return this.MOCK_READMES[normalizedName] || 'No README content available.';
    }

    // 3. Perform live API fetch
    const username = githubConfig.username;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'suraj-multiverse-os'
    };
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, {
        headers,
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const text = await response.text();
        if (fs && cachePath) {
          try {
            let cache: Record<string, string> = {};
            if (fs.existsSync(cachePath)) {
              const cacheContent = fs.readFileSync(cachePath, 'utf8');
              cache = JSON.parse(cacheContent) || {};
            }
            cache[normalizedName] = text;
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
          } catch (e) {
            console.error('ReadmeFetcher: Failed to write to cache:', e);
          }
        }
        return text;
      }
    } catch (error) {
      console.error(`ReadmeFetcher: Error fetching README for ${repoName}:`, error);
    }

    // 4. Return offline mock if available, otherwise return the explicit unavailable message
    return this.MOCK_READMES[normalizedName] || 'No README content available.';
  }
}
