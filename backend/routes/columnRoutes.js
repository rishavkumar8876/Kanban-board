const express = require('express');
const router = express.Router();
const {
  createColumn,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = require('../controllers/columnController');
const { protect } = require('../middleware/authMiddleware');
const { resolveTenantAccess, requireRole } = require('../middleware/tenantMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createColumnValidator,
  updateColumnValidator,
  reorderColumnsValidator,
} = require('../validators/columnValidators');

router.use(protect);
router.use(resolveTenantAccess);

router.route('/')
  .post(requireRole('tenant_admin'), createColumnValidator, validate, createColumn)
  .get(getColumnsByBoard);

router.get('/board/:boardId', getColumnsByBoard);

router.put('/reorder', requireRole('tenant_admin'), reorderColumnsValidator, validate, reorderColumns);

router.route('/:id')
  .put(requireRole('tenant_admin'), updateColumnValidator, validate, updateColumn)
  .delete(requireRole('tenant_admin'), deleteColumn);

module.exports = router;
