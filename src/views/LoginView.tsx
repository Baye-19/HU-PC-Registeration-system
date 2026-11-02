import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Role } from '../types';
import {
  GraduationCap,
  ShieldCheck,
  DoorOpen,
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
  Lock,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Building2
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  initialRole?: Role;
}

type PortalType = 'DIRECTORY' | 'STUDENT' | 'OFFICER' | 'GATE_OFFICER' | 'ADMIN';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, initialRole }) => {
  const [currentPortal, setCurrentPortal] = useState<PortalType>(
    initialRole ? initialRole : 'DIRECTORY'
  );

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // When a portal is chosen, set default credentials for convenience
  const handleSelectPortal = (portal: PortalType) => {
    setCurrentPortal(portal);
    setErrorMsg(null);
    switch (portal) {
      case 'STUDENT':
        setUsername('abebe.bikila@hu.edu.et');
        setPassword('Student@123');
        break;
      case 'OFFICER':
        setUsername('kebede@security.hu.edu.et');
        setPassword('Officer@123');
        break;
      case 'GATE_OFFICER':
        setUsername('gate1@security.hu.edu.et');
        setPassword('Gate@123');
        break;
      case 'ADMIN':
        setUsername('admin@hu.edu.et');
        setPassword('Admin@123');
        break;
      default:
        setUsername('');
        setPassword('');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { user } = await api.login(username, password);

      // Verify role alignment with portal
      if (currentPortal !== 'DIRECTORY' && user.role !== currentPortal) {
        throw new Error(
          `Unauthorized portal access: Your account role is "${user.role}", but you attempted to sign into the "${currentPortal}" portal. Please use your designated portal.`
        );
      }

      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const portalDefinitions = [
    {
      id: 'STUDENT' as PortalType,
      title: 'Student Self-Service Portal',
      amharic: 'የተማሪዎች ፖርታል',
      subtitle: 'Personal Laptop Registration & Pass',
      description: 'Register student personal laptops, view official digital QR clearance passes, and file lost device incident reports.',
      icon: GraduationCap,
      accentColor: 'border-[#0284C7]',
      tagBg: 'bg-blue-50 text-[#0284C7]',
      btnBg: 'bg-[#0284C7] hover:bg-[#0369A1]',
      sampleAccount: 'abebe.bikila@hu.edu.et (Pass: Student@123)'
    },
    {
      id: 'OFFICER' as PortalType,
      title: 'Campus Police Union Portal',
      amharic: 'የካምፓስ ፖሊስ ማህበር',
      subtitle: 'Registration Verification & Incident Desk',
      description: 'Review student laptop submissions, perform in-person physical inspections, generate ID passes, and manage perimeter alerts.',
      icon: ShieldCheck,
      accentColor: 'border-[#15803D]',
      tagBg: 'bg-emerald-50 text-[#15803D]',
      btnBg: 'bg-[#15803D] hover:bg-[#166534]',
      sampleAccount: 'kebede@security.hu.edu.et (Pass: Officer@123)'
    },
    {
      id: 'GATE_OFFICER' as PortalType,
      title: 'Gate Security Terminal Post',
      amharic: 'የበር ጥበቃ ተርሚናል',
      subtitle: 'Perimeter Access & Movement Scanner',
      description: 'Optical camera barcode scanning, device validation, consecutive movement auditing, and perimeter emergency detention.',
      icon: DoorOpen,
      accentColor: 'border-[#F59E0B]',
      tagBg: 'bg-amber-50 text-[#B45309]',
      btnBg: 'bg-[#B45309] hover:bg-[#92400E]',
      sampleAccount: 'gate1@security.hu.edu.et (Pass: Gate@123)'
    },
    {
      id: 'ADMIN' as PortalType,
      title: 'System Administration Console',
      amharic: 'ዋና አስተዳዳሪ ኮንሶል',
      subtitle: 'ICT Directorate & Security Oversight',
      description: 'Enterprise oversight, system analytics, user management, campus gate configuration, and immutable security audit logs.',
      icon: LockKeyhole,
      accentColor: 'border-[#0B2A63]',
      tagBg: 'bg-slate-100 text-[#0B2A63]',
      btnBg: 'bg-[#0B2A63] hover:bg-[#0E3B85]',
      sampleAccount: 'admin@hu.edu.et (Pass: Admin@123)'
    }
  ];

  // -------------------------------------------------------------
  // VIEW 1: PORTAL DIRECTORY / GATEWAY
  // -------------------------------------------------------------
  if (currentPortal === 'DIRECTORY') {
    return (
      <div className="min-h-screen bg-[#071638] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-radial from-[#0E3B85]/40 via-[#071638] to-[#030B1C] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto w-full relative z-10 space-y-8 my-auto">
          {/* Header with Official Logo */}
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-white mx-auto p-1.5 shadow-2xl border-3 border-[#F59E0B] flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/image_3d6f99fa.png"
                alt="Hawassa University Official Seal"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                CampusGuard Security Gateway
              </h1>
              <p className="text-xs text-[#7DD3FC] uppercase tracking-wider font-semibold mt-1">
                ሀዋሳ ዩኒቨርሲቲ · Hawassa University (Est. 1976)
              </p>
              <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                Automated Campus Laptop Registration and Gate Security Management System.
                Please select your designated university portal to proceed with authentication.
              </p>
            </div>
          </div>

          {/* 4 Dedicated Portal Entry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {portalDefinitions.map(portal => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  onClick={() => handleSelectPortal(portal.id)}
                  className={`bg-white rounded-2xl p-6 shadow-xl border-2 ${portal.accentColor} hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 shadow-xs border border-slate-200 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-[#0B2A63]" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full font-mono ${portal.tagBg}`}>
                        {portal.subtitle}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0B2A63] transition-colors">
                        {portal.title}
                      </h2>
                      <p className="text-[11px] text-[#0284C7] font-semibold">
                        {portal.amharic}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Restricted Access
                    </span>
                    <button
                      type="button"
                      className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors ${portal.btnBg}`}
                    >
                      <span>Enter Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-slate-400 text-xs">
            Directorate of Information & Communication Technology · Hawassa University Campus Police Union
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DEDICATED SEPARATE LOGIN PAGE FOR THE SELECTED ROLE
  // -------------------------------------------------------------
  const activeDef = portalDefinitions.find(p => p.id === currentPortal)!;
  const ActiveIcon = activeDef.icon;

  return (
    <div className="min-h-screen bg-[#071638] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-radial from-[#0E3B85]/40 via-[#071638] to-[#030B1C] pointer-events-none"></div>

      <div className="max-w-md w-full mx-auto relative z-10 space-y-5">
        {/* Navigation back to Portal Directory */}
        <button
          onClick={() => setCurrentPortal('DIRECTORY')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7DD3FC] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch University Portal</span>
        </button>

        {/* Dedicated Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
          {/* Distinctive Role Header Banner */}
          <div className="bg-[#0B2A63] text-white p-6 border-b-2 border-[#F59E0B] relative">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/image_3d6f99fa.png"
                  alt="Hawassa University"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider block">
                  {activeDef.subtitle}
                </span>
                <h1 className="text-base font-bold text-white tracking-tight">
                  {activeDef.title}
                </h1>
                <p className="text-[11px] text-[#7DD3FC]">
                  {activeDef.amharic} · Hawassa University
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentPortal === 'STUDENT'
                    ? 'Student ID or Institutional Email'
                    : currentPortal === 'OFFICER'
                    ? 'Officer Badge ID or Official Email'
                    : currentPortal === 'GATE_OFFICER'
                    ? 'Gate Officer Terminal Account'
                    : 'System Administrator Username / Email'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={
                      currentPortal === 'STUDENT'
                        ? 'e.g. abebe.bikila@hu.edu.et or HU/14022/13'
                        : currentPortal === 'OFFICER'
                        ? 'e.g. kebede@security.hu.edu.et'
                        : currentPortal === 'GATE_OFFICER'
                        ? 'e.g. gate1@security.hu.edu.et'
                        : 'e.g. admin@hu.edu.et'
                    }
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:outline-hidden"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {currentPortal === 'STUDENT'
                    ? 'Student Portal Password'
                    : currentPortal === 'OFFICER'
                    ? 'Police Security PIN / Password'
                    : currentPortal === 'GATE_OFFICER'
                    ? 'Terminal Post PIN / Password'
                    : 'Administrator Password'}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:outline-hidden"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${activeDef.btnBg}`}
              >
                <span>
                  {loading
                    ? 'Verifying Authorization...'
                    : `Sign In to ${activeDef.title.split(' ')[0]} Portal`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Role Notice & Security Warning */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Authorized Institutional Access Only</span>
              </div>
              <p>
                {currentPortal === 'STUDENT'
                  ? 'Students must verify their own personal laptops only. Misrepresentation of asset ownership is subject to university disciplinary committee sanctions.'
                  : currentPortal === 'OFFICER'
                  ? 'Police Union officers are authorized to approve laptop registrations and coordinate recovery of stolen campus devices.'
                  : currentPortal === 'GATE_OFFICER'
                  ? 'All gate scans and movement entries (IN/OUT) are timestamped and permanently logged in the perimeter security audit trail.'
                  : 'Administrative privileges are restricted to authorized ICT Directorate security engineers.'}
              </p>
            </div>

            {/* Quick autofill for demonstration */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  if (currentPortal === 'STUDENT') {
                    setUsername('abebe.bikila@hu.edu.et');
                    setPassword('Student@123');
                  } else if (currentPortal === 'OFFICER') {
                    setUsername('kebede@security.hu.edu.et');
                    setPassword('Officer@123');
                  } else if (currentPortal === 'GATE_OFFICER') {
                    setUsername('gate1@security.hu.edu.et');
                    setPassword('Gate@123');
                  } else if (currentPortal === 'ADMIN') {
                    setUsername('admin@hu.edu.et');
                    setPassword('Admin@123');
                  }
                }}
                className="text-[10px] text-[#0284C7] hover:text-[#0369A1] font-semibold underline"
              >
                Auto-fill default demo credentials for {activeDef.title}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-xs">
          Hawassa University · CampusGuard Automated Security System &copy; 2026
        </div>
      </div>
    </div>
  );
};
