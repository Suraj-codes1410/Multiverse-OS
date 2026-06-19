import { conversationalMemoryService } from '@/lib/oracle/memory';
import { getRepositories } from '@/lib/github/github';
import { getProjects } from '@/lib/content/index';

async function runMemoryTest() {
  console.log("Starting Conversational Memory Validation Tests...\n");

  const sessionId = 'test-session-123';

  // Clear memory first to ensure a clean state
  conversationalMemoryService.clear(sessionId);

  // Capture logs to verify required logs are printed: MEMORY_STORE, MEMORY_RESOLVE, MEMORY_HIT
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    console.log("--- Interaction 1: User asks about SAHAI ---");
    const query1 = "Tell me about SAHAI";
    const response1 = "SAHAI is a Mental Health & Lifestyle Platform with Pinecone-backed RAG and WebSockets built with Python and React.";

    // Store in conversational memory
    await conversationalMemoryService.store(sessionId, query1, response1);

    console.log("\n--- Interaction 2: User asks 'What technologies does it use?' ---");
    const query2 = "What technologies does it use?";
    
    // Resolve pronouns
    const resolution = conversationalMemoryService.resolve(sessionId, query2);

    // Restore console.log to print verification results
    console.log = originalLog;

    console.log(`\nOriginal Query: "${query2}"`);
    console.log(`Resolved Query: "${resolution.resolvedQuery}"`);
    console.log(`Resolution Hit: ${resolution.hit}`);
    console.log(`Resolved Entity: ${resolution.resolvedEntities.join(', ') || 'none'}`);

    // Verification asserts
    const storeLogged = logs.some(l => l.includes('MEMORY_STORE'));
    const detectedLogged = logs.some(l => l.includes('FOLLOWUP_DETECTED'));
    const resolvedLogged = logs.some(l => l.includes('ENTITY_RESOLVED'));
    const memoryUsedLogged = logs.some(l => l.includes('MEMORY_CONTEXT_USED'));

    console.log("\n--- Log Verification ---");
    console.log(`MEMORY_STORE Logged: ${storeLogged}`);
    console.log(`FOLLOWUP_DETECTED Logged: ${detectedLogged}`);
    console.log(`ENTITY_RESOLVED Logged: ${resolvedLogged}`);
    console.log(`MEMORY_CONTEXT_USED Logged: ${memoryUsedLogged}`);

    let allPassed = true;

    if (resolution.resolvedQuery.toLowerCase().includes('sahai') && resolution.hit) {
      console.log("\n✅ SUCCESS: Pronoun 'it' correctly resolved to 'SAHAI'!");
    } else {
      console.log("\n❌ FAILURE: Pronoun 'it' was NOT resolved to 'SAHAI'!");
      allPassed = false;
    }

    if (storeLogged && detectedLogged && resolvedLogged && memoryUsedLogged) {
      console.log("✅ SUCCESS: Required logs (MEMORY_STORE, FOLLOWUP_DETECTED, ENTITY_RESOLVED, MEMORY_CONTEXT_USED) were printed!");
    } else {
      console.log("❌ FAILURE: Missing required logs!");
      allPassed = false;
    }

    if (allPassed) {
      console.log("\n🎉 ALL CONVERSATIONAL MEMORY TESTS PASSED SUCCESSFULLY! 🎉\n");
    } else {
      console.log("\n🔴 SOME CONVERSATIONAL MEMORY TESTS FAILED! 🔴\n");
    }

  } catch (error) {
    console.log = originalLog;
    console.error("❌ ERROR running memory test:", error);
  }
}

runMemoryTest().catch(console.error);
