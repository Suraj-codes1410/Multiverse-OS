import { RecruiterInsightEngine } from '../lib/github/recruiterInsightEngine';

async function testQuery(query: string) {
  console.log(`\n========================================`);
  console.log(`Recruiter Query: "${query}"`);
  
  const result = await RecruiterInsightEngine.evaluateQuery(query);
  if (result) {
    console.log(`Matched Dimension: ${result.bestDimensionMatched}`);
    console.log(`Recommended Project: ${result.recommendedProject.projectTitle} (Score: ${result.recommendedProject.score}/100)`);
    console.log(`\nAll Rankings:`);
    result.rankings.forEach(rank => {
      console.log(`  Rank ${rank.rank}: ${rank.projectTitle} (Score: ${rank.score}/100)`);
      console.log(`    Repository: ${rank.repositoryName} | URL: ${rank.repositoryUrl}`);
      console.log(`    Technologies: ${rank.technologies.slice(0, 5).join(', ')}`);
      console.log(`    Evidence: ${rank.evidence.slice(0, 3).join(', ')}...`);
      console.log(`    Rationale: ${rank.rationale}`);
    });
  } else {
    console.log("No matched dimension found.");
  }
}

async function main() {
  await testQuery("Which project best demonstrates backend engineering?");
  await testQuery("Which project should recruiters review first?");
}

main().catch(err => {
  console.error(err);
});
