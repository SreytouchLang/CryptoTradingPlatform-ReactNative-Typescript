// src/domain/models.ts

export type Asset = { symbol: string; name: string };

export type Vault = {
  id: string;
  name: string;
  type: "COLD" | "HOT";
  approvalsRequired: number;
};

export type Balance = { accountId: string; symbol: string; amount: number };

export type Quote = { symbol: string; bid: number; ask: number; ts: number };

export type Order = {
  id: string;
  idempotencyKey: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  status: "FILLED" | "REVIEW" | "REJECTED";
  createdAt: number;
  riskScore: number;
  accountId: string;
};

export type StakingPosition = {
  symbol: string;
  stakedAmount: number;
  rewardsYtd: number;
  apr: number;
};

export type LoanOffer = {
  id: string;
  symbol: string;
  apr: number;
  termDays: number;
  minAmount: number;
};

export type RfqQuote = {
  id: string;
  venue: string;
  price: number;
  expiresAt: number;
};

/** =========================
 * Transfers (for custodyHooks)
 * ========================= */
export type TransferStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export type Transfer = {
  id: string;
  createdAt: number;

  fromVault: string;
  toAddress: string;
  asset: string;
  amount: number;

  network: string;
  priority: "Standard" | "Fast";
  memo?: string;

  feeLabel: string;
  etaLabel: string;

  approvalsRequired: number;
  approvals: number;

  status: TransferStatus;
};