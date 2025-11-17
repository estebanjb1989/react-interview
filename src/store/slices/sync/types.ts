// src/store/sync/types.ts

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
  description: string;
  completed: boolean;
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
    | "ADD_LIST"
    | "UPDATE_LIST"
    | "DELETE_LIST"
    | "ADD_ITEM"
    | "UPDATE_ITEM"
    | "DELETE_ITEM";
  payload: PendingPayload;
  queueId?: string;
}

export interface SyncState {
  queue: PendingRequest[];
}
