// src/api/mockServer.ts
import {
  Asset,
  Balance,
  LoanOffer,
  Order,
  Quote,
  RfqQuote,
  StakingPosition,
  Transfer,
  Vault,
} from "../domain/models";
import { riskScoreForOrder } from "../domain/risk";

/** Simple ID helper (no crypto dependency) */
function rid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * =========================
 * AUTH (demo-only)
 * =========================
 */
type AuthUser = {
  id: string;
  name: string;
  email: string;
  password: string; // demo-only
};

const users: AuthUser[] = [
  { id: "usr_demo", name: "Demo User", email: "demo@crypto.local", password: "password123" },
];

function makeToken(email: string) {
  return `demo.token.${email.replace(/[^a-z0-9]/gi, "_")}`;
}

/**
 * =========================
 * Trading/Custody demo data
 * =========================
 */
const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "USDC", name: "USD Coin" },
];

let vaults: Vault[] = [
  { id: "vlt_1", name: "Institutional Cold Vault", type: "COLD", approvalsRequired: 2 },
  { id: "vlt_2", name: "Operations Hot Vault", type: "HOT", approvalsRequired: 1 },
];

let balances: Balance[] = [
  { accountId: "vlt_1", symbol: "BTC", amount: 12.4 },
  { accountId: "vlt_1", symbol: "USDC", amount: 2_500_000 },
  { accountId: "vlt_2", symbol: "ETH", amount: 800 },
  { accountId: "vlt_2", symbol: "USDC", amount: 350_000 },
];

let orders: Order[] = [];

let staking: StakingPosition[] = [
  { symbol: "ETH", stakedAmount: 120, rewardsYtd: 3.2, apr: 3.6 },
];

let lendingOffers: LoanOffer[] = [
  { id: "loan_1", symbol: "USDC", apr: 8.5, termDays: 30, minAmount: 50_000 },
  { id: "loan_2", symbol: "USDC", apr: 7.8, termDays: 90, minAmount: 100_000 },
];

/** Transfers storage */
let transfers: Transfer[] = [];

export const mockServer = {
  /** =========================
   * Auth
   * ========================= */
  async register(input: { name: string; email: string; password: string }): Promise<{ token: string }> {
    await sleep(350);
    const email = input.email.trim().toLowerCase();

    if (users.some((u) => u.email === email)) throw new Error("Email already registered.");
    if (input.password.length < 6) throw new Error("Password must be at least 6 characters.");

    users.push({
      id: rid("usr"),
      name: input.name.trim(),
      email,
      password: input.password,
    });

    return { token: makeToken(email) };
  },

  async login(input: { email: string; password: string }): Promise<{ token: string }> {
    await sleep(300);
    const email = input.email.trim().toLowerCase();
    const user = users.find((u) => u.email === email);

    if (!user || user.password !== input.password) throw new Error("Invalid email or password.");
    return { token: makeToken(email) };
  },

  /** =========================
   * Custody / Trading
   * ========================= */
  async listAssets(): Promise<Asset[]> {
    await sleep(250);
    return assets;
  },

  async listVaults(): Promise<Vault[]> {
    await sleep(250);
    return vaults;
  },

  async listBalances(): Promise<Balance[]> {
    await sleep(250);
    return balances;
  },

  async getQuote(symbol: string): Promise<Quote> {
    await sleep(250);
    const mid = symbol === "BTC" ? 98_000 : symbol === "ETH" ? 5_200 : 1;
    const spread = symbol === "USDC" ? 0.0001 : 0.0025;

    return {
      symbol,
      bid: mid * (1 - spread),
      ask: mid * (1 + spread),
      ts: Date.now(),
    };
  },

  async placeOrder(input: {
    symbol: string;
    side: "BUY" | "SELL";
    qty: number;
    accountId: string;
    idempotencyKey: string;
  }): Promise<Order> {
    await sleep(350);

    const existing = orders.find((o) => o.idempotencyKey === input.idempotencyKey);
    if (existing) return existing;

    const quote = await this.getQuote(input.symbol);
    const px = input.side === "BUY" ? quote.ask : quote.bid;

    const risk = riskScoreForOrder({ symbol: input.symbol, qty: input.qty, price: px });

    const order: Order = {
      id: rid("ord"),
      idempotencyKey: input.idempotencyKey,
      symbol: input.symbol,
      side: input.side,
      qty: input.qty,
      price: px,
      status: risk > 70 ? "REVIEW" : "FILLED",
      createdAt: Date.now(),
      riskScore: risk,
      accountId: input.accountId,
    };

    orders = [order, ...orders];
    return order;
  },

  async listOrders(): Promise<Order[]> {
    await sleep(200);
    return orders;
  },

  async listStaking(): Promise<StakingPosition[]> {
    await sleep(200);
    return staking;
  },

  async stake(input: { symbol: string; amount: number }): Promise<StakingPosition> {
    await sleep(300);

    const found = staking.find((s) => s.symbol === input.symbol);
    if (!found) {
      const pos: StakingPosition = { symbol: input.symbol, stakedAmount: input.amount, rewardsYtd: 0, apr: 3.2 };
      staking = [pos, ...staking];
      return pos;
    }

    found.stakedAmount += input.amount;
    return { ...found };
  },

  async listLendingOffers(): Promise<LoanOffer[]> {
    await sleep(200);
    return lendingOffers;
  },

  async createLoanIntent(input: { offerId: string; amount: number }): Promise<{ id: string; status: "PENDING" | "APPROVED" }> {
    await sleep(250);
    return { id: rid("loan_intent"), status: "PENDING" };
  },

  async rfq(input: { base: string; quote: string; notional: number }): Promise<RfqQuote[]> {
    await sleep(450);
    const venues = ["VenueA", "VenueB", "VenueC"];
    const mid = input.base === "BTC" ? 98_000 : input.base === "ETH" ? 5_200 : 1;

    return venues.map((v, i) => ({
      id: rid("rfq"),
      venue: v,
      price: mid * (1 + (i - 1) * 0.0008),
      expiresAt: Date.now() + 12_000,
    }));
  },

  /** =========================
   * Transfers
   * ========================= */
  async listTransfers(): Promise<Transfer[]> {
    await sleep(200);
    return transfers;
  },

  async createTransferDraft(input: {
    fromVault: string;
    toAddress: string;
    asset: string;
    amount: number;
    network: string;
    priority: "Standard" | "Fast";
    memo?: string;
  }): Promise<Transfer> {
    await sleep(250);

    const approvalsRequired = input.fromVault === "vlt_1" ? 2 : 1;

    const feeLabel =
      input.network.toUpperCase() === "BTC"
        ? input.priority === "Fast"
          ? "~0.00025 BTC"
          : "~0.00015 BTC"
        : input.priority === "Fast"
          ? "~0.003 ETH"
          : "~0.002 ETH";

    const etaLabel = input.priority === "Fast" ? "≈ 5–10 min" : "≈ 15–30 min";

    const t: Transfer = {
      id: rid("tr"),
      createdAt: Date.now(),
      fromVault: input.fromVault,
      toAddress: input.toAddress,
      asset: input.asset,
      amount: input.amount,
      network: input.network,
      priority: input.priority,
      memo: input.memo,
      feeLabel,
      etaLabel,
      approvalsRequired,
      approvals: 0,
      status: "DRAFT",
    };

    transfers = [t, ...transfers];
    return t;
  },

  async submitTransferForApproval(input: { id: string }): Promise<Transfer> {
    await sleep(220);

    const t = transfers.find((x) => x.id === input.id);
    if (!t) throw new Error("Transfer not found.");
    if (t.status !== "DRAFT") return { ...t };

    const allowlisted = t.toAddress.toLowerCase().startsWith("bc1q");
    if (!allowlisted) {
      t.status = "REJECTED";
      return { ...t };
    }

    t.status = "PENDING_APPROVAL";
    return { ...t };
  },

  async approveTransfer(input: { id: string }): Promise<Transfer> {
    await sleep(240);

    const t = transfers.find((x) => x.id === input.id);
    if (!t) throw new Error("Transfer not found.");

    if (t.status === "REJECTED") return { ...t };
    if (t.status === "DRAFT") t.status = "PENDING_APPROVAL";

    if (t.status === "PENDING_APPROVAL") {
      t.approvals += 1;
      if (t.approvals >= t.approvalsRequired) {
        t.status = "APPROVED";

        const bal = balances.find((b) => b.accountId === t.fromVault && b.symbol === t.asset);
        if (bal) bal.amount = Math.max(0, bal.amount - t.amount);
      }
    }

    return { ...t };
  },

  async rejectTransfer(input: { id: string }): Promise<Transfer> {
    await sleep(200);

    const t = transfers.find((x) => x.id === input.id);
    if (!t) throw new Error("Transfer not found.");

    t.status = "REJECTED";
    return { ...t };
  },
};