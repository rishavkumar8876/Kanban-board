const ActivityLog = require('../models/ActivityLog');
const { emitToTenant } = require('./socketService');

const logActivity = async ({
  organizationId,
  tenantId,
  userId,
  action,
  entityType,
  entityId = null,
  metadata = {},
  excludeSocketId = null,
}) => {
  try {
    const activity = await ActivityLog.create({
      organizationId,
      tenantId,
      userId,
      action,
      entityType,
      entityId,
      metadata,
    });

    const populatedActivity = await ActivityLog.findById(activity._id).populate(
      'userId',
      'name email avatar'
    );

    emitToTenant(tenantId, 'activity:new', populatedActivity, excludeSocketId);

    return populatedActivity;
  } catch (error) {
    console.error('[Activity Logging Error]', error);

    return null;
  }
};

module.exports = {
  logActivity,
};
