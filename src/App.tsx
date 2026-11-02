import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { User, Role, SecurityAlert } from './types';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { AdminDashboard } from './views/AdminDashboard';
import { OfficerDashboard } from './views/OfficerDashboard';
import { StudentPortal } from './views/StudentPortal';
import { GateTerminal } from './views/GateTerminal';
import { StudentsManagementView } from './views/StudentsManagementView';
import { MovementsView } from './views/MovementsView';
import { AuditLogsView } from './views/AuditLogsView';
import { ArchitectureView } from './views/ArchitectureModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await api.getMe();
        setCurrentUser(user);
        setDefaultTabForRole(user.role);
      } catch (err) {
        console.log('No existing session, prompting login.');
      } finally {
        setLoadingInitial(false);
      }
    };
    initAuth();
  }, []);

  // Fetch initial alerts
  useEffect(() => {
    if (!currentUser) return;
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      }
    };
    fetchAlerts();

    // Setup SSE Real-time alert listener
    const eventSource = new EventSource('/api/v1/alerts/stream');
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'NEW_ALERT' && payload.alert) {
          setAlerts(prev => [payload.alert, ...prev]);
        }
      } catch (err) {
        console.error('Error parsing alert event:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [currentUser]);

  const setDefaultTabForRole = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        setActiveTab('dashboard');
        break;
      case 'OFFICER':
        setActiveTab('dashboard');
        break;
      case 'STUDENT':
        setActiveTab('dashboard');
        break;
      case 'GATE_OFFICER':
        setActiveTab('gate-scan');
        break;
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setDefaultTabForRole(user.role);
  };

  const handleSwitchRole = async (role: Role) => {
    try {
      const { user } = await api.switchAccount(role);
      setCurrentUser(user);
      setDefaultTabForRole(user.role);
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const updated = await api.acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Connecting to CampusGuard Hawassa University Security System...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Administrator Perspectives */}
        {currentUser.role === 'ADMIN' && (
          <>
            {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
            {activeTab === 'students' && <StudentsManagementView />}
            {activeTab === 'laptops' && <OfficerDashboard />}
            {activeTab === 'registrations' && <OfficerDashboard />}
            {activeTab === 'movements' && <MovementsView />}
            {activeTab === 'lost-reports' && <OfficerDashboard />}
            {activeTab === 'audit-logs' && <AuditLogsView />}
            {activeTab === 'architecture' && <ArchitectureView />}
          </>
        )}

        {/* Security Officer Perspectives */}
        {currentUser.role === 'OFFICER' && (
          <>
            {activeTab === 'dashboard' && <OfficerDashboard />}
            {activeTab === 'registrations' && <OfficerDashboard />}
            {activeTab === 'register-assisted' && <OfficerDashboard />}
            {activeTab === 'laptops' && <OfficerDashboard />}
            {activeTab === 'lost-reports' && <OfficerDashboard />}
            {activeTab === 'audit-logs' && <AuditLogsView />}
            {activeTab === 'architecture' && <ArchitectureView />}
          </>
        )}

        {/* Student Perspectives */}
        {currentUser.role === 'STUDENT' && (
          <>
            {activeTab === 'dashboard' && <StudentPortal currentUser={currentUser} />}
            {activeTab === 'my-laptops' && <StudentPortal currentUser={currentUser} />}
            {activeTab === 'register-laptop' && <StudentPortal currentUser={currentUser} />}
            {activeTab === 'report-lost' && <StudentPortal currentUser={currentUser} />}
          </>
        )}

        {/* Gate Officer Perspectives */}
        {currentUser.role === 'GATE_OFFICER' && (
          <>
            {(activeTab === 'gate-scan' || activeTab === 'dashboard') && (
              <GateTerminal
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            )}
            {activeTab === 'gate-history' && <MovementsView />}
            {activeTab === 'gate-alerts' && (
              <GateTerminal
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">CampusGuard System</span>
            <span>·</span>
            <span>Hawassa University, Ethiopia</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Security Police Union & Directorate of ICT
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
