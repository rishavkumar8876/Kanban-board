let ioInstance = null;

const setSocketIO = (io) => {
  ioInstance = io;
};

const getSocketIO = () => {
  return ioInstance;
};

const emitToTenant = (tenantId, event, payload, excludeSocketId = null) => {
  if (!ioInstance) return;
  const roomName = `tenant:${tenantId.toString()}`;
  if (excludeSocketId) {
    ioInstance.to(roomName).except(excludeSocketId).emit(event, payload);
  } else {
    ioInstance.to(roomName).emit(event, payload);
  }
};

module.exports = {
  setSocketIO,
  getSocketIO,
  emitToTenant,
};
