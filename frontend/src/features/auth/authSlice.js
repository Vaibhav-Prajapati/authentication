import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          detail: 'Registration failed. Please try again.',
        }
      );
    }
  }
);

const loginUser = createAsyncThunk('auth/login', async (credential, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credential);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      error.response?.data || {
        detail: 'Login failed. Please try again.',
      }
    );
  }
});

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  successMessage: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = true;
      state.error = false;
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      // Register - Fulfilled
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.data.user;
        state.successMessage = action.payload.message;
      })

      // Register - Rejected
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload.data.user;
        state.accessToken = action.payload.data.access;
        state.refreshToken = action.payload.data.refresh;
        state.isAuthenticated = true;
        state.successMessage = action.payload.message;
      })

      // Login - Rejected
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
export const { setCredentials, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
