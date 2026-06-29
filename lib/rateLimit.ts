import { RateLimitBucket } from './types'

const buckets = new Map<string, RateLimitBucket>()

export function checkRateLimit(ip: string, maxTokens: number, windowMs: number): boolean {
  const now = Date.now()
  let bucket = buckets.get(ip)

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now }
  }

  const elapsed = now - bucket.lastRefill
  bucket.tokens = Math.min(maxTokens, bucket.tokens + (elapsed / windowMs) * maxTokens)
  bucket.lastRefill = now

  if (bucket.tokens < 1) {
    buckets.set(ip, bucket)
    return false
  }

  bucket.tokens -= 1
  buckets.set(ip, bucket)
  return true
}

export function getRateLimitHeaders(ip: string, maxTokens: number): Record<string, string> {
  const bucket = buckets.get(ip)
  return {
    'X-RateLimit-Limit': maxTokens.toString(),
    'X-RateLimit-Remaining': Math.floor(bucket?.tokens ?? 0).toString(),
  }
}
