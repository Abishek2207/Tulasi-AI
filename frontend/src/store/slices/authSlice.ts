import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "user" | "admin";
    is_pro?: boolean;
  } | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.is_pro = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, setLoading, setProStatus } = authSlice.actions;
export default authSlice.reducer;

