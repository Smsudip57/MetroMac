import { createSlice } from "@reduxjs/toolkit";

export interface SidebarState {
  isSidebarCollapsed: boolean;
  isSidebarOpen: boolean;
}

const initialState: SidebarState = {
  isSidebarCollapsed: false,
  isSidebarOpen: false,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebarCollapse(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.isSidebarCollapsed = action.payload;
    },
    toggleSidebarOpen(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const {
  toggleSidebarCollapse,
  setSidebarCollapsed,
  toggleSidebarOpen,
  setSidebarOpen,
} = sidebarSlice.actions;
export default sidebarSlice.reducer;
