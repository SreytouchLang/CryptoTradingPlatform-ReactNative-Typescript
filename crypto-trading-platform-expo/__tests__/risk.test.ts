import { riskScoreForOrder } from "../src/domain/risk";

test("risk increases with notional", () => {
  const low = riskScoreForOrder({ symbol: "BTC", qty: 0.1, price: 50_000 });   // 5,000
  const high = riskScoreForOrder({ symbol: "BTC", qty: 10, price: 100_000 });  // 1,000,000
  expect(high).toBeGreaterThan(low);
});