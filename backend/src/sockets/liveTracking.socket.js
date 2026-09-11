let ioInstance = null;

function initializeSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Tactical client connected: ${socket.id}`);

    socket.on('join_room', (room) => {
      socket.join(room);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  return ioInstance;
}

function broadcastVehicleUpdate(vehicleData) {
  if (ioInstance) {
    ioInstance.emit('vehicle:location_update', vehicleData);
    ioInstance.to(`vehicle:${vehicleData.vehicleId}`).emit('vehicle:telemetry_tick', vehicleData);
  }
}

function broadcastAlert(alertData) {
  if (ioInstance) {
    ioInstance.emit('alert:broadcast', alertData);
  }
}

function broadcastIncident(incidentData) {
  if (ioInstance) {
    ioInstance.emit('incident:new', incidentData);
  }
}

module.exports = {
  initializeSocket,
  getIO,
  broadcastVehicleUpdate,
  broadcastAlert,
  broadcastIncident
};
