import { buildKnowledgeGraph } from '../lib/knowledge/builder';

async function testGraphRelationships() {
  console.log("\n=== Testing Knowledge Graph Repository Relationships ===");
  try {
    const graph = await buildKnowledgeGraph();

    console.log(`Total Nodes: ${graph.getNodes().length}`);
    console.log(`Total Relationships: ${graph.getRelationships().length}`);

    console.log("\nAll Repository Nodes:");
    graph.getNodesByType('Repository').forEach(node => {
      console.log(`  - ${node.id} (${node.label})`);
    });

    console.log("\nSample Nodes:");
    graph.getNodes().slice(0, 15).forEach(node => {
      console.log(`  - ${node.id} (${node.type})`);
    });

    console.log("\nSample Relationships:");
    graph.getRelationships().slice(0, 15).forEach(rel => {
      console.log(`  - ${rel.sourceId} --[${rel.type}]--> ${rel.targetId}`);
    });

    const testSkills = ['FastAPI', 'Kafka'];

    testSkills.forEach(skillName => {
      const skillId = `skill:${skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      const node = graph.getNode(skillId);
      
      if (!node) {
        console.log(`\nSkill Node not found for: ${skillName}`);
        return;
      }

      console.log(`\nSkill: ${node.label}`);
      console.log('Related Repositories:');

      const neighbors = graph.getNeighbors(skillId, 'both');
      const repoNeighbors = neighbors.filter(neighbor => neighbor.node.type === 'Repository');

      if (repoNeighbors.length > 0) {
        repoNeighbors.forEach(neighbor => {
          console.log(`  * ${neighbor.node.label} (${neighbor.relationship.properties?.description || 'USES'})`);
        });
      } else {
        console.log('  * None');
      }
    });

  } catch (error) {
    console.error('Error during Knowledge Graph verification:', error);
  }
}

testGraphRelationships();
