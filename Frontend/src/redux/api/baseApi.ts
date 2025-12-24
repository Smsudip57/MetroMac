import {
  BaseQueryApi,
  BaseQueryFn,
  DefinitionType,
  FetchArgs,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
// import * as Sentry from "@sentry/nextjs";
import { API_CONFIG } from "@/lib/config";

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.base_url,
  credentials: "include",
  prepareHeaders: (headers) => {
    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  try {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
      console.log("Sending refresh token");

      const refreshTokenResult = await fetch(API_CONFIG.refresh_token_url, {
        method: "POST",
        credentials: "include",
      });

      const data = await refreshTokenResult.json();

      if (data?.data?.access_token) {
        result = await baseQuery(args, api, extraOptions);
      }
    }

    return result;
  } catch (error) {
    // Sentry.withScope((scope) => {
    //     scope.setExtra("endpoint", args.url);
    //     scope.setExtra("method", args.method);
    //     scope.setLevel("fatal");

    //     Sentry.captureException(error);
    // });
    throw error;
  }
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  endpoints: () => ({}),
  tagTypes: [
    "topupRequest",
    "passengers",
    "profile",
    "subUsers",
    "creditRequests",
    "bankList",
    "flightBooking",
    "supportTicket",
    "voidTicket",
    "refundTicketList",
    "reissueTicket",
    "dueSettlement",
    "roles",
    "users",
    "UserPermissions",
    "RolePermissions",
    "invoices",
    "invoice-stats",
    "invoiceStatuses",
    "paymentMethods",
    "quotations",
    "quotation-stats",
    "quotationStatuses",
    "leads",
    "lead-stats",
    "leadStatuses",
    "leadSources",
    "shiftTypes",
    // Project Management Tags
    "projectTemplates",
    "projectTemplate-stats",
    "boardTemplates",
    "boardTemplate-stats",
    "projects",
    "project-stats",
    "projectMembers",
    "projectBoards",
    "workItems",
    "workItem-stats",
    "workItemComments",
    "workItemAttachments",
    "pushSubscription",
    "general-settings",
  ],
});
