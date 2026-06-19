import { PortfolioCopilotEngine } from '@/lib/oracle/copilotEngine';

async function testCopilotQuery(query: string, expectedLog: 'CAREER_DIRECT_RESPONSE' | 'CAREER_MODEL_ROUTE') {
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
    const result = await PortfolioCopilotEngine.evaluate(query);
    
    console.log = originalLog;

    console.log(`\nDirect Answer Available: ${result.directAnswerAvailable}`);
    console.log(`Career Category: ${result.category}`);
    if (result.directAnswerAvailable && result.directResponse) {
      console.log(`Response Preview:\n${result.directResponse.split('\n').slice(0, 5).join('\n')}\n...`);
    }

    const logMatched = logs.some(l => l.includes(expectedLog));
    console.log(`Expected Log [${expectedLog}] Found: ${logMatched}`);

    // Verify sub-analyses logging categories when direct response is active
    if (expectedLog === 'CAREER_DIRECT_RESPONSE') {
      const modeLogged = logs.some(l => l.includes('CAREER_MODE'));
      const fitLogged = logs.some(l => l.includes('JOB_FIT_ANALYSIS'));
      const gapLogged = logs.some(l => l.includes('SKILL_GAP_ANALYSIS'));
      const recLogged = logs.some(l => l.includes('PROJECT_RECOMMENDATION'));
      const copilotLogged = logs.some(l => l.includes('PORTFOLIO_COPILOT'));

      console.log(`Additional Checks - CAREER_MODE: ${modeLogged} | JOB_FIT_ANALYSIS: ${fitLogged} | SKILL_GAP_ANALYSIS: ${gapLogged} | PROJECT_RECOMMENDATION: ${recLogged} | PORTFOLIO_COPILOT: ${copilotLogged}`);

      if (logMatched && result.directAnswerAvailable && modeLogged && fitLogged && gapLogged && recLogged && copilotLogged) {
        console.log(`✅ SUCCESS: Career copilot routing & analysis checks matched!`);
        return true;
      }
    } else {
      if (logMatched && !result.directAnswerAvailable) {
        console.log(`✅ SUCCESS: Fallback to OpenRouter mentoring narrative matched!`);
        return true;
      }
    }

    console.log(`❌ FAILURE: Routing/checks mismatch.`);
    return false;
  } catch (error) {
    console.log = originalLog;
    console.error("❌ ERROR running copilot test:", error);
    return false;
  }
}

async function runAllCopilotTests() {
  console.log("Starting Portfolio Copilot & Career Advisor Verification Tests...\n");

  let allPassed = true;

  // Test 1: Resume Optimizer
  const t1 = await testCopilotQuery("Which project should I put first on my resume?", "CAREER_DIRECT_RESPONSE");
  if (!t1) allPassed = false;

  // Test 2: Skill Gaps
  const t2 = await testCopilotQuery("What skills am I missing for backend engineering roles?", "CAREER_DIRECT_RESPONSE");
  if (!t2) allPassed = false;

  // Test 3: Internship readiness
  const t3 = await testCopilotQuery("Am I ready for a Java backend internship?", "CAREER_DIRECT_RESPONSE");
  if (!t3) allPassed = false;

  // Test 4: Project recommendations
  const t4 = await testCopilotQuery("What should I build next?", "CAREER_DIRECT_RESPONSE");
  if (!t4) allPassed = false;

  // Test 5: Interview showcase
  const t5 = await testCopilotQuery("Which project should I showcase in interviews?", "CAREER_DIRECT_RESPONSE");
  if (!t5) allPassed = false;

  // Test 6: Job Matching (Job Description)
  const t6 = await testCopilotQuery("Which project best matches this job description for a Java Spring Boot engineer?", "CAREER_DIRECT_RESPONSE");
  if (!t6) allPassed = false;

  // Test 7: Interview showcase (Distributed Systems focus)
  const t7 = await testCopilotQuery("Which project should I showcase for distributed systems interviews?", "CAREER_DIRECT_RESPONSE");
  if (!t7) allPassed = false;

  // Test 8: Project recommendations (Distributed Systems focus)
  const t8 = await testCopilotQuery("What project would help me get into distributed systems?", "CAREER_DIRECT_RESPONSE");
  if (!t8) allPassed = false;

  // Test 9: Long-form mentoring career advice fallback
  const t9 = await testCopilotQuery("Provide career path mentoring for my long-form development goals.", "CAREER_MODEL_ROUTE");
  if (!t9) allPassed = false;

  console.log("\n========================================");
  if (allPassed) {
    console.log("🎉 ALL PORTFOLIO COPILOT & CAREER ADVISOR TESTS PASSED! 🎉");
  } else {
    console.log("🔴 SOME TESTS ENCOUNTERED FAILURES! 🔴");
  }
  console.log("========================================\n");
}

runAllCopilotTests().catch(console.error);
