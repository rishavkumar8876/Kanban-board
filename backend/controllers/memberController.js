const Membership = require('../models/Membership');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');
const { emitToTenant } = require('../services/socketService');

const getTenantMembers = async (req, res) => {
  const { tenantId, organizationId } = req;

  const memberships = await Membership.find({
    organizationId,
    $or: [{ tenantId }, { role: 'org_admin' }],
    status: 'active',
  })
    .populate('userId', 'name email avatar createdAt')
    .sort({ createdAt: -1 });

  const memberMap = new Map();
  for (const m of memberships) {
    if (!m.userId) continue;
    const uid = m.userId._id.toString();

    if (!memberMap.has(uid)) {
      memberMap.set(uid, {
        membershipId: m._id,
        user: m.userId,
        role: m.role,
        status: m.status,
        joinedAt: m.createdAt,
      });
    } else {
      const existing = memberMap.get(uid);

      if (m.role === 'org_admin') {
        existing.role = 'org_admin';
        existing.membershipId = m._id;
      } else if (m.role === 'tenant_admin' && existing.role !== 'org_admin') {
        existing.role = 'tenant_admin';
      }
    }
  }

  const memberList = Array.from(memberMap.values());

  res.status(200).json({
    success: true,
    members: memberList,
  });
};

const addTenantMember = async (req, res) => {
  const { email, role } = req.body;
  const { tenantId, organizationId } = req;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user registered with this email address. Please ask them to register first.',
    });
  }

  const existingMembership = await Membership.findOne({
    userId: user._id,
    organizationId,
    tenantId,
  });

  if (existingMembership) {
    if (existingMembership.status === 'active') {
      return res.status(409).json({
        success: false,
        message: 'This user is already an active member of this branch/tenant',
      });
    } else {
      existingMembership.status = 'active';
      existingMembership.role = role || 'member';
      await existingMembership.save();

      const memberPayload = {
        membershipId: existingMembership._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
        },
        role: existingMembership.role,
        status: 'active',
      };

      emitToTenant(tenantId, 'member:joined', memberPayload);

      return res.status(200).json({
        success: true,
        message: 'Member reactivated successfully',
        member: memberPayload,
      });
    }
  }

  const assignedRole = role === 'tenant_admin' ? 'tenant_admin' : 'member';

  const newMembership = await Membership.create({
    userId: user._id,
    organizationId,
    tenantId,
    role: assignedRole,
    status: 'active',
  });

  const memberPayload = {
    membershipId: newMembership._id,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    role: assignedRole,
    status: 'active',
  };

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'member:joined', memberPayload, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'MEMBER_ADDED',
    entityType: 'member',
    entityId: user._id,
    metadata: { memberName: user.name, memberEmail: user.email, role: assignedRole },
    excludeSocketId: socketId,
  });

  res.status(201).json({
    success: true,
    message: 'Member added to tenant successfully',
    member: memberPayload,
  });
};

const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const { tenantId, organizationId } = req;

  if (!['tenant_admin', 'member'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be either tenant_admin or member',
    });
  }

  const membership = await Membership.findOne({
    _id: req.params.membershipId,
    tenantId,
  }).populate('userId', 'name email avatar');

  if (!membership) {
    return res.status(404).json({
      success: false,
      message: 'Membership not found in this tenant',
    });
  }

  membership.role = role;
  await membership.save();

  const memberPayload = {
    membershipId: membership._id,
    user: membership.userId,
    role: membership.role,
    status: membership.status,
  };

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'member:role_updated', memberPayload, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'MEMBER_ROLE_UPDATED',
    entityType: 'member',
    entityId: membership.userId._id,
    metadata: { memberName: membership.userId.name, newRole: role },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Member role updated successfully',
    member: memberPayload,
  });
};

const removeTenantMember = async (req, res) => {
  const { tenantId, organizationId } = req;

  const membership = await Membership.findOne({
    _id: req.params.membershipId,
    tenantId,
  }).populate('userId', 'name email');

  if (!membership) {
    return res.status(404).json({
      success: false,
      message: 'Membership not found in this tenant',
    });
  }

  if (membership.userId._id.toString() === req.user._id.toString()) {
    const adminCount = await Membership.countDocuments({
      tenantId,
      role: 'tenant_admin',
      status: 'active',
    });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove yourself as you are the only Tenant Admin. Assign another admin first.',
      });
    }
  }

  const removedUserId = membership.userId._id;
  const removedUserName = membership.userId.name;

  await Membership.deleteOne({ _id: membership._id });

  const socketId = req.headers['x-socket-id'];
  emitToTenant(tenantId, 'member:left', { userId: removedUserId }, socketId);

  await logActivity({
    organizationId,
    tenantId,
    userId: req.user._id,
    action: 'MEMBER_REMOVED',
    entityType: 'member',
    entityId: removedUserId,
    metadata: { memberName: removedUserName },
    excludeSocketId: socketId,
  });

  res.status(200).json({
    success: true,
    message: 'Member removed from tenant successfully',
  });
};

module.exports = {
  getTenantMembers,
  addTenantMember,
  updateMemberRole,
  removeTenantMember,
};
