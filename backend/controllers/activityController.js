const ActivityLog = require('../models/ActivityLog');

const getTenantActivities = async (req, res) => {
  const { tenantId } = req;
  const limit = parseInt(req.query.limit, 10) || 50;
  const page = parseInt(req.query.page, 10) || 1;
  const skip = (page - 1) * limit;

  const activities = await ActivityLog.find({ tenantId })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ActivityLog.countDocuments({ tenantId });

  res.status(200).json({
    success: true,
    activities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  getTenantActivities,
};
