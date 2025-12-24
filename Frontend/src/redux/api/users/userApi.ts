import { baseApi } from "../baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query({
      query: (params) => ({
        url: "/api/v1/users/get",
        params,
      }),
      providesTags: ["users"],
    }),
    getUserPermissions: build.query({
      query: (id: number | string) => ({
        url: `/api/v1/users/${id}/permissions`,
      }),
      providesTags: ["UserPermissions"],
    }),
    getUserStats: build.query({
      query: (params) => ({
        url: "/api/v1/users/stats",
        params,
      }),
      providesTags: ["users"],
    }),
    createUser: build.mutation({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["users", "roles"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["users", "roles"],
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `/api/v1/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserPermissionsQuery,
  useGetUserStatsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
