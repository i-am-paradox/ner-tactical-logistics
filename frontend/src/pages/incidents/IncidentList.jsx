import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input, Select } from '../../components/ui/Input';
import { incidentService, districtService } from '../../services/domainServices';
import { formatDate } from '../../utils/formatters';

export function IncidentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [translations, setTranslations] = useState({});
  const [translatingId, setTranslatingId] = useState(null);

  const { data: incidentsData, refetch } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentService.getIncidents()
  });

  const { data: districtsData } = useQuery({
    queryKey: ['districts'],
    queryFn: () => districtService.getDistricts()
  });

  const incidents = incidentsData?.data || [];
  const districts = districtsData?.data || [];

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title?.toLowerCase().includes(search.toLowerCase()) ||
      inc.districtName?.toLowerCase().includes(search.toLowerCase()) ||
      inc.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || inc.severity === Number(severityFilter);
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Multilingual translation toggle using Gemini API
  const handleTranslate = async (e, inc, targetLang = 'hi') => {
    e.stopPropagation();
    const id = inc.clientUuid || inc._id;
    if (translations[id]) {
      // Toggle back to original
      const updated = { ...translations };
      delete updated[id];
      setTranslations(updated);
      return;
    }

    setTranslatingId(id);
    try {
      const res = await incidentService.translateIncident(id, targetLang);
      setTranslations((prev) => ({
        ...prev,
        [id]: res.translatedText
      }));
    } catch (err) {
      console.warn('Translation error:', err);
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <PageShell
      title="Field Incident Matrix & Hazard Registry"
      subtitle="Multimodal ground intelligence, BRO clearance status, and Gemini multilingual translations"
      breadcrumbs={['Dashboard', 'Incidents']}
      actionSlot={
        <Button variant="danger" size="sm" onClick={() => navigate('/incidents/new')} icon={Plus}>
          Submit Field Incident
        </Button>
      }
    >
      {/* Search & Filter Controls */}
      <Card className="p-4 border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              placeholder="Search by hazard title, district, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Severity Levels' },
                { value: '5', label: 'Level 5 (Emergency Crisis)' },
                { value: '4', label: 'Level 4 (Major Impasse)' },
                { value: '3', label: 'Level 3 (Moderate)' },
                { value: '2', label: 'Level 2 (Minor)' }
              ]}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'reported', label: 'Reported' },
                { value: 'verified', label: 'Verified by EOC' },
                { value: 'crew_dispatched', label: 'Road Crew Dispatched' },
                { value: 'resolved', label: 'Cleared & Resolved' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Incident List */}
      <div className="space-y-4">
        {filteredIncidents.map((inc) => {
          const id = inc.clientUuid || inc._id;
          const isTranslated = Boolean(translations[id]);

          return (
            <div
              key={id}
              onClick={() => navigate(`/incidents/${id}`)}
              className={`tactical-glass p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                inc.severity >= 4
                  ? 'border-red-900/60 hover:border-red-500/80 bg-red-950/20'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={inc.severity >= 4 ? 'danger' : inc.severity === 3 ? 'warning' : 'safe'} size="md">
                    Level {inc.severity} • {inc.incidentType?.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {inc.districtName} ({inc.clientUuid})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">{formatDate(inc.capturedAt)}</span>
                  <Badge variant={inc.status === 'resolved' ? 'safe' : 'warning'} size="sm">
                    {inc.status?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-100 mb-1">
                  {isTranslated ? translations[id].split('.')[0] : inc.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {isTranslated ? translations[id] : inc.description}
                </p>
              </div>

              {inc.aiClassification?.shortDescription && (
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <b className="text-sky-400">Gemini AI Finding:</b> {inc.aiClassification.shortDescription}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-slate-400 text-[11px]">
                  Reporter: <b className="text-slate-200">{inc.reporterName}</b>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={translatingId === id}
                    onClick={(e) => handleTranslate(e, inc, 'hi')}
                    icon={Globe}
                  >
                    {isTranslated ? 'View Original (EN)' : 'Translate (हिन्दी)'}
                  </Button>
                  <Button variant="ghost" size="sm" icon={ChevronRight}>
                    Inspect Report
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
