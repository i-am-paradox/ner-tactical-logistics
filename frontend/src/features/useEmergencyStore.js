import { create } from 'zustand';
import { emergencyService } from '../services/domainServices';

export const useEmergencyStore = create((set, get) => ({
  isEmergencyActive: true,
  emergencyTitle: 'STATE 1 MONSOON CRISIS: NH-6 & SELA CORRIDOR DEGRADATION',
  operationalSummary: 'Emergency green corridors enforced across Assam-Meghalaya and Arunachal trunk routes. Priority clearance given to medical oxygen and life-saving pediatric consignments.',
  sitRep: '',
  loadingSitRep: false,

  setEmergencyActive: (active) => set({ isEmergencyActive: active }),

  toggleEmergency: async (active, title, summary) => {
    try {
      const data = await emergencyService.toggleEmergencyMode({ active, title, summary });
      if (data.emergencyState) {
        set({
          isEmergencyActive: data.emergencyState.isActive,
          emergencyTitle: data.emergencyState.title,
          operationalSummary: data.emergencyState.operationalSummary
        });
      }
    } catch (err) {
      set({ isEmergencyActive: active });
    }
  },

  fetchSitRep: async () => {
    set({ loadingSitRep: true });
    try {
      const data = await emergencyService.generateSitRep();
      set({ sitRep: data.sitRep, loadingSitRep: false });
    } catch (err) {
      set({ loadingSitRep: false });
    }
  }
}));
