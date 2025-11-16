import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TodoList } from "@/types/TodoList";

interface TodoListsState {
    lists: TodoList[];
}

const initialState: TodoListsState = {
    lists: [],
};

export const todoListsSlice = createSlice({
    name: "todoLists",
    initialState,
    reducers: {
        setTodoLists: (state, action: PayloadAction<TodoList[]>) => {
            state.lists = action.payload;
        },

        addListLocal: (state, action: PayloadAction<{ name: string; id: number }>) => {
            state.lists.push({
                id: action.payload.id,
                name: action.payload.name,
                todos: [],
                dirty: false
            });
        },

        removeListLocal: (
            state,
            action: PayloadAction<{ id: number }>
        ) => {
            state.lists = state.lists.filter(l => l.id !== action.payload.id);
        },

        conciliateIds: (state, action: PayloadAction<{ localId: number; id: number }>) => {
            state.lists = state.lists.map(todolist => (
                todolist.id === action.payload.localId ? {
                    ...todolist,
                    id: action.payload.id
                } : todolist
            ))
        },

        updateListLocal: (
            state,
            action: PayloadAction<{ id: number; name?: string; dirty?: boolean }>
        ) => {
            const list = state.lists.find(l => l.id === action.payload.id);
            if (!list) return;

            if (typeof action.payload.name !== "undefined") {
                list.name = action.payload.name;
            }
            if (typeof action.payload.dirty !== "undefined") {
                list.dirty = action.payload.dirty;
            }
        },
    },
});

export const {
    setTodoLists,
    addListLocal,
    removeListLocal,
    conciliateIds,
    updateListLocal
} = todoListsSlice.actions;

export default todoListsSlice.reducer;
