import React, { useState } from 'react';
import { api } from '../services/api';
import { User, Role } from '../types';
import { ShieldCheck, Lock, User as UserIcon, ArrowRight, AlertTriangle } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin@hu.edu.et');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { user } = await api.login(username, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        setUsername('admin@hu.edu.et');
        setPassword('Admin@123');
        break;
      case 'OFFICER':
        setUsername('kebede@security.hu.edu.et');
        setPassword('Officer@123');
        break;
      case 'STUDENT':
        setUsername('abebe.bikila@hu.edu.et');
        setPassword('Student@123');
        break;
      case 'GATE_OFFICER':
        setUsername('gate1@security.hu.edu.et');
        setPassword('Gate@123');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-radial from-blue-900/20 via-slate-900 to-slate-950 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg border border-blue-400">
          HU
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          CampusGuard
        </h1>
        <p className="text-xs text-blue-300 uppercase tracking-widest font-mono">
          Hawassa University · Campus Security Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Institutional Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="name@hu.edu.et"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#142B4A] hover:bg-[#1a3860] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to CampusGuard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Role Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Role Demonstration Logins:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="p-2 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium text-left border border-slate-200"
              >
                <strong>System Admin</strong>
                <span className="block text-slate-400 font-mono text-[9px]">admin@hu.edu.et</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('OFFICER')}
                className="p-2 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium text-left border border-slate-200"
              >
                <strong>Police Officer</strong>
                <span className="block text-slate-400 font-mono text-[9px]">kebede@security...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('STUDENT')}
                className="p-2 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium text-left border border-slate-200"
              >
                <strong>Student Portal</strong>
                <span className="block text-slate-400 font-mono text-[9px]">abebe.bikila@hu...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('GATE_OFFICER')}
                className="p-2 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium text-left border border-slate-200"
              >
                <strong>Gate Terminal</strong>
                <span className="block text-slate-400 font-mono text-[9px]">gate1@security...</span>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-slate-400 text-[11px]">
          Hawassa University ICT Directorate & Campus Police Union &copy; 2026
        </div>
      </div>
    </div>
  );
};
