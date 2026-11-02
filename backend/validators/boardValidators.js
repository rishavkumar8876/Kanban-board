const { body, param } = require('express-validator');

const createBoardValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Board title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isMongoId()
    .withMessage('Invalid Tenant ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateBoardValidator = [
  param('id').isMongoId().withMessage('Invalid Board ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Board title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

module.exports = {
  createBoardValidator,
  updateBoardValidator,
};
