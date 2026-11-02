const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByBoard,
  getTaskById,
  updateTask,
  moveTask,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { resolveTenantAccess, requireRole } = require('../middleware/tenantMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createTaskValidator,
  updateTaskValidator,
  moveTaskValidator,
  addCommentValidator,
} = require('../validators/taskValidators');

router.use(protect);
router.use(resolveTenantAccess);

router.route('/')
  .post(requireRole('member', 'tenant_admin'), createTaskValidator, validate, createTask)
  .get(getTasksByBoard);

router.get('/board/:boardId', getTasksByBoard);

router.put('/:id/move', requireRole('member', 'tenant_admin'), moveTaskValidator, validate, moveTask);
router.post('/:id/comments', requireRole('member', 'tenant_admin'), addCommentValidator, validate, addComment);

router.route('/:id')
  .get(getTaskById)
  .put(requireRole('member', 'tenant_admin'), updateTaskValidator, validate, updateTask)
  .delete(requireRole('member', 'tenant_admin'), deleteTask);

module.exports = router;
