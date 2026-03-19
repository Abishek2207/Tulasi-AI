import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string | null;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  sessionId: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  sessionId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    /** Append streaming tokens to an existing message by ID */
    updateLastMessage: (state, action: PayloadAction<{ id: string; append: string }>) => {
      const msg = state.messages.find(m => m.id === action.payload.id);
      if (msg) msg.content += action.payload.append;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.sessionId = null;
    },
  },
});

export const { addMessage, updateLastMessage, setLoading, setSessionId, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
