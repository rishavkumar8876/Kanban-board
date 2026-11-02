const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  createOrgValidator,
  updateOrgValidator,
} = require('../validators/orgValidators');

router.use(protect);

router.route('/')
  .post(createOrgValidator, validate, createOrganization)
  .get(getOrganizations);

router.route('/:id')
  .get(getOrganizationById)
  .put(updateOrgValidator, validate, updateOrganization)
  .delete(deleteOrganization);

module.exports = router;
