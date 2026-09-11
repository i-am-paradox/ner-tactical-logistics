import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Truck,
  AlertTriangle,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { PageShell } from '../../components/layout/PageShell';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { analyticsService } from '../../services/domainServices';

export function Analytics() {
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getAnalyticsData()
  });

  const summary = analyticsRes?.summary || {
    totalShipments: 45,
    inTransitShipments: 6,
    deliveredShipments: 38,
    successRate: 94.6,
    totalIncidents: 12,
    resolvedIncidents: 8,
    highRiskSegments: 3,
    avgResponseTimeMin: 38
  };

  const charts = analyticsRes?.charts || {
    monthlyTrends: [
      { month: 'Apr 2026', incidents: 8, clearedRate: 92, avgRainfallMm: 65 },
      { month: 'May 2026', incidents: 14, clearedRate: 88, avgRainfallMm: 110 },
      { month: 'Jun 2026', incidents: 29, clearedRate: 79, avgRainfallMm: 240 },
      { month: 'Jul 2026', incidents: 38, clearedRate: 74, avgRainfallMm: 380 },
      { month: 'Aug 2026', incidents: 31, clearedRate: 81, avgRainfallMm: 290 },
      { month: 'Sep 2026', incidents: 18, clearedRate: 89, avgRainfallMm: 145 }
    ],
    districtHotspots: [
      { district: 'East Khasi Hills', count: 5, severity: 4.2 },
      { district: 'Papum Pare', count: 4, severity: 3.8 },
      { district: 'Tawang', count: 3, severity: 3.5 },
      { district: 'Cachar', count: 2, severity: 3.0 }
    ],
    cargoDistribution: [
      { cargo: 'Medicines', count: 18 },
      { cargo: 'Food Supplies', count: 14 },
      { cargo: 'Heavy Equipment', count: 8 },
      { cargo: 'Agricultural Produce', count: 5 }
    ]
  };

  const aiInsights = analyticsRes?.aiInsights || [
    'Convoys routed via East Khasi Hills experience a 38% higher delay probability during sustained rainfall >40mm; recommend activating pre-emptive staging depots.',
    'Delivery success rate maintained at 94.6% across 45 shipments through automated dynamic rerouting around 4 high-risk landslide sectors.',
    'Incident resolution time dropped by 24 minutes when field agents submitted multimodal photo telemetry with instant AI slope severity classification.'
  ];

  const COLORS = ['#0284c7', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <PageShell
      title="Regional Logistics Intelligence & Analytics"
      subtitle="Historical disruption trends, corridor reliability scores, and Gemini AI strategic insight synthesis"
      breadcrumbs={['Dashboard', 'Analytics & Insights']}
      actionSlot={
        <Button variant="outline" size="sm" icon={Download}>
          Export Intel Dossier (PDF/CSV)
        </Button>
      }
    >
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consignment Delivery Rate"
          value={`${summary.successRate}%`}
          subtitle={`${summary.deliveredShipments} / ${summary.totalShipments} missions successful`}
          icon={ShieldCheck}
          variant="safe"
        />
        <StatCard
          title="Mean Road Clearance Time"
          value={`${summary.avgResponseTimeMin} min`}
          subtitle="BRO Heavy Earthmover response"
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Monsoon Hazard Incidents"
          value={summary.totalIncidents}
          subtitle={`${summary.resolvedIncidents} cleared & reopened`}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="High-Risk Bottlenecks"
          value={summary.highRiskSegments}
          subtitle="Active watch on NH-6 & NH-13"
          icon={Layers}
          variant="danger"
        />
      </div>

      {/* Gemini AI Strategic Operational Insights */}
      <Card
        className="border-sky-500/40 bg-gradient-to-br from-slate-900 via-sky-950/30 to-slate-900"
        header={
          <span className="flex items-center gap-2 text-sky-300">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Gemini Strategic Intelligence Synthesis (Grounded in Ground Data)
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">
                STRATEGIC FINDING #{idx + 1}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{insight}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Disruption Trend (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card header="Monsoon Precipitation (mm) vs Hazard Disruption Trends">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyTrends}>
                  <defs>
                    <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#334155', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="avgRainfallMm" stroke="#0284c7" fillOpacity={1} fill="url(#rainGrad)" name="Rainfall (mm)" />
                  <Area type="monotone" dataKey="incidents" stroke="#ef4444" fillOpacity={1} fill="url(#incGrad)" name="Disruptions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Cargo Type Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card header="Consignment Cargo Distribution">
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.cargoDistribution}
                    dataKey="count"
                    nameKey="cargo"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {charts.cargoDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0d1527', borderColor: '#334155', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
