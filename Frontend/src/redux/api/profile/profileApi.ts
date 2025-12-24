import { baseApi } from "../baseApi";
import { setAuthData } from "../../features/authSlice";

export const profileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Replaced getProfile with useGetMeQuery for backend compatibility
    getMe: build.query({
      query: () => ({
        url: "/api/v1/auth/me",
        method: "GET",
      }),
      providesTags: ["profile"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Backend returns both user and modules data
          dispatch(
            setAuthData({
              user: data?.user,
              modules: data?.modules || [],
            })
          );
        } catch (error) {
          dispatch(
            setAuthData({
              user: null,
              modules: [],
            })
          );
          console.error("Failed to fetch user profile:", error);
        }
      },
    }),

    updateProfile: build.mutation({
      query: (data) => ({
        url: "/api/v1/b2b/profile/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["profile"],
    }),

    userBalance: build.query({
      query: () => ({
        url: "/api/v1/b2b/balance",
      }),
    }),

    requestPartialPayment: build.mutation({
      query: () => ({
        url: "/api/v1/b2b/request-partial-payment",
        method: "POST",
        body: {
          user_remarks:
            "I need to enable the partial payment feature in my account",
        },
      }),
      invalidatesTags: ["profile"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useUserBalanceQuery,
  useRequestPartialPaymentMutation,
} = profileApi;
