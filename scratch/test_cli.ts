import { registry } from '../lib/commands/registry';
import '../lib/commands/index'; // triggers registration

async function runCliTest() {
  console.log("\n=== Testing Knowledge Query CLI Command ===");
  const findCmd = registry.get('find');
  if (!findCmd) {
    console.error("FAIL: find command not registered in the registry!");
    return;
  }

  const queries = [['fastapi'], ['kafka'], ['react']];

  for (const args of queries) {
    console.log(`\n> find ${args.join(' ')}`);
    try {
      const result = await findCmd.execute(args, { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing find ${args.join(' ')}:`, e);
    }
  }
}

runCliTest();
