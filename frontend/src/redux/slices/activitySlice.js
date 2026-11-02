import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTenantActivities = createAsyncThunk(
  'activities/fetchByTenant',
  async ({ tenantId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/activities?tenantId=${tenantId}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch activities');
    }
  }
);

const initialState = {
  activities: [],
  pagination: { total: 0, page: 1, limit: 50, pages: 1 },
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    handleNewActivity: (state, action) => {
      state.activities.unshift(action.payload);
      state.pagination.total += 1;
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenantActivities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTenantActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTenantActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { handleNewActivity, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
