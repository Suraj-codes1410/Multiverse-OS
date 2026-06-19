import { queryCacheService, CacheManager } from '../lib/oracle/queryCache';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
}

async function runCacheTests() {
  console.log("====================================================");
  console.log("STARTING ORACLE QUERY CACHE VALIDATION");
  console.log("====================================================");

  const manager = CacheManager.getInstance();
  manager.clear();

  // 1. Normalization Tests
  console.log("\n--- Testing Key Normalization ---");
  const key1 = queryCacheService.normalize("What is Java?");
  const key2 = queryCacheService.normalize("What is java");
  const key3 = queryCacheService.normalize("What is JAVA?");
  assert(key1 === "what is java", `key1 normalization expected 'what is java', got '${key1}'`);
  assert(key1 === key2, "key1 and key2 should match");
  assert(key1 === key3, "key1 and key3 should match");

  const spacedKey1 = queryCacheService.normalize("  Compare   SAHAI   and   ORBITAIR. ");
  const spacedKey2 = queryCacheService.normalize("compare sahai and orbitair");
  assert(spacedKey1 === spacedKey2, "extra spacing and punctuation should be cleaned and matched");

  // 2. TTL Configuration Tests
  console.log("\n--- Testing TTL Tiers ---");
  
  // General Knowledge -> 24 Hours
  const ttlGK = queryCacheService.getTTL("What is Java?");
  assert(ttlGK === 24 * 60 * 60 * 1000, `GK TTL should be 24h, got ${ttlGK / 1000}s`);

  // Portfolio -> 1 Hour
  const ttlPort = queryCacheService.getTTL("Which project demonstrates backend engineering?");
  assert(ttlPort === 60 * 60 * 1000, `Portfolio TTL should be 1h, got ${ttlPort / 1000}s`);

  // Repository -> 30 Minutes
  const ttlRepo = queryCacheService.getTTL("Summarize oracle-sync-test");
  assert(ttlRepo === 30 * 60 * 1000, `Repo TTL should be 30m, got ${ttlRepo / 1000}s`);

  // GitHub Metadata -> 5 Minutes
  const ttlGit = queryCacheService.getTTL("What is the git sync timestamp?");
  assert(ttlGit === 5 * 60 * 1000, `Git TTL should be 5m, got ${ttlGit / 1000}s`);

  // 3. Cache Miss / Store / Hit Lifecycle Tests
  console.log("\n--- Testing Cache Miss / Store / Hit Lifecycle ---");
  
  const query = "What is Java?";
  const mockResponse = "Java is a programming language.";
  const mockSource = "google/gemini-2.5-flash";

  // Cache Lookup 1 (Should be Miss)
  const result1 = queryCacheService.get(query);
  assert(result1 === null, "First lookup must return null (CACHE_MISS)");

  // Store in cache
  queryCacheService.set(query, mockResponse, mockSource);

  // Cache Lookup 2 (Should be Hit)
  const result2 = queryCacheService.get(query);
  assert(result2 === mockResponse, "Second lookup must return cached response (CACHE_HIT)");

  // Normalization match verification
  const result3 = queryCacheService.get("what is JAVA");
  assert(result3 === mockResponse, "Normalized query variant must hit cache");

  // 4. Cache Expiration Verification
  console.log("\n--- Testing Cache Expiration ---");
  
  // Store with short TTL (force eviction)
  const shortQuery = "Short query";
  const shortKey = queryCacheService.normalize(shortQuery);
  manager.set(shortKey, {
    query: shortQuery,
    response: "Short lived response",
    createdAt: Date.now(),
    expiresAt: Date.now() - 1000, // already expired
    source: "mock"
  });

  const expiredResult = queryCacheService.get(shortQuery);
  assert(expiredResult === null, "Expired query must return null and trigger CACHE_EXPIRE log");

  console.log("\n====================================================");
  console.log("CACHE VALIDATION RUN COMPLETED SUCCESSFULLY");
  console.log("====================================================");
}

runCacheTests();
