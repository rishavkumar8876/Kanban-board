const Tenant = require('../models/Tenant');
const Organization = require('../models/Organization');
const Membership = require('../models/Membership');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../services/activityService');

const createTenant = async (req, res) => {
  const { name, organizationId, description } = req.body;

  const org = await Organization.findById(organizationId);
  if (!org) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    });
  }

  const isOrgAdmin = await Membership.findOne({
    userId: req.user._id,
    organizationId,
    role: 'org_admin',
    status: 'active',
  });

  if (!isOrgAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Organization Admins can create new tenants/branches',
    });
  }

  const tenant = await Tenant.create({
    name,
    organizationId,
    description: description || '',
    createdBy: req.user._id,
  });

  const existingOrgAdmin = await Membership.findOne({
    userId: req.user._id,
    organizationId,
    role: 'org_admin',
    status: 'active',
  });

  if (!existingOrgAdmin) {
    await Membership.create({
      userId: req.user._id,
      organizationId,
      tenantId: tenant._id,
      role: 'tenant_admin',
      status: 'active',
    });
  }

  await logActivity({
    organizationId,
    tenantId: tenant._id,
    userId: req.user._id,
    action: 'MEMBER_ADDED',
    entityType: 'tenant',
    entityId: tenant._id,
    metadata: { tenantName: tenant.name },
  });

  res.status(201).json({
    success: true,
    message: 'Tenant / Branch created successfully',
    tenant,
  });
};

const getTenantsByOrg = async (req, res) => {
  const organizationId = req.query.organizationId || req.params.organizationId;
  if (!organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Organization ID is required',
    });
  }

  const orgAdminMembership = await Membership.findOne({
    userId: req.user._id,
    organizationId,
    role: 'org_admin',
    status: 'active',
  });

  let tenants;
  if (orgAdminMembership) {

    tenants = await Tenant.find({ organizationId }).sort({ createdAt: -1 });
  } else {

    const userMemberships = await Membership.find({
      userId: req.user._id,
      organizationId,
      status: 'active',
      tenantId: { $ne: null },
    });

    const tenantIds = userMemberships.map((m) => m.tenantId);
    tenants = await Tenant.find({
      _id: { $in: tenantIds },
      organizationId,
    }).sort({ createdAt: -1 });
  }

  res.status(200).json({
    success: true,
    tenants,
  });
};

const getTenantById = async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).populate('organizationId', 'name slug');
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found',
    });
  }

  const hasAccess = await Membership.findOne({
    userId: req.user._id,
    organizationId: tenant.organizationId._id || tenant.organizationId,
    $or: [{ role: 'org_admin' }, { tenantId: tenant._id }],
    status: 'active',
  });

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You do not have permissions for this tenant',
    });
  }

  const boardCount = await Board.countDocuments({ tenantId: tenant._id });
  const memberCount = await Membership.countDocuments({
    tenantId: tenant._id,
    status: 'active',
  });

  res.status(200).json({
    success: true,
    tenant: {
      ...tenant.toObject(),
      userRole: hasAccess.role,
      boardCount,
      memberCount,
    },
  });
};

const updateTenant = async (req, res) => {
  const { name, description } = req.body;
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found',
    });
  }

  const hasAdminRights = await Membership.findOne({
    userId: req.user._id,
    organizationId: tenant.organizationId,
    $or: [
      { role: 'org_admin' },
      { tenantId: tenant._id, role: 'tenant_admin' },
    ],
    status: 'active',
  });

  if (!hasAdminRights) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Tenant Admins or Org Admins can update this tenant',
    });
  }

  if (name) tenant.name = name;
  if (description !== undefined) tenant.description = description;

  await tenant.save();

  res.status(200).json({
    success: true,
    message: 'Tenant updated successfully',
    tenant,
  });
};

const deleteTenant = async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: 'Tenant not found',
    });
  }

  const isOrgAdmin = await Membership.findOne({
    userId: req.user._id,
    organizationId: tenant.organizationId,
    role: 'org_admin',
    status: 'active',
  });

  if (!isOrgAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Organization Admins can delete branches/tenants',
    });
  }

  const tenantId = tenant._id;

  await Task.deleteMany({ tenantId });
  await Column.deleteMany({ tenantId });
  await Board.deleteMany({ tenantId });
  await Membership.deleteMany({ tenantId });
  await ActivityLog.deleteMany({ tenantId });
  await Tenant.findByIdAndDelete(tenantId);

  res.status(200).json({
    success: true,
    message: 'Tenant and all its boards and tasks deleted successfully',
  });
};

module.exports = {
  createTenant,
  getTenantsByOrg,
  getTenantById,
  updateTenant,
  deleteTenant,
};
