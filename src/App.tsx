import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { User, Role, SecurityAlert } from './types';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
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
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  const getDefaultTabForRole = (role: Role) => {
    switch (role) {
      case 'ADMIN':
      case 'OFFICER':
      case 'STUDENT':
        return 'dashboard';
      case 'GATE_OFFICER':
        return 'gate-scan';
      default:
        return 'dashboard';
    }
  };

  const setDefaultTabForRole = (role: Role) => {
    const tab = getDefaultTabForRole(role);
    setActiveTab(tab);
    setNavHistory([]);
  };

  const handleSelectTab = (newTab: string) => {
    setMobileSidebarOpen(false);
    if (newTab === activeTab) return;
    setNavHistory(prev => [...prev, activeTab]);
    setActiveTab(newTab);
  };

  const handleNavigateBack = () => {
    setMobileSidebarOpen(false);
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory(prev => prev.slice(0, prev.length - 1));
      setActiveTab(prevTab);
    } else if (currentUser) {
      const defaultTab = getDefaultTabForRole(currentUser.role);
      setActiveTab(defaultTab);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setDefaultTabForRole(user.role);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setNavHistory([]);
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
      <div className="min-h-screen bg-[#071638] flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-[#F59E0B] shadow-lg animate-pulse flex items-center justify-center">
            <img
              src="/assets/aistudio/image_3d6f99fa.png"
              alt="Hawassa University"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="font-mono text-slate-300">
            Connecting to CampusGuard Hawassa University Security System...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const defaultTab = getDefaultTabForRole(currentUser.role);
  const canNavigateBack = navHistory.length > 0 || activeTab !== defaultTab;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Vertical Sidebar Menu */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top HeaderBar with Back Button, Breadcrumb, Alerts */}
        <HeaderBar
          currentUser={currentUser}
          activeTab={activeTab}
          onNavigateBack={canNavigateBack ? handleNavigateBack : undefined}
          canNavigateBack={canNavigateBack}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />

        {/* Dynamic View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Administrator Perspectives */}
          {currentUser.role === 'ADMIN' && (
            <>
              {activeTab === 'dashboard' && <AdminDashboard onNavigate={handleSelectTab} />}
              {activeTab === 'students' && (
                <StudentsManagementView onNavigateBack={handleNavigateBack} />
              )}
              {activeTab === 'laptops' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="LAPTOPS"
                />
              )}
              {activeTab === 'registrations' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="REVIEWS"
                />
              )}
              {activeTab === 'movements' && (
                <MovementsView onNavigateBack={handleNavigateBack} />
              )}
              {activeTab === 'lost-reports' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="INCIDENTS"
                />
              )}
              {activeTab === 'audit-logs' && (
                <AuditLogsView onNavigateBack={handleNavigateBack} />
              )}
              {activeTab === 'architecture' && (
                <ArchitectureView onNavigateBack={handleNavigateBack} />
              )}
            </>
          )}

          {/* Security Officer Perspectives */}
          {currentUser.role === 'OFFICER' && (
            <>
              {activeTab === 'dashboard' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="REVIEWS"
                />
              )}
              {activeTab === 'registrations' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="REVIEWS"
                />
              )}
              {activeTab === 'register-assisted' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="REGISTER"
                />
              )}
              {activeTab === 'laptops' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="LAPTOPS"
                />
              )}
              {activeTab === 'lost-reports' && (
                <OfficerDashboard
                  onNavigateBack={handleNavigateBack}
                  initialSubTab="INCIDENTS"
                />
              )}
              {activeTab === 'movements' && (
                <MovementsView onNavigateBack={handleNavigateBack} />
              )}
              {activeTab === 'audit-logs' && (
                <AuditLogsView onNavigateBack={handleNavigateBack} />
              )}
              {activeTab === 'architecture' && (
                <ArchitectureView onNavigateBack={handleNavigateBack} />
              )}
            </>
          )}

          {/* Student Perspectives */}
          {currentUser.role === 'STUDENT' && (
            <StudentPortal
              currentUser={currentUser}
              onNavigateBack={handleNavigateBack}
            />
          )}

          {/* Gate Officer Perspectives */}
          {currentUser.role === 'GATE_OFFICER' && (
            <>
              {(activeTab === 'gate-scan' || activeTab === 'dashboard' || activeTab === 'gate-alerts') && (
                <GateTerminal
                  alerts={alerts}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onNavigateBack={handleNavigateBack}
                />
              )}
              {activeTab === 'gate-history' && (
                <MovementsView onNavigateBack={handleNavigateBack} />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="no-print bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/image_3d6f99fa.png"
                alt="Hawassa University Seal"
                className="w-5 h-5 object-contain rounded-full"
              />
              <span className="font-semibold text-slate-800">CampusGuard System</span>
              <span>·</span>
              <span>ሀዋሳ ዩኒቨርሲቲ · Hawassa University (Est. 1976)</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Campus Police Union & Directorate of ICT Security
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
export default App;
