import { SmartRouter } from '@/lib/oracle/smartRouter';

async function testRecruiterQuery(query: string, expectedLog: 'RECRUITER_DIRECT_RESPONSE' | 'RECRUITER_MODEL_ROUTE') {
  console.log(`\n========================================`);
  console.log(`TEST QUERY: "${query}"`);
  console.log(`========================================`);

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    const result = await SmartRouter.route(query);
    
    console.log = originalLog;

    console.log(`\nDirect Response Generated: ${result.directAnswerAvailable}`);
    if (result.directAnswerAvailable) {
      console.log(`Response Preview:\n${result.directResponse?.split('\n').slice(0, 5).join('\n')}\n...`);
    }

    const logMatched = logs.some(l => l.includes(expectedLog));
    console.log(`Expected Log [${expectedLog}] Found: ${logMatched}`);

    if (logMatched && (expectedLog === 'RECRUITER_DIRECT_RESPONSE' ? result.directAnswerAvailable : !result.directAnswerAvailable)) {
      console.log(`✅ SUCCESS: Recruiter routing matched expectations!`);
      return true;
    } else {
      console.log(`❌ FAILURE: Routing mismatch.`);
      return false;
    }
  } catch (error) {
    console.log = originalLog;
    console.error("❌ ERROR running recruiter test:", error);
    return false;
  }
}

async function runAllRecruiterTests() {
  console.log("Starting Recruiter Insight Routing Verification Tests...\n");

  let allPassed = true;

  // Test 1: backend engineering (Expected: RECRUITER_DIRECT_RESPONSE)
  const t1 = await testRecruiterQuery("Which project best demonstrates backend engineering?", "RECRUITER_DIRECT_RESPONSE");
  if (!t1) allPassed = false;

  // Test 2: AI engineering (Expected: RECRUITER_DIRECT_RESPONSE)
  const t2 = await testRecruiterQuery("Which project best demonstrates AI engineering?", "RECRUITER_DIRECT_RESPONSE");
  if (!t2) allPassed = false;

  // Test 3: distributed systems (Expected: RECRUITER_DIRECT_RESPONSE)
  const t3 = await testRecruiterQuery("Which project demonstrates distributed systems?", "RECRUITER_DIRECT_RESPONSE");
  if (!t3) allPassed = false;

  // Test 4: strongest technical skills (Expected: RECRUITER_DIRECT_RESPONSE)
  const t4 = await testRecruiterQuery("What are Suraj's strongest technical skills?", "RECRUITER_DIRECT_RESPONSE");
  if (!t4) allPassed = false;

  // Test 5: hired backend role (Expected: RECRUITER_DIRECT_RESPONSE)
  const t5 = await testRecruiterQuery("Why should Suraj be hired for a backend role?", "RECRUITER_DIRECT_RESPONSE");
  if (!t5) allPassed = false;

  // Test 6: recruiter summary pitch (Expected: RECRUITER_MODEL_ROUTE)
  const t6 = await testRecruiterQuery("Write a recruiter summary for Suraj's experience.", "RECRUITER_MODEL_ROUTE");
  if (!t6) allPassed = false;

  console.log("\n========================================");
  if (allPassed) {
    console.log("🎉 ALL RECRUITER ROUTING TESTS PASSED! 🎉");
  } else {
    console.log("🔴 SOME RECRUITER ROUTING TESTS FAILED! 🔴");
  }
  console.log("========================================\n");
}

runAllRecruiterTests().catch(console.error);
