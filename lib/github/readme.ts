import githubConfig from '@/data/github-config.json';

// Offline markdown documentation fallbacks for mock repositories
const MOCK_READMES: { [key: string]: string } = {
  novadb: `# NovaDB\n\nA high-performance, distributed vector database engineered in Go and Rust.\n\n## Core Features\n- **Sub-millisecond query latency**: Optimized similarity search indices.\n- **Raft Consensus**: Distributed state machine replication for failover protection.\n- **gRPC API Layer**: Fast serialization protocol buffers endpoints.\n\n## Quick Start\n\`\`\`bash\n# Run novadb standalone server\nnovadb-server --config ./config.yaml\n\`\`\`\n\n## References\nCheck the developer portal at [novadb.io](https://novadb.example.com) for specs.`,
  aetheragent: `# AetherAgent\n\nAn asynchronous, event-driven orchestration framework for executing complex multi-agent workflows.\n\n## Core Features\n- **Agent Handshakes**: Dynamic consensus negotiation.\n- **RabbitMQ Broker**: Decoupled task queue channels.\n- **State Persistence**: Memory store indexing using Redis.\n\n## Quick Start\n\`\`\`typescript\nimport { AetherNode } from 'aetheragent';\nconst node = new AetherNode();\nawait node.initialize();\n\`\`\`\n\n## References\nDocumentation available in the [Aether docs portal](https://aetheragent.example.com).`,
  logpulse: `# LogPulse\n\nA robust, real-time log ingestion and processing pipeline designed to handle 100,000+ events per second.\n\n## Core Features\n- **Kafka Streaming**: High-throughput distributed partition ingestion.\n- **Elastic Search Mapping**: Auto-indexing configurations.\n- **PyTorch Auditing**: Live anomaly detection model filters.\n\n## Quick Start\n\`\`\`bash\n# Start Kafka pipeline consumer\nlogpulse-pipeline --kafka-broker localhost:9092\n\`\`\`\n\n## References\nRead structural reviews at [logpulse.dev](https://logpulse.example.com).`
};

/**
 * Reusable README service to retrieve raw README markdown content from GitHub repository.
 * Consumed by repository detail pages and future ORACLE agents.
 */
export async function getReadmeContent(repoName: string): Promise<string> {
  const username = githubConfig.username;
  const normalizedName = repoName.toLowerCase();
  
  try {
    const response = await fetch(`https://api.github.com/repos/${username}/${repoName}/readme`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'suraj-multiverse-os'
      }
    });

    if (!response.ok) {
      console.warn(`GitHub README API returned status ${response.status} for ${repoName}. Using mock fallback.`);
      return MOCK_READMES[normalizedName] || `# ${repoName}\n\nNo README.md content found on GitHub. Displaying dynamic placeholder for active repository dossier.`;
    }

    const markdownText = await response.text();
    return markdownText;
  } catch (error) {
    console.error(`Error loading README for repository ${repoName}:`, error);
    return MOCK_READMES[normalizedName] || `# ${repoName}\n\nError fetching README.md documentation feed. Offline cache placeholder loaded.`;
  }
}
