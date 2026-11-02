import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Users,
  Laptop as LaptopIcon,
  Clock,
  CheckCircle,
  AlertOctagon,
  ShieldCheck,
  DoorOpen,
  ArrowRightCircle,
  ArrowLeftCircle,
  RefreshCw,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="text-sm">Loading Hawassa University security metrics...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Registered Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => onNavigate('students')
    },
    {
      label: 'Registered Laptops',
      value: stats.totalLaptops,
      icon: LaptopIcon,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      action: () => onNavigate('laptops')
    },
    {
      label: 'Pending Requests',
      value: stats.pendingRegistrations,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => onNavigate('registrations')
    },
    {
      label: 'Approved Registrations',
      value: stats.approvedRegistrations,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      action: () => onNavigate('laptops')
    },
    {
      label: 'Active Stolen / Lost',
      value: stats.activeLostReports,
      icon: AlertOctagon,
      color: 'text-red-600',
      bg: 'bg-red-50',
      action: () => onNavigate('lost-reports')
    },
    {
      label: 'Campus Gates',
      value: stats.totalCampusGates,
      icon: DoorOpen,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      action: () => onNavigate('movements')
    },
    {
      label: "Today's Campus IN",
      value: stats.todayInMovements,
      icon: ArrowRightCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      action: () => onNavigate('movements')
    },
    {
      label: "Today's Campus OUT",
      value: stats.todayOutMovements,
      icon: ArrowLeftCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      action: () => onNavigate('movements')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Security Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hawassa University Automated Laptop Registration & Gate Access Control System
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('architecture')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Spring Boot & DB Specs
          </button>
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#142B4A] hover:bg-[#1a3860] rounded-lg shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.action}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 truncate">
                  {kpi.label}
                </span>
                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Gate Verifications & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Gate Verifications */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Gate Verifications
              </h3>
            </div>
            <button
              onClick={() => onNavigate('movements')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentEvents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent gate verification events</p>
            ) : (
              stats.recentEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{evt.pcId}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700">{evt.studentName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{evt.gateName}</span>
                      <span>·</span>
                      <span>Officer: {evt.officerName}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        evt.movementType === 'IN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.movementType}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Audit Trail */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Security Audit Log
              </h3>
            </div>
            <button
              onClick={() => onNavigate('audit-logs')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Full Audit Trail
            </button>
          </div>

          <div className="space-y-2.5">
            {stats.recentAudits.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-800">{log.action}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{log.details}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Actor: {log.actorName} ({log.actorRole})</span>
                  <span>·</span>
                  <span className="font-mono">{log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribution by Department and Brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Laptop Distribution by Department
          </h3>
          <div className="space-y-2">
            {stats.departmentDistribution.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-mono text-slate-900 font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.totalLaptops)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Hardware Manufacturer Distribution
          </h3>
          <div className="space-y-2">
            {stats.brandDistribution.map((item: any) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="font-mono text-slate-900 font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.totalLaptops)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
