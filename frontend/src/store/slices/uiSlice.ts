import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "dark";
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "dark",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
  },
});

export const { toggleSidebar, setSidebar } = uiSlice.actions;
export default uiSlice.reducer;
