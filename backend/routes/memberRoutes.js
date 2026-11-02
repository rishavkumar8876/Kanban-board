const express = require('express');
const router = express.Router();
const {
  getTenantMembers,
  addTenantMember,
  updateMemberRole,
  removeTenantMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { resolveTenantAccess, requireRole } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(resolveTenantAccess);

router.route('/')
  .get(getTenantMembers)
  .post(requireRole('tenant_admin'), addTenantMember);

router.route('/:membershipId')
  .put(requireRole('tenant_admin'), updateMemberRole)
  .delete(requireRole('tenant_admin'), removeTenantMember);

module.exports = router;
