import { baseApi } from "../baseApi";

export const importExportApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        exportData: build.query({
            query: (params) => ({
                url: "/api/v1/import-export/export",
                params,
                responseHandler: async (response) => response.blob(),
            }),
        }),

        importData: build.mutation({
            query: (data) => {
                const formData = new FormData();
                formData.append("module", data.module);
                formData.append("mode", data.mode || "insert");
                formData.append("file", data.file);

                return {
                    url: "/api/v1/import-export/import",
                    method: "POST",
                    body: formData,
                };
            },
        }),

        getImportExportConfig: build.query({
            query: (module) => ({
                url: `/api/v1/import-export/config/${module}`,
            }),
        }),
    }),
});

export const {
    useLazyExportDataQuery,
    useGetImportExportConfigQuery,
    useImportDataMutation,
} = importExportApi;
