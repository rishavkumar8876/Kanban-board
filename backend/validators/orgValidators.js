const { body, param } = require('express-validator');

const createOrgValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateOrgValidator = [
  param('id').isMongoId().withMessage('Invalid organization ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Organization name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Organization name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

module.exports = {
  createOrgValidator,
  updateOrgValidator,
};
