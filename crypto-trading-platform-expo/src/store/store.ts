import { configureStore } from "@reduxjs/toolkit";

import approvalQueueReducer from "./slices/approvalQueueSlice";
import orderDraftReducer from "./slices/orderDraftSlice";

// If any old code still expects `crypto`, we alias it to the same reducer
// so `state.crypto` won't crash.
export const store = configureStore({
  reducer: {
    approvalQueue: approvalQueueReducer,
    orderDraft: orderDraftReducer,

    // ✅ compatibility alias (prevents "state.crypto" crash)
    crypto: orderDraftReducer as any,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;