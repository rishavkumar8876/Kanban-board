import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  onlineUsers: [],
  count: 0,
};

const presenceSlice = createSlice({
  name: 'presence',
  initialState,
  reducers: {
    setPresence: (state, action) => {
      state.onlineUsers = action.payload.onlineUsers || [];
      state.count = action.payload.count || action.payload.onlineUsers?.length || 0;
    },
    clearPresence: (state) => {
      state.onlineUsers = [];
      state.count = 0;
    },
  },
});

export const { setPresence, clearPresence } = presenceSlice.actions;
export default presenceSlice.reducer;
