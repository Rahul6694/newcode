import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
   lang: string;
}

const initialState: AuthState = {
  token: null,
  user: null,
    lang: 'en',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    clearToken: (state) => {
      state.token = null;
      state.user = null;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
     setLang: (state, action: PayloadAction<string>) => {
      state.lang = action.payload; 
    },

    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const {
  setToken,
  clearToken,
  setUser,
  clearUser,
    setLang,
} = authSlice.actions;

export default authSlice.reducer;
