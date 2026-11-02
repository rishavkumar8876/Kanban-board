const { body, param } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('boardId')
    .notEmpty()
    .withMessage('Board ID is required')
    .isMongoId()
    .withMessage('Invalid Board ID'),
  body('columnId')
    .notEmpty()
    .withMessage('Column ID is required')
    .isMongoId()
    .withMessage('Invalid Column ID'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
  body('assignedTo').optional({ nullable: true }).isMongoId().withMessage('Invalid User ID for assignment'),
  body('description').optional().trim(),
];

const updateTaskValidator = [
  param('id').isMongoId().withMessage('Invalid Task ID'),
  body('version')
    .notEmpty()
    .withMessage('Version is required for concurrency control')
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional({ nullable: true }),
  body('assignedTo').optional({ nullable: true }),
  body('description').optional().trim(),
];

const moveTaskValidator = [
  param('id').isMongoId().withMessage('Invalid Task ID'),
  body('version')
    .notEmpty()
    .withMessage('Version is required for concurrency control')
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer'),
  body('targetColumnId')
    .notEmpty()
    .withMessage('Target Column ID is required')
    .isMongoId()
    .withMessage('Invalid Target Column ID'),
  body('position')
    .notEmpty()
    .withMessage('Target position is required')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

const addCommentValidator = [
  param('id').isMongoId().withMessage('Invalid Task ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  moveTaskValidator,
  addCommentValidator,
};
