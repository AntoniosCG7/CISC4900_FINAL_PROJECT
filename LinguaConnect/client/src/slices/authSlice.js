import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  profileCompleted: false,
  user: null,
  loading: false,
  error: null,
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
      state.loading = false;
      state.error = null;
    },
    // Called when a user completes their profile
    profileCompletionSuccess: (state, action) => {
      state.profileCompleted = true;
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
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          state.isAuthenticated = true;
          state.loading = false;
          state.user = action.payload;
          state.profileCompleted = action.payload.profileCompleted;
        } else {
          console.warn("No valid user loaded:", action.payload);
          state.isAuthenticated = false;
          state.loading = false;
          state.user = null;
        }
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload || "Failed to load user";
      });
  },
});

// Export actions
export const {
  startLoading,
  setUserOnAuthentication,
  profileCompletionSuccess,
  logout,
  authError,
  clearErrors,
} = authSlice.actions;

export default authSlice.reducer;
