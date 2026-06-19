import { buildKnowledgeGraph } from '../lib/knowledge/builder';
import { RelationshipDiscoveryService } from '../lib/knowledge/relationshipDiscoveryService';

async function testGraph() {
  console.log("==========================================");
  console.log("BUILDING KNOWLEDGE GRAPH & RUNNING RELATIONSHIP DISCOVERY");
  console.log("==========================================");

  const graph = await buildKnowledgeGraph(true);

  console.log("\n--- EXPOSING GRAPH DIAGNOSTICS ---");
  const diagnostics = RelationshipDiscoveryService.getDiagnostics(graph);
  console.log("Total Nodes:           ", diagnostics.totalNodes);
  console.log("Total Relationships:   ", diagnostics.totalRelationships);
  console.log("\nMost Connected Technologies:");
  diagnostics.mostConnectedTechnologies.forEach(t => {
    console.log(`  - ${t.name}: ${t.count} connections`);
  });
  console.log("\nMost Connected Repositories:");
  diagnostics.mostConnectedRepositories.forEach(r => {
    console.log(`  - ${r.name}: ${r.count} connections`);
  });

  console.log("\n--- TESTING REVERSE LOOKUPS ---");
  const queries = [
    { tech: 'FastAPI', type: 'Repository' },
    { tech: 'Docker', type: 'Project' },
    { tech: 'Spring Boot', type: 'Repository' },
    { tech: 'Kafka', type: 'Project' }
  ];

  queries.forEach(({ tech, type }) => {
    console.log(`\nWhich ${type.toLowerCase()}s use ${tech}?`);
    const results = type === 'Repository' 
      ? RelationshipDiscoveryService.findRepositoriesByTech(graph, tech)
      : RelationshipDiscoveryService.findProjectsByTech(graph, tech);

    if (results.length === 0) {
      console.log("  (None found)");
    } else {
      results.forEach(res => {
        console.log(`  - ${res.label} (${res.type})`);
      });
    }
  });

  console.log("\n--- TESTING SHARED TECHNOLOGY DETECTION ---");
  console.log("\nWhat technologies are shared between SAHAI and ORBITAIR?");
  const shared = RelationshipDiscoveryService.findSharedTechnologies(graph, 'SAHAI', 'ORBITAIR');
  shared.forEach(s => {
    console.log(`  - ${s.label}`);
  });

  console.log("\nWhat repositories use both FastAPI and React?");
  const intersect = RelationshipDiscoveryService.findRepositoriesWithAllTech(graph, ['FastAPI', 'React']);
  intersect.forEach(i => {
    console.log(`  - ${i.label}`);
  });

  console.log("\n--- TESTING RELATIONSHIP CONFIDENCE AND SOURCE ---");
  const relationships = graph.getRelationships();
  const withProps = relationships.filter(rel => rel.properties && rel.properties.confidence !== undefined);
  console.log(`Found ${withProps.length} relationships with confidence properties.`);
  console.log("Sample of 10 relationships with properties:");
  withProps.slice(0, 10).forEach(rel => {
    console.log(`- Edge: ${rel.sourceId} -[${rel.type}]-> ${rel.targetId}`);
    if (rel.properties) {
      console.log(`  * Source:           ${rel.properties.source}`);
      console.log(`  * Confidence:       ${rel.properties.confidence}`);
      console.log(`  * Discovery Method: ${rel.properties.discoveryMethod}`);
      console.log(`  * Description:      ${rel.properties.description}`);
    }
  });
}

testGraph().catch(err => {
  console.error("Test failed with error:", err);
});
