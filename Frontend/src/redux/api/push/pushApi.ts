import { baseApi } from "../baseApi";

export const pushApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPushConfig: build.query({
      query: () => ({
        url: "/api/v1/push/config",
      }),
    }),
    subscribeToPush: build.mutation({
      query: (subscription) => ({
        url: "/api/v1/push/subscribe",
        method: "POST",
        body: { subscription },
      }),
      invalidatesTags: ["pushSubscription"],
    }),
    unsubscribeFromPush: build.mutation({
      query: (endpoint) => ({
        url: "/api/v1/push/unsubscribe",
        method: "DELETE",
        body: { endpoint },
      }),
      invalidatesTags: ["pushSubscription"],
    }),
    getPushSubscriptionCount: build.query({
      query: () => ({
        url: "/api/v1/push/subscription-count",
      }),
      providesTags: ["pushSubscription"],
    }),
  }),
});

export const {
  useGetPushConfigQuery,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useGetPushSubscriptionCountQuery,
} = pushApi;
