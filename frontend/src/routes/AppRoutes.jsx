import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';

import { Landing } from '../pages/public/Landing';
import { Login } from '../pages/public/Login';
import { Overview } from '../pages/dashboard/Overview';
import { LiveMap } from '../pages/map/LiveMap';
import { VehicleDetail } from '../pages/map/VehicleDetail';
import { RoutePlanner } from '../pages/routes/RoutePlanner';
import { ReportIncident } from '../pages/incidents/ReportIncident';
import { IncidentList } from '../pages/incidents/IncidentList';
import { IncidentDetail } from '../pages/incidents/IncidentDetail';
import { AlertsCenter } from '../pages/alerts/AlertsCenter';
import { Analytics } from '../pages/analytics/Analytics';
import { DistrictDirectory } from '../pages/districts/DistrictDirectory';
import { DistrictDetail } from '../pages/districts/DistrictDetail';
import { ShipmentList } from '../pages/shipments/ShipmentList';
import { ShipmentDetail } from '../pages/shipments/ShipmentDetail';
import { EmergencyMode } from '../pages/emergency/EmergencyMode';
import { ImportData } from '../pages/import/ImportData';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Tactical Pages */}
      <Route path="/dashboard" element={<RequireAuth><Overview /></RequireAuth>} />
      <Route path="/map" element={<RequireAuth><LiveMap /></RequireAuth>} />
      <Route path="/map/vehicle/:id" element={<RequireAuth><VehicleDetail /></RequireAuth>} />
      <Route path="/routes/planner" element={<RequireAuth><RoutePlanner /></RequireAuth>} />
      <Route path="/incidents/new" element={<RequireAuth><ReportIncident /></RequireAuth>} />
      <Route path="/incidents" element={<RequireAuth><IncidentList /></RequireAuth>} />
      <Route path="/incidents/:id" element={<RequireAuth><IncidentDetail /></RequireAuth>} />
      <Route path="/alerts" element={<RequireAuth><AlertsCenter /></RequireAuth>} />
      <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
      <Route path="/districts" element={<RequireAuth><DistrictDirectory /></RequireAuth>} />
      <Route path="/districts/:id" element={<RequireAuth><DistrictDetail /></RequireAuth>} />
      <Route path="/shipments" element={<RequireAuth><ShipmentList /></RequireAuth>} />
      <Route path="/shipments/:id" element={<RequireAuth><ShipmentDetail /></RequireAuth>} />
      <Route path="/emergency" element={<RequireAuth><EmergencyMode /></RequireAuth>} />
      <Route path="/import-data" element={<RequireAuth><ImportData /></RequireAuth>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
