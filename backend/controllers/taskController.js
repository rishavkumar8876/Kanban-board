const Task = require('../models/Task');
const Column = require('../models/Column');
const Board = require('../models/Board');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');
const { emitToTenant } = require('../services/socketService');

const createTask = async (req, res) => {
  const {
    title,
    description,
    boardId,
    columnId,
    priority,
    dueDate,
    assignedTo,
    position,
  } = req.body;
  const { tenantId, organizationId } = req;

  const board = await Board.findOne({ _id: boardId, tenantId });
  if (!board) {
    return res.status(404).json({
      success: false,
      message: 'Board not found in this tenant',
    });
  }

  const column = await Column.findOne({ _id: columnId, boardId, tenantId });
  if (!column) {
    return res.status(404).json({
      success: false,
      message: 'Column not found on this board',
    });
  }

  let pos = position;
  if (pos === undefined || pos === null) {
    const highestPosTask = await Task.findOne({ columnId, tenantId }).sort({ position: -1 });
    pos = highestPosTask ? highestPosTask.position + 1 : 0;
  }

  const task = await Task.create({
    title,
    description: description || '',
    boardId,
    columnId,
    tenantId,
    organizationId,
    priority: priority || 'Medium',
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    position: pos,
    version: 1,
    createdBy: req.user._id,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'task:created', populatedTask, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'TASK_CREATED',
    entityType: 'task',
    entityId: task._id,
    metadata: {
      taskTitle: task.title,
      columnTitle: column.title,
      boardId,
    },
    excludeSocketId: socketId,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task: populatedTask,
  });
};

const getTasksByBoard = async (req, res) => {
  const boardId = req.query.boardId || req.params.boardId;
  const { tenantId } = req;

  if (!boardId) {
    return res.status(400).json({
      success: false,
      message: 'Board ID is required',
    });
  }

  const tasks = await Task.find({ boardId, tenantId })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort({ position: 1 });

  res.status(200).json({
    success: true,
    tasks,
  });
};

const getTaskById = async (req, res) => {
  const { tenantId } = req;

  const task = await Task.findOne({ _id: req.params.id, tenantId })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('updatedBy', 'name email avatar')
    .populate('columnId', 'title color position');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found in this tenant',
    });
  }

  res.status(200).json({
    success: true,
    task,
  });
};

const updateTask = async (req, res) => {
  const {
    version,
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    columnId,
    position,
  } = req.body;
  const { tenantId, organizationId } = req;

  const currentTask = await Task.findOne({ _id: req.params.id, tenantId });
  if (!currentTask) {
    return res.status(404).json({
      success: false,
      message: 'Task not found in this tenant',
    });
  }

  if (currentTask.version !== Number(version)) {
    const latestTask = await Task.findById(currentTask._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('updatedBy', 'name email avatar');

    return res.status(409).json({
      success: false,
      conflict: true,
      message: 'Conflict: This task has been modified by another user or session. Please review latest changes.',
      latestTask,
    });
  }

  const updates = {
    updatedBy: req.user._id,
    $inc: { version: 1 },
  };

  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority !== undefined) updates.priority = priority;
  if (dueDate !== undefined) updates.dueDate = dueDate;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo;
  if (columnId !== undefined) updates.columnId = columnId;
  if (position !== undefined) updates.position = position;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: currentTask._id, tenantId, version: Number(version) },
    updates,
    { new: true }
  )
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('updatedBy', 'name email avatar');

  if (!updatedTask) {

    const latest = await Task.findById(currentTask._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    return res.status(409).json({
      success: false,
      conflict: true,
      message: 'Conflict: Task was simultaneously updated by another user.',
      latestTask: latest,
    });
  }

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'task:updated', updatedTask, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'TASK_UPDATED',
    entityType: 'task',
    entityId: updatedTask._id,
    metadata: {
      taskTitle: updatedTask.title,
      version: updatedTask.version,
    },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    task: updatedTask,
  });
};

