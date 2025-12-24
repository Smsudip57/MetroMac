import { baseApi } from "../../baseApi";

export const generalSettingsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getGeneralSettings: build.query({
            query: () => ({
                url: "/api/v1/general-settings",
            }),
            providesTags: ["general-settings"],
        }),

        updateGeneralSettings: build.mutation({
            query: (data) => ({
                url: "/api/v1/general-settings",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["general-settings"],
        }),
    }),
});

export const {
    useGetGeneralSettingsQuery,
    useUpdateGeneralSettingsMutation,
} = generalSettingsApi;