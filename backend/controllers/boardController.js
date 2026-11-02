const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');
const { emitToTenant } = require('../services/socketService');

const DEFAULT_COLUMNS = [
  { title: 'To Do', color: '#6366f1', position: 0 },
  { title: 'In Progress', color: '#0ea5e9', position: 1 },
  { title: 'Review', color: '#f59e0b', position: 2 },
  { title: 'Done', color: '#10b981', position: 3 },
];

const createBoard = async (req, res) => {
  const { title, description } = req.body;
  const { tenantId, organizationId } = req;

  const board = await Board.create({
    title,
    description: description || '',
    tenantId,
    organizationId,
    createdBy: req.user._id,
  });

  const columnDocs = DEFAULT_COLUMNS.map((col) => ({
    ...col,
    boardId: board._id,
    tenantId,
    organizationId,
  }));
  const createdColumns = await Column.insertMany(columnDocs);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'BOARD_CREATED',
    entityType: 'board',
    entityId: board._id,
    metadata: { boardTitle: board.title },
  });

  res.status(201).json({
    success: true,
    message: 'Board created successfully with default columns',
    board,
    columns: createdColumns,
  });
};

const getBoardsByTenant = async (req, res) => {
  const { tenantId } = req;

  const boards = await Board.find({ tenantId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    boards,
  });
};

const getBoardById = async (req, res) => {
  const { tenantId } = req;

  const board = await Board.findOne({
    _id: req.params.id,
    tenantId,
  });

  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found in this tenant',
    });
  }

  const columns = await Column.find({
    boardId: board._id,
    tenantId,
  }).sort({ position: 1 });

  const tasks = await Task.find({
    boardId: board._id,
    tenantId,
  })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ position: 1 });

  res.status(200).json({
    success: true,
    board,
    columns,
    tasks,
  });
};

const updateBoard = async (req, res) => {
  const { tenantId, organizationId } = req;
  const { title, description } = req.body;

  const board = await Board.findOne({
    _id: req.params.id,
    tenantId,
  });

  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found',
    });
  }

  if (title) board.title = title;
  if (description !== undefined) board.description = description;

  await board.save();

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'BOARD_UPDATED',
    entityType: 'board',
    entityId: board._id,
    metadata: { boardTitle: board.title },
  });

  res.status(200).json({
    success: true,
    message: 'Board updated successfully',
    board,
  });
};

const deleteBoard = async (req, res) => {
  const { tenantId, organizationId } = req;

  const board = await Board.findOne({
    _id: req.params.id,
    tenantId,
  });

  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found in this tenant',
    });
  }

  const boardId = board._id;

  await Task.deleteMany({ boardId, tenantId });
  await Column.deleteMany({ boardId, tenantId });
  await Board.deleteOne({ _id: boardId, tenantId });

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'BOARD_DELETED',
    entityType: 'board',
    entityId: boardId,
    metadata: { boardTitle: board.title },
  });

  res.status(200).json({
    success: true,
    message: 'Board and associated columns and tasks deleted successfully',
  });
};

module.exports = {
  createBoard,
  getBoardsByTenant,
  getBoardById,
  updateBoard,
  deleteBoard,
};
