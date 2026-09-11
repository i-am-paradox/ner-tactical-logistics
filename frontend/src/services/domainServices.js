import api from './api';

export const vehicleService = {
  async getVehicles(params = {}) {
    const res = await api.get('/vehicles', { params });
    return res.data;
  },
  async getVehicleById(id) {
    const res = await api.get(`/vehicles/${id}`);
    return res.data;
  }
};

export const roadService = {
  async getRoads(params = {}) {
    const res = await api.get('/roads', { params });
    return res.data;
  },
  async getRoadById(id) {
    const res = await api.get(`/roads/${id}`);
    return res.data;
  },
  async updateRoadStatus(id, data) {
    const res = await api.patch(`/roads/${id}/status`, data);
    return res.data;
  }
};

export const shipmentService = {
  async getShipments(params = {}) {
    const res = await api.get('/shipments', { params });
    return res.data;
  },
  async getShipmentById(id) {
    const res = await api.get(`/shipments/${id}`);
    return res.data;
  },
  async createShipment(data) {
    const res = await api.post('/shipments', data);
    return res.data;
  },
  async rerouteShipment(id, data) {
    const res = await api.post(`/shipments/${id}/reroute`, data);
    return res.data;
  }
};

export const routeService = {
  async generateRoutes(originDistrictId, destinationDistrictId) {
    const res = await api.post('/routes/generate', { originDistrictId, destinationDistrictId });
    return res.data;
  },
  async saveRoute(routeData) {
    const res = await api.post('/routes/save', routeData);
    return res.data;
  },
  async getSavedRoutes() {
    const res = await api.get('/routes');
    return res.data;
  }
};

export const incidentService = {
  async getIncidents(params = {}) {
    const res = await api.get('/incidents', { params });
    return res.data;
  },
  async getIncidentById(id) {
    const res = await api.get(`/incidents/${id}`);
    return res.data;
  },
  async submitIncident(data) {
    const res = await api.post('/incidents', data);
    return res.data;
  },
  async updateStatus(id, statusData) {
    const res = await api.patch(`/incidents/${id}/status`, statusData);
    return res.data;
  },
  async translateIncident(id, targetLang) {
    const res = await api.post(`/incidents/${id}/translate`, { targetLang });
    return res.data;
  }
};

export const alertService = {
  async getAlerts(params = {}) {
    const res = await api.get('/alerts', { params });
    return res.data;
  },
  async getAlertById(id) {
    const res = await api.get(`/alerts/${id}`);
    return res.data;
  },
  async broadcastAlert(data) {
    const res = await api.post('/alerts/broadcast', data);
    return res.data;
  }
};

export const districtService = {
  async getDistricts(params = {}) {
    const res = await api.get('/districts', { params });
    return res.data;
  },
  async getDistrictById(id) {
    const res = await api.get(`/districts/${id}`);
    return res.data;
  }
};

export const emergencyService = {
  async getEmergencyStatus() {
    const res = await api.get('/emergency/status');
    return res.data;
  },
  async toggleEmergencyMode(data) {
    const res = await api.post('/emergency/toggle', data);
    return res.data;
  },
  async generateSitRep() {
    const res = await api.post('/emergency/sitrep');
    return res.data;
  }
};

export const analyticsService = {
  async getAnalyticsData() {
    const res = await api.get('/analytics');
    return res.data;
  }
};

export const importService = {
  async uploadDataset(formData) {
    const res = await api.post('/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000
    });
    return res.data;
  },
  async commitImport(auditId) {
    const res = await api.post(`/import/commit/${auditId}`);
    return res.data;
  },
  async getImportHistory() {
    const res = await api.get('/import/history');
    return res.data;
  },
  async getImportById(id) {
    const res = await api.get(`/import/${id}`);
    return res.data;
  }
};
