import { combineReducers, UnknownAction } from "@reduxjs/toolkit";
import { todoApi } from "@/store/api/todoApi";
import { todoItemsApi } from "./api";
import todoListsReducer from "@/store/slices/todoListsSlice";
import { itemsReducerHOF } from "@/store/slices/todoItemsSlice";
import themeReducer from "@/store/slices/themeSlice";
import syncReducer from "@/store/slices/syncSlice";

const combined = combineReducers({
  todoLists: todoListsReducer,
  theme: themeReducer,
  sync: syncReducer,
  [todoApi.reducerPath]: todoApi.reducer,
  [todoItemsApi.reducerPath]: todoItemsApi.reducer,
});

export type CombinedState = ReturnType<typeof combined>;

export default function rootReducer(
  state: CombinedState = combined(undefined, { type: "@@INIT" }),
  action: UnknownAction
): CombinedState {

  const nextState = itemsReducerHOF(state, action);

  return combined(nextState, action);
}
