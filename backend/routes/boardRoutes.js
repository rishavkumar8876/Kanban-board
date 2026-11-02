const express = require('express');
const router = express.Router();
const {
  createBoard,
  getBoardsByTenant,
  getBoardById,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');
const { resolveTenantAccess, requireRole } = require('../middleware/tenantMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createBoardValidator,
  updateBoardValidator,
} = require('../validators/boardValidators');

router.use(protect);
router.use(resolveTenantAccess);

router.route('/')
  .post(requireRole('tenant_admin'), createBoardValidator, validate, createBoard)
  .get(getBoardsByTenant);

router.get('/tenant/:tenantId', getBoardsByTenant);

router.route('/:id')
  .get(getBoardById)
  .put(requireRole('tenant_admin'), updateBoardValidator, validate, updateBoard)
  .delete(requireRole('tenant_admin'), deleteBoard);

module.exports = router;
