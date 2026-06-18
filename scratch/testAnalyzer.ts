import { buildKnowledgeGraph } from '../lib/knowledge/builder';

async function main() {
  console.log("Building Knowledge Graph and running content analyzer...");
  const graph = await buildKnowledgeGraph(true);
  
  const repos = graph.getNodesByType('Repository');
  console.log(`Found ${repos.length} repository nodes:`);
  
  for (const repo of repos) {
    console.log(`\n========================================`);
    console.log(`Repository: ${repo.label}`);
    const summary = repo.properties.repositorySummary as any;
    if (summary) {
      console.log(`Purpose: ${summary.RepositoryPurpose}`);
      console.log(`Key Features: ${summary.KeyFeatures.slice(0, 3).join(', ')}...`);
      console.log(`Technologies: ${summary.TechnologyStack.join(', ')}`);
      console.log(`Complexity Indicators: ${summary.ComplexityIndicators.join(', ')}`);
    } else {
      console.log(`No repositorySummary property found!`);
    }
  }
}

main().catch(err => {
  console.error(err);
});
