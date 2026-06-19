import { POST } from '@/app/api/oracle/route';

if (!process.env.OPENROUTER_API_KEY) {
  process.env.OPENROUTER_API_KEY = 'mock-api-key-for-validation';
}

async function debugQuery(q: string) {
  console.log(`\n---------------------------------`);
  console.log(`DEBUGGING QUERY: "${q}"`);
  console.log(`---------------------------------`);

  const mockReq = new Request('http://localhost/api/oracle', {
    method: 'POST',
    body: JSON.stringify({ query: q, sessionId: 'debug-session' })
  });

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    logs.push(args.join(' '));
    originalLog(...args);
  };

  try {
    const res = await POST(mockReq);
    const data = await res.json();
    console.log = originalLog;

    console.log(`HTTP Status: ${res.status}`);
    console.log(`Response Text:`);
    console.log(data.text);
    console.log(`\nDebug Headers:`, data.debug);
    console.log(`Captured Console Logs:`);
    logs.forEach(l => console.log(`  > ${l}`));
  } catch (err: any) {
    console.log = originalLog;
    console.error(`Error:`, err);
  }
}

async function run() {
  await debugQuery("Tell me about SAHAI.");
  await debugQuery("List Suraj's repositories.");
  await debugQuery("Which is Suraj's newest repository?");
  await debugQuery("Which project demonstrates backend engineering?");
  await debugQuery("Why should Suraj be hired?");
  await debugQuery("What technologies are used in oracle-sync-test?");
}

run();
