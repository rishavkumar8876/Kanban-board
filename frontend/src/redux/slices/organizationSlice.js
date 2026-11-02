import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/organizations');
      return response.data.organizations;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch organizations');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await api.post('/organizations', orgData);
      return response.data.organization;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create organization');
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/organizations/${id}`, data);
      return response.data.organization;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update organization');
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  'organizations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/organizations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete organization');
    }
  }
);

const initialState = {
  organizations: [],
  currentOrg: null,
  loading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setCurrentOrgDetails: (state, action) => {
      state.currentOrg = action.payload;
    },
    clearOrgError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.unshift(action.payload);
      })

      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex((o) => o._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = { ...state.organizations[index], ...action.payload };
        }
        if (state.currentOrg && state.currentOrg._id === action.payload._id) {
          state.currentOrg = { ...state.currentOrg, ...action.payload };
        }
      })

      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter((o) => o._id !== action.payload);
        if (state.currentOrg && state.currentOrg._id === action.payload) {
          state.currentOrg = null;
        }
      });
  },
});

export const { setCurrentOrgDetails, clearOrgError } = organizationSlice.actions;
export default organizationSlice.reducer;
