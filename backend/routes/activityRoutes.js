const express = require('express');
const router = express.Router();
const { getTenantActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { resolveTenantAccess } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(resolveTenantAccess);

router.get('/', getTenantActivities);

module.exports = router;
