import { baseApi } from "../baseApi";

export const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/api/v1/files/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
    getFile: builder.query({
      query: (fileId: string) => ({
        url: `/api/v1/files/${fileId}`,
      }),
    }),
    deleteFile: builder.mutation({
      query: (fileId: string) => ({
        url: `/api/v1/files/${fileId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFileQuery,
  useDeleteFileMutation,
} = fileApi;
