import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTenantsByOrg = createAsyncThunk(
  'tenants/fetchByOrg',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tenants?organizationId=${organizationId}`);
      return response.data.tenants;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tenants');
    }
  }
);

export const fetchTenantById = createAsyncThunk(
  'tenants/fetchById',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tenants/${tenantId}`);
      return response.data.tenant;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tenant');
    }
  }
);

export const createTenant = createAsyncThunk(
  'tenants/create',
  async (tenantData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tenants', tenantData);
      return response.data.tenant;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create tenant');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenants/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tenants/${id}`, data);
      return response.data.tenant;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update tenant');
    }
  }
);

export const deleteTenant = createAsyncThunk(
  'tenants/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tenants/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete tenant');
    }
  }
);

export const fetchTenantMembers = createAsyncThunk(
  'tenants/fetchMembers',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/members?tenantId=${tenantId}`);
      return response.data.members;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tenant members');
    }
  }
);

export const addTenantMember = createAsyncThunk(
  'tenants/addMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await api.post('/members', memberData);
      return response.data.member;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add tenant member');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'tenants/updateRole',
  async ({ membershipId, role }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/members/${membershipId}`, { role });
      return response.data.member;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update member role');
    }
  }
);

export const removeTenantMember = createAsyncThunk(
  'tenants/removeMember',
  async (membershipId, { rejectWithValue }) => {
    try {
      await api.delete(`/members/${membershipId}`);
      return membershipId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove member');
    }
  }
);

const initialState = {
  tenants: [],
  currentTenant: null,
  members: [],
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    setCurrentTenantDetails: (state, action) => {
      state.currentTenant = action.payload;
    },

    handleMemberJoined: (state, action) => {
      const exists = state.members.some(
        (m) => m.membershipId === action.payload.membershipId
      );
      if (!exists) {
        state.members.unshift(action.payload);
      }
    },
    handleMemberLeft: (state, action) => {
      state.members = state.members.filter(
        (m) => m.user?._id !== action.payload.userId
      );
    },
    handleMemberRoleUpdated: (state, action) => {
      const index = state.members.findIndex(
        (m) => m.membershipId === action.payload.membershipId
      );
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    clearTenantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTenantsByOrg.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTenantsByOrg.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenantsByOrg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTenantById.fulfilled, (state, action) => {
        state.currentTenant = action.payload;
      })

      .addCase(createTenant.fulfilled, (state, action) => {
        state.tenants.unshift(action.payload);
      })

      .addCase(updateTenant.fulfilled, (state, action) => {
        const index = state.tenants.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tenants[index] = { ...state.tenants[index], ...action.payload };
        }
        if (state.currentTenant && state.currentTenant._id === action.payload._id) {
          state.currentTenant = { ...state.currentTenant, ...action.payload };
        }
      })

      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.tenants = state.tenants.filter((t) => t._id !== action.payload);
        if (state.currentTenant && state.currentTenant._id === action.payload) {
          state.currentTenant = null;
        }
      })

      .addCase(fetchTenantMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })

      .addCase(addTenantMember.fulfilled, (state, action) => {
        const exists = state.members.some((m) => m.membershipId === action.payload.membershipId);
        if (!exists) {
          state.members.unshift(action.payload);
        }
      })

      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const index = state.members.findIndex((m) => m.membershipId === action.payload.membershipId);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })

      .addCase(removeTenantMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.membershipId !== action.payload);
      });
  },
});

export const {
  setCurrentTenantDetails,
  handleMemberJoined,
  handleMemberLeft,
  handleMemberRoleUpdated,
  clearTenantError,
} = tenantSlice.actions;

export default tenantSlice.reducer;
