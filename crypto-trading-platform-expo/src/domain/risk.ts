// src/domain/risk.ts
export function riskScoreForOrder(input: { symbol: string; qty: number; price: number }): number {
  const notional = Math.max(0, input.qty) * Math.max(0, input.price);

  // Simple demo scoring:
  // - base score depends on asset
  // - increases with notional
  const assetBase =
    input.symbol === "BTC" ? 10 :
    input.symbol === "ETH" ? 12 :
    input.symbol === "USDC" ? 2 : 8;

  let score = assetBase;

  if (notional >= 10_000) score += 15;
  if (notional >= 50_000) score += 15;
  if (notional >= 200_000) score += 20;
  if (notional >= 1_000_000) score += 25;

  // clamp to 0..100
  return Math.max(0, Math.min(100, score));
}