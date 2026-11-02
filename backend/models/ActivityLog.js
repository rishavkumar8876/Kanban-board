const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'TASK_CREATED',
        'TASK_UPDATED',
        'TASK_MOVED',
        'TASK_DELETED',
        'TASK_COMMENT_ADDED',
        'COLUMN_CREATED',
        'COLUMN_UPDATED',
        'COLUMN_DELETED',
        'COLUMN_REORDERED',
        'BOARD_CREATED',
        'BOARD_UPDATED',
        'BOARD_DELETED',
        'MEMBER_ADDED',
        'MEMBER_ROLE_UPDATED',
        'MEMBER_REMOVED',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['task', 'column', 'board', 'member', 'tenant', 'organization'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

activityLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
