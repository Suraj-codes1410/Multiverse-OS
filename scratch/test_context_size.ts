import { contextService } from '../lib/oracle/service';

async function checkContextSize() {
  try {
    const context = await contextService.getContext();
    const serialized = JSON.stringify(context);
    console.log(`Context String Length: ${serialized.length} characters`);
    console.log(`Approximate Tokens: ${Math.round(serialized.length / 4)} tokens`);
    
    console.log("\nBreakdown of sizes:");
    console.log(`  Profile size: ${JSON.stringify(context.profile).length} chars`);
    console.log(`  Skills size: ${JSON.stringify(context.skills).length} chars`);
    console.log(`  Projects size: ${JSON.stringify(context.projects).length} chars`);
    console.log(`  Repositories size: ${JSON.stringify(context.repositories).length} chars`);
    console.log(`  Achievements size: ${JSON.stringify(context.achievements).length} chars`);
    console.log(`  Timeline size: ${JSON.stringify(context.timeline).length} chars`);
    console.log(`  Tech relationships size: ${JSON.stringify(context.technologyRelationships).length} chars`);
    console.log(`  Repo relationships size: ${JSON.stringify(context.repositoryRelationships).length} chars`);
  } catch (error) {
    console.error(error);
  }
}

checkContextSize();
