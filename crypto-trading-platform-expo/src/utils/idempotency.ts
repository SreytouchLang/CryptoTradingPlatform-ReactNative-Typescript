// src/utils/idempotency.ts

/**
 * Hermes-safe idempotency key generator (no nanoid / no crypto dependency).
 * Good enough for demo apps and prevents duplicate writes in the mock server.
 */
export function newIdempotencyKey(prefix: string) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}_${rand}`;
}
