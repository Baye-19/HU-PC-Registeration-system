import React, { useState } from 'react';
import { User, SecurityAlert } from '../types';
import { Menu, ArrowLeft, Bell, ShieldAlert, Check } from 'lucide-react';

interface HeaderBarProps {
  currentUser: User;
  activeTab: string;
  onNavigateBack?: () => void;
  canNavigateBack: boolean;
  onToggleMobileMenu: () => void;
  alerts: SecurityAlert[];
  onAcknowledgeAlert?: (id: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentUser,
  activeTab,
  onNavigateBack,
  canNavigateBack,
  onToggleMobileMenu,
  alerts,
  onAcknowledgeAlert
}) => {
  const [alertsOpen, setAlertsOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.active);
  const unreadAlertsCount = activeAlerts.length;

  const tabTitles: Record<string, string> = {
    dashboard: 'Security Overview',
    students: 'Student Management & PC Registry',
    laptops: 'Registered Hardware Catalog',
    registrations: 'Pending Registration Applications',
    'register-assisted': 'In-Person Laptop Registration',
    movements: 'Perimeter Gate Movement Logs',
    'lost-reports': 'Missing & Stolen Device Incidents',
    'audit-logs': 'Immutable Security Audit Trail',
    architecture: 'Spring Boot & Database Specifications',
    'my-laptops': 'My Registered Laptops',
    'register-laptop': 'Submit Laptop Registration',
    'report-lost': 'Report Missing Device',
    'gate-scan': 'Optical Gate Verification Scanner',
    'gate-history': 'Station Movement History',
    'gate-alerts': 'Real-Time Perimeter Security Alerts'
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile hamburger + Back Button + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Back Button */}
        {canNavigateBack && onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0B2A63] bg-blue-50/80 hover:bg-blue-100/80 rounded-lg border border-blue-200 transition-colors shadow-2xs shrink-0"
            title="Navigate Back to Previous Screen"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0B2A63]" />
            <span className="hidden xs:inline">Back</span>
          </button>
        )}

        {/* Active View Title */}
        <div className="border-l border-slate-200 pl-2 sm:pl-3 min-w-0">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block leading-none truncate">
            Hawassa CampusGuard
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-tight mt-0.5 truncate max-w-[120px] xs:max-w-[190px] sm:max-w-md">
            {tabTitles[activeTab] || 'Security Management'}
          </h2>
        </div>
      </div>

      {/* Right: Real-time alerts notification bell + Station Tag */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <span className="hidden sm:inline-block text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          Hawassa Main Campus
        </span>

        {/* Real-time Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Perimeter Security Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC2626] text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {alertsOpen && (
            <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900 overflow-hidden z-50">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#0B2A63]">
                  <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                  <span>Real-Time Security Broadcasts</span>
                </div>
                <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                  {activeAlerts.length} Active
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active alerts. All campus perimeter gates normal.
                  </div>
                ) : (
                  activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#DC2626]">
                        <span className="truncate">{alert.title}</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{alert.message}</p>
                      {onAcknowledgeAlert && currentUser.role !== 'STUDENT' && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="text-[10px] text-[#0284C7] hover:text-[#0369A1] font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Acknowledge
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
