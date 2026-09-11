import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to NER Tactical Server:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });
  }
  return socketInstance;
}

export function subscribeToLiveVehicles(queryClient) {
  const socket = getSocket();

  const handleLocationUpdate = (updatedVehicle) => {
    // Patch React Query cache directly for 'vehicles' key
    queryClient.setQueryData(['vehicles'], (oldData) => {
      if (!oldData || !oldData.data) return oldData;
      const updatedList = oldData.data.map((v) => {
        if (v.vehicleId === updatedVehicle.vehicleId) {
          return { ...v, ...updatedVehicle };
        }
        return v;
      });
      return { ...oldData, data: updatedList };
    });

    // Patch single vehicle query if active
    queryClient.setQueryData(['vehicle', updatedVehicle.vehicleId], (oldSingle) => {
      if (!oldSingle || !oldSingle.data) return oldSingle;
      return {
        ...oldSingle,
        data: { ...oldSingle.data, ...updatedVehicle }
      };
    });
  };

  const handleAlert = (newAlert) => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleIncident = (newIncident) => {
    queryClient.invalidateQueries({ queryKey: ['incidents'] });
  };

  socket.on('vehicle:location_update', handleLocationUpdate);
  socket.on('alert:broadcast', handleAlert);
  socket.on('incident:new', handleIncident);

  return () => {
    socket.off('vehicle:location_update', handleLocationUpdate);
    socket.off('alert:broadcast', handleAlert);
    socket.off('incident:new', handleIncident);
  };
}
