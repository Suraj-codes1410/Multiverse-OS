import { SmartRouter } from '@/lib/oracle/smartRouter';
import { conversationalMemoryService } from '@/lib/oracle/memory';

async function runDialogueTest() {
  console.log("Starting Conversational Dialogue Integration Test...\n");

  const sessionId = 'dialogue-session-456';
  conversationalMemoryService.clear(sessionId);

  console.log("--- STEP 1: Tell me about SAHAI ---");
  const query1 = "Tell me about SAHAI";
  
  // Resolve memory
  const res1 = conversationalMemoryService.resolve(sessionId, query1);
  console.log(`Resolved query: "${res1.resolvedQuery}"`);

  // We route step 1 (Expect MODEL_ROUTE since summary/complex question)
  const routeResult1 = await SmartRouter.route(res1.resolvedQuery);
  console.log(`Direct Answer Available: ${routeResult1.directAnswerAvailable}`);
  console.log(`Category Classified: ${routeResult1.category}`);

  // Simulate storing final model response in memory (which would happen in the actual route handler)
  const response1 = "SAHAI is a Mental Health & Lifestyle Platform with Pinecone-backed RAG and WebSockets built with Python and React.";
  await conversationalMemoryService.store(sessionId, res1.resolvedQuery, response1);

  console.log("\n--- STEP 2: What technologies does it use? ---");
  const query2 = "What technologies does it use?";
  
  // Resolve memory
  const res2 = conversationalMemoryService.resolve(sessionId, query2);
  console.log(`Resolved query: "${res2.resolvedQuery}"`);

  // We route step 2 (Expect SMART_ROUTE since it becomes "What technologies does SAHAI use?")
  const routeResult2 = await SmartRouter.route(res2.resolvedQuery);
  console.log(`Direct Answer Available: ${routeResult2.directAnswerAvailable}`);
  console.log(`Category Classified: ${routeResult2.category}`);
  
  if (routeResult2.directAnswerAvailable && routeResult2.directResponse) {
    console.log(`\nLocal Direct Response Output:\n${routeResult2.directResponse}`);
  }

  // Verification asserts
  if (res2.resolvedQuery.toLowerCase().includes('sahai') && routeResult2.directAnswerAvailable) {
    console.log("\n🎉 SUCCESS: Dialogue resolved correctly! Context pronoun 'it' resolved to 'SAHAI' and routed to local SMART_ROUTE successfully! 🎉\n");
  } else {
    console.log("\n❌ FAILURE: Dialogue routing did not match expectations! ❌\n");
  }
}

runDialogueTest().catch(console.error);
