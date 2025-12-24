import { createSlice } from "@reduxjs/toolkit";
import { deleteCookie, setCookie } from "cookies-next";

export interface PhoneCode {
  name: string;
  slug: string;
  phone_code: string;
  flag: string;
}

export interface Country {
  id: number;
  name: string;
  slug: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
}

export interface IKeyAccountManager {
  id: number;
  email: string;
  phone_code: string | null;
  phone: string | null;
  address: string | null;
  first_name: string;
  last_name: string;
}

export interface PartialPayment {
  current_limit: number;
  current_slots: number;
  is_enabled: boolean;
}

export interface IModule {
  id: number;
  name: string;
  parent_id: number | null;
  actions: string[];
  children: IModule[];
}

export interface IUser {
  id?: number;
  user_id?: number;
  username: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  is_verified?: boolean;
  is_super_user?: boolean;
  is_suspended?: boolean;
  is_2fa_enabled?: boolean;
  company_name?: string;
  company_address?: string;
  role?: string | {
        id: number;
        name: string;
        type?: "internal" | "external";
      };
  designation?:
    | string
    | {
        id: number;
        name: string;
      };
  department?:
    | string
    | {
        id: number;
        name: string;
      };
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  phone_code?: any;
  country?: any;
  city?: any;
  logo_dark?: string | null;
  logo_light?: string | null;
  icon_dark?: string | null;
  icon_light?: string | null;
  created_at?: string;
  updated_at?: string;
}

type TAuthState = {
  user: IUser | null;
  modules: IModule[];
  token?: null | string;
};

const initialState: TAuthState = {
  user: null,
  modules: [],
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setModules: (state, action) => {
      state.modules = action.payload;
    },

    setAuthData: (state, action) => {
      // Set both user and modules from getMe response
      state.user = action.payload.user;
      state.modules = action.payload.modules || [];
    },

    setToken: (state, action) => {
      // Set cookie when token is updated
      if (action.payload) setCookie("triplio_access_token", action.payload);
    },

    logout: () => {
      deleteCookie("triplio_access_token", { path: "/" });
      return initialState;
    },
  },
});

export const { setUser, setModules, setAuthData, setToken, logout } =
  authSlice.actions;

export default authSlice.reducer;
