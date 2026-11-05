import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Role } from '../types';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  User as UserIcon,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
  initialRole?: Role;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [credential, setCredential] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = credential.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your Student ID number or staff security password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.unifiedLogin(trimmed);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Invalid Student ID or Security Password. Please verify and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-between py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{ backgroundImage: "url('/assets/aistudio/campus_bg.jpg')" }}
      >
        {/* Soft atmospheric overlay to ensure optimal contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35 pointer-events-none"></div>

        {/* Main Container */}
              <div className="max-w-xl mx-auto w-full relative z-10 space-y-4 sm:space-y-5 my-auto">
                {/* Header with Official Seal & Title matching reference */}
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white mx-auto p-1 shadow-2xl border-3 border-[#F59E0B] flex items-center justify-center shrink-0">
                    <img
                      src="/assets/aistudio/image_3d6f99fa.png"
                      alt="Hawassa University Official Seal"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]">
                        CampusGuard Security Gateway
                      </h1>
                        <p className="text-xs sm:text-sm text-white font-bold tracking-wider mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                          ሀዋሳ ዩኒቨርሲቲ - HAWASSA UNIVERSITY (EST. 1976)
                        </p>
                          <p className="text-[11px] sm:text-xs text-white max-w-md mx-auto mt-1 leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] font-medium">
                            Automated Campus Laptop Registration and Gate Security Management System
                          </p>
                        </div>
                      </div>

                      {/* Unified Login Card */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-white/70 overflow-hidden">
                          {/* Header Banner */}
                            <div className="bg-gradient-to-r from-[#0E3B85] via-[#0B2A63] to-[#0284C7] text-white p-5 sm:p-6 border-b-2 border-[#F59E0B]">
                              <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
                                  <ShieldCheck className="w-7 h-7 text-[#F59E0B]" />
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider block font-mono">
                                    UNIVERSITY PORTAL AUTHENTICATION · የተቋሙ መግቢያ በር
                                  </span>
                                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                    Sign In to CampusGuard
                                  </h2>
                                    <p className="text-[11px] text-blue-100 mt-0.5">
                                      Students enter Student ID - Staff enter Security Password
                                    </p>
                                </div>
                              </div>
                            </div>

                            {/* Form Body */}
                              <div className="p-5 sm:p-7 space-y-4 sm:space-y-5">
                                {errorMsg && (
                                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-[#DC2626] flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                                    <span>{errorMsg}</span>
                                  </div>
                                )}

                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                      Student ID Number or Security Password (የተማሪ መታወቂያ ወይም የደህንነት ቃል)
                                    </label>
                                    <div className="relative">
                                      <input
                                        type={showSecret ? 'text' : 'password'}
                                        required
                                        autoFocus
                                        placeholder="e.g. HU/14022/13 or Security Password"
                                        value={credential}
                                        onChange={e => {
                                          setCredential(e.target.value);
                                          setErrorMsg(null);
                                        }}
                                        className="w-full text-sm font-mono tracking-wide pl-10 pr-11 py-2.5 sm:py-3 border-2 border-slate-300 rounded-xl focus:border-[#0284C7] focus:ring-3 focus:ring-blue-100 focus:outline-hidden transition-all text-slate-900 font-semibold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
                                      />
                                      <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-3 sm:top-3.5" />

                                      {/* Interactive Eye Icon to toggle visibility and check for mistakes */}
                                      <button
                                        type="button"
                                        onClick={() => setShowSecret(!showSecret)}
                                        className="absolute right-3 top-2.5 sm:top-3 p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-hidden cursor-pointer"
                                        title={showSecret ? 'Hide password' : 'Show password to check for typos'}
                                        aria-label={showSecret ? 'Hide password' : 'Show password'}
                                      >
                                        {showSecret ? (
                                          <EyeOff className="w-5 h-5 text-[#0284C7]" />
                                        ) : (
                                          <Eye className="w-5 h-5 text-slate-400" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={loading || !credential.trim()}
                                    className="w-full py-2.5 sm:py-3 px-4 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] transition-all disabled:opacity-50 cursor-pointer"
                                  >
                                    <span>{loading ? 'Verifying Authorization...' : 'Sign in to CampusGuard'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </form>

                                  {/* Single Sign-On Protocol Box */}
                                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                                      <Lock className="w-3.5 h-3.5 text-[#0B2A63]" />
                                      <span>Single Sign-On Protocol</span>
                                    </div>
                                    <ul className="space-y-1 text-[11px] leading-relaxed text-slate-600 list-disc list-inside">
                                      <li>
                                        <strong className="text-slate-800">Students:</strong> Enter your official Hawassa University ID (e.g. <span className="font-mono text-[#0B2A63] font-bold">HU/14022/13</span>). If no PC is registered, you will be directly guided to the laptop registration form.
                                      </li>
                                      <li>
                                        <strong className="text-slate-800">Police, Gate Security & Admins:</strong> Enter your designated security PIN or password to automatically enter your respective portal (Police Union, Gate Terminal, or Admin Console).
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                                <div className="text-center text-white text-xs space-y-1 pt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                                  <div>
                                    Directorate of Information & Communication Technology - Hawassa University Campus Police Union
                                  </div>
                                    <div className="text-[11px] text-white/90 font-mono">
                                      campusguard Automated Security System &copy; 2026
                                    </div>
                                  </div>
                                </div>
                              </div>
                              );
};
