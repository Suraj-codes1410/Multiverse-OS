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
  // 4. Test what command
  const whatCmd = registry.get('what');
  if (!whatCmd) {
    console.error("FAIL: what command not registered in the registry!");
    return;
  }

  const whatQueries = [
    ['uses', 'fastapi'],
    ['uses', 'kafka'],
    ['uses', 'grpc'],
    ['uses', 'react']
  ];

  for (const args of whatQueries) {
    console.log(`\n> what ${args.join(' ')}`);
    try {
      const result = await whatCmd.execute(args, { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing what ${args.join(' ')}:`, e);
    }
  }
  // 5. Test repos filter queries
  const reposCmd = registry.get('repos');
  if (!reposCmd) {
    console.error("FAIL: repos command not registered in the registry!");
    return;
  }

  const reposQueries = [
    ['ai'],
    ['backend'],
    ['distributed-systems'],
    ['fastapi'],
    ['kafka']
  ];

  for (const args of reposQueries) {
    console.log(`\n> repos ${args.join(' ')}`);
    try {
      const result = await reposCmd.execute(args, { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing repos ${args.join(' ')}:`, e);
    }
  }
  // 6. Test timeline, achievements, hackathons, milestones
  const timelineCmd = registry.get('timeline');
  const achievementsCmd = registry.get('achievements');
  const hackathonsCmd = registry.get('hackathons');
  const milestonesCmd = registry.get('milestones');

  if (!timelineCmd || !achievementsCmd || !hackathonsCmd || !milestonesCmd) {
    console.error("FAIL: One or more career path commands not registered!");
    return;
  }

  const careerCommands = [
    { cmd: timelineCmd, name: 'timeline' },
    { cmd: achievementsCmd, name: 'achievements' },
    { cmd: hackathonsCmd, name: 'hackathons' },
    { cmd: milestonesCmd, name: 'milestones' }
  ];

  for (const item of careerCommands) {
    console.log(`\n> ${item.name}`);
    try {
      const result = await item.cmd.execute([], { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing ${item.name}:`, e);
    }
  }
  // 7. Test recruiter commands
  const strengthsCmd = registry.get('strengths');
  const backendExpCmd = registry.get('backend-experience');
  const aiExpCmd = registry.get('ai-experience');
  const dsCmd = registry.get('distributed-systems');
  const bestProjCmd = registry.get('best-projects');

  if (!strengthsCmd || !backendExpCmd || !aiExpCmd || !dsCmd || !bestProjCmd) {
    console.error("FAIL: One or more recruiter commands not registered!");
    return;
  }

  const recruiterCommands = [
    { cmd: strengthsCmd, name: 'strengths' },
    { cmd: backendExpCmd, name: 'backend-experience' },
    { cmd: aiExpCmd, name: 'ai-experience' },
    { cmd: dsCmd, name: 'distributed-systems' },
    { cmd: bestProjCmd, name: 'best-projects' }
  ];

  for (const item of recruiterCommands) {
    console.log(`\n> ${item.name}`);
    try {
      const result = await item.cmd.execute([], { clearTerminal: () => {} });
      console.log(`Success: ${result.success}`);
      if (Array.isArray(result.output)) {
        result.output.forEach(line => console.log(line));
      } else {
        console.log(result.output);
      }
    } catch (e) {
      console.error(`Error executing ${item.name}:`, e);
    }
  }
}

runCliTest();
