// src/domain/policy.ts
import type { Vault } from "./models";

export function isColdVault(v: Vault): boolean {
  return v.type === "COLD";
}

export function approvalsRequiredForVault(v: Vault): number {
  return v.approvalsRequired;
}

/**
 * Demo allowlist rule:
 * - allow EVM-style addresses: 0x....
 * - allow BTC bech32 demo: bc1q....
 */
export function isAllowlistedAddress(address: string): boolean {
  const a = (address || "").trim().toLowerCase();
  if (a.startsWith("0x") && a.length >= 4) return true;
  if (a.startsWith("bc1q") && a.length >= 8) return true;
  return false;
}