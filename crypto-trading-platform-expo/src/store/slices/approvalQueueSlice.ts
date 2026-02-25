import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

export type TransferStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
export type ApprovalType = "TRANSFER" | "ORDER_REVIEW";

export type TransferRequest = {
  id: string;
  type: "TRANSFER";
  createdAt: number;

  fromVault: string;
  toAddress: string;
  asset: string;
  amount: number;

  network: string;
  priority: string;
  memo?: string;

  feeLabel: string;
  etaLabel: string;

  approvalsRequired: number;
  riskScore: number;

  status: TransferStatus;
  approvals: { by: string; at: number }[];
  rejection?: { by: string; at: number; reason?: string };
};

export type OrderReviewItem = {
  id: string;
  type: "ORDER_REVIEW";
  createdAt: number;
  summary: string;
  status: TransferStatus;
};

export type ApprovalItem = TransferRequest | OrderReviewItem;

type State = {
  items: ApprovalItem[];
};

const initialState: State = { items: [] };

const slice = createSlice({
  name: "approvalQueue",
  initialState,
  reducers: {
    // ✅ recommended for transfers
    enqueueTransfer: {
      reducer(state, action: PayloadAction<TransferRequest>) {
        state.items.unshift(action.payload);
      },
      prepare(input: Omit<TransferRequest, "id" | "createdAt" | "type" | "status" | "approvals">) {
        const id = `tr_${nanoid(8)}`;
        const createdAt = Date.now();

        return {
          payload: {
            ...input,
            id,
            createdAt,
            type: "TRANSFER",
            status: input.approvalsRequired > 1 ? "IN_REVIEW" : "PENDING",
            approvals: [],
          } as TransferRequest,
        };
      },
    },

    // optional generic enqueue
    enqueue(state, action: PayloadAction<ApprovalItem>) {
      state.items.unshift(action.payload);
    },

    approve(state, action: PayloadAction<{ id: string; approver: string }>) {
      const it = state.items.find((x) => x.id === action.payload.id);
      if (!it) return;
      if (it.status === "APPROVED" || it.status === "REJECTED") return;

      if (it.type === "TRANSFER") {
        if (it.approvals.some((a) => a.by === action.payload.approver)) return;

        it.approvals.push({ by: action.payload.approver, at: Date.now() });

        if (it.approvals.length >= it.approvalsRequired) {
          it.status = "APPROVED";
        } else {
          it.status = "IN_REVIEW";
        }
        return;
      }

      // ORDER_REVIEW
      it.status = "APPROVED";
    },

    reject(state, action: PayloadAction<{ id: string; approver: string; reason?: string }>) {
      const it = state.items.find((x) => x.id === action.payload.id);
      if (!it) return;
      if (it.status === "APPROVED") return;

      it.status = "REJECTED";
      if (it.type === "TRANSFER") {
        it.rejection = { by: action.payload.approver, at: Date.now(), reason: action.payload.reason };
      }
    },

    clearCompleted(state) {
      state.items = state.items.filter((x) => x.status !== "APPROVED" && x.status !== "REJECTED");
    },

    clearAll() {
      return initialState;
    },
  },
});

export const { enqueueTransfer, enqueue, approve, reject, clearCompleted, clearAll } = slice.actions;
export default slice.reducer;