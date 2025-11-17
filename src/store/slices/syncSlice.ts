// src/store/sync/syncSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "@reduxjs/toolkit";
import { SyncState, PendingRequest } from "./sync/types";
import { listReducers } from "./sync/listsReducer";
import { itemReducers } from "./sync/itemsReducer";

const initialState: SyncState = { queue: [] };

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    // Queue core
    enqueueRequest(state, action: PayloadAction<PendingRequest>) {
      state.queue.push({ ...action.payload, queueId: nanoid() });
    },

    dequeueRequest(state, action: PayloadAction<{ queueId?: string }>) {
      state.queue = state.queue.filter(
        req => req.queueId !== action.payload.queueId
      );
    },

    clearQueue(state) {
      state.queue = [];
    },

    ...listReducers,
    ...itemReducers,
  },
});

export const {
  enqueueRequest,
  dequeueRequest,
  clearQueue,

  // List reducers
  clearQueueForList,
  updateQueuedAddListName,
  updateQueuedUpdateList,
  removeQueuedUpdateList,
  removeQueuedDeleteList,

  // Item reducers
  removeQueuedAddItem,
  removeQueuedUpdateItem,
  updateQueuedAddItem,
  updateQueuedUpdateItem,
  removeQueuedDeleteItem,
  updateQueueListId,
} = syncSlice.actions;


export default syncSlice.reducer;
