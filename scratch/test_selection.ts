import { contextService } from '../lib/oracle/service';
import { OracleContextSelector } from '../lib/oracle/contextSelector';

async function runSelectionTest() {
  console.log("\n=== Testing Oracle Context Selection & Compression ===");
  try {
    const fullContext = await contextService.getContext();
    const fullSizeChars = JSON.stringify(fullContext).length;
    const fullTokens = Math.round(fullSizeChars / 4);

    console.log(`Full Context Size BEFORE Optimization: ${fullSizeChars} characters (~${fullTokens} tokens)`);

    const queries = [
      "Tell me about ORBITAIR",
      "Tell me about SAHAI",
      "What backend technologies does Suraj know?"
    ];

    queries.forEach((query, idx) => {
      console.log(`\n---------------------------------------------------------`);
      console.log(`TEST CASE ${idx + 1}: "${query}"`);
      console.log(`---------------------------------------------------------`);

      const selected = OracleContextSelector.select(query, fullContext);
      const compressedText = OracleContextSelector.compressAndFormat(selected);
      const compressedSizeChars = compressedText.length;
      const compressedTokens = Math.round(compressedSizeChars / 4);
      const reductionPercent = Math.round(((fullSizeChars - compressedSizeChars) / fullSizeChars) * 100);

      console.log(`Selected Sections: ${selected.selectedSections.join(', ') || 'None'}`);
      console.log(`Selected Projects: ${selected.projects.map(p => p.title).join(', ') || 'None'}`);
      console.log(`Selected Skills: ${selected.skills.map(s => s.name).join(', ') || 'None'}`);
      console.log(`Selected Repositories: ${selected.repositories.map(r => r.name).join(', ') || 'None'}`);
      console.log(`Selected Achievements: ${selected.achievements.map(a => a.title).join(', ') || 'None'}`);
      console.log(`Selected Milestones: ${selected.timeline.reduce((sum, t) => sum + t.milestones.length, 0)} milestones`);
      
      console.log(`\nContext Size AFTER Optimization: ${compressedSizeChars} characters (~${compressedTokens} tokens)`);
      console.log(`Payload Size Reduction: ${reductionPercent}%`);
      
      console.log(`\nSample Output Context (First 500 chars):`);
      console.log(compressedText.slice(0, 500) + "...\n[TRUNCATED FOR LOGS]");
    });

  } catch (error) {
    console.error("Error in selection test:", error);
  }
}

runSelectionTest();
