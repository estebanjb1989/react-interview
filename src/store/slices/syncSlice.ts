import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "@reduxjs/toolkit";

export interface AddListPayload {
  id: number;
  name: string;
}

export interface UpdateListPayload {
  id: number;
  name: string;
}

export interface DeleteListPayload {
  id: number;
}

export interface AddItemPayload {
  listId: number;
  id: number;
  description: string;
  completed: boolean;
}

export interface UpdateItemPayload {
  listId: number;
  id: number;
  completed: boolean;
  description: string;
}

export interface DeleteItemPayload {
  listId: number;
  id: number;
}

export type PendingPayload =
  | AddListPayload
  | UpdateListPayload
  | DeleteListPayload
  | AddItemPayload
  | UpdateItemPayload
  | DeleteItemPayload;

export interface PendingRequest {
  type:
  | "ADD_ITEM"
  | "DELETE_ITEM"
  | "UPDATE_ITEM"
  | "ADD_LIST"
  | "UPDATE_LIST"
  | "DELETE_LIST";
  payload: PendingPayload;
  queueId?: string;
}

export interface SyncState {
  queue: PendingRequest[];
}

const initialState: SyncState = {
  queue: [],
};

export const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    enqueueRequest: (state, action: PayloadAction<PendingRequest>) => {
      state.queue.push({ ...action.payload, queueId: nanoid() });
    },

    clearQueue: (state) => {
      state.queue = [];
    },

    clearQueueForList: (state, action: PayloadAction<{ listId: number }>) => {
      const id = action.payload.listId;

      state.queue = state.queue.filter((req) => {
        if (req.type === "ADD_LIST" && req.payload.id === id)
          return false;
        if (req.type === "DELETE_LIST" && req.payload.id === id)
          return false;

        if (
          req.type === "ADD_ITEM" &&
          "listId" in req.payload &&
          req.payload.listId === id
        )
          return false;

        if (
          req.type === "DELETE_ITEM" &&
          "listId" in req.payload &&
          req.payload.listId === id
        )
          return false;

        return true;
      });
    },


    removeQueuedAddItem: (
      state,
      action: PayloadAction<{ listId: number; id: number }>
    ) => {
      state.queue = state.queue.filter(
        (req) =>
          !(
            req.type === "ADD_ITEM" &&
            "listId" in req.payload &&   // ← type guard
            req.payload.listId === action.payload.listId &&
            req.payload.id === action.payload.id
          )
      );
    },

    updateQueuedAddListName: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      state.queue = state.queue.map((req) => {
        if (req.type === "ADD_LIST" && req.payload.id === action.payload.id) {
          return {
            ...req,
            payload: {
              ...req.payload,
              name: action.payload.name,
            },
          };
        }
        return req;
      });
    },

    updateQueuedAddItem: (
      state,
      action: PayloadAction<{ listId: number; id: number; completed: boolean }>
    ) => {
      const { listId, id, completed } = action.payload;

      const req = state.queue.find(
        (r) =>
          r.type === "ADD_ITEM" &&
          "listId" in r.payload &&  // ← type guard
          "id" in r.payload &&      // ← type guard
          r.payload.listId === listId &&
          r.payload.id === id
      );

      if (req && "completed" in req.payload) {  // ← otro guard
        req.payload.completed = completed;
      }
    },


    updateQueuedUpdateItem: (
      state,
      action: PayloadAction<{ listId: number; id: number; completed: boolean }>
    ) => {
      const { listId, id, completed } = action.payload;

      const req = state.queue.find(
        (r) =>
          r.type === "UPDATE_ITEM" &&
          "listId" in r.payload &&   // type guard
          "id" in r.payload &&       // type guard
          r.payload.listId === listId &&
          r.payload.id === id
      );

      if (req && "completed" in req.payload) {  // type guard
        req.payload.completed = completed;
      }
    },


    removeQueuedDeleteItem: (
      state,
      action: PayloadAction<{ listId: number; id: number }>
    ) => {
      state.queue = state.queue.filter((req) => {
        if (
          req.type === "DELETE_ITEM" &&
          "listId" in req.payload &&      
          "id" in req.payload             
        ) {
          return !(
            req.payload.listId === action.payload.listId &&
            req.payload.id === action.payload.id
          );
        }

        return true;
      });
    },


    dequeueRequest: (state, action: PayloadAction<PendingRequest>) => {
      state.queue = state.queue.filter(q => q.queueId !== action.payload.queueId);
    },

    updateQueueListId: (state, action) => {
      const { oldListId, newListId } = action.payload;

      state.queue = state.queue.map(req => {
        if (
          (
            req.type === "ADD_ITEM" ||
            req.type === "UPDATE_ITEM" ||
            req.type === "DELETE_ITEM"
          ) &&
          "listId" in req.payload
        ) {
          if (req.payload.listId === oldListId) {
            return {
              ...req,
              payload: {
                ...req.payload,
                listId: newListId
              }
            };
          }
        }

        return req;
      });
    },

  },
});

export const {
  enqueueRequest,
  clearQueue,
  removeQueuedAddItem,
  clearQueueForList,
  updateQueuedAddListName,
  updateQueuedAddItem,
  updateQueuedUpdateItem,
  removeQueuedDeleteItem,
  dequeueRequest,
  updateQueueListId
} = syncSlice.actions;
export default syncSlice.reducer;
