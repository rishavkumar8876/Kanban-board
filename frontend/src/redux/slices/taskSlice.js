import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTasksByBoard = createAsyncThunk(
  'tasks/fetchByBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks?boardId=${boardId}`);
      return response.data.tasks;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}`, data);
      return response.data.task;
    } catch (error) {

      return rejectWithValue(error);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/move',
  async ({ id, targetColumnId, position, version }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${id}/move`, {
        targetColumnId,
        position,
        version,
      });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete task');
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${id}/comments`, { content });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

const initialState = {
  tasks: [],
  activeTask: null,
  conflictTask: null,
  isConflictModalOpen: false,
  filterPriority: 'ALL',
  filterAssignee: 'ALL',
  filterSearch: '',
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setActiveTask: (state, action) => {
      state.activeTask = action.payload;
    },
    clearActiveTask: (state) => {
      state.activeTask = null;
    },
    clearConflict: (state) => {
      state.conflictTask = null;
      state.isConflictModalOpen = false;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
    setFilterAssignee: (state, action) => {
      state.filterAssignee = action.payload;
    },
    setFilterSearch: (state, action) => {
      state.filterSearch = action.payload;
    },

    optimisticMoveTask: (state, action) => {
      const { taskId, targetColumnId, newPosition } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].columnId = targetColumnId;
        state.tasks[taskIndex].position = newPosition;
      }
    },

    handleTaskCreated: (state, action) => {
      const exists = state.tasks.some((t) => t._id === action.payload._id);
      if (!exists) {
        state.tasks.push(action.payload);
      }
    },
    handleTaskUpdated: (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.activeTask && state.activeTask._id === action.payload._id) {
        state.activeTask = action.payload;
      }
    },
    handleTaskMoved: (state, action) => {
      const { taskId, task, newColumnId, newPosition } = action.payload;
      const index = state.tasks.findIndex((t) => t._id === taskId);
      if (index !== -1) {
        if (task) {
          state.tasks[index] = task;
        } else {
          state.tasks[index].columnId = newColumnId;
          state.tasks[index].position = newPosition;
        }
      } else if (task) {
        state.tasks.push(task);
      }
      if (state.activeTask && state.activeTask._id === taskId) {
        state.activeTask = task || {
          ...state.activeTask,
          columnId: newColumnId,
          position: newPosition,
        };
      }
    },
    handleTaskDeleted: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload.taskId);
      if (state.activeTask && state.activeTask._id === action.payload.taskId) {
        state.activeTask = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTasksByBoard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasksByBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createTask.fulfilled, (state, action) => {
        const exists = state.tasks.some((t) => t._id === action.payload._id);
        if (!exists) {
          state.tasks.push(action.payload);
        }
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask && state.activeTask._id === action.payload._id) {
          state.activeTask = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {

        if (action.payload?.conflict && action.payload?.latestTask) {
          state.conflictTask = action.payload.latestTask;
          state.isConflictModalOpen = true;

          const idx = state.tasks.findIndex((t) => t._id === action.payload.latestTask._id);
          if (idx !== -1) {
            state.tasks[idx] = action.payload.latestTask;
          }
        }
        state.error = action.payload?.message || 'Update failed';
      })

      .addCase(moveTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        if (action.payload?.conflict && action.payload?.latestTask) {
          state.conflictTask = action.payload.latestTask;
          state.isConflictModalOpen = true;
          const idx = state.tasks.findIndex((t) => t._id === action.payload.latestTask._id);
          if (idx !== -1) {
            state.tasks[idx] = action.payload.latestTask;
          }
        }
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        if (state.activeTask && state.activeTask._id === action.payload) {
          state.activeTask = null;
        }
      })

      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.activeTask && state.activeTask._id === action.payload._id) {
          state.activeTask = action.payload;
        }
      });
  },
});

export const {
  setActiveTask,
  clearActiveTask,
  clearConflict,
  setFilterPriority,
  setFilterAssignee,
  setFilterSearch,
  optimisticMoveTask,
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskMoved,
  handleTaskDeleted,
} = taskSlice.actions;

export default taskSlice.reducer;
