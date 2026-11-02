const { body, param } = require('express-validator');

const createColumnValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Column title is required')
    .isLength({ max: 50 })
    .withMessage('Column title cannot exceed 50 characters'),
  body('boardId')
    .notEmpty()
    .withMessage('Board ID is required')
    .isMongoId()
    .withMessage('Invalid Board ID'),
  body('position').optional().isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  body('color').optional().isString().trim(),
];

const updateColumnValidator = [
  param('id').isMongoId().withMessage('Invalid Column ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Column title cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Column title cannot exceed 50 characters'),
  body('position').optional().isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  body('color').optional().isString().trim(),
];

const reorderColumnsValidator = [
  body('columns')
    .isArray({ min: 1 })
    .withMessage('Columns array is required for reordering'),
  body('columns.*.columnId')
    .isMongoId()
    .withMessage('Invalid Column ID in columns array'),
  body('columns.*.position')
    .isInt({ min: 0 })
    .withMessage('Position must be a non-negative integer'),
];

module.exports = {
  createColumnValidator,
  updateColumnValidator,
  reorderColumnsValidator,
};
