import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Student, Laptop } from '../types';
import {
  Users,
  Search,
  Laptop as LaptopIcon,
  PlusCircle,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';

export const StudentsManagementView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Add student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('Software Engineering');
  const [newFaculty, setNewFaculty] = useState('Institute of Technology (IoT)');
  const [newYear, setNewYear] = useState(3);
  const [newPhone, setNewPhone] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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
      await api.createUser({
        username: `student.${newFullName.toLowerCase().replace(/\s+/g, '.')}`,
        email: newEmail,
        password: 'Student@123',
        fullName: newFullName,
        role: 'STUDENT',
        phone: newPhone,
        studentId: newStudentId
      });

      setShowAddModal(false);
      setNewFullName('');
      setNewStudentId('');
      setNewEmail('');
      setNewPhone('');
      await fetchData();
    } catch (err: any) {
      setAddError(err.message || 'Failed to create student');
    } finally {
      setAddLoading(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Student Management
          </h1>
          <p className="text-xs text-slate-500">
            Registered Hawassa University student profiles and associated hardware assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Student Profile
          </button>
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search students by name, ID number, or institutional email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
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
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Department & Faculty</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Laptops</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const studentLaptops = getStudentLaptops(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{student.fullName}</div>
                      <div className="text-[11px] text-slate-500">{student.institutionalEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {student.studentId}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800">{student.department}</span>
                      <span className="text-[10px] text-slate-400 block">{student.faculty}</span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      Year {student.academicYear}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <LaptopIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-mono">{studentLaptops.length}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {student.accountStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details & Owned Laptops Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedStudent.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedStudent.studentId}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                <span className="font-medium text-slate-800">{selectedStudent.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Faculty</span>
                <span className="font-medium text-slate-800">{selectedStudent.faculty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Email</span>
                <span className="text-slate-700">{selectedStudent.institutionalEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone</span>
                <span className="text-slate-700">{selectedStudent.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Registered Laptops ({getStudentLaptops(selectedStudent.id).length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getStudentLaptops(selectedStudent.id).map(lpt => (
                  <div key={lpt.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-blue-700">{lpt.pcId}</span>
                      <span className="text-slate-700 ml-2 font-medium">{lpt.brand} {lpt.model}</span>
                      <span className="text-slate-400 font-mono ml-2">({lpt.serialNumber})</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        lpt.securityStatus === 'REPORTED_LOST'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {lpt.securityStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Create New Student Profile</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {addError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dawit Haile"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="HU/16109/15"
                    value={newStudentId}
                    onChange={e => setNewStudentId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Academic Year</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newYear}
                    onChange={e => setNewYear(parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@hu.edu.et"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={e => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+251 9X XXX XXXX"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                >
                  {addLoading ? 'Saving...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
