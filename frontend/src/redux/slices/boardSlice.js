import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBoardsByTenant = createAsyncThunk(
  'boards/fetchByTenant',
  async (tenantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/boards?tenantId=${tenantId}`);
      return response.data.boards;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch boards');
    }
  }
);

export const fetchBoardDetails = createAsyncThunk(
  'boards/fetchDetails',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch board details');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/create',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await api.post('/boards', boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/boards/${id}`, data);
      return response.data.board;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete board');
    }
  }
);

export const createColumn = createAsyncThunk(
  'boards/createColumn',
  async (columnData, { rejectWithValue }) => {
    try {
      const response = await api.post('/columns', columnData);
      return response.data.column;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'boards/updateColumn',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/columns/${id}`, data);
      return response.data.column;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'boards/deleteColumn',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/columns/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete column');
    }
  }
);

export const reorderColumns = createAsyncThunk(
  'boards/reorderColumns',
  async ({ boardId, columns }, { rejectWithValue }) => {
    try {
      const response = await api.put('/columns/reorder', { boardId, columns });
      return response.data.columns;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reorder columns');
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  columns: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },

    handleColumnCreated: (state, action) => {
      if (
        state.currentBoard &&
        action.payload.boardId === state.currentBoard._id
      ) {
        const exists = state.columns.some((c) => c._id === action.payload._id);
        if (!exists) {
          state.columns.push(action.payload);
          state.columns.sort((a, b) => a.position - b.position);
        }
      }
    },
    handleColumnUpdated: (state, action) => {
      const index = state.columns.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    handleColumnDeleted: (state, action) => {
      state.columns = state.columns.filter((c) => c._id !== action.payload.columnId);
    },
    handleColumnReordered: (state, action) => {
      if (
        state.currentBoard &&
        action.payload.boardId === state.currentBoard._id
      ) {
        state.columns = action.payload.columns;
      }
    },
    clearBoardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchBoardsByTenant.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardsByTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoardsByTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchBoardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
        state.columns = action.payload.columns.sort((a, b) => a.position - b.position);
      })
      .addCase(fetchBoardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload.board);
        state.currentBoard = action.payload.board;
        state.columns = action.payload.columns || [];
      })

      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })

      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter((b) => b._id !== action.payload);
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null;
          state.columns = [];
        }
      })

      .addCase(createColumn.fulfilled, (state, action) => {
        const exists = state.columns.some((c) => c._id === action.payload._id);
        if (!exists) {
          state.columns.push(action.payload);
          state.columns.sort((a, b) => a.position - b.position);
        }
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter((c) => c._id !== action.payload);
      })
      .addCase(reorderColumns.fulfilled, (state, action) => {
        state.columns = action.payload;
      });
  },
});

export const {
  setCurrentBoard,
  handleColumnCreated,
  handleColumnUpdated,
  handleColumnDeleted,
  handleColumnReordered,
  clearBoardError,
} = boardSlice.actions;

export default boardSlice.reducer;
