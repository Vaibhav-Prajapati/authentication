import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

import {
  getAccessToken,
  setAccessToken,
  clearTokens,
} from '../../services/token';


/*
|--------------------------------------------------------------------------
| Initial State
|--------------------------------------------------------------------------
*/

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};


/*
|--------------------------------------------------------------------------
| Error Helper
|--------------------------------------------------------------------------
*/

const getErrorPayload = (error, fallbackMessage) => {
  return (
    error.response?.data || {
      detail: fallbackMessage,
    }
  );
};


/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

export const registerUser = createAsyncThunk(
  'auth/registerUser',

  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/register/',
        userData
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          'Registration failed. Please try again.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/

export const loginUser = createAsyncThunk(
  'auth/loginUser',

  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/login/',
        credentials
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          'Login failed. Please check your credentials.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        '/auth/me/'
      );

      return response.data;

    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          'Unable to fetch user information.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
|
| IMPORTANT:
| The refresh token is NOT read by JavaScript.
|
| Django stores it in an HttpOnly cookie.
| The browser automatically sends that cookie.
|
*/

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/token/refresh/'
      );

      const accessToken = response.data.access;

      if (!accessToken) {
        return rejectWithValue({
          detail: 'Access token was not returned.',
        });
      }

      /*
       * Store access token in JavaScript memory.
       */
      setAccessToken(accessToken);

      return response.data;

    } catch (error) {
      clearTokens();

      return rejectWithValue(
        getErrorPayload(
          error,
          'Session expired. Please login again.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Initialize CSRF
|--------------------------------------------------------------------------
*/

export const initializeCSRF = createAsyncThunk(
  'auth/initializeCSRF',

  async (_, { rejectWithValue }) => {
    try {
      await api.get(
        '/auth/csrf/'
      );

      return true;

    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          'Unable to initialize security token.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Restore Session
|--------------------------------------------------------------------------
|
| Called when the React application starts.
|
| 1. Refresh access token using HttpOnly cookie.
| 2. Fetch current user.
|
*/

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',

  async (_, { dispatch, rejectWithValue }) => {
    try {
      /*
       * Get a new access token.
       *
       * The browser automatically sends the
       * HttpOnly refresh_token cookie.
       */
      await dispatch(
        refreshAccessToken()
      ).unwrap();


      /*
       * Access token is now available in memory.
       *
       * Fetch the authenticated user.
       */
      const user = await dispatch(
        getCurrentUser()
      ).unwrap();


      return user;

    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


/*
|--------------------------------------------------------------------------
| Logout User
|--------------------------------------------------------------------------
*/

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/auth/logout/'
      );
 clearTokens();
      return response.data;

    } catch (error) {
      return rejectWithValue(
        getErrorPayload(
          error,
          'Logout failed.'
        )
      );
    }
  }
);


/*
|--------------------------------------------------------------------------
| Auth Slice
|--------------------------------------------------------------------------
*/

const authSlice = createSlice({
  name: 'auth',

  initialState,


  /*
  |--------------------------------------------------------------------------
  | Synchronous Reducers
  |--------------------------------------------------------------------------
  */

  reducers: {

    /*
     * Set user credentials.
     *
     * Refresh token is intentionally NOT accepted here.
     */
    setCredentials: (state, action) => {
      const {
        user,
        accessToken,
      } = action.payload;

      state.user = user || null;
      state.isAuthenticated = Boolean(accessToken);
      state.error = null;

      if (accessToken) {
        setAccessToken(accessToken);
      }
    },


    /*
     * Local logout.
     *
     * Used when we want to clear frontend authentication state.
     */
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitializing = false;
      state.error = null;

      clearTokens();
    },


    /*
     * Clear authentication error.
     */
    clearAuthError: (state) => {
      state.error = null;
    },
  },


  /*
  |--------------------------------------------------------------------------
  | Async Thunks
  |--------------------------------------------------------------------------
  */

  extraReducers: (builder) => {

    /*
    |--------------------------------------------------------------------------
    | Register
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        const {
          user,
          access,
        } = action.payload;

        state.user = user || null;

        /*
         * Access token → memory
         *
         * Refresh token → HttpOnly cookie
         */
        setAccessToken(access);

        state.isAuthenticated = Boolean(access);
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        state.user = null;
        state.isAuthenticated = false;

        clearTokens();
      });


    /*
    |--------------------------------------------------------------------------
    | Get Current User
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        state.user = action.payload;

        state.isAuthenticated = Boolean(
          getAccessToken()
        );
      })

      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


    /*
    |--------------------------------------------------------------------------
    | Refresh Access Token
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(refreshAccessToken.pending, (state) => {
        state.error = null;
      })

      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.error = null;
      })

      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;

        clearTokens();

        state.error =
          'Session expired. Please login again.';
      });


    /*
    |--------------------------------------------------------------------------
    | Restore Session
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(restoreSession.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.error = null;

        state.user = action.payload;
        state.isAuthenticated = true;
      })

      .addCase(restoreSession.rejected, (state) => {
        /*
         * No refresh cookie is perfectly normal.
         *
         * This simply means the user isn't logged in.
         */
        state.isInitializing = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;

        clearTokens();
      });


    /*
    |--------------------------------------------------------------------------
    | Initialize CSRF
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(initializeCSRF.rejected, (state, action) => {
        state.error = action.payload;
      });


    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitializing = false;
        state.error = null;

        clearTokens();
      })

      .addCase(logoutUser.rejected, (state, action) => {
        /*
         * Even if the server logout fails,
         * clear the local authentication state.
         */
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitializing = false;

        clearTokens();

        state.error = action.payload;
      });
  },
});


/*
|--------------------------------------------------------------------------
| Actions
|--------------------------------------------------------------------------
*/

export const {
  setCredentials,
  logout,
  clearAuthError,
} = authSlice.actions;


/*
|--------------------------------------------------------------------------
| Selectors
|--------------------------------------------------------------------------
*/

export const selectUser = (state) =>
  state.auth.user;

export const selectIsAuthenticated = (state) =>
  state.auth.isAuthenticated;

export const selectAuthLoading = (state) =>
  state.auth.isLoading;

export const selectAuthInitializing = (state) =>
  state.auth.isInitializing;

export const selectAuthError = (state) =>
  state.auth.error;


export default authSlice.reducer;