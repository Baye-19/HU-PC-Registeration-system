import React, { useState } from 'react';
import { User, Role, SecurityAlert } from '../types';
import { Bell, LogOut, ChevronDown, Check, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSwitchRole: (role: Role) => void;
  onLogout: () => void;
  alerts: SecurityAlert[];
  onAcknowledgeAlert?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onSwitchRole,
  onLogout,
  alerts,
  onAcknowledgeAlert
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const activeAlerts = alerts.filter(a => a.active);
  const unreadAlertsCount = activeAlerts.length;

  const roleLabels: Record<Role, string> = {
    ADMIN: 'System Admin',
    OFFICER: 'Security Officer',
    STUDENT: 'Student',
    GATE_OFFICER: 'Gate Officer'
  };

  // Nav links based on current role (1-2 word single-line labels)
  const getNavLinks = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Overview' },
          { id: 'students', label: 'Students' },
          { id: 'laptops', label: 'Laptops' },
          { id: 'movements', label: 'Movements' },
          { id: 'lost-reports', label: 'Incidents' },
          { id: 'audit-logs', label: 'Audits' },
          { id: 'architecture', label: 'Spring Boot Architecture' }
        ];
      case 'OFFICER':
        return [
          { id: 'dashboard', label: 'Desk' },
          { id: 'registrations', label: 'Reviews' },
          { id: 'register-assisted', label: 'New Register' },
          { id: 'laptops', label: 'Directory' },
          { id: 'lost-reports', label: 'Incidents' },
          { id: 'audit-logs', label: 'Audit Trail' }
        ];
      case 'STUDENT':
        return [
          { id: 'dashboard', label: 'Portal' },
          { id: 'my-laptops', label: 'My Laptops' },
          { id: 'register-laptop', label: 'Register Device' },
          { id: 'report-lost', label: 'Report Lost' }
        ];
      case 'GATE_OFFICER':
        return [
          { id: 'gate-scan', label: 'Scan Terminal' },
          { id: 'gate-history', label: 'Gate Logs' },
          { id: 'gate-alerts', label: 'Alerts' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-[#142B4A] text-white border-b border-slate-700/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single line, display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-xs border border-blue-400">
              CG
            </div>
            <div className="whitespace-nowrap">
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                CampusGuard
              </span>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-mono">
                Hawassa University
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (1-2 word single-line labels with hover underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive
                    ? 'text-white border-b-2 border-blue-400 font-bold'
                    : 'hover:text-white hover:border-b-2 hover:border-slate-400'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Real-time Alerts Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="relative p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Security Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Panel */}
            {alertsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900 overflow-hidden z-50">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Real-Time Security Broadcasts</span>
                  </div>
                  <span className="text-[10px] font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                    {activeAlerts.length} Active
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {activeAlerts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No active alerts. All campus gates normal.
                    </div>
                  ) : (
                    activeAlerts.map(alert => (
                      <div key={alert.id} className="p-3 hover:bg-slate-50 transition-colors text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-red-700">
                          <span className="truncate">{alert.title}</span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-snug">{alert.message}</p>
                        {onAcknowledgeAlert && currentUser?.role !== 'STUDENT' && (
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => onAcknowledgeAlert(alert.id)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
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

          {/* Sandbox Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
            >
              <span className="truncate max-w-[130px]">
                {currentUser ? roleLabels[currentUser.role] : 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-800">{currentUser?.fullName}</p>
                  <p className="truncate text-[10px] font-mono text-slate-400">{currentUser?.email}</p>
                </div>

                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Test Role Perspectives:
                </div>

                {(['ADMIN', 'OFFICER', 'STUDENT', 'GATE_OFFICER'] as Role[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      onSwitchRole(role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser?.role === role ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{roleLabels[role]}</span>
                    {currentUser?.role === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
