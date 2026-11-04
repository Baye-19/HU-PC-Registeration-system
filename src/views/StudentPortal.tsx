import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Laptop, LaptopRegistration, LostReport, User } from '../types';
import { PrintableCard } from '../components/PrintableCard';
import {
  Laptop as LaptopIcon,
  PlusCircle,
  AlertTriangle,
  Printer,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  ArrowLeft,
  Camera,
  Upload
} from 'lucide-react';

interface StudentPortalProps {
  currentUser: User;
  onNavigateBack?: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser, onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState<'MY_LAPTOPS' | 'REGISTER' | 'REPORT_LOST'>('MY_LAPTOPS');
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [registrations, setRegistrations] = useState<LaptopRegistration[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected laptop for printable pass
  const [selectedLaptopForPass, setSelectedLaptopForPass] = useState<Laptop | null>(null);

  // New Registration Form
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('16GB DDR4');
  const [storage, setStorage] = useState('512GB SSD');
  const [os, setOs] = useState('Windows 11 Pro');
  const [color, setColor] = useState('Natural Silver');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [ownerPhone, setOwnerPhone] = useState(currentUser.phone || '+251 9');
  const [studentPhotoUrl, setStudentPhotoUrl] = useState<string>('');
  const [studentNameAmharic, setStudentNameAmharic] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('Computer Science');
  const [studentFaculty, setStudentFaculty] = useState('Institute of Technology (IoT)');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regErrorMsg, setRegErrorMsg] = useState<string | null>(null);

  // Lost Device Form
  const [selectedLaptopToReport, setSelectedLaptopToReport] = useState('');
  const [incidentType, setIncidentType] = useState('LOST_ON_CAMPUS');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '');
  const [submittingLost, setSubmittingLost] = useState(false);
  const [lostSuccessMsg, setLostSuccessMsg] = useState<string | null>(null);
  const [lostErrorMsg, setLostErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allLaptops, allRegs, allLost] = await Promise.all([
        api.getLaptops(),
        api.getRegistrations(),
        api.getLostReports()
      ]);

      // Filter by current student
      const studentLaptops = allLaptops.filter(
        l => l.studentIdNumber === currentUser.studentId || l.studentName === currentUser.fullName
      );
      const studentRegs = allRegs.filter(
        r => r.studentIdNumber === currentUser.studentId || r.submittedByUserId === currentUser.id
      );
      const studentLost = allLost.filter(
        lr => lr.studentIdNumber === currentUser.studentId || lr.reportingStudentName === currentUser.fullName
      );

      setLaptops(studentLaptops);
      setRegistrations(studentRegs);
      setLostReports(studentLost);

      if (studentLaptops.length > 0 && !selectedLaptopToReport) {
        setSelectedLaptopToReport(studentLaptops[0].id);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle Submit Registration
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReg(true);
    setRegErrorMsg(null);
    setRegSuccessMsg(null);

    if (!ownerPhone.trim()) {
      setRegErrorMsg('Phone number of PC owner is strictly required.');
      setSubmittingReg(false);
      return;
    }

    try {
      const students = await api.getStudents();
      const matched = students.find(s => s.studentId === currentUser.studentId || s.userId === currentUser.id) || students[0];

      await api.createRegistration({
        studentId: matched.id,
        brand,
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        deviceType,
        processor,
        ram,
        storage,
        os,
        color,
        physicalDescription,
        ownerPhone: ownerPhone.trim(),
        studentPhotoUrl,
        studentNameAmharic: studentNameAmharic.trim(),
        department: studentDepartment.trim() || matched.department,
        faculty: studentFaculty.trim() || matched.faculty,
        submittedByRole: 'STUDENT',
        submittedByUserId: currentUser.id
      });

      setRegSuccessMsg('Registration request submitted successfully! Your submission is now PENDING review by the campus security police office.');
      setModel('');
      setSerialNumber('');
      setPhysicalDescription('');
      await fetchData();
    } catch (err: any) {
      setRegErrorMsg(err.message || 'Failed to submit registration request');
    } finally {
      setSubmittingReg(false);
    }
  };

  // Handle Submit Lost Report
  const handleSubmitLostReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLaptopToReport) {
      setLostErrorMsg('Please select a registered laptop to report.');
      return;
    }

    setSubmittingLost(true);
    setLostErrorMsg(null);
    setLostSuccessMsg(null);

    try {
      await api.createLostReport({
        laptopId: selectedLaptopToReport,
        incidentType,
        incidentDate: new Date(incidentDate).toISOString(),
        incidentLocation,
        description: incidentDescription,
        contactPhone
      });

      setLostSuccessMsg('Incident report filed with Campus Police Union. Security officers will review and activate gate alerts.');
      setIncidentLocation('');
      setIncidentDescription('');
      await fetchData();
    } catch (err: any) {
      setLostErrorMsg(err.message || 'Failed to submit lost device report');
    } finally {
      setSubmittingLost(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Header with Hawassa University Emblem */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-xs border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
            <img
              src="/assets/aistudio/image_3d6f99fa.png"
              alt="Hawassa University"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#0284C7] tracking-wider block truncate">
              ሀዋሳ ዩኒቨርሲቲ · Student Portal
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              Welcome, {currentUser.fullName}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5 truncate">
              Student ID: {currentUser.studentId || 'HU/14022/13'} · Email: {currentUser.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg bg-slate-100 p-1 text-xs font-semibold overflow-x-auto max-w-full no-scrollbar whitespace-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('MY_LAPTOPS')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeTab === 'MY_LAPTOPS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LaptopIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>My Laptops</span>
            <span className="font-mono bg-slate-200 px-1.5 py-0.2 rounded text-[10px] ml-1">
              {laptops.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('REGISTER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeTab === 'REGISTER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Register New</span>
          </button>

          <button
            onClick={() => setActiveTab('REPORT_LOST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors shrink-0 ${
              activeTab === 'REPORT_LOST' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Report Stolen/Lost</span>
          </button>
        </div>
      </div>

      {/* TAB 1: My Registered Laptops */}
      {activeTab === 'MY_LAPTOPS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">
              Approved Registered Laptops
            </h2>
            <span className="text-xs text-slate-500">
              Use your digital pass at Hawassa University campus gates.
            </span>
          </div>

          {laptops.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 space-y-3">
              <LaptopIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">No Approved Laptops Registered</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have not registered any laptops yet, or your application is currently under review.
              </p>
              <button
                onClick={() => setActiveTab('REGISTER')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Register Laptop Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {laptops.map(laptop => (
                <div
                  key={laptop.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <LaptopIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {laptop.brand} {laptop.model}
                        </h3>
                        <p className="font-mono text-xs font-bold text-blue-600">
                          {laptop.pcId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {laptop.securityStatus === 'REPORTED_LOST' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          REPORTED STOLEN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          APPROVED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Serial Number</span>
                      <span className="font-mono font-bold text-slate-800">{laptop.serialNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gate Status</span>
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.2 rounded text-[10px] ${
                          laptop.currentMovementStatus === 'IN'
                            ? 'bg-blue-100 text-blue-800'
                            : laptop.currentMovementStatus === 'OUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {laptop.currentMovementStatus}
                      </span>
                    </div>
                    {laptop.processor && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Processor</span>
                        <span className="text-slate-700 truncate block">{laptop.processor}</span>
                      </div>
                    )}
                    {laptop.storage && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">RAM / Storage</span>
                        <span className="text-slate-700">{laptop.ram} · {laptop.storage}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: View Printable Pass Card & Sticker and Report Stolen Button */}
                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Registered: {new Date(laptop.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {laptop.securityStatus !== 'REPORTED_LOST' ? (
                        <button
                          onClick={() => {
                            setSelectedLaptopToReport(laptop.id);
                            setActiveTab('REPORT_LOST');
                          }}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          title="Report this PC as Lost or Stolen to campus security"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Report Stolen PC</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>Stolen Alert Active</span>
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedLaptopForPass(laptop)}
                        className="px-3.5 py-1.5 bg-[#0B2A63] hover:bg-[#0E3B85] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Registration History Tracker */}
          {registrations.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Registration Application History
              </h3>
              <div className="divide-y divide-slate-100">
                {registrations.map(reg => (
                  <div key={reg.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{reg.brand} {reg.model}</span>
                      <span className="font-mono text-slate-400 ml-2">({reg.serialNumber})</span>
                      <span className="text-slate-400 ml-2">· {new Date(reg.registrationDate).toLocaleDateString()}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        reg.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : reg.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Register New Laptop Form */}
      {activeTab === 'REGISTER' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Submit Laptop Registration Application
            </h2>
            <p className="text-xs text-slate-500">
              Enter your device hardware specifications. Hawassa University Police Union security officers will verify the details and issue an authorized clearance pass.
            </p>
          </div>

          {regSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {regErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{regErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRegistration} className="space-y-4">
            {/* Student Photo Upload with Live Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID Portrait Photo (የተማሪው ፎቶ)
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="w-14 h-18 rounded-md border border-slate-300 bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative">
                  {studentPhotoUrl ? (
                    <img src={studentPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1 text-slate-400">
                      <Camera className="w-4 h-4 mx-auto text-slate-400" />
                      <span className="text-[8px] block leading-tight mt-0.5">Passport Photo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1 text-xs">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => {
                          if (typeof ev.target?.result === 'string') {
                            setStudentPhotoUrl(ev.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 file:text-[#0B2A63] hover:file:bg-blue-100 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStudentPhotoUrl('/assets/aistudio/student_id_photo.png')}
                      className="text-[10px] text-blue-600 hover:underline font-semibold"
                    >
                      Sample Student Photo
                    </button>
                    {studentPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setStudentPhotoUrl('')}
                        className="text-[10px] text-red-500 hover:underline font-medium ml-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400">
                    Upload your official student ID photo. It will be printed on your gate clearance pass.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (English)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.fullName}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  የተማሪው ሙሉ ስም (Amharic Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ዳዊት ኃይሌ / ጎበዜ ዘለቀ"
                  value={studentNameAmharic}
                  onChange={e => setStudentNameAmharic(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  value={studentDepartment}
                  onChange={e => setStudentDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Faculty / College *
                </label>
                <input
                  type="text"
                  value={studentFaculty}
                  onChange={e => setStudentFaculty(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manufacturer / Brand *
                </label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Dell">Dell</option>
                  <option value="HP">HP</option>
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
                  placeholder="e.g. Latitude 5420, MacBook Air M2"
                  value={model}
                  onChange={e => setModel(e.target.value)}
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
                  placeholder="e.g. SN-DL-882914"
                  value={serialNumber}
                  onChange={e => setSerialNumber(e.target.value)}
                  className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Find on bottom label or BIOS. Duplicates are strictly rejected.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number of PC Owner *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +251 91 234 5678"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Mandatory contact number. Must match owner's active mobile phone.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Device Type
                </label>
                <select
                  value={deviceType}
                  onChange={e => setDeviceType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="MacBook">MacBook</option>
                  <option value="Ultrabook">Ultrabook</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processor (CPU)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intel Core i7 11th Gen"
                  value={processor}
                  onChange={e => setProcessor(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operating System
                </label>
                <input
                  type="text"
                  placeholder="e.g. Windows 11 Pro, Ubuntu 24.04"
                  value={os}
                  onChange={e => setOs(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RAM Memory
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16GB"
                  value={ram}
                  onChange={e => setRam(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chassis Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silver, Matte Black"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Identifying Characteristics
              </label>
              <textarea
                rows={2}
                placeholder="Stickers, scratches, or engravings that help identify your device..."
                value={physicalDescription}
                onChange={e => setPhysicalDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submittingReg}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                {submittingReg ? 'Submitting Application...' : 'Submit for Security Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Report Lost or Stolen Laptop */}
      {activeTab === 'REPORT_LOST' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Report Lost or Stolen Laptop
            </h2>
            <p className="text-xs text-slate-500">
              Submit an urgent missing device report. Once verified by campus police, all gate security terminals will be notified to intercept the hardware.
            </p>
          </div>

          {lostSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-medium">
              {lostSuccessMsg}
            </div>
          )}

          {lostErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-700 font-medium">
              {lostErrorMsg}
            </div>
          )}

          {laptops.length === 0 ? (
            <p className="text-xs text-slate-500">
              You do not have any registered laptops eligible for reporting.
            </p>
          ) : (
            <form onSubmit={handleSubmitLostReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Missing Laptop *
                </label>
                <select
                  value={selectedLaptopToReport}
                  onChange={e => setSelectedLaptopToReport(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {laptops.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.pcId} — {l.brand} {l.model} (SN: {l.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incident Type *
                  </label>
                  <select
                    value={incidentType}
                    onChange={e => setIncidentType(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="LOST_ON_CAMPUS">Lost on Campus Grounds</option>
                    <option value="STOLEN_DORM">Stolen from Dormitory</option>
                    <option value="STOLEN_LIBRARY">Stolen in Library / Study Hall</option>
                    <option value="ROBBERY">Robbery / Snatching Off-Campus</option>
                    <option value="MISPLACED">Misplaced / Forgotten</option>
                    <option value="OTHER">Other Incident</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Approximate Date & Time *
                  </label>
                  <input
                    type="date"
                    required
                    value={incidentDate}
                    onChange={e => setIncidentDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Female Dorm Block 42 Room 304, Main Library 2nd Floor"
                  value={incidentLocation}
                  onChange={e => setIncidentLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description of Circumstances *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe when you last saw the laptop, accompanying bag, charger, or any suspicious individuals..."
                  value={incidentDescription}
                  onChange={e => setIncidentDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+251 9X XXX XXXX"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingLost}
                  className="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {submittingLost ? 'Filing Report...' : 'Submit Incident to Campus Police'}
                </button>
              </div>
            </form>
          )}

          {/* Past Incident Reports */}
          {lostReports.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                My Reported Incidents
              </h3>
              {lostReports.map(rep => (
                <div key={rep.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{rep.brand} {rep.model}</span>
                    <span className="text-slate-400 ml-2">({rep.incidentType})</span>
                    <p className="text-[11px] text-slate-500">Location: {rep.incidentLocation}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      rep.status === 'CONFIRMED'
                        ? 'bg-red-100 text-red-800'
                        : rep.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Card Modal */}
      {selectedLaptopForPass && (
        <PrintableCard
          laptop={selectedLaptopForPass}
          onClose={() => setSelectedLaptopForPass(null)}
        />
      )}
    </div>
  );
};
