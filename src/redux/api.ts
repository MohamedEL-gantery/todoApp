import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  CreateTodoRequest,
  GetTodosParams,
  GetTodosResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Todo,
  UpdateTodoRequest,
} from "@/types";
import { getAuthSession } from "@/utils/tokenStorage";

const resolveApiBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: resolveApiBaseUrl(),
    prepareHeaders: async (headers) => {
      const session = await getAuthSession();

      if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Todos"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    getTodos: builder.query<GetTodosResponse, GetTodosParams | void>({
      query: (params) => ({
        url: "/todos",
        params: params ?? undefined,
      }),
      providesTags: ["Todos"],
    }),

    getTodoById: builder.query<Todo, string>({
      query: (id) => `/todos/${id}`,
      transformResponse: (response: { data: Todo }) => response.data,
      providesTags: ["Todos"],
    }),

    createTodo: builder.mutation<Todo, CreateTodoRequest>({
      query: (body) => ({
        url: "/todos",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: Todo }) => response.data,
      invalidatesTags: ["Todos"],
    }),

    updateTodo: builder.mutation<Todo, { id: string; data: UpdateTodoRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/todos/${id}`,
          method: "PATCH",
          body: data,
        }),
        transformResponse: (response: { data: Todo }) => response.data,
        invalidatesTags: ["Todos"],
      },
    ),

    deleteTodo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/todos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Todos"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetTodosQuery,
  useGetTodoByIdQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = api;
