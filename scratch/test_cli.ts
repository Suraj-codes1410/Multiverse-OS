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
  // 2. Test related command
  const relatedCmd = registry.get('related');
  if (!relatedCmd) {
    console.error("FAIL: related command not registered in the registry!");
    return;
  }

  const relatedQueries = [['orbitair'], ['kafka'], ['fastapi']];

  for (const args of relatedQueries) {
    console.log(`\n> related ${args.join(' ')}`);
    try {
      const result = await relatedCmd.execute(args, { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing related ${args.join(' ')}:`, e);
    }
  }
  // 3. Test show command
  const showCmd = registry.get('show');
  if (!showCmd) {
    console.error("FAIL: show command not registered in the registry!");
    return;
  }

  const showQueries = [
    ['ai', 'projects'],
    ['backend', 'projects'],
    ['distributed-systems', 'projects'],
    ['frontend', 'projects'],
    ['fullstack', 'projects']
  ];

  for (const args of showQueries) {
    console.log(`\n> show ${args.join(' ')}`);
    try {
      const result = await showCmd.execute(args, { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing show ${args.join(' ')}:`, e);
    }
  }
}

runCliTest();
