// src/api/endpoints.ts
import { mockServer } from "./mockServer";

export const api = {
  // ===== Auth =====
  register: (p: { name: string; email: string; password: string }) => mockServer.register(p),
  login: (p: { email: string; password: string }) => mockServer.login(p),

  // ===== Trading/Custody =====
  assets: () => mockServer.listAssets(),
  vaults: () => mockServer.listVaults(),
  balances: () => mockServer.listBalances(),

  quote: (symbol: string) => mockServer.getQuote(symbol),
  placeOrder: (p: {
    symbol: string;
    side: "BUY" | "SELL";
    qty: number;
    accountId: string;
    idempotencyKey: string;
  }) => mockServer.placeOrder(p),
  orders: () => mockServer.listOrders(),

  staking: () => mockServer.listStaking(),
  stake: (p: { symbol: string; amount: number }) => mockServer.stake(p),

  lendingOffers: () => mockServer.listLendingOffers(),
  createLoanIntent: (p: { offerId: string; amount: number }) => mockServer.createLoanIntent(p),

  rfq: (p: { base: string; quote: string; notional: number }) => mockServer.rfq(p),

  // ===== Transfers (for custodyHooks.ts) =====
  transfers: () => mockServer.listTransfers(),
  createTransferDraft: (p: {
    fromVault: string;
    toAddress: string;
    asset: string;
    amount: number;
    network: string;
    priority: "Standard" | "Fast";
    memo?: string;
  }) => mockServer.createTransferDraft(p),
  submitTransferForApproval: (p: { id: string }) => mockServer.submitTransferForApproval(p),
  approveTransfer: (p: { id: string }) => mockServer.approveTransfer(p),
  rejectTransfer: (p: { id: string }) => mockServer.rejectTransfer(p),
};