import { baseApi } from "../../baseApi";

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRoles: build.query({
      query: (params) => ({
        url: "/api/v1/constants/roles/get",
        params,
      }),
      providesTags: ["roles"],
    }),

    getRoleById: build.query({
      query: ({ id, ...params }) => ({
        url: `/api/v1/constants/roles/get/${id}`,
        params,
      }),
    }),

    createRole: build.mutation({
      query: (data) => ({
        url: "/api/v1/constants/roles/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["roles"],
    }),

    updateRole: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/constants/roles/edit/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["roles"],
    }),

    deleteRole: build.mutation({
      query: (id) => ({
        url: `/api/v1/constants/roles/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["roles"],
    }),

    bulkDeleteRoles: build.mutation({
      query: (ids) => ({
        url: "/api/v1/constants/roles/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["roles"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useBulkDeleteRolesMutation,
} = rolesApi;
