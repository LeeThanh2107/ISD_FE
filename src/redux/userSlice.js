import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullname: '',
  role: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.fullname = action.payload.fullname;
      state.role = action.payload.role;
    },
    clearUserInfo: (state) => {
      state.fullname = '';
      state.role = '';
    },
  },
});

export const { setUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
