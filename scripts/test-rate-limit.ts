import assert from "node:assert/strict";
import { checkRateLimit, getForwardedIp, rateLimitKey } from "@/lib/rateLimit";

assert.equal(rateLimitKey("chat", "user-a"), "vartai:ratelimit:chat:user-a");
assert.equal(getForwardedIp("198.51.100.7, 203.0.113.4"), "198.51.100.7");

async function main() {
  const key = `test-${Date.now()}`;
  const first = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
  const second = await checkRateLimit({ key, limit: 2, windowSeconds: 60 });
  assert.equal(first.allowed, true);
  assert.equal(first.configured, false);
  assert.equal(second.allowed, true);
  console.log("Rate-limit helper test passed.");
}

void main();
