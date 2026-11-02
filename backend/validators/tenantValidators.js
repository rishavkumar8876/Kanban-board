const { body, param } = require('express-validator');

const createTenantValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tenant name is required')
    .isLength({ max: 100 })
    .withMessage('Tenant name cannot exceed 100 characters'),
  body('organizationId')
    .notEmpty()
    .withMessage('Organization ID is required')
    .isMongoId()
    .withMessage('Invalid Organization ID'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

const updateTenantValidator = [
  param('id').isMongoId().withMessage('Invalid Tenant ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tenant name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Tenant name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

module.exports = {
  createTenantValidator,
  updateTenantValidator,
};
