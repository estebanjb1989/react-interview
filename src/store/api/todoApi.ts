import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TodoList } from "@/types/TodoList";

export const todoApi = createApi({
    reducerPath: "todoApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
    }),

    tagTypes: ["TodoLists", "TodoItems"],

    endpoints: (builder) => ({

        getTodoLists: builder.query<TodoList[], void>({
            query: () => "/todolists",
            providesTags: ["TodoLists"],
        }),

        addList: builder.mutation<TodoList, { name: string }>({
            query: (body) => ({
                url: "/todolists",
                method: "POST",
                body,
            }),
        }),

        deleteList: builder.mutation<TodoList, number>({
            query: (listId) => ({
                url: `/todolists/${listId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["TodoLists"],
        }),

        updateList: builder.mutation<TodoList, { id: number; name: string }>({
            query: ({ id, name }) => ({
                url: `/todolists/${id}`,
                method: "PUT",
                body: { name },
            }),
        }),
    }),
});

export const {
    useAddListMutation,
    useDeleteListMutation,
    useGetTodoListsQuery,
    useUpdateListMutation
} = todoApi;
