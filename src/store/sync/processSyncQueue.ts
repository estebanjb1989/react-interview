import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";

import { todoApi, todoItemsApi } from "@/store/api/index";

import { 
    conciliateIds,
    updateListLocal,
    removeListLocal
} from "@/store/slices/todoListsSlice";

import { 
    conciliateItemIds,
    removeItemLocal,
    addItemLocal
} from "@/store/slices/todoItemsSlice";

import {
    AddItemPayload,
    DeleteItemPayload,
    dequeueRequest,
    UpdateItemPayload,
    UpdateListPayload,
    updateQueueListId
} from "@/store/slices/syncSlice";

import { AddListPayload } from "@/store/slices/syncSlice";

export const processSyncQueue = createAsyncThunk(
    "sync/process",
    async (_, { getState, dispatch }) => {
        let state = getState() as RootState;
        let queue = state.sync.queue;

        for (const request of queue) {
            const { type } = request;
            if (!["ADD_LIST", "UPDATE_LIST", "DELETE_LIST"].includes(type)) {
                continue;
            }

            try {
                switch (type) {

                    case "ADD_LIST": {
                        const { name, id } = request.payload as AddListPayload;

                        const created = await dispatch(
                            todoApi.endpoints.addList.initiate({ name })
                        ).unwrap();

                        await dispatch(conciliateIds({
                            localId: id,
                            id: created.id
                        }));

                        dispatch(updateQueueListId({
                            oldListId: id,
                            newListId: created.id
                        }));

                        dispatch(dequeueRequest(request));
                        break;
                    }

                    case "UPDATE_LIST": {
                        const { id, name } = request.payload as UpdateListPayload;

                        const updated = await dispatch(
                            todoApi.endpoints.updateList.initiate({ id, name })
                        ).unwrap();

                        dispatch(updateListLocal({
                            id: updated.id,
                            name: updated.name,
                            dirty: false
                        }));

                        dispatch(dequeueRequest(request));
                        break;
                    }

                    case "DELETE_LIST": {
                        const { id } = request.payload;

                        await dispatch(
                            todoApi.endpoints.deleteList.initiate(id)
                        ).unwrap();

                        dispatch(removeListLocal({ id }));
                        dispatch(dequeueRequest(request));
                        break;
                    }
                }
            } catch (err) {
                console.warn("Sync LIST error, keeping request in queue", request, err);
                continue;
            }
        }

        state = getState() as RootState;
        queue = state.sync.queue;


        for (const request of queue) {
            const { type } = request;
            if (!["ADD_ITEM", "UPDATE_ITEM", "DELETE_ITEM"].includes(type)) {
                continue;
            }

            try {
                switch (type) {

                    case "ADD_ITEM": {
                        const { listId, id: localId, description, completed } = request.payload as AddItemPayload;

                        const created = await dispatch(
                            todoItemsApi.endpoints.addTodoItem.initiate({
                                listId,
                                description,
                                completed
                            })
                        ).unwrap();

                        dispatch(conciliateItemIds({
                            listId,
                            localId,
                            serverId: created.id
                        }));

                        dispatch(dequeueRequest(request));
                        break;
                    }

                    case "UPDATE_ITEM": {
                        const { listId, id, description, completed } = request.payload as UpdateItemPayload;

                        const updated = await dispatch(
                            todoItemsApi.endpoints.updateTodoItem.initiate({
                                listId,
                                itemId: id,
                                description,
                                completed
                            })
                        ).unwrap();

                        dispatch(addItemLocal({
                            id,
                            listId,
                            description: updated.description,
                            completed: updated.completed
                        }));

                        dispatch(dequeueRequest(request));
                        break;
                    }

                    case "DELETE_ITEM": {
                        const { listId, id } = request.payload as DeleteItemPayload;

                        await dispatch(
                            todoItemsApi.endpoints.deleteTodoItem.initiate({
                                listId,
                                itemId: id
                            })
                        ).unwrap();

                        dispatch(removeItemLocal({ listId, itemId: id }));
                        dispatch(dequeueRequest(request));
                        break;
                    }
                }
            } catch (err) {
                console.warn("Sync ITEM error, keeping request in queue", request, err);
                continue;
            }
        }
    }
);
