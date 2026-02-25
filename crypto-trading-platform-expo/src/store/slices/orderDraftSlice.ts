import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DraftState = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: string;
  accountId: string;
};

const initialState: DraftState = {
  symbol: "BTC",
  side: "BUY",
  qty: "0.1",
  accountId: "vlt_2",
};

const slice = createSlice({
  name: "orderDraft",
  initialState,
  reducers: {
    setSymbol(state, action: PayloadAction<string>) {
      state.symbol = action.payload.toUpperCase();
    },
    setSide(state, action: PayloadAction<"BUY" | "SELL">) {
      state.side = action.payload;
    },
    setQty(state, action: PayloadAction<string>) {
      state.qty = action.payload;
    },
    setAccountId(state, action: PayloadAction<string>) {
      state.accountId = action.payload;
    },
    resetDraft() {
      return initialState;
    },
  },
});

export const { setSymbol, setSide, setQty, setAccountId, resetDraft } = slice.actions;
export default slice.reducer;
