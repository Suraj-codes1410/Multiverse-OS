import { discoverRepositories } from '../lib/github/discoveryService';

async function testDiscoveryQueries() {
  console.log("\n=== Testing Reusable Repository Discovery Service ===");
  const queries = [
    'Show AI projects',
    'Show Backend projects',
    'Show Distributed Systems projects',
    'Show FastAPI projects',
    'Show Kafka projects',
    'Show React projects'
  ];

  for (const q of queries) {
    console.log(`\nQuery: "${q}"`);
    try {
      const result = await discoverRepositories(q);
      console.log(`  Matched Filters:`, result.matchedFilters);
      console.log(`  Matching Projects Count: ${result.projects.length}`);
      result.projects.forEach(p => {
        console.log(`    * ${p.title} (ID: ${p.id})`);
      });
    } catch (e) {
      console.error(`  Error running query "${q}":`, e);
    }
  }
}

testDiscoveryQueries();
