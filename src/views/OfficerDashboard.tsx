import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LaptopRegistration, Laptop, LostReport } from '../types';
import { PrintableCard } from '../components/PrintableCard';
import {
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Search,
  PlusCircle,
  ShieldAlert,
  Laptop as LaptopIcon,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

interface OfficerDashboardProps {
  onNavigateBack?: () => void;
  initialSubTab?: 'REVIEWS' | 'REGISTER' | 'LAPTOPS' | 'INCIDENTS';
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ onNavigateBack, initialSubTab = 'REVIEWS' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'REVIEWS' | 'REGISTER' | 'LAPTOPS' | 'INCIDENTS'>(initialSubTab);
  const [registrations, setRegistrations] = useState<LaptopRegistration[]>([]);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingRegId, setRejectingRegId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected laptop for printable card
  const [selectedLaptopForCard, setSelectedLaptopForCard] = useState<Laptop | null>(null);

  // Search queries
  const [laptopSearchQuery, setLaptopSearchQuery] = useState('');

  // Officer-assisted in-person registration form
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assistedBrand, setAssistedBrand] = useState('Dell');
  const [assistedModel, setAssistedModel] = useState('');
  const [assistedSerial, setAssistedSerial] = useState('');
  const [assistedOwnerPhone, setAssistedOwnerPhone] = useState('');
  const [assistedType, setAssistedType] = useState('Laptop');
  const [assistedProcessor, setAssistedProcessor] = useState('');
  const [assistedRam, setAssistedRam] = useState('16GB DDR4');
  const [assistedStorage, setAssistedStorage] = useState('512GB SSD');
  const [assistedOs, setAssistedOs] = useState('Windows 11');
  const [assistedColor, setAssistedColor] = useState('Black');
  const [assistedDescription, setAssistedDescription] = useState('');
  const [assistedSubmitting, setAssistedSubmitting] = useState(false);
  const [assistedSuccessMsg, setAssistedSuccessMsg] = useState<string | null>(null);
  const [assistedErrorMsg, setAssistedErrorMsg] = useState<string | null>(null);

  // Stolen / Miss Emergency Direct Broadcast
  const [stolenModalLaptop, setStolenModalLaptop] = useState<Laptop | null>(null);
  const [stolenIncidentType, setStolenIncidentType] = useState('THEFT_ON_CAMPUS');
  const [stolenIncidentLocation, setStolenIncidentLocation] = useState('Hawassa University Main Campus');
  const [stolenDescription, setStolenDescription] = useState('');
  const [stolenContactPhone, setStolenContactPhone] = useState('+251 46 220 5311');
  const [stolenSubmitting, setStolenSubmitting] = useState(false);
  const [broadcastAlertNotice, setBroadcastAlertNotice] = useState<string | null>(null);

  // Recovery / Resolve Modal
  const [resolveModalLaptop, setResolveModalLaptop] = useState<Laptop | null>(null);
  const [resolveNotes, setResolveNotes] = useState('Hardware verified and recovered by Campus Police. Returned to authorized student owner.');
  const [resolveSubmitting, setResolveSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regs, lpts, reps, stus] = await Promise.all([
        api.getRegistrations(),
        api.getLaptops(),
        api.getLostReports(),
        api.getStudents()
      ]);
      setRegistrations(regs);
      setLaptops(lpts);
      setLostReports(reps);
      setStudentsList(stus);
      if (stus.length > 0 && !selectedStudentId) {
        setSelectedStudentId(stus[0].id);
      }
    } catch (err) {
      console.error('Error fetching officer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Approve
  const handleApprove = async (regId: string) => {
    try {
      const { laptop } = await api.approveRegistration(regId);
      await fetchData();
      setSelectedLaptopForCard(laptop);
    } catch (err: any) {
      alert(err.message || 'Error approving registration');
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRegId) return;

    try {
      await api.rejectRegistration(rejectingRegId, rejectionReason);
      setRejectingRegId(null);
      setRejectionReason('');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error rejecting registration');
    }
  };

  // Handle Officer-Assisted In-Person Registration
  const handleAssistedRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssistedSubmitting(true);
    setAssistedErrorMsg(null);
    setAssistedSuccessMsg(null);

    if (!assistedOwnerPhone.trim()) {
      setAssistedErrorMsg('Phone number of PC owner is strictly required.');
      setAssistedSubmitting(false);
      return;
    }

    try {
      const res = await api.createRegistration({
        studentId: selectedStudentId,
        brand: assistedBrand,
        model: assistedModel,
        serialNumber: assistedSerial,
        deviceType: assistedType,
        processor: assistedProcessor,
        ram: assistedRam,
        storage: assistedStorage,
        os: assistedOs,
        color: assistedColor,
        physicalDescription: assistedDescription,
        ownerPhone: assistedOwnerPhone.trim(),
        submittedByRole: 'OFFICER',
        autoApprove: true
      });

      setAssistedSuccessMsg(`Registration complete! Issued PC ID: ${res.pcId}`);
      await fetchData();

      // Find the newly created laptop to show print card
      const newlyCreated = laptops.find(l => l.pcId === res.pcId);
      if (newlyCreated) {
        setSelectedLaptopForCard(newlyCreated);
      }

      // Reset form
      setAssistedModel('');
      setAssistedSerial('');
      setAssistedDescription('');
    } catch (err: any) {
      setAssistedErrorMsg(err.message || 'Registration failed');
    } finally {
      setAssistedSubmitting(false);
    }
  };

  // Handle Incident Review & State Responses: UNDER_EXECUTION, FOUND, etc.
  const handleReviewIncident = async (reportId: string, status: 'CONFIRMED' | 'REJECTED' | 'UNDER_EXECUTION' | 'FOUND') => {
    const defaultNote =
      status === 'UNDER_EXECUTION'
        ? 'Active investigation & perimeter gate guard dispatch under execution.'
        : status === 'FOUND'
        ? 'Hardware found and verified by Campus Police. Returned to owner.'
        : status === 'CONFIRMED'
        ? 'Incident verified. Live gate broadcast dispatched.'
        : 'Incident rejected after investigation.';

    const notes = prompt(`Enter security dispatch notes for marking this incident as ${status}:`, defaultNote);
    if (notes === null) return;

    try {
      await api.reviewLostReport(reportId, status, notes || defaultNote);
      setBroadcastAlertNotice(
        status === 'UNDER_EXECUTION'
          ? '⏱️ Incident marked as UNDER EXECUTION. Investigation teams and gate guards notified.'
          : status === 'FOUND'
          ? '✅ Device marked as FOUND & RECOVERED. Security alerts deactivated.'
          : `Incident updated to ${status}.`
      );
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating incident');
    }
  };

  const handleResolveIncident = async (reportId: string) => {
    const notes = prompt('Enter recovery notes for this hardware:', 'Device recovered and verified by Campus Police');
    if (notes === null) return;

    try {
      await api.resolveLostReport(reportId, notes || 'Device recovered and verified');
      setBroadcastAlertNotice('✅ Device marked as FOUND. Security alerts deactivated.');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Error resolving incident');
    }
  };

  // Direct Stolen / Miss Broadcast (Without requiring student action)
  const handleStolenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stolenModalLaptop) return;
    setStolenSubmitting(true);
    try {
      await api.createLostReport({
        laptopId: stolenModalLaptop.id,
        incidentType: stolenIncidentType,
        incidentDate: new Date().toISOString(),
        incidentLocation: stolenIncidentLocation.trim() || 'Hawassa Main Campus',
        description: stolenDescription.trim() || `Officer emergency action: Hardware reported stolen/missing. Serial: ${stolenModalLaptop.serialNumber}. Broadcast alert pushed to all gates.`,
        contactPhone: stolenContactPhone.trim() || '+251 46 220 5311'
      });
      setBroadcastAlertNotice(
        `🚨 High-Priority Stolen Alert Broadcasted! PC ID ${stolenModalLaptop.pcId} (${stolenModalLaptop.brand} ${stolenModalLaptop.model}, S/N: ${stolenModalLaptop.serialNumber}) is now flagged across all campus gate terminals.`
      );
      setStolenModalLaptop(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast stolen report');
    } finally {
      setStolenSubmitting(false);
    }
  };

  // Direct Recovery Resolution
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalLaptop) return;
    setResolveSubmitting(true);
    try {
      const activeReport = lostReports.find(
        r => (r.laptopId === resolveModalLaptop.id || r.pcId === resolveModalLaptop.pcId) && r.status !== 'RESOLVED'
      );
      if (activeReport) {
        await api.resolveLostReport(activeReport.id, resolveNotes.trim());
      }
      setBroadcastAlertNotice(
        `✅ Incident Resolved: PC ID ${resolveModalLaptop.pcId} security state restored to NORMAL. Perimeter gate alerts cleared.`
      );
      setResolveModalLaptop(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident');
    } finally {
      setResolveSubmitting(false);
    }
  };

  const pendingRegistrations = registrations.filter(r => r.status === 'PENDING');

  const filteredLaptops = laptops.filter(l => {
    const q = laptopSearchQuery.toLowerCase();
    return (
      l.pcId.toLowerCase().includes(q) ||
      l.studentName.toLowerCase().includes(q) ||
      l.studentIdNumber.toLowerCase().includes(q) ||
      l.serialNumber.toLowerCase().includes(q) ||
      l.brand.toLowerCase().includes(q) ||
      l.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Subtab Navigation with University Emblem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0B2A63] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs mr-1 shrink-0"
              title="Return to Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0B2A63]" />
              <span className="hidden xs:inline">Back</span>
            </button>
          )}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 shadow-xs border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_3d6f99fa.png"
              alt="Hawassa University"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Security Police Union Desk
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              ሀዋሳ ዩኒቨርሲቲ · Laptop Registration Processing, ID Pass Generation & Incident Management
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-semibold overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveSubTab('REVIEWS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeSubTab === 'REVIEWS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Reviews</span>
            {pendingRegistrations.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                {pendingRegistrations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('REGISTER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeSubTab === 'REGISTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Assisted Register</span>
          </button>

          <button
            onClick={() => setActiveSubTab('LAPTOPS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeSubTab === 'LAPTOPS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LaptopIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>All Laptops</span>
          </button>

          <button
            onClick={() => setActiveSubTab('INCIDENTS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeSubTab === 'INCIDENTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Lost Devices</span>
          </button>
        </div>
      </div>

      {/* Broadcast Alert Toast / Notice */}
      {broadcastAlertNotice && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl text-xs text-red-900 font-medium flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-800 text-sm">Perimeter Security Broadcast Sent</div>
              <p className="mt-0.5 text-red-700">{broadcastAlertNotice}</p>
            </div>
          </div>
          <button
            onClick={() => setBroadcastAlertNotice(null)}
            className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-1 rounded bg-red-100 hover:bg-red-200 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Pending Reviews Queue */}
      {activeSubTab === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Student Registration Requests Awaiting Verification
            </h2>
            <button
              onClick={fetchData}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {pendingRegistrations.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">All Registration Requests Processed</h4>
              <p className="text-xs text-slate-400">There are no pending laptop verification submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRegistrations.map(reg => (
                <div
                  key={reg.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Applicant Student
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{reg.studentName}</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {reg.studentIdNumber}</p>
                      <p className="text-[11px] text-slate-600">{reg.department} · {reg.faculty}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">
                      PENDING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hardware</span>
                      <span className="font-bold text-slate-800">{reg.brand} {reg.model}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Serial Number</span>
                      <span className="font-mono text-slate-800 font-bold">{reg.serialNumber}</span>
                    </div>
                    {reg.processor && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Processor</span>
                        <span className="text-slate-700 truncate block">{reg.processor}</span>
                      </div>
                    )}
                    {reg.ram && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">RAM / Storage</span>
                        <span className="text-slate-700">{reg.ram} · {reg.storage}</span>
                      </div>
                    )}
                    {reg.color && (
                      <div className="col-span-2 pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Color & Description</span>
                        <span className="text-slate-600">{reg.color} {reg.physicalDescription ? `— ${reg.physicalDescription}` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleApprove(reg.id)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve & Issue PC ID
                    </button>
                    <button
                      onClick={() => setRejectingRegId(reg.id)}
                      className="py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Officer-Assisted In-Person Registration Form */}
      {activeSubTab === 'REGISTER' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Officer-Assisted Laptop Registration
              </h2>
              <p className="text-xs text-slate-500">
                Direct physical registration for students visiting the Campus Police Union office.
                Generates instant PC ID sequence and printable identification card upon submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('LAPTOPS')}
              className="text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-auto shrink-0 shadow-2xs"
              title="Report an already registered laptop as stolen or missing without student"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>Flag Stolen / Miss →</span>
            </button>
          </div>

          {/* Stolen / Missing Device Expedited Callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Urgent Stolen Device Alert?</strong> If a laptop is reported stolen or missing, security officers can directly flag it and broadcast perimeter gate alarms without the student.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('LAPTOPS')}
              className="text-xs font-bold text-red-700 underline hover:text-red-900 shrink-0"
            >
              Search & Broadcast Alert
            </button>
          </div>

          {assistedSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-semibold flex items-center justify-between">
              <span>{assistedSuccessMsg}</span>
              <button
                onClick={() => setActiveSubTab('LAPTOPS')}
                className="underline hover:text-emerald-950 ml-2"
              >
                View in Directory
              </button>
            </div>
          )}

          {assistedErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{assistedErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAssistedRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Student Owner
              </label>
              <select
                value={selectedStudentId}
                onChange={e => {
                  setSelectedStudentId(e.target.value);
                  const st = studentsList.find(s => s.id === e.target.value);
                  if (st?.phone) setAssistedOwnerPhone(st.phone);
                }}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentId}) — {s.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Required Phone Number of PC Owner */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number of PC Owner *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. +251 91 123 4567"
                value={assistedOwnerPhone}
                onChange={e => setAssistedOwnerPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Mandatory contact phone for owner verification, gate logs, and security alerts.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand / Manufacturer *
                </label>
                <select
                  value={assistedBrand}
                  onChange={e => setAssistedBrand(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Dell">Dell</option>
                  <option value="HP">HP (Hewlett-Packard)</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="Apple">Apple</option>
                  <option value="Asus">Asus</option>
                  <option value="Acer">Acer</option>
                  <option value="Toshiba">Toshiba</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Laptop Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latitude 5420, ProBook 450 G8"
                  value={assistedModel}
                  onChange={e => setAssistedModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial Number or Service Tag *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-DL-882914 or 7X9K2B3"
                  value={assistedSerial}
                  onChange={e => setAssistedSerial(e.target.value)}
                  className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Enforces uniqueness across all active registered campus laptops.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Device Type
                </label>
                <select
                  value={assistedType}
                  onChange={e => setAssistedType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="MacBook">MacBook</option>
                  <option value="Ultrabook">Ultrabook</option>
                  <option value="Workstation">Mobile Workstation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processor (CPU)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intel Core i7 11th Gen, AMD Ryzen 7"
                  value={assistedProcessor}
                  onChange={e => setAssistedProcessor(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chassis Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silver, Matte Black, Space Gray"
                  value={assistedColor}
                  onChange={e => setAssistedColor(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RAM Memory
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16GB DDR4"
                  value={assistedRam}
                  onChange={e => setAssistedRam(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 512GB SSD"
                  value={assistedStorage}
                  onChange={e => setAssistedStorage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Identifying Details / Marks
              </label>
              <textarea
                rows={2}
                placeholder="Distinctive scratches, stickers, engravings, or hardware features..."
                value={assistedDescription}
                onChange={e => setAssistedDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={assistedSubmitting}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {assistedSubmitting ? 'Registering & Approving...' : 'Complete In-Person Registration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. All Registered Laptops Directory */}
      {activeSubTab === 'LAPTOPS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Hawassa University Registered Laptops Database
              </h2>
              <p className="text-xs text-slate-500">
                Total Authorized Assets: {laptops.length}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search PC ID, student, serial..."
                value={laptopSearchQuery}
                onChange={e => setLaptopSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">PC ID</th>
                  <th className="py-2.5 px-3">Student Owner</th>
                  <th className="py-2.5 px-3">Device Specs</th>
                  <th className="py-2.5 px-3">Serial No</th>
                  <th className="py-2.5 px-3">Security State</th>
                  <th className="py-2.5 px-3">Gate Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLaptops.map(laptop => (
                  <tr key={laptop.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {laptop.pcId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{laptop.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{laptop.studentIdNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{laptop.brand} {laptop.model}</div>
                      <div className="text-[10px] text-slate-400">{laptop.color} · {laptop.os}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {laptop.serialNumber}
                    </td>
                    <td className="py-3 px-3">
                      {laptop.securityStatus === 'REPORTED_LOST' ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                          REPORTED STOLEN
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          laptop.currentMovementStatus === 'IN'
                            ? 'bg-blue-100 text-blue-800'
                            : laptop.currentMovementStatus === 'OUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {laptop.currentMovementStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {laptop.securityStatus === 'REPORTED_LOST' ? (
                          <button
                            onClick={() => {
                              setResolveModalLaptop(laptop);
                              setResolveNotes('Hardware verified and recovered by Campus Police. Returned to authorized student owner.');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                            title="Device is currently flagged stolen. Click to mark recovered & clear gate alerts"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Recovered</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setStolenModalLaptop(laptop);
                              setStolenIncidentType('THEFT_ON_CAMPUS');
                              setStolenIncidentLocation('Hawassa University Main Campus');
                              setStolenDescription(`Officer emergency action: PC reported stolen/missing directly at Security Police Desk without student.`);
                              setStolenContactPhone('+251 46 220 5311');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md transition-colors shadow-2xs"
                            title="Immediately flag this laptop as Stolen / Miss and broadcast perimeter gate security alerts across all campus gates without student"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span>Stolen / Miss</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLaptopForCard(laptop)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                          title="Print / View Hawassa University Security Identification Card"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Pass</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Lost & Stolen Incidents Review Desk */}
      {activeSubTab === 'INCIDENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Lost & Stolen Laptop Incident Reports
              </h2>
              <p className="text-xs text-slate-500">
                Confirming an incident immediately locks the laptop status to REPORTED_LOST and pushes high-priority broadcasts to all campus gate terminals.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {lostReports.map(rep => (
              <div
                key={rep.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-red-600">
                        {rep.pcId}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-900">{rep.brand} {rep.model}</span>
                      <span className="font-mono text-xs text-slate-500">({rep.serialNumber})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Reported by: <span className="font-semibold text-slate-800">{rep.reportingStudentName}</span> (ID: {rep.studentIdNumber}) · Contact: {rep.contactPhone}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
                      rep.status === 'UNDER_EXECUTION'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : rep.status === 'FOUND' || rep.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : rep.status === 'CONFIRMED'
                        ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                        : rep.status === 'REJECTED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {rep.status === 'UNDER_EXECUTION' && <Clock className="w-3.5 h-3.5 text-blue-600" />}
                    {(rep.status === 'FOUND' || rep.status === 'RESOLVED') && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    {rep.status === 'CONFIRMED' && <ShieldAlert className="w-3.5 h-3.5 text-red-600" />}
                    <span>{rep.status === 'FOUND' ? 'FOUND' : rep.status}</span>
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Location: <strong className="text-slate-700">{rep.incidentLocation}</strong></span>
                    <span>Date: {new Date(rep.incidentDate).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 italic">"{rep.description}"</p>
                  {rep.reviewNotes && (
                    <p className="text-blue-800 font-semibold pt-1 text-[11px]">
                      Security Dispatch / Notes: {rep.reviewNotes}
                    </p>
                  )}
                </div>

                {/* System Admin & Security Officer Response Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                  {rep.status !== 'FOUND' && rep.status !== 'RESOLVED' && rep.status !== 'REJECTED' && (
                    <>
                      {/* Under Execution Button */}
                      <button
                        onClick={() => handleReviewIncident(rep.id, 'UNDER_EXECUTION')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors ${
                          rep.status === 'UNDER_EXECUTION'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title="Mark stolen report as Under Execution (active search & investigation dispatched)"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Under Execution</span>
                      </button>

                      {/* Found Button */}
                      <button
                        onClick={() => handleReviewIncident(rep.id, 'FOUND')}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors"
                        title="Mark laptop as Found / Recovered and restore security state to NORMAL"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Found</span>
                      </button>

                      {rep.status === 'SUBMITTED' && (
                        <button
                          onClick={() => handleReviewIncident(rep.id, 'REJECTED')}
                          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}

                  {(rep.status === 'FOUND' || rep.status === 'RESOLVED') && (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Case Resolved: Laptop marked Found & Clearance Restored</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal Dialog */}
      {rejectingRegId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reject Registration Request
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a valid institutional reason for rejecting this student's laptop registration (e.g., mismatched invoice or invalid serial tag).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Specify reason for rejection..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingRegId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Card Modal */}
      {selectedLaptopForCard && (
        <PrintableCard
          laptop={selectedLaptopForCard}
          onClose={() => setSelectedLaptopForCard(null)}
        />
      )}

      {/* Emergency Stolen / Miss Direct Broadcast Modal */}
      {stolenModalLaptop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-red-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Emergency Stolen / Miss Broadcast</span>
                  </h3>
                  <p className="text-xs text-red-700 font-medium">
                    Immediate Campus Perimeter Security Alert Dispatch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStolenModalLaptop(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Crucial Notice: Without Student Requirement */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-800">
                <span>⚠️ Direct Officer Enforcement: No Student Login Required</span>
              </div>
              <p className="text-[11px] text-red-700 leading-relaxed">
                This action immediately marks the hardware status as <strong>REPORTED STOLEN</strong> and broadcasts a real-time perimeter alert across <strong>all campus gate scanner terminals</strong>. Any attempt to scan this QR code or serial at gate exit/entry will sound an emergency alarm.
              </p>
            </div>

            {/* Target Hardware Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Asset</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {stolenModalLaptop.pcId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block">Device Model</span>
                  <span className="font-semibold text-slate-900">{stolenModalLaptop.brand} {stolenModalLaptop.model}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Serial Number</span>
                  <span className="font-mono text-slate-900 font-bold">{stolenModalLaptop.serialNumber}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Registered Student Owner</span>
                  <span className="font-medium text-slate-900">{stolenModalLaptop.studentName} ({stolenModalLaptop.studentIdNumber})</span>
                </div>
              </div>
            </div>

            {/* Broadcast Form */}
            <form onSubmit={handleStolenSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Incident Classification *
                  </label>
                  <select
                    value={stolenIncidentType}
                    onChange={e => setStolenIncidentType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  >
                    <option value="THEFT_ON_CAMPUS">Theft on Campus Grounds</option>
                    <option value="STOLEN_DORM">Stolen from Dormitory</option>
                    <option value="LOST_ON_CAMPUS">Misplaced / Missing on Campus</option>
                    <option value="EXTERNAL_THEFT">Off-Campus / City Theft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Incident Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Female Dorm 42, Library, IoT Cafe"
                    value={stolenIncidentLocation}
                    onChange={e => setStolenIncidentLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security Desk Contact Phone
                </label>
                <input
                  type="text"
                  value={stolenContactPhone}
                  onChange={e => setStolenContactPhone(e.target.value)}
                  placeholder="+251 46 220 5311"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Incident & Dispatch Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={stolenDescription}
                  onChange={e => setStolenDescription(e.target.value)}
                  placeholder="Describe incident circumstances, suspect information, or police report file number..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStolenModalLaptop(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stolenSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>{stolenSubmitting ? 'Broadcasting Alert...' : '🚨 Broadcast Stolen Alert Immediately'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery / Resolve Incident Modal */}
      {resolveModalLaptop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Mark Device Recovered
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    PC ID: {resolveModalLaptop.pcId} ({resolveModalLaptop.brand} {resolveModalLaptop.model})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolveModalLaptop(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Marking this device as recovered will restore its security status to <strong>NORMAL</strong> and immediately deactivate the perimeter stolen alert across all campus gate terminals.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recovery & Verification Notes *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolveNotes}
                  onChange={e => setResolveNotes(e.target.value)}
                  placeholder="Explain recovery location, verifying officer, and return confirmation..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalLaptop(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{resolveSubmitting ? 'Updating...' : 'Confirm Recovery & Clear Alerts'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
