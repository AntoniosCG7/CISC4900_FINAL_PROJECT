import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  profileCompleted: false,
  user: null,
  loading: false,
  error: null,
  loggedOut: false,
};

// Reset user state
const resetUserState = (state) => {
  state.isAuthenticated = false;
  state.profileCompleted = false;
  state.user = null;
  state.loading = false;
  state.error = null;
};

// Load user from server
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/users/me",
        {
          withCredentials: true,
        }
      );
      return response.data.data.user;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Unable to load user data.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axios.get("http://localhost:3000/api/v1/users/logout", {
        withCredentials: true,
      });
      dispatch(logout());
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed.";
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Loading action, for when we're awaiting a server response
    startLoading: (state) => {
      state.loading = true;
    },
    // Called when a user is loaded from the server
    setUserOnAuthentication: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.profileCompleted = action.payload.profileCompleted;
      state.loading = false;
      state.error = null;
    },
    // Logout the user and reset state
    logout: (state) => {
      state.isAuthenticated = false;
      state.profileCompleted = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      state.loggedOut = true;
    },
    // Reset loggedOut state
    resetLoggedOut: (state) => {
      state.loggedOut = false;
    },
    // Called when an error occurs during authentication
    authError: (state, action) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = action.payload.message || "An error occurred";
    },
    // Clear any errors
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload._id) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.profileCompleted = action.payload.profileCompleted;
        } else {
          resetUserState(state);
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        resetUserState(state);
        state.error = action.payload || "Failed to load user";
      })
      .addCase(logoutUser.fulfilled, resetUserState)
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addMatcher(
        (action) =>
          action.type === "auth/loadUser/pending" ||
          action.type === "auth/logoutUser/pending",
        (state) => {
          state.loading = true;
        }
      );
  },
});

// Export actions
export const {
  startLoading,
  setUserOnAuthentication,
  logout,
  resetLoggedOut,
  authError,
  clearErrors,
} = authSlice.actions;

export default authSlice.reducer;
