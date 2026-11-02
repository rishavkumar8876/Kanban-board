const Organization = require('../models/Organization');
const Tenant = require('../models/Tenant');
const Membership = require('../models/Membership');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const createOrganization = async (req, res) => {
  const { name, description } = req.body;

  const slug = name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');

  const organization = await Organization.create({
    name,
    slug,
    description: description || '',
    createdBy: req.user._id,
  });

  await Membership.create({
    userId: req.user._id,
    organizationId: organization._id,
    tenantId: null,
    role: 'org_admin',
    status: 'active',
  });

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    organization: {
      ...organization.toObject(),
      userRole: 'org_admin',
    },
  });
};

const getOrganizations = async (req, res) => {

  const memberships = await Membership.find({
    userId: req.user._id,
    status: 'active',
  }).populate('organizationId');

  const orgMap = new Map();
  for (const m of memberships) {
    if (!m.organizationId) continue;
    const orgId = m.organizationId._id.toString();
    if (!orgMap.has(orgId)) {
      orgMap.set(orgId, {
        organization: m.organizationId,
        role: m.role,
      });
    } else {

      const existing = orgMap.get(orgId);
      if (m.role === 'org_admin') {
        existing.role = 'org_admin';
      } else if (m.role === 'tenant_admin' && existing.role !== 'org_admin') {
        existing.role = 'tenant_admin';
      }
    }
  }

  const organizations = Array.from(orgMap.values()).map((item) => ({
    ...item.organization.toObject(),
    userRole: item.role,
  }));

  res.status(200).json({
    success: true,
    organizations,
  });
};

const getOrganizationById = async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    });
  }

  const membership = await Membership.findOne({
    userId: req.user._id,
    organizationId: organization._id,
    status: 'active',
  });

  if (!membership) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You are not a member of this organization',
    });
  }

  const tenantCount = await Tenant.countDocuments({
    organizationId: organization._id,
  });

  res.status(200).json({
    success: true,
    organization: {
      ...organization.toObject(),
      userRole: membership.role,
      tenantCount,
    },
  });
};

const updateOrganization = async (req, res) => {
  const { name, description } = req.body;

  const membership = await Membership.findOne({
    userId: req.user._id,
    organizationId: req.params.id,
    role: 'org_admin',
    status: 'active',
  });

  if (!membership) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Organization Admins can update organization settings',
    });
  }

  const updateFields = {};
  if (name) {
    updateFields.name = name;
    updateFields.slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  if (description !== undefined) updateFields.description = description;

  const organization = await Organization.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!organization) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Organization updated successfully',
    organization,
  });
};

const deleteOrganization = async (req, res) => {

  const membership = await Membership.findOne({
    userId: req.user._id,
    organizationId: req.params.id,
    role: 'org_admin',
    status: 'active',
  });

  if (!membership) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Organization Admins can delete an organization',
    });
  }

  const orgId = req.params.id;

  await Task.deleteMany({ organizationId: orgId });
  await Column.deleteMany({ organizationId: orgId });
  await Board.deleteMany({ organizationId: orgId });
  await Tenant.deleteMany({ organizationId: orgId });
  await Membership.deleteMany({ organizationId: orgId });
  await ActivityLog.deleteMany({ organizationId: orgId });
  await Organization.findByIdAndDelete(orgId);

  res.status(200).json({
    success: true,
    message: 'Organization and all associated data deleted successfully',
  });
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
