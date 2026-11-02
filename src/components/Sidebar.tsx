import React from 'react';
import { User, Role } from '../types';
import {
  LayoutDashboard,
  Users,
  Laptop as LaptopIcon,
  Clock,
  ArrowLeftRight,
  AlertTriangle,
  ShieldCheck,
  FileCode2,
  PlusCircle,
  Camera,
  History,
  Bell,
  LogOut,
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onCloseMobile
}) => {
  const roleLabels: Record<Role, string> = {
    ADMIN: 'System Admin',
    OFFICER: 'Security Police Officer',
    STUDENT: 'Student',
    GATE_OFFICER: 'Gate Security Officer'
  };

  const getNavItems = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Security Overview', icon: LayoutDashboard },
          { id: 'students', label: 'Student Management', icon: Users },
          { id: 'laptops', label: 'Laptop Registry', icon: LaptopIcon },
          { id: 'registrations', label: 'Registration Queue', icon: Clock },
          { id: 'movements', label: 'Gate Movements', icon: ArrowLeftRight },
          { id: 'lost-reports', label: 'Security Incidents', icon: AlertTriangle },
          { id: 'audit-logs', label: 'Audit Trail', icon: ShieldCheck },
          { id: 'architecture', label: 'Spring Boot Architecture', icon: FileCode2 }
        ];
      case 'OFFICER':
        return [
          { id: 'dashboard', label: 'Police Desk', icon: LayoutDashboard },
          { id: 'registrations', label: 'Review Applications', icon: Clock },
          { id: 'register-assisted', label: 'In-Person Register', icon: PlusCircle },
          { id: 'laptops', label: 'Authorized Laptops', icon: LaptopIcon },
          { id: 'lost-reports', label: 'Incident Review', icon: AlertTriangle },
          { id: 'movements', label: 'Gate Movement Logs', icon: ArrowLeftRight },
          { id: 'audit-logs', label: 'Audit Records', icon: ShieldCheck }
        ];
      case 'STUDENT':
        return [
          { id: 'dashboard', label: 'Student Portal', icon: LayoutDashboard },
          { id: 'my-laptops', label: 'My Registered Laptops', icon: LaptopIcon },
          { id: 'register-laptop', label: 'Register New Laptop', icon: PlusCircle },
          { id: 'report-lost', label: 'Report Lost or Stolen', icon: AlertTriangle }
        ];
      case 'GATE_OFFICER':
        return [
          { id: 'gate-scan', label: 'Verification Scanner', icon: Camera },
          { id: 'gate-history', label: 'Perimeter Gate Logs', icon: History },
          { id: 'gate-alerts', label: 'Active Alerts', icon: Bell }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B2A63] text-white border-r-2 border-[#0284C7]/20 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#0284C7]/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_3d6f99fa.png"
              alt="Hawassa University"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              CampusGuard
            </h1>
            <p className="text-[10px] text-[#7DD3FC] uppercase tracking-wider font-semibold font-mono">
              Hawassa University
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#0E3B85]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge Tag */}
      <div className="px-5 py-3 bg-[#081F4B]/80 border-b border-[#0284C7]/15">
        <span className="text-[9px] uppercase font-mono font-bold text-slate-300 tracking-wider block">
          Current Access Portal
        </span>
        <span className="text-xs font-bold text-[#F59E0B] block truncate">
          {roleLabels[currentUser.role]}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold text-[#7DD3FC]/80 uppercase tracking-widest font-mono">
          Navigation Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-[#0E3B85] text-white shadow-xs border-l-4 border-[#F59E0B]'
                  : 'text-slate-200 hover:bg-[#0E3B85]/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#F59E0B]' : 'text-slate-300 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F59E0B]" />}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile Card & Sign Out */}
      <div className="p-4 border-t border-[#0284C7]/20 bg-[#081F4B]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.fullName}
            </p>
            <p className="text-[10px] text-slate-300 font-mono truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-red-500/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
