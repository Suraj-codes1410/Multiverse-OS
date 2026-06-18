import { contextService } from '../lib/oracle/service';
import { OracleContextSelector } from '../lib/oracle/contextSelector';

async function main() {
  console.log("Loading Oracle context...");
  const fullContext = await contextService.getContext();
  
  // Test query 1
  const query1 = "Summarize Multiverse-OS";
  console.log(`\n========================================`);
  console.log(`Simulating query: "${query1}"`);
  const selected1 = await OracleContextSelector.select(query1, fullContext);
  const formatted1 = OracleContextSelector.compressAndFormat(selected1);
  
  // Let's see if the output contains the Multiverse-OS summary
  const hasMultiverseOSSummary = formatted1.includes("multiverse-os") || formatted1.includes("Multiverse-OS");
  console.log(`Context selected Multiverse-OS: ${hasMultiverseOSSummary}`);
  if (hasMultiverseOSSummary) {
    // Print the Multiverse-OS repository block in the context
    const lines = formatted1.split('\n');
    const startIdx = lines.findIndex(l => l.includes('**Multiverse-OS**'));
    if (startIdx !== -1) {
      console.log("Extracted Context Block:");
      console.log(lines.slice(startIdx, startIdx + 8).join('\n'));
    }
  }

  // Test query 2
  const query2 = "What technologies are used in Uber-architecture?";
  console.log(`\n========================================`);
  console.log(`Simulating query: "${query2}"`);
  const selected2 = await OracleContextSelector.select(query2, fullContext);
  const formatted2 = OracleContextSelector.compressAndFormat(selected2);
  
  const hasUberSummary = formatted2.includes("uber-architecture") || formatted2.includes("Uber-architecture");
  console.log(`Context selected Uber-architecture: ${hasUberSummary}`);
  if (hasUberSummary) {
    const lines = formatted2.split('\n');
    const startIdx = lines.findIndex(l => l.includes('**Uber-architecture**'));
    if (startIdx !== -1) {
      console.log("Extracted Context Block:");
      console.log(lines.slice(startIdx, startIdx + 8).join('\n'));
    }
  }
}

main().catch(err => {
  console.error(err);
});
