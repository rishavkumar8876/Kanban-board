import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const savedOrgId = localStorage.getItem('currentOrgId') || null;
const savedTenantId = localStorage.getItem('currentTenantId') || null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Registration failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch user session');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await api.put('/auth/profile', data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update profile');
  }
});

const resolveRole = (memberships, orgId, tenantId) => {
  if (!memberships || !orgId) return 'member';

  const isOrgAdmin = memberships.some((m) => {
    const mOrgId = m.organizationId?._id || m.organizationId;
    return mOrgId?.toString() === orgId?.toString() && m.role === 'org_admin';
  });
  if (isOrgAdmin) return 'org_admin';

  if (tenantId) {
    const tenantMem = memberships.find((m) => {
      const mTenantId = m.tenantId?._id || m.tenantId;
      return mTenantId?.toString() === tenantId?.toString();
    });
    if (tenantMem) return tenantMem.role;
  }

  const anyOrgMem = memberships.find((m) => {
    const mOrgId = m.organizationId?._id || m.organizationId;
    return mOrgId?.toString() === orgId?.toString();
  });
  return anyOrgMem ? anyOrgMem.role : 'member';
};

const initialState = {
  user: savedUser,
  token: savedToken,
  memberships: [],
  isAuthenticated: !!savedToken,
  currentOrgId: savedOrgId,
  currentTenantId: savedTenantId,
  userRole: 'member',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.memberships = [];
      state.isAuthenticated = false;
      state.currentOrgId = null;
      state.currentTenantId = null;
      state.userRole = 'member';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentOrgId');
      localStorage.removeItem('currentTenantId');
      disconnectSocket();
    },
    setCurrentOrg: (state, action) => {
      state.currentOrgId = action.payload;
      localStorage.setItem('currentOrgId', action.payload);
      state.userRole = resolveRole(state.memberships, action.payload, state.currentTenantId);
    },
    setCurrentTenant: (state, action) => {
      state.currentTenantId = action.payload;
      if (action.payload) {
        localStorage.setItem('currentTenantId', action.payload);
      } else {
        localStorage.removeItem('currentTenantId');
      }
      state.userRole = resolveRole(state.memberships, state.currentOrgId, action.payload);
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.memberships = action.payload.memberships || [];

        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));

        connectSocket(action.payload.token);

        if (state.memberships.length > 0) {
          const firstOrg = state.memberships[0].organizationId;
          if (firstOrg) {
            state.currentOrgId = firstOrg._id || firstOrg;
            localStorage.setItem('currentOrgId', state.currentOrgId);
          }
          const firstTenant = state.memberships.find((m) => m.tenantId)?.tenantId;
          if (firstTenant) {
            state.currentTenantId = firstTenant._id || firstTenant;
            localStorage.setItem('currentTenantId', state.currentTenantId);
          }
        }
        state.userRole = resolveRole(state.memberships, state.currentOrgId, state.currentTenantId);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.memberships = [];
        state.userRole = 'org_admin';
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        connectSocket(action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.memberships = action.payload.memberships || [];
        localStorage.setItem('user', JSON.stringify(action.payload.user));

        if (!state.currentOrgId && state.memberships.length > 0) {
          const firstOrg = state.memberships[0].organizationId;
          if (firstOrg) {
            state.currentOrgId = firstOrg._id || firstOrg;
            localStorage.setItem('currentOrgId', state.currentOrgId);
          }
        }

        state.userRole = resolveRole(state.memberships, state.currentOrgId, state.currentTenantId);
      })

      .addCase('organizations/create/fulfilled', (state, action) => {
        const newOrg = action.payload;
        state.currentOrgId = newOrg._id;
        localStorage.setItem('currentOrgId', newOrg._id);
        state.userRole = 'org_admin';
        state.memberships.push({
          organizationId: newOrg,
          tenantId: null,
          role: 'org_admin',
          status: 'active',
        });
      })

      .addCase('organizations/fetchAll/fulfilled', (state, action) => {
        const orgs = action.payload || [];
        if (!state.currentOrgId && orgs.length > 0) {
          state.currentOrgId = orgs[0]._id;
          localStorage.setItem('currentOrgId', orgs[0]._id);
        }
        const active = orgs.find((o) => o._id === state.currentOrgId);
        if (active && active.userRole) {
          state.userRole = active.userRole;
        } else {
          state.userRole = resolveRole(state.memberships, state.currentOrgId, state.currentTenantId);
        }
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      });
  },
});

export const { logout, setCurrentOrg, setCurrentTenant, setUserRole, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;
