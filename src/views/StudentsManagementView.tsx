import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, Laptop } from '../types';
import { PrintableCard } from '../components/PrintableCard';
import {
  Users,
  Search,
  Laptop as LaptopIcon,
  PlusCircle,
  CheckCircle,
  RefreshCw,
  X,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Cpu,
  HardDrive,
  HardDriveDownload,
  Info
} from 'lucide-react';

interface StudentsManagementViewProps {
  onNavigateBack?: () => void;
}

export const StudentsManagementView: React.FC<StudentsManagementViewProps> = ({ onNavigateBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add student modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering');
  const [newFaculty, setNewFaculty] = useState('Institute of Technology (IoT)');
  const [newYear, setNewYear] = useState(3);
  const [newPhone, setNewPhone] = useState('');

  // PC Registration fields inside Create Student Modal
  const [registerPcWithStudent, setRegisterPcWithStudent] = useState(true);
  const [pcBrand, setPcBrand] = useState('Dell');
  const [pcModel, setPcModel] = useState('');
  const [pcSerialNumber, setPcSerialNumber] = useState('');
  const [pcDeviceType, setPcDeviceType] = useState('Laptop');
  const [pcProcessor, setPcProcessor] = useState('Intel Core i5');
  const [pcRam, setPcRam] = useState('16GB DDR4');
  const [pcStorage, setPcStorage] = useState('512GB NVMe SSD');
  const [pcOs, setPcOs] = useState('Windows 11 Pro');
  const [pcColor, setPcColor] = useState('Silver / Dark Gray');
  const [pcDescription, setPcDescription] = useState('');

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Quick Register PC for Existing Student modal
  const [registerPcStudent, setRegisterPcStudent] = useState<Student | null>(null);
  const [quickBrand, setQuickBrand] = useState('HP');
  const [quickModel, setQuickModel] = useState('');
  const [quickSerialNumber, setQuickSerialNumber] = useState('');
  const [quickDeviceType, setQuickDeviceType] = useState('Laptop');
  const [quickProcessor, setQuickProcessor] = useState('Intel Core i5');
  const [quickRam, setQuickRam] = useState('16GB');
  const [quickStorage, setQuickStorage] = useState('512GB SSD');
  const [quickOs, setQuickOs] = useState('Windows 11');
  const [quickColor, setQuickColor] = useState('Black / Charcoal');
  const [quickDescription, setQuickDescription] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Modal to display newly issued PrintableCard pass
  const [activePrintLaptop, setActivePrintLaptop] = useState<Laptop | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stu, lpt] = await Promise.all([
        api.getStudents(),
        api.getLaptops()
      ]);
      setStudents(stu);
      setLaptops(lpt);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const payload: any = {
        username: `student.${newFullName.toLowerCase().replace(/\s+/g, '.')}`,
        email: newEmail.trim(),
        password: 'Student@123',
        fullName: newFullName.trim(),
        role: 'STUDENT',
        phone: newPhone.trim(),
        studentId: newStudentId.trim(),
        department: newDepartment.trim(),
        faculty: newFaculty.trim(),
        academicYear: newYear
      };

      if (registerPcWithStudent && pcSerialNumber.trim() && pcModel.trim()) {
        payload.laptopDetails = {
          brand: pcBrand,
          model: pcModel.trim(),
          serialNumber: pcSerialNumber.trim(),
          deviceType: pcDeviceType,
          processor: pcProcessor,
          ram: pcRam,
          storage: pcStorage,
          os: pcOs,
          color: pcColor,
          physicalDescription: pcDescription.trim()
        };
      }

      const res: any = await api.createUser(payload);

      setShowAddModal(false);
      // Reset form fields
      setNewFullName('');
      setNewStudentId('');
      setNewEmail('');
      setNewPhone('');
      setPcModel('');
      setPcSerialNumber('');
      setPcDescription('');

      // Refresh data
      await fetchData();

      // If a laptop was created, show the printable pass immediately!
      if (res?.createdLaptop) {
        setActivePrintLaptop(res.createdLaptop);
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create student and register PC');
    } finally {
      setAddLoading(false);
    }
  };

  const handleQuickRegisterPc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerPcStudent) return;
    setQuickLoading(true);
    setQuickError(null);

    try {
      const reg = await api.createRegistration({
        studentId: registerPcStudent.id,
        brand: quickBrand,
        model: quickModel.trim(),
        serialNumber: quickSerialNumber.trim(),
        deviceType: quickDeviceType,
        processor: quickProcessor,
        ram: quickRam,
        storage: quickStorage,
        os: quickOs,
        color: quickColor,
        physicalDescription: quickDescription.trim(),
        autoApprove: true
      });

      // Refresh laptops
      const freshLaptops = await api.getLaptops();
      setLaptops(freshLaptops);
      const newlyCreated = freshLaptops.find(l => l.pcId === reg.pcId || l.serialNumber.toUpperCase() === quickSerialNumber.trim().toUpperCase());

      setRegisterPcStudent(null);
      setQuickModel('');
      setQuickSerialNumber('');
      setQuickDescription('');

      if (newlyCreated) {
        setActivePrintLaptop(newlyCreated);
      }
    } catch (err: any) {
      setQuickError(err.message || 'Failed to register PC for student');
    } finally {
      setQuickLoading(false);
    }
  };

  const departments = Array.from(new Set(students.map(s => s.department)));

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.institutionalEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getStudentLaptops = (studentId: string) => {
    return laptops.filter(l => l.studentId === studentId || l.studentIdNumber === studentId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0B2A63] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs shrink-0"
              title="Return to Security Overview Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0B2A63]" />
              <span className="hidden xs:inline">Back</span>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
              <Users className="w-5 h-5 text-[#0B2A63] shrink-0" />
              <span className="truncate">Student Management & PC Registry</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              Registered Hawassa University student profiles and associated hardware assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white bg-[#0B2A63] hover:bg-[#071d47] rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-[#F59E0B]" />
            <span>Add Student Profile</span>
          </button>
          <button
            onClick={fetchData}
            title="Refresh Registry"
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search students by name, ID number, or institutional email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium text-slate-700"
        >
          <option value="ALL">All Departments ({departments.length})</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-[#0B2A63]/5 text-[#0B2A63] border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Student ID</th>
                <th className="py-2.5 px-4">Department & Faculty</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-4">Registered PCs</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const studentLaptops = getStudentLaptops(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[11px] text-slate-500">{student.institutionalEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0B2A63]">
                        {student.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{student.department}</span>
                        <span className="text-[10px] text-slate-400 block">{student.faculty}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-600">
                        Year {student.academicYear}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <LaptopIcon className="w-3.5 h-3.5 text-[#0284C7]" />
                          <span className="font-mono bg-blue-50 px-2 py-0.5 rounded text-[#0B2A63] border border-blue-200">
                            {studentLaptops.length} {studentLaptops.length === 1 ? 'PC' : 'PCs'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {student.accountStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setRegisterPcStudent(student);
                              setQuickModel('');
                              setQuickSerialNumber('');
                              setQuickDescription('');
                              setQuickError(null);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            title="Register a Laptop / PC for this student"
                          >
                            <PlusCircle className="w-3 h-3 text-blue-600" />
                            <span>+ Register PC</span>
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details & Registered Laptops Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">Student ID: {selectedStudent.studentId}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3 sm:p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                <span className="font-medium text-slate-800">{selectedStudent.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty</span>
                <span className="font-medium text-slate-800">{selectedStudent.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Institutional Email</span>
                <span className="text-slate-700 font-mono text-[11px] truncate block">{selectedStudent.institutionalEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Number</span>
                <span className="text-slate-700">{selectedStudent.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                  <LaptopIcon className="w-3.5 h-3.5 text-[#0B2A63]" />
                  <span>Registered Hardware Assets ({getStudentLaptops(selectedStudent.id).length})</span>
                </h4>
                <button
                  onClick={() => {
                    setRegisterPcStudent(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Register New PC</span>
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {getStudentLaptops(selectedStudent.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 text-slate-500 text-xs text-center rounded-lg border border-dashed border-slate-200">
                    No laptops registered yet for this student. Click "+ Register New PC" to register one.
                  </div>
                ) : (
                  getStudentLaptops(selectedStudent.id).map(lpt => (
                    <div
                      key={lpt.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center hover:border-blue-300 transition-colors shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#0B2A63] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {lpt.pcId}
                          </span>
                          <span className="text-slate-900 font-semibold">{lpt.brand} {lpt.model}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          S/N: {lpt.serialNumber} · {lpt.processor || 'CPU'} · {lpt.ram || 'RAM'} · {lpt.storage || 'SSD'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            lpt.securityStatus === 'REPORTED_LOST'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {lpt.securityStatus}
                        </span>
                        <button
                          onClick={() => {
                            setActivePrintLaptop(lpt);
                            setSelectedStudent(null);
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-[#0B2A63] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1"
                          title="View / Print Hawassa University Security Clearance Pass"
                        >
                          <QrCode className="w-3 h-3 text-[#0B2A63]" />
                          <span>Pass</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW STUDENT PROFILE MODAL (with PC and PC Detail Registration as requested) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#0B2A63]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Create New Student Profile</h3>
                  <p className="text-[11px] text-slate-500">Enroll student and register their hardware asset in one step</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-red-600" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              {/* Section 1: Student Information */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  1. Student Identity Information
                </h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dawit Haile"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Student ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="HU/16109/15"
                      value={newStudentId}
                      onChange={e => setNewStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-slate-800 uppercase focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={newYear}
                      onChange={e => setNewYear(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@hu.edu.et"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={e => setNewDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Faculty / College</label>
                    <input
                      type="text"
                      value={newFaculty}
                      onChange={e => setNewFaculty(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+251 9X XXX XXXX"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#0B2A63]"
                  />
                </div>
              </div>

              {/* Section 2: Student PC & PC Detail Registration (Requested Feature) */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between bg-blue-50/80 p-3 rounded-lg border border-blue-200/80 mb-3">
                  <div className="flex items-center gap-2">
                    <LaptopIcon className="w-4 h-4 text-[#0B2A63]" />
                    <div>
                      <span className="font-bold text-slate-900 block">Register Student PC & PC Details</span>
                      <span className="text-[11px] text-slate-500">Assign official CampusGuard PC ID and cryptographic QR pass</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="registerPcCheckbox"
                    checked={registerPcWithStudent}
                    onChange={e => setRegisterPcWithStudent(e.target.checked)}
                    className="w-4 h-4 text-[#0B2A63] rounded border-slate-300 focus:ring-[#0B2A63]"
                  />
                </div>

                {registerPcWithStudent && (
                  <div className="space-y-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">PC Brand *</label>
                        <select
                          value={pcBrand}
                          onChange={e => setPcBrand(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        >
                          <option value="Dell">Dell</option>
                          <option value="HP">HP</option>
                          <option value="Lenovo">Lenovo</option>
                          <option value="Apple">Apple (MacBook)</option>
                          <option value="Asus">Asus</option>
                          <option value="Acer">Acer</option>
                          <option value="Toshiba">Toshiba</option>
                          <option value="Samsung">Samsung</option>
                          <option value="Microsoft Surface">Microsoft Surface</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Model Name / Number *</label>
                        <input
                          type="text"
                          required={registerPcWithStudent}
                          placeholder="e.g. Latitude 5420 / ThinkPad T14"
                          value={pcModel}
                          onChange={e => setPcModel(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Hardware Serial Number (S/N) *</label>
                        <input
                          type="text"
                          required={registerPcWithStudent}
                          placeholder="e.g. CN-0XYZ12-12345"
                          value={pcSerialNumber}
                          onChange={e => setPcSerialNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white font-mono uppercase"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">From chassis or BIOS</span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Device Form Factor</label>
                        <select
                          value={pcDeviceType}
                          onChange={e => setPcDeviceType(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                        >
                          <option value="Laptop">Standard Laptop</option>
                          <option value="Ultrabook">Ultrabook</option>
                          <option value="MacBook">MacBook</option>
                          <option value="2-in-1 Convertible">2-in-1 Convertible</option>
                          <option value="Mobile Workstation">Mobile Workstation</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Processor (CPU)</label>
                        <input
                          type="text"
                          placeholder="e.g. Core i5-1135G7"
                          value={pcProcessor}
                          onChange={e => setPcProcessor(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">RAM Capacity</label>
                        <input
                          type="text"
                          placeholder="e.g. 16GB"
                          value={pcRam}
                          onChange={e => setPcRam(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Storage</label>
                        <input
                          type="text"
                          placeholder="e.g. 512GB SSD"
                          value={pcStorage}
                          onChange={e => setPcStorage(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Operating System</label>
                        <select
                          value={pcOs}
                          onChange={e => setPcOs(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white text-[11px]"
                        >
                          <option value="Windows 11 Pro">Windows 11 Pro</option>
                          <option value="Windows 10">Windows 10</option>
                          <option value="macOS Sonoma">macOS Sonoma</option>
                          <option value="Ubuntu / Linux">Ubuntu / Linux</option>
                          <option value="Dual Boot Win/Linux">Dual Boot Win/Linux</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">PC Color / Finish</label>
                        <input
                          type="text"
                          placeholder="e.g. Silver / Matte Black"
                          value={pcColor}
                          onChange={e => setPcColor(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 bg-white text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Distinguishing Physical Marks / Notes
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hawassa Uni sticker on lid, minor dent on front left corner"
                        value={pcDescription}
                        onChange={e => setPcDescription(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 font-bold text-white bg-[#0B2A63] hover:bg-[#071d47] rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  {addLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Student & PC...</span>
                    </>
                  ) : (
                    <span>Create Student & Register PC</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK REGISTER PC FOR AN EXISTING STUDENT MODAL */}
      {registerPcStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <LaptopIcon className="w-4 h-4 text-[#0B2A63]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Register PC for Student</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {registerPcStudent.fullName} ({registerPcStudent.studentId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRegisterPcStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {quickError}
              </div>
            )}

            <form onSubmit={handleQuickRegisterPc} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PC Brand *</label>
                  <select
                    value={quickBrand}
                    onChange={e => setQuickBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Apple">Apple (MacBook)</option>
                    <option value="Asus">Asus</option>
                    <option value="Acer">Acer</option>
                    <option value="Toshiba">Toshiba</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model Name / Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EliteBook 840 G8"
                    value={quickModel}
                    onChange={e => setQuickModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hardware Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5CD12345XYZ"
                    value={quickSerialNumber}
                    onChange={e => setQuickSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Device Form Factor</label>
                  <select
                    value={quickDeviceType}
                    onChange={e => setQuickDeviceType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="Laptop">Standard Laptop</option>
                    <option value="Ultrabook">Ultrabook</option>
                    <option value="MacBook">MacBook</option>
                    <option value="2-in-1 Convertible">2-in-1 Convertible</option>
                    <option value="Mobile Workstation">Mobile Workstation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Processor</label>
                  <input
                    type="text"
                    value={quickProcessor}
                    onChange={e => setQuickProcessor(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RAM</label>
                  <input
                    type="text"
                    value={quickRam}
                    onChange={e => setQuickRam(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage</label>
                  <input
                    type="text"
                    value={quickStorage}
                    onChange={e => setQuickStorage(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Operating System</label>
                  <input
                    type="text"
                    value={quickOs}
                    onChange={e => setQuickOs(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color / Finish</label>
                  <input
                    type="text"
                    value={quickColor}
                    onChange={e => setQuickColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Distinguishing Physical Marks</label>
                <input
                  type="text"
                  placeholder="e.g. Engraved ID, stickers on outer shell"
                  value={quickDescription}
                  onChange={e => setQuickDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRegisterPcStudent(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickLoading}
                  className="px-5 py-2 font-bold text-white bg-[#0B2A63] hover:bg-[#071d47] rounded-lg shadow-sm transition-all flex items-center gap-2"
                >
                  {quickLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Issuing Pass...</span>
                    </>
                  ) : (
                    <span>Register PC & Issue Pass</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE CARD / PASS MODAL */}
      {activePrintLaptop && (
        <PrintableCard
          laptop={activePrintLaptop}
          onClose={() => setActivePrintLaptop(null)}
        />
      )}
    </div>
  );
};
