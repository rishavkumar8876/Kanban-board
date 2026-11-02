const { verifyToken } = require('../utils/token');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Tenant = require('../models/Tenant');

const tenantPresence = new Map();

const initializeSockets = (io) => {

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication failed: Missing token'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication failed: User not found'));
      }

      socket.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      next(new Error('Authentication failed: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    socket.on('join:tenant', async ({ tenantId, organizationId }, callback) => {
      try {
        if (!tenantId) {
          if (callback) callback({ success: false, message: 'tenantId is required' });
          return;
        }

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
          if (callback) callback({ success: false, message: 'Tenant not found' });
          return;
        }

        const isOrgAdmin = await Membership.findOne({
          userId: user._id,
          organizationId: tenant.organizationId,
          role: 'org_admin',
          status: 'active',
        });

        const isTenantMember = await Membership.findOne({
          userId: user._id,
          organizationId: tenant.organizationId,
          tenantId: tenant._id,
          status: 'active',
        });

        if (!isOrgAdmin && !isTenantMember) {
          if (callback) callback({ success: false, message: 'Access denied: Not a member of this tenant' });
          return;
        }

        if (socket.currentTenantId && socket.currentTenantId !== tenantId) {
          leaveTenantPresence(socket, socket.currentTenantId, io);
          socket.leave(`tenant:${socket.currentTenantId}`);
        }

        const roomName = `tenant:${tenantId}`;
        socket.join(roomName);
        socket.currentTenantId = tenantId;

        joinTenantPresence(tenantId, user, socket.id);

        broadcastPresence(tenantId, io);

        if (callback) {
          callback({
            success: true,
            onlineUsers: getOnlineUsers(tenantId),
          });
        }
      } catch (err) {
        console.error('[Socket Join Error]', err);
        if (callback) callback({ success: false, message: 'Failed to join tenant room' });
      }
    });

    socket.on('leave:tenant', ({ tenantId }) => {
      if (tenantId) {
        leaveTenantPresence(socket, tenantId, io);
        socket.leave(`tenant:${tenantId}`);
        if (socket.currentTenantId === tenantId) {
          socket.currentTenantId = null;
        }
      }
    });

    socket.on('disconnect', () => {
      if (socket.currentTenantId) {
        leaveTenantPresence(socket, socket.currentTenantId, io);
      }
    });
  });
};

function joinTenantPresence(tenantId, user, socketId) {
  if (!tenantPresence.has(tenantId)) {
    tenantPresence.set(tenantId, new Map());
  }
  const tenantUsers = tenantPresence.get(tenantId);
  if (tenantUsers.has(user._id)) {
    const existing = tenantUsers.get(user._id);
    existing.socketCount += 1;
    existing.socketIds.add(socketId);
  } else {
    tenantUsers.set(user._id, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      socketCount: 1,
      socketIds: new Set([socketId]),
      joinedAt: new Date(),
    });
  }
}

function leaveTenantPresence(socket, tenantId, io) {
  const tenantUsers = tenantPresence.get(tenantId);
  if (!tenantUsers) return;

  const userEntry = tenantUsers.get(socket.user._id);
  if (userEntry) {
    userEntry.socketIds.delete(socket.id);
    userEntry.socketCount -= 1;
    if (userEntry.socketCount <= 0) {
      tenantUsers.delete(socket.user._id);
    }
  }

  if (tenantUsers.size === 0) {
    tenantPresence.delete(tenantId);
  }

  broadcastPresence(tenantId, io);
}

function getOnlineUsers(tenantId) {
  const tenantUsers = tenantPresence.get(tenantId);
  if (!tenantUsers) return [];
  return Array.from(tenantUsers.values()).map((entry) => entry.user);
}

function broadcastPresence(tenantId, io) {
  const users = getOnlineUsers(tenantId);
  io.to(`tenant:${tenantId}`).emit('presence:update', {
    tenantId,
    onlineUsers: users,
    count: users.length,
  });
}

module.exports = {
  initializeSockets,
  getOnlineUsers,
};
