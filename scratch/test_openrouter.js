const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value.trim();
    }
  });
}

const apiKey = process.env.OPENROUTER_API_KEY;

async function testModel(modelName) {
  console.log(`\n--- Testing model: ${modelName} ---`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'user', content: 'Say hello!' }
        ]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Response text:`, data.choices?.[0]?.message?.content || JSON.stringify(data));
  } catch (error) {
    console.error(`Error with model ${modelName}:`, error.message);
  }
}

async function run() {
  await testModel('openrouter/free');
}

run();
