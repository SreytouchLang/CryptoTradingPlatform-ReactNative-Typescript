import { approvalsRequiredForVault, isColdVault, isAllowlistedAddress } from "../src/domain/policy";

test("cold vault is detected", () => {
  expect(isColdVault({ id: "1", name: "cold", type: "COLD", approvalsRequired: 2 })).toBe(true);
});

test("approvals required is returned", () => {
  expect(approvalsRequiredForVault({ id: "1", name: "x", type: "HOT", approvalsRequired: 1 })).toBe(1);
});

test("allowlist demo rule", () => {
  expect(isAllowlistedAddress("0xabc")).toBe(true);
  expect(isAllowlistedAddress("hello")).toBe(false);

  // also supports your BTC demo
  expect(isAllowlistedAddress("bc1q-demo-address")).toBe(true);
});