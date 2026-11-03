export type Role = 'ADMIN' | 'OFFICER' | 'STUDENT' | 'GATE_OFFICER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  active: boolean;
  createdAt: string;
  studentId?: string; // If student
  gateId?: string;    // If gate officer assigned to default gate
}

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  studentId: string; // e.g. "HU/14022/13"
  institutionalEmail: string;
  department: string;
  faculty: string;
  academicYear: number;
  phone?: string;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'GRADUATED';
  createdAt: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REVOKED';
export type SecurityStatus = 'NORMAL' | 'REPORTED_LOST';
export type MovementStatus = 'IN' | 'OUT' | 'UNKNOWN';

export interface LaptopRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  department: string;
  faculty: string;
  brand: string;
  model: string;
  serialNumber: string;
  deviceType: string;
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
  color?: string;
  physicalDescription?: string;
  ownerPhone?: string;
  status: RegistrationStatus;
  registrationDate: string;
  submittedByRole: 'STUDENT' | 'OFFICER';
  submittedByUserId: string;
  reviewedByOfficerId?: string;
  reviewedByOfficerName?: string;
  reviewDate?: string;
  rejectionReason?: string;
  pcId?: string;
}

export interface Laptop {
  id: string;
  pcId: string; // e.g. "CG-LPT-000001"
  registrationId: string;
  studentId: string;
  studentName: string;
  studentIdNumber: string;
  department: string;
  faculty: string;
  brand: string;
  model: string;
  serialNumber: string;
  deviceType: string;
  processor?: string;
  ram?: string;
  storage?: string;
  os?: string;
  color?: string;
  physicalDescription?: string;
  ownerPhone?: string;
  status: RegistrationStatus;
  securityStatus: SecurityStatus;
  qrToken: string;
  currentMovementStatus: MovementStatus;
  lastMovementDate?: string;
  lastMovementGate?: string;
  lastMovementOfficer?: string;
  createdAt: string;
}

export interface Gate {
  id: string;
  code: string;
  name: string;
  location: string;
  active: boolean;
}

export type MovementType = 'IN' | 'OUT';
export type VerificationMethod = 'QR_SCAN' | 'MANUAL_SEARCH';
export type VerificationResult = 'VALID' | 'REPORTED_LOST' | 'SUSPENDED' | 'REVOKED' | 'NOT_FOUND';

export interface SecurityEvent {
  id: string;
  laptopId: string;
  pcId: string;
  studentName: string;
  studentIdNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  gateId: string;
  gateName: string;
  officerId: string;
  officerName: string;
  movementType: MovementType;
  verificationMethod: VerificationMethod;
  verificationResult: VerificationResult;
  notes?: string;
  timestamp: string;
}

export type LostIncidentType =
  | 'LOST_ON_CAMPUS'
  | 'STOLEN_DORM'
  | 'STOLEN_LIBRARY'
  | 'ROBBERY'
  | 'MISPLACED'
  | 'OTHER';

export type LostReportStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'UNDER_EXECUTION'
  | 'CONFIRMED'
  | 'FOUND'
  | 'RESOLVED'
  | 'REJECTED';

export interface LostReport {
  id: string;
  laptopId: string;
  pcId: string;
  brand: string;
  model: string;
  serialNumber: string;
  reportingStudentId: string;
  reportingStudentName: string;
  studentIdNumber: string;
  incidentType: LostIncidentType;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  contactPhone: string;
  status: LostReportStatus;
  reviewedByOfficerId?: string;
  reviewedByOfficerName?: string;
  reviewNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AlertAcknowledgement {
  officerId: string;
  officerName: string;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  type: 'LOST_DEVICE' | 'SECURITY_WARNING' | 'ANNOUNCEMENT';
  title: string;
  message: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  laptopId?: string;
  pcId?: string;
  lostReportId?: string;
  active: boolean;
  createdAt: string;
  acknowledgements: AlertAcknowledgement[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetEntity: string;
  targetId: string;
  timestamp: string;
  ipAddress: string;
  outcome: 'SUCCESS' | 'FAILURE';
  details: string;
}

export interface VerificationResponse {
  outcome: VerificationResult;
  message: string;
  laptop?: Laptop;
  student?: {
    fullName: string;
    studentId: string;
    department: string;
    faculty: string;
    phone?: string;
    accountStatus: string;
  };
  previousMovement?: {
    status: MovementStatus;
    timestamp?: string;
    gateName?: string;
  };
  activeLostReport?: LostReport;
}
