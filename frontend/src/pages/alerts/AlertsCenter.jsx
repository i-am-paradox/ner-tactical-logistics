import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Radio,
  Send,
  AlertTriangle,
  Globe,
  Smartphone,
  CheckCircle2,
  Volume2,
  Shield,
  Plus
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { alertService, districtService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../features/useAuthStore';

export function AlertsCenter() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [scope, setScope] = useState('corridor');
  const [selectedChannels, setSelectedChannels] = useState(['in_app', 'sms', 'push']);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const { data: alertsData } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAlerts()
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const alerts = alertsData?.data || [];
  const districts = districtsData?.data || [];

  const broadcastMutation = useMutation({
    mutationFn: (data) => alertService.broadcastAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setBroadcastSuccess(true);
      setTimeout(() => {
        setBroadcastSuccess(false);
        setModalOpen(false);
        setTitle('');
        setMessage('');
      }, 2000);
    }
  });

  const handleBroadcast = (e) => {
    e.preventDefault();
    broadcastMutation.mutate({
      title,
      message,
      severity,
      scope,
      channels: selectedChannels,
      affectedDistricts: ['East Khasi Hills', 'Cachar', 'Papum Pare']
    });
  };

  const toggleChannel = (ch) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter(c => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  return (
    <PageShell
      title="Alerts & Notification Broadcast Center"
      subtitle="Multi-channel emergency dispatches across Push, SMS, and In-App with Gemini automated regional translations"
      breadcrumbs={['Dashboard', 'Alerts & Broadcasts']}
      actionSlot={
        <Button variant="danger" size="sm" onClick={() => setModalOpen(true)} icon={Radio}>
          Issue Emergency Broadcast
        </Button>
      }
    >
      <div className="space-y-4">
        {alerts.map((alt) => (
          <div
            key={alt.alertId}
            className={`tactical-glass p-5 rounded-2xl border transition-all space-y-3 ${
              alt.severity === 'critical'
                ? 'border-red-900/80 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : alt.severity === 'warning'
                ? 'border-amber-900/60 bg-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={alt.severity === 'critical' ? 'danger' : alt.severity === 'warning' ? 'warning' : 'safe'} size="md">
                  {alt.severity} Alert
                </Badge>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {alt.alertId} • Scope: {alt.scope?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{formatDate(alt.createdAt || alt.broadcastAt)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-100 mb-1">{alt.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{alt.message}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Dispatched Channels:</span>
                {alt.channels?.map((ch) => (
                  <span key={ch} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-sky-400 uppercase">
                    {ch}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-slate-400">
                Issued By: <b className="text-slate-200">{alt.broadcastBy || 'NER Command'}</b>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tactical Emergency Broadcast"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Alert Severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              options={[
                { value: 'critical', label: 'CRITICAL (Red Alert)' },
                { value: 'warning', label: 'WARNING (Caution)' },
                { value: 'info', label: 'INFORMATIONAL' }
              ]}
            />

            <Select
              label="Broadcast Scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              options={[
                { value: 'all', label: 'All 8 NER States' },
                { value: 'corridor', label: 'Active Mountain Corridors' },
                { value: 'district', label: 'Selected Districts' },
                { value: 'convoys_only', label: 'In-Transit Convoys Only' }
              ]}
            />
          </div>

          <Input
            label="Alert Headline"
            placeholder="e.g. RED ALERT: NH-6 Sonapur Sector Impassable"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Broadcast Advisory Message
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter mandatory advisory, instructions for active convoys, and emergency detour routes..."
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Dispatch Channels
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'in_app', label: 'In-App Telemetry' },
                { id: 'sms', label: 'Emergency SMS' },
                { id: 'push', label: 'Mobile Push' }
              ].map((ch) => (
                <button
                  type="button"
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                    selectedChannels.includes(ch.id)
                      ? 'bg-sky-950 text-sky-300 border-sky-500'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Broadcast transmitted across tactical network!
            </div>
          )}

          <Button
            type="submit"
            variant="danger"
            size="lg"
            loading={broadcastMutation.isPending}
            className="w-full"
            icon={Send}
          >
            Dispatch Multi-Channel Broadcast
          </Button>
        </form>
      </Modal>
    </PageShell>
  );
}
