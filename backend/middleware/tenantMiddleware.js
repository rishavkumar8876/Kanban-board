const Tenant = require('../models/Tenant');
const Organization = require('../models/Organization');
const Membership = require('../models/Membership');

const resolveTenantAccess = async (req, res, next) => {
  try {
    const tenantId =
      req.params.tenantId ||
      req.headers['x-tenant-id'] ||
      req.query.tenantId ||
      req.body.tenantId;

    const organizationId =
      req.params.organizationId ||
      req.headers['x-organization-id'] ||
      req.query.organizationId ||
      req.body.organizationId;

    if (!tenantId && !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization or Tenant identifier is required for this operation',
      });
    }

    if (tenantId) {
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant / Branch not found',
        });
      }

      const orgAdminMembership = await Membership.findOne({
        userId: req.user._id,
        organizationId: tenant.organizationId,
        role: 'org_admin',
        status: 'active',
      });

      if (orgAdminMembership) {
        req.tenant = tenant;
        req.tenantId = tenant._id;
        req.organizationId = tenant.organizationId;
        req.userRole = 'org_admin';
        req.isOrgAdmin = true;
        req.membership = orgAdminMembership;
        return next();
      }

      const tenantMembership = await Membership.findOne({
        userId: req.user._id,
        tenantId: tenant._id,
        organizationId: tenant.organizationId,
        status: 'active',
      });

      if (!tenantMembership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have an active membership in this tenant/branch',
        });
      }

      req.tenant = tenant;
      req.tenantId = tenant._id;
      req.organizationId = tenant.organizationId;
      req.userRole = tenantMembership.role;
      req.isOrgAdmin = false;
      req.membership = tenantMembership;
      return next();
    }

    if (organizationId) {
      const org = await Organization.findById(organizationId);
      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
        });
      }

      const orgMembership = await Membership.findOne({
        userId: req.user._id,
        organizationId: org._id,
        status: 'active',
      });

      if (!orgMembership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have membership in this organization',
        });
      }

      req.organization = org;
      req.organizationId = org._id;
      req.userRole = orgMembership.role;
      req.isOrgAdmin = orgMembership.role === 'org_admin';
      req.membership = orgMembership;
      return next();
    }

    next();
  } catch (error) {
    console.error('[Tenant Middleware Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify tenant authorization',
      error: error.message,
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({
        success: false,
        message: 'No role determined for this tenant context',
      });
    }

    if (req.userRole === 'org_admin') {
      return next();
    }

    if (allowedRoles.includes(req.userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.userRole}'.`,
    });
  };
};

module.exports = {
  resolveTenantAccess,
  requireRole,
};
