// src/store/sync/itemReducers.ts

import { PayloadAction } from "@reduxjs/toolkit";
import { SyncState } from "./types";

export const itemReducers = {
    removeQueuedAddItem(
        state: SyncState,
        action: PayloadAction<{ listId: number; id: number }>
    ) {
        state.queue = state.queue.filter(req => {
            return !(
                req.type === "ADD_ITEM" &&
                "listId" in req.payload &&
                req.payload.listId === action.payload.listId &&
                req.payload.id === action.payload.id
            );
        });
    },

    removeQueuedUpdateItem(
        state: SyncState,
        action: PayloadAction<{ listId: number; id: number }>
    ) {
        state.queue = state.queue.filter(req => {
            return !(
                req.type === "UPDATE_ITEM" &&
                "listId" in req.payload &&
                req.payload.listId === action.payload.listId &&
                req.payload.id === action.payload.id
            );
        });
    },

    updateQueuedAddItem(
        state: SyncState,
        action: PayloadAction<{
            listId: number;
            id: number;
            completed: boolean;
            description: string;
        }>
    ) {
        const req = state.queue.find(
            r =>
                r.type === "ADD_ITEM" &&
                "listId" in r.payload &&
                r.payload.listId === action.payload.listId &&
                r.payload.id === action.payload.id
        );

        if (req && ("completed" in req.payload && "description" in req.payload)) {
            req.payload.completed = action.payload.completed;
            req.payload.description = action.payload.description;
        }
    },

    updateQueuedUpdateItem(
        state: SyncState,
        action: PayloadAction<{
            listId: number;
            id: number;
            completed: boolean;
            description: string;
        }>
    ) {
        const req = state.queue.find(
            r =>
                r.type === "UPDATE_ITEM" &&
                "listId" in r.payload &&
                r.payload.listId === action.payload.listId &&
                r.payload.id === action.payload.id
        );

        if (req && ("completed" in req.payload && "description" in req.payload)) {
            req.payload.completed = action.payload.completed;
            req.payload.description = action.payload.description;
        }
    },

    removeQueuedDeleteItem(
        state: SyncState,
        action: PayloadAction<{ listId: number; id: number }>
    ) {
        state.queue = state.queue.filter(req => {
            return !(
                req.type === "DELETE_ITEM" &&
                "listId" in req.payload &&
                req.payload.listId === action.payload.listId &&
                req.payload.id === action.payload.id
            );
        });
    },

    updateQueueListId(
        state: SyncState,
        action: PayloadAction<{ oldListId: number; newListId: number }>
    ) {
        const { oldListId, newListId } = action.payload;

        state.queue = state.queue.map(req => {
            if (
                (req.type === "ADD_ITEM" ||
                    req.type === "UPDATE_ITEM" ||
                    req.type === "DELETE_ITEM") &&
                "listId" in req.payload &&
                req.payload.listId === oldListId
            ) {
                return {
                    ...req,
                    payload: { ...req.payload, listId: newListId },
                };
            }
            return req;
        });
    },
};
