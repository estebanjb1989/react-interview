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
      providesTags: (result, error, listId) => [
        { type: "TodoItems", id: listId }
      ]
    }),

    toggleCompleteAsync: builder.mutation<void, { listId: number; completed: boolean }>({
      query: ({ listId, completed }) => ({
        url: `/todolists/${listId}/toggle-complete-async`,
        method: "PUT",
        body: { completed },
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: "TodoItems", id: listId },
      ],
    }),

    addTodoItem: builder.mutation<TodoItem, { listId: number; description: string, completed: boolean }>({
      query: ({ listId, description, completed }) => ({
        url: `/todolists/${listId}/todos`,
        method: "POST",
        body: { description, completed },
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: "TodoItems", id: listId },
      ],
    }),

    deleteTodoItem: builder.mutation<{ ok: boolean }, { listId: number; itemId: number }>({
      query: ({ listId, itemId }) => ({
        url: `/todolists/${listId}/todos/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: "TodoItems", id: listId },
      ],
    }),

    updateTodoItem: builder.mutation<TodoItem, { listId: number; itemId: number; completed: boolean; description: string }>({
      query: ({ listId, itemId, completed, description }) => ({
        url: `/todolists/${listId}/todos/${itemId}`,
        method: "PUT",
        body: { completed, description },
      }),
      invalidatesTags: (result, error, { listId }) => [
        { type: "TodoItems", id: listId },
      ],
    }),
  }),
});

export const {
  useGetTodoItemsQuery,
  useAddTodoItemMutation,
  useDeleteTodoItemMutation,
  useUpdateTodoItemMutation,
  useToggleCompleteAsyncMutation,
} = todoItemsApi;
