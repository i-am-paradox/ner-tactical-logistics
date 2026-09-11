import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  audioAlertsEnabled: true,
  activeFilter: 'all',
  
  // Map Layer Controls
  mapLayers: {
    terrain3D: true,
    roadRisk: true,
    landslideZones: true,
    weatherOverlay: false,
    activeConvoys: true,
    checkpoints: true
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleAudioAlerts: () => set((state) => ({ audioAlertsEnabled: !state.audioAlertsEnabled })),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  
  toggleMapLayer: (layerKey) => set((state) => ({
    mapLayers: {
      ...state.mapLayers,
      [layerKey]: !state.mapLayers[layerKey]
    }
  }))
}));
