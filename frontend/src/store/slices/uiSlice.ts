import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarOpen: boolean;
  theme: "dark";
  stats: {
    xp: number;
    level: string;
    streak: number;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: "dark",
  stats: {
    xp: 0,
    level: "Novice",
    streak: 0,
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action: PayloadAction<boolean>) => { state.sidebarOpen = action.payload; },
    updateStats: (state, action: PayloadAction<Partial<UIState["stats"]>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
});

export const { toggleSidebar, setSidebar, updateStats } = uiSlice.actions;
export default uiSlice.reducer;