const moveTask = async (req, res) => {
  const { targetColumnId, position, version } = req.body;
  const { tenantId, organizationId } = req;

  const currentTask = await Task.findOne({ _id: req.params.id, tenantId });
  if (!currentTask) {
    return res.status(404).json({
      success: false,
      message: 'Task not found in this tenant',
    });
  }

  const targetColumn = await Column.findOne({
    _id: targetColumnId,
    boardId: currentTask.boardId,
    tenantId,
  });

  if (!targetColumn) {
    return res.status(404).json({
      success: false,
      message: 'Target column not found on this board',
    });
  }

  if (currentTask.version !== Number(version)) {
    const latestTask = await Task.findById(currentTask._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    return res.status(409).json({
      success: false,
      conflict: true,
      message: 'Conflict: Task position or state was altered by another collaborator.',
      latestTask,
    });
  }

  const oldColumnId = currentTask.columnId;
  const newColumnId = targetColumn._id;
  const targetPos = Number(position);

  await Task.updateMany(
    {
      columnId: newColumnId,
      tenantId,
      position: { $gte: targetPos },
      _id: { $ne: currentTask._id },
    },
    { $inc: { position: 1 } }
  );

  if (oldColumnId.toString() !== newColumnId.toString()) {
    await Task.updateMany(
      {
        columnId: oldColumnId,
        tenantId,
        position: { $gt: currentTask.position },
      },
      { $inc: { position: -1 } }
    );
  }

  const updatedTask = await Task.findOneAndUpdate(
    { _id: currentTask._id, tenantId, version: Number(version) },
    {
      columnId: newColumnId,
      position: targetPos,
      updatedBy: req.user._id,
      $inc: { version: 1 },
    },
    { new: true }
  )
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  if (!updatedTask) {
    const latest = await Task.findById(currentTask._id);
    return res.status(409).json({
      success: false,
      conflict: true,
      message: 'Conflict: Concurrency check failed during task movement.',
      latestTask: latest,
    });
  }

  const socketId = req.headers['x-socket-id'];
  emitToTenant(
    tenantId,
    'task:moved',
    {
      taskId: updatedTask._id,
      task: updatedTask,
      oldColumnId,
      newColumnId,
      newPosition: targetPos,
      boardId: currentTask.boardId,
    },
    socketId
  );

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'TASK_MOVED',
    entityType: 'task',
    entityId: updatedTask._id,
    metadata: {
      taskTitle: updatedTask.title,
      targetColumn: targetColumn.title,
      position: targetPos,
    },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Task moved successfully',
    task: updatedTask,
  });
};

const deleteTask = async (req, res) => {
  const { tenantId, organizationId } = req;

  const task = await Task.findOne({ _id: req.params.id, tenantId });
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found in this tenant',
    });
  }

  const taskId = task._id;
  const boardId = task.boardId;
  const columnId = task.columnId;

  await Task.updateMany(
    {
      columnId,
      tenantId,
      position: { $gt: task.position },
    },
    { $inc: { position: -1 } }
  );

  await Task.deleteOne({ _id: taskId, tenantId });

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'task:deleted', { taskId, boardId, columnId }, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'TASK_DELETED',
    entityType: 'task',
    entityId: taskId,
    metadata: { taskTitle: task.title, boardId },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    taskId,
  });
};

const addComment = async (req, res) => {
  const { content } = req.body;
  const { tenantId, organizationId } = req;

  const task = await Task.findOne({ _id: req.params.id, tenantId });
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found in this tenant',
    });
  }

  const newComment = {
    userId: req.user._id,
    userName: req.user.name,
    userAvatar: req.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&background=4f46e5&color=fff&bold=true&rounded=true`,
    content,
    createdAt: new Date(),
  };

  task.comments.push(newComment);
  task.version += 1;
  task.updatedBy = req.user._id;
  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('updatedBy', 'name email avatar');

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'task:updated', populatedTask, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'TASK_COMMENT_ADDED',
    entityType: 'task',
    entityId: task._id,
    metadata: { taskTitle: task.title, commentSnippet: content.slice(0, 50) },
    excludeSocketId: socketId,
  });

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    task: populatedTask,
  });
};

module.exports = {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTask,
  moveTask,
  deleteTask,
  addComment,
};
