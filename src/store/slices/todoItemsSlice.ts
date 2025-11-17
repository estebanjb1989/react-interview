import { TodoItem, TodoList } from "@/types/TodoList";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";

export const todoItemsSlice = createSlice({
  name: "todoItems",
  initialState: {},
  reducers: {
    addItemLocal: (
      _,
      action: PayloadAction<{ id: number; listId: number; description: string; completed: boolean }>
    ) => action,

    toggleItemLocal: (
      _,
      action: PayloadAction<{ listId: number; itemId: number }>
    ) => action,

    updateItemLocal: (
      _,
      action: PayloadAction<{ listId: number; itemId: number; description: string, completed: boolean }>
    ) => action,

    removeItemLocal: (
      _,
      action: PayloadAction<{ listId: number; itemId: number }>
    ) => action,

    conciliateItemIds: (
      _,
      action: PayloadAction<{ listId: number; localId: number; serverId: number }>
    ) => action,

    setItemsFetched: (
      _,
      action: PayloadAction<{ listId: number; todos: TodoItem[] }>
    ) => action,
  },
});

export const {
  addItemLocal,
  toggleItemLocal,
  removeItemLocal,
  conciliateItemIds,
  setItemsFetched,
  updateItemLocal
} = todoItemsSlice.actions;

/* ---------------------------------------------
   TYPESCRIPT FIJOS PARA DRAFT Y ACTION
----------------------------------------------*/

type ItemsDraft = {
  todoLists?: {
    lists: TodoList[];
  };
};

export const itemsReducerHOF = produce(
  (draft: ItemsDraft, action: unknown) => {
    if (addItemLocal.match(action)) {
      const { id, listId, description } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (list) {
        list.todos.push({
          id,
          description,
          completed: false,
          listId: list.id
        });
      }
    }

    if (toggleItemLocal.match(action)) {
      const { listId, itemId } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (!list) return;

      const item = list.todos.find((todo: TodoItem) => todo.id === itemId);
      if (item) {
        item.completed = !item.completed;
      }
    }

    if (removeItemLocal.match(action)) {
      const { listId, itemId } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (!list) return;

      list.todos = list.todos.filter((todo: TodoItem) => todo.id !== itemId);
    }

    if (conciliateItemIds.match(action)) {
      const { listId, localId, serverId } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (!list) return;

      const item = list.todos.find((todo: TodoItem) => todo.id === localId);
      if (item) {
        item.id = serverId;
      }
    }

    if (setItemsFetched.match(action)) {
      const { listId, todos: fetchedItems } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (!list) return;

      const existing = list.todos || [];

      const localOnly = existing.filter((item: TodoItem) => {
        return !fetchedItems.some((todo: TodoItem) => todo.id === item.id);
      });

      list.todos = [...localOnly, ...fetchedItems];
    }

    if (updateItemLocal.match(action)) {
      const { listId, itemId, description, completed } = action.payload;

      const list = draft.todoLists?.lists?.find((list: TodoList) => list.id === listId);
      if (!list) return;

      const item = list.todos.find((todo: TodoItem) => todo.id === itemId);
      if (item) {
        item.description = description;
        item.completed = completed
      }
    }
  }
);
