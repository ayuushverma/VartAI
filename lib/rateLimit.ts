type RateLimitOptions = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  configured: boolean;
  retryAfterSeconds: number;
};

const developmentCounters = new Map<string, { count: number; expiresAt: number }>();

export async function checkRateLimit({ key, limit, windowSeconds }: RateLimitOptions): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      return { allowed: false, configured: false, retryAfterSeconds: windowSeconds };
    }
    return checkDevelopmentRateLimit(key, limit, windowSeconds);
  }

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, windowSeconds]]),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Rate-limit provider rejected the request.");
    const result = (await response.json()) as [{ result?: number }];
    const count = Number(result[0]?.result);
    if (!Number.isFinite(count)) throw new Error("Rate-limit provider returned an invalid result.");
    return { allowed: count <= limit, configured: true, retryAfterSeconds: windowSeconds };
  } catch (error) {
    console.error("Rate-limit provider failed:", error instanceof Error ? error.message : "unknown error");
    return { allowed: false, configured: true, retryAfterSeconds: windowSeconds };
  }
}

function checkDevelopmentRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const current = developmentCounters.get(key);
  if (!current || current.expiresAt <= now) {
    developmentCounters.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return { allowed: true, configured: false, retryAfterSeconds: windowSeconds };
  }
  current.count += 1;
  return { allowed: current.count <= limit, configured: false, retryAfterSeconds: Math.ceil((current.expiresAt - now) / 1000) };
}

export function rateLimitKey(scope: string, identity: string) {
  return `vartai:ratelimit:${scope}:${identity}`;
}

export function getForwardedIp(value: string | null) {
  return value?.split(",")[0]?.trim() || "unknown";
}