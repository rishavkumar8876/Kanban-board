import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;
export const getSocketId = () => (socket && socket.connected ? socket.id : null);

export const connectSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_SERVER_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server, ID:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket Connection Error]:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinTenantRoom = (tenantId, organizationId) => {
  if (!socket || !socket.connected) return;
  socket.emit('join:tenant', { tenantId, organizationId }, (response) => {
    if (response && response.success) {
      console.log(`[Socket] Joined tenant room: ${tenantId}`);
    } else {
      console.warn('[Socket] Could not join tenant room:', response?.message);
    }
  });
};

export const leaveTenantRoom = (tenantId) => {
  if (!socket || !socket.connected) return;
  socket.emit('leave:tenant', { tenantId });
};
