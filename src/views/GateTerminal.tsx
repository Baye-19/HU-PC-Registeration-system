import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Gate, SecurityEvent, SecurityAlert } from '../types';
import { GateScanner } from '../components/GateScanner';
import { ShieldCheck, DoorOpen, History, Bell, Check, ArrowLeft } from 'lucide-react';

interface GateTerminalProps {
  alerts: SecurityAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onNavigateBack?: () => void;
}

export const GateTerminal: React.FC<GateTerminalProps> = ({ alerts, onAcknowledgeAlert, onNavigateBack }) => {
  const [gates, setGates] = useState<Gate[]>([]);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [recentMovements, setRecentMovements] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGatesAndMovements = async () => {
    try {
      const [allGates, events] = await Promise.all([
        api.getGates(),
        api.getSecurityEvents()
      ]);
      setGates(allGates);
      if (allGates.length > 0 && !selectedGate) {
        setSelectedGate(allGates[0]);
      }
      setRecentMovements(events);
    } catch (err) {
      console.error('Error loading gate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatesAndMovements();
  }, []);

  const handleMovementLogged = (event: SecurityEvent) => {
    setRecentMovements(prev => [event, ...prev]);
  };

  if (loading || !selectedGate) {
    return (
      <div className="p-12 text-center text-slate-500 text-xs">
        Initializing Gate Terminal Station...
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.active);

  return (
    <div className="space-y-6">
      {/* Terminal Header & Station Gate Selector */}
      <div className="bg-[#0B2A63] text-white p-3.5 sm:p-4 rounded-xl shadow-md border-b-2 border-[#0284C7]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-sm border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_3d6f99fa.png"
              alt="Hawassa University Official Seal"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                Campus Gate Terminal
              </h1>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/40 shrink-0">
                ONLINE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#7DD3FC] truncate">
              ሀዋሳ ዩኒቨርሲቲ · Security Gate Clearance Post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] sm:text-xs font-semibold text-blue-200 whitespace-nowrap">
            Gate:
          </label>
          <select
            value={selectedGate.id}
            onChange={e => {
              const g = gates.find(gate => gate.id === e.target.value);
              if (g) setSelectedGate(g);
            }}
            className="text-xs font-bold bg-slate-800 text-white border border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            {gates.map(gate => (
              <option key={gate.id} value={gate.id}>
                {gate.code}: {gate.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Active Alert Warning Ticker if any stolen laptop is unacknowledged */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-600 text-white rounded-xl p-4 shadow-md space-y-2 border-2 border-red-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bell className="w-5 h-5 text-white animate-bounce" />
              <span>ACTIVE PERIMETER SECURITY ALERTS ({activeAlerts.length})</span>
            </div>
            <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded">
              BROADCASTED TO ALL GATES
            </span>
          </div>

          <div className="divide-y divide-red-500/60 text-xs">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="pt-2 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold">{alert.title}</span>
                  <p className="text-red-100 text-[11px]">{alert.message}</p>
                </div>
                <button
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className="px-3 py-1 bg-white text-red-700 hover:bg-red-50 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  Acknowledge Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Central Gate Verification Scanner */}
      <GateScanner
        currentGate={selectedGate}
        onMovementLogged={handleMovementLogged}
      />

      {/* Live Gate Verification Event History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Recent Gate Verifications Stream
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recentMovements.length} logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">PC ID</th>
                <th className="py-2 px-3">Student</th>
                <th className="py-2 px-3">Hardware</th>
                <th className="py-2 px-3">Gate</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Result</th>
                <th className="py-2 px-3">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMovements.slice(0, 15).map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                    {evt.pcId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800">{evt.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{evt.studentIdNumber}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    {evt.brand} {evt.model}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                    {evt.gateName}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.movementType === 'IN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.movementType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        evt.verificationResult === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {evt.verificationResult}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {evt.officerName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
