import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import organizationReducer from './slices/organizationSlice';
import tenantReducer from './slices/tenantSlice';
import boardReducer from './slices/boardSlice';
import taskReducer from './slices/taskSlice';
import presenceReducer from './slices/presenceSlice';
import activityReducer from './slices/activitySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    organizations: organizationReducer,
    tenants: tenantReducer,
    boards: boardReducer,
    tasks: taskReducer,
    presence: presenceReducer,
    activities: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
