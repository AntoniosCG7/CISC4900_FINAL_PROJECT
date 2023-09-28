import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  profileCompleted: false,
  user: null,
  loading: true,
  error: null,
};

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
      return response.data.user;
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
    startLoading: (state) => {
      state.loading = true;
    },
    userLoaded: (state, action) => {
      state.isAuthenticated = true;
      state.loading = false;
      state.user = action.payload;
    },
    authenticationSuccess: (state) => {
      state.isAuthenticated = true;
      state.loading = false;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
    },
    authError: (state, action) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = action.payload.message || "An error occurred";
    },
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
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload || "Failed to load user";
      });
  },
});

export const {
  startLoading,
  userLoaded,
  authenticationSuccess,
  logout,
  authError,
  clearErrors,
} = authSlice.actions;

export default authSlice.reducer;
