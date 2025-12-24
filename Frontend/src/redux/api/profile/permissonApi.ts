import { baseApi } from "../baseApi";

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all permissions (module tree)
    getAllPermissions: build.query({
      query: () => ({
        url: "/api/v1/permissions/all",
        method: "GET",
      }),
    }),
    // Role permissions
    getRolePermissions: build.query({
      query: (id) => ({
        url: `/api/v1/permissions/roles/${id}/permissions`,
        method: "GET",
      }),
      providesTags: ["RolePermissions"],
    }),
    setRolePermissions: build.mutation({
      query: ({ id, permissions }) => ({
        url: `/api/v1/permissions/roles/${id}/permissions`,
        method: "POST",
        body: { permissions },
      }),
      invalidatesTags: ["RolePermissions"],
    }),
    bulkSetRolePermissions: build.mutation({
      query: (items) => ({
        url: `/api/v1/permissions/roles/bulk-permissions`,
        method: "POST",
        body: { items },
      }),
      invalidatesTags: ["RolePermissions"],
    }),
    // User permissions
    setUserPermissions: build.mutation({
      query: ({ id, permissions }) => ({
        url: `/api/v1/permissions/users/${id}/permissions`,
        method: "POST",
        body: { permissions },
      }),
      invalidatesTags: ["UserPermissions"],
    }),
    bulkSetUserPermissions: build.mutation({
      query: (items) => ({
        url: `/api/v1/permissions/users/bulk-permissions`,
        method: "POST",
        body: { items },
      }),
      invalidatesTags: ["UserPermissions"],
    }),
  }),
});

export const {
  useGetAllPermissionsQuery,
  useGetRolePermissionsQuery,
  useSetRolePermissionsMutation,
  useBulkSetRolePermissionsMutation,
  useSetUserPermissionsMutation,
  useBulkSetUserPermissionsMutation,
} = permissionApi;
