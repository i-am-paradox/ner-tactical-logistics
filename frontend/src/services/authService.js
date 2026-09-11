import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  async demoLogin(role) {
    const res = await api.post('/auth/demo-login', { role });
    return res.data;
  },
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  }
};
