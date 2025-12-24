import { baseApi } from "../baseApi";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query({
      query: (params) => ({
        url: "/api/v1/tasks/get",
        params,
      }),
      providesTags: ["workItems"],
    }),
    getTaskById: build.query({
      query: (id: string | number) => ({
        url: `/api/v1/tasks/${id}`,
      }),
      providesTags: ["workItems"],
    }),
    getTaskStats: build.query({
      query: (params) => ({
        url: "/api/v1/tasks/stats",
        params,
      }),
      providesTags: ["workItem-stats"],
    }),
    createTask: build.mutation({
      query: (body) => ({
        url: "/api/v1/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["workItems", "workItem-stats"],
    }),
    updateTask: build.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/tasks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["workItems", "workItem-stats"],
    }),
    deleteTask: build.mutation({
      query: (id: string | number) => ({
        url: `/api/v1/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["workItems", "workItem-stats"],
    }),
    bulkDeleteTasks: build.mutation({
      query: (body) => ({
        url: "/api/v1/tasks/bulk-delete",
        method: "POST",
        body,
      }),
      invalidatesTags: ["workItems", "workItem-stats"],
    }),
    getTaskAlerts: build.query({
      query: (taskId: string | number) => ({
        url: `/api/v1/tasks/${taskId}/alerts`,
      }),
      providesTags: ["workItemComments"],
    }),
    addTaskAlert: build.mutation({
      query: ({ taskId, ...body }) => ({
        url: `/api/v1/tasks/${taskId}/alerts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["workItemComments"],
    }),
    deleteTaskAlert: build.mutation({
      query: (alertId: string | number) => ({
        url: `/api/v1/tasks/alerts/${alertId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["workItemComments", "workItems"],
    }),
    addTaskComment: build.mutation({
      query: ({ taskId, ...body }) => ({
        url: `/api/v1/tasks/${taskId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["workItems"],
    }),
    deleteTaskComment: build.mutation({
      query: (commentId: string | number) => ({
        url: `/api/v1/tasks/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["workItems"],
    }),
    attachFileToTask: build.mutation({
      query: ({ taskId, ...body }) => ({
        url: `/api/v1/tasks/${taskId}/attachments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["workItems"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGetTaskStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkDeleteTasksMutation,
  useGetTaskAlertsQuery,
  useAddTaskAlertMutation,
  useDeleteTaskAlertMutation,
  useAddTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useAttachFileToTaskMutation,
} = taskApi;
