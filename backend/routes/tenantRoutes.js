const express = require('express');
const router = express.Router();
const {
  createTenant,
  getTenantsByOrg,
  getTenantById,
  updateTenant,
  deleteTenant,
} = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createTenantValidator,
  updateTenantValidator,
} = require('../validators/tenantValidators');

router.use(protect);

router.route('/')
  .post(createTenantValidator, validate, createTenant)
  .get(getTenantsByOrg);

router.get('/organization/:organizationId', getTenantsByOrg);

router.route('/:id')
  .get(getTenantById)
  .put(updateTenantValidator, validate, updateTenant)
  .delete(deleteTenant);

module.exports = router;
