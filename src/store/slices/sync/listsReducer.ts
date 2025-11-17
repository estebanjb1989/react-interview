// src/store/sync/listReducers.ts

import { PayloadAction } from "@reduxjs/toolkit";
import { SyncState } from "./types";

export const listReducers = {
    clearQueueForList(
        state: SyncState,
        action: PayloadAction<{ listId: number }>
    ) {
        const id = action.payload.listId;

        state.queue = state.queue.filter(req => {
            // 1. Operaciones sobre la lista misma
            if (
                (req.type === "ADD_LIST" ||
                    req.type === "UPDATE_LIST" ||
                    req.type === "DELETE_LIST") &&
                "id" in req.payload &&
                req.payload.id === id
            ) {
                return false;
            }

            // 2. Operaciones sobre items de esa lista
            if (
                (req.type === "ADD_ITEM" ||
                    req.type === "UPDATE_ITEM" ||
                    req.type === "DELETE_ITEM") &&
                "listId" in req.payload &&
                req.payload.listId === id
            ) {
                return false;
            }

            return true;
        });
    },

    updateQueuedAddListName(
        state: SyncState,
        action: PayloadAction<{ id: number; name: string }>
    ) {
        const { id, name } = action.payload;

        state.queue = state.queue.map(req => {
            if (req.type === "ADD_LIST" && req.payload.id === id) {
                return {
                    ...req,
                    payload: { ...req.payload, name },
                };
            }
            return req;
        });
    },

    updateQueuedUpdateList(
        state: SyncState,
        action: PayloadAction<{ id: number; name: string }>
    ) {
        const req = state.queue.find(
            r => r.type === "UPDATE_LIST" && r.payload.id === action.payload.id
        );

        if (req && "name" in req.payload) {
            req.payload.name = action.payload.name;
        }
    },

    removeQueuedUpdateList(
        state: SyncState,
        action: PayloadAction<{ id: number }>
    ) {
        state.queue = state.queue.filter(
            req =>
                !(req.type === "UPDATE_LIST" && req.payload.id === action.payload.id)
        );
    },

    removeQueuedDeleteList(
        state: SyncState,
        action: PayloadAction<{ id: number }>
    ) {
        state.queue = state.queue.filter(
            req =>
                !(req.type === "DELETE_LIST" && req.payload.id === action.payload.id)
        );
    },
};
