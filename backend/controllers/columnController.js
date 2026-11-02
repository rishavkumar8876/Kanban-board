const Column = require('../models/Column');
const Board = require('../models/Board');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');
const { emitToTenant } = require('../services/socketService');

const createColumn = async (req, res) => {
  const { title, boardId, position, color } = req.body;
  const { tenantId, organizationId } = req;

  const board = await Board.findOne({ _id: boardId, tenantId });
  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found in this tenant',
    });
  }

  let pos = position;
  if (pos === undefined || pos === null) {
    const highestPosColumn = await Column.findOne({ boardId, tenantId }).sort({ position: -1 });
    pos = highestPosColumn ? highestPosColumn.position + 1 : 0;
  }

  const column = await Column.create({
    title,
    boardId,
    tenantId,
    organizationId,
    position: pos,
    color: color || '#6366f1',
  });

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'column:created', column, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'COLUMN_CREATED',
    entityType: 'column',
    entityId: column._id,
    metadata: { columnTitle: column.title, boardId },
    excludeSocketId: socketId,
  });

  res.status(201).json({
    success: true,
    message: 'Column created successfully',
    column,
  });
};

const getColumnsByBoard = async (req, res) => {
  const boardId = req.query.boardId || req.params.boardId;
  const { tenantId } = req;

  if (!boardId) {
    return res.status(400).json({
      success: false,
      message: 'Board ID is required',
    });
  }

  const columns = await Column.find({ boardId, tenantId }).sort({ position: 1 });

  res.status(200).json({
    success: true,
    columns,
  });
};

const updateColumn = async (req, res) => {
  const { title, color } = req.body;
  const { tenantId, organizationId } = req;

  const column = await Column.findOne({ _id: req.params.id, tenantId });
  if (!column) {
    return res.status(404).json({
      success: false,
      message: 'Column not found in this tenant',
    });
  }

  if (title) column.title = title;
  if (color) column.color = color;

  await column.save();

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'column:updated', column, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'COLUMN_UPDATED',
    entityType: 'column',
    entityId: column._id,
    metadata: { columnTitle: column.title },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Column updated successfully',
    column,
  });
};

const deleteColumn = async (req, res) => {
  const { tenantId, organizationId } = req;

  const column = await Column.findOne({ _id: req.params.id, tenantId });
  if (!column) {
    return res.status(404).json({
      success: false,
      message: 'Column not found in this tenant',
    });
  }

  const columnId = column._id;
  const boardId = column.boardId;

  await Task.deleteMany({ columnId, tenantId });
  await Column.deleteOne({ _id: columnId, tenantId });

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'column:deleted', { columnId, boardId }, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'COLUMN_DELETED',
    entityType: 'column',
    entityId: columnId,
    metadata: { columnTitle: column.title, boardId },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Column and associated tasks deleted successfully',
  });
};

const reorderColumns = async (req, res) => {
  const { columns, boardId } = req.body;
  const { tenantId, organizationId } = req;

  const board = await Board.findOne({ _id: boardId, tenantId });
  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found in this tenant',
    });
  }

  const updatePromises = columns.map(({ columnId, position }) =>
    Column.updateOne({ _id: columnId, tenantId, boardId }, { position })
  );
  await Promise.all(updatePromises);

  const updatedColumns = await Column.find({ boardId, tenantId }).sort({ position: 1 });

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'column:reordered', { boardId, columns: updatedColumns }, socketId);

  res.status(200).json({
    success: true,
    message: 'Columns reordered successfully',
    columns: updatedColumns,
  });
};

module.exports = {
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
  reorderColumns,
};
