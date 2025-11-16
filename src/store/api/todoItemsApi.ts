import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TodoItem } from "@/types/TodoList";

export const todoItemsApi = createApi({
  reducerPath: "todoItemsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),

  tagTypes: ["TodoItems"],

  endpoints: (builder) => ({
    getTodoItems: builder.query<TodoItem[], number>({
      query: (listId) => `/todolists/${listId}/todos`,
    }),

    addTodoItem: builder.mutation<TodoItem, { listId: number; description: string, completed: boolean }>({
      query: ({ listId, description, completed }) => ({
        url: `/todolists/${listId}/todos`,
        method: "POST",
        body: { description, completed },
      }),
    }),

    deleteTodoItem: builder.mutation<{ ok: boolean }, { listId: number; itemId: number }>({
      query: ({ listId, itemId }) => ({
        url: `/todolists/${listId}/todos/${itemId}`,
        method: "DELETE",
      }),
    }),

    updateTodoItem: builder.mutation<TodoItem, { listId: number; itemId: number; completed: boolean; description: string }>({
      query: ({ listId, itemId, completed, description }) => ({
        url: `/todolists/${listId}/todos/${itemId}`,
        method: "PUT",
        body: { completed, description },
      }),
    }),
  }),
});

export const {
  useGetTodoItemsQuery,
  useAddTodoItemMutation,
  useDeleteTodoItemMutation,
  useUpdateTodoItemMutation
} = todoItemsApi;
