import { create } from 'zustand';
import { authService } from '../services/authService';

function getInitialUser() {
  try {
    const stored = localStorage.getItem('ner_user');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn('Failed to parse stored user:', e);
  }
  return {
    name: 'Commandant R. K. Sharma',
    email: 'admin@nerlogistics.gov.in',
    role: 'admin',
    districtId: 'AS-KAM',
    districtName: 'Kamrup Metropolitan',
    preferredLanguage: 'en',
    department: 'NER Inter-Agency Logistics Command'
  };
}

const initialLang = localStorage.getItem('ner_lang') || 'en';
const initialToken = localStorage.getItem('ner_token') || 'demo_tactical_jwt_token_2026';

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: initialToken,
  language: initialLang,
  isAuthenticated: true, // Default authenticated demo mode

  setLanguage: (lang) => {
    localStorage.setItem('ner_lang', lang);
    set((state) => ({
      language: lang,
      user: state.user ? { ...state.user, preferredLanguage: lang } : null
    }));
  },

  login: async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('ner_token', data.token);
    localStorage.setItem('ner_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isAuthenticated: true, language: data.user.preferredLanguage || 'en' });
    return data;
  },

  switchRole: async (role) => {
    try {
      const data = await authService.demoLogin(role);
      localStorage.setItem('ner_token', data.token);
      localStorage.setItem('ner_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true });
    } catch (err) {
      // Fallback local role switch
      const roleProfiles = {
        admin: { name: 'Commandant R. K. Sharma', email: 'admin@nerlogistics.gov.in', role: 'admin', department: 'NERHQ Inter-Agency Command' },
        district_officer: { name: 'District Officer P. Sangma', email: 'officer@nerlogistics.gov.in', role: 'district_officer', department: 'Meghalaya Disaster Authority' },
        field_agent: { name: 'Field Agent J. Lyngdoh', email: 'agent@nerlogistics.gov.in', role: 'field_agent', department: 'Rapid Road Assessment Cell' },
        driver: { name: 'Convoy Lead Bikash Borah', email: 'driver@nerlogistics.gov.in', role: 'driver', department: 'Emergency Fleet Division' }
      };
      const profile = roleProfiles[role] || roleProfiles.admin;
      const updatedUser = { ...get().user, ...profile, role };
      localStorage.setItem('ner_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  logout: () => {
    localStorage.removeItem('ner_token');
    localStorage.removeItem('ner_user');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
