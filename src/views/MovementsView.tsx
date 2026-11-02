import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SecurityEvent } from '../types';
import { History, Download, RefreshCw, Search } from 'lucide-react';

export const MovementsView: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getSecurityEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleExportCsv = () => {
    if (events.length === 0) return;
    const headers = ['Timestamp', 'PC ID', 'Student Name', 'Student ID', 'Hardware', 'Serial No', 'Gate', 'Movement', 'Result', 'Method', 'Officer', 'Notes'];
    const rows = events.map(e => [
      `"${e.timestamp}"`,
      `"${e.pcId}"`,
      `"${e.studentName}"`,
      `"${e.studentIdNumber}"`,
      `"${e.brand} ${e.model}"`,
      `"${e.serialNumber}"`,
      `"${e.gateName}"`,
      `"${e.movementType}"`,
      `"${e.verificationResult}"`,
      `"${e.verificationMethod}"`,
      `"${e.officerName}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusGuard_GateMovements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch =
      e.pcId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentIdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.gateName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = movementFilter === 'ALL' || e.movementType === movementFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Campus Gate Movements History
          </h1>
          <p className="text-xs text-slate-500">
            Real-time auditable entry and exit activity records across all Hawassa University perimeter gates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Export CSV
          </button>
          <button
            onClick={fetchEvents}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by PC ID, student name, student ID, serial number, or gate..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setMovementFilter('ALL')}
            className={`px-3 py-1.5 rounded-md ${
              movementFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Movements
          </button>
          <button
            onClick={() => setMovementFilter('IN')}
            className={`px-3 py-1.5 rounded-md ${
              movementFilter === 'IN' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Campus IN
          </button>
          <button
            onClick={() => setMovementFilter('OUT')}
            className={`px-3 py-1.5 rounded-md ${
              movementFilter === 'OUT' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Campus OUT
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">PC ID</th>
                <th className="py-2.5 px-3">Student Owner</th>
                <th className="py-2.5 px-3">Hardware Details</th>
                <th className="py-2.5 px-3">Gate Location</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(evt => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {evt.pcId}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800">{evt.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">{evt.studentIdNumber}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-medium">{evt.brand} {evt.model}</div>
                    <div className="text-[10px] font-mono text-slate-400">{evt.serialNumber}</div>
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
