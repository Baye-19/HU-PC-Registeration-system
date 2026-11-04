import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  Student,
  LaptopRegistration,
  Laptop,
  Gate,
  SecurityEvent,
  LostReport,
  SecurityAlert,
  AuditLog,
  VerificationResponse,
  MovementType,
  VerificationMethod,
  VerificationResult
} from '../src/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'campusguard_db.json');

export interface DatabaseSchema {
  nextPcIdSequence: number;
  users: (User & { passwordHash: string })[];
  students: Student[];
  gates: Gate[];
  registrations: LaptopRegistration[];
  laptops: Laptop[];
  securityEvents: SecurityEvent[];
  lostReports: LostReport[];
  alerts: SecurityAlert[];
  auditLogs: AuditLog[];
}

class DatabaseService {
  private db: DatabaseSchema;
  private sseClients: ((alert: SecurityAlert) => void)[] = [];

  constructor() {
    this.db = this.loadOrCreateDatabase();
  }

  private loadOrCreateDatabase(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, re-initializing...', err);
      }
    }

    const initialDb = this.createInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private createInitialData(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);

    const users: (User & { passwordHash: string })[] = [
      {
        id: 'usr-admin-1',
        username: 'admin',
        email: 'admin@hu.edu.et',
        fullName: 'Dr. Tadesse Bekele',
        role: 'ADMIN',
        phone: '+251 91 123 4567',
        active: true,
        createdAt: '2026-01-10T08:00:00.000Z',
        passwordHash: bcrypt.hashSync('Admin@123', salt)
      },
      {
        id: 'usr-officer-1',
        username: 'officer.kebede',
        email: 'kebede@security.hu.edu.et',
        fullName: 'Inspector Kebede Wolde',
        role: 'OFFICER',
        phone: '+251 91 234 5678',
        active: true,
        createdAt: '2026-01-12T09:30:00.000Z',
        passwordHash: bcrypt.hashSync('Officer@123', salt)
      },
      {
        id: 'usr-gate-1',
        username: 'gate.main',
        email: 'gate1@security.hu.edu.et',
        fullName: 'Officer Girma Tesfaye',
        role: 'GATE_OFFICER',
        phone: '+251 91 345 6789',
        gateId: 'gate-1',
        active: true,
        createdAt: '2026-01-15T10:00:00.000Z',
        passwordHash: bcrypt.hashSync('Gate@123', salt)
      },
      {
        id: 'usr-student-1',
        username: 'student.abebe',
        email: 'abebe.bikila@hu.edu.et',
        fullName: 'Abebe Bikila',
        role: 'STUDENT',
        phone: '+251 92 456 7890',
        studentId: 'HU/14022/13',
        active: true,
        createdAt: '2026-02-01T11:00:00.000Z',
        passwordHash: bcrypt.hashSync('Student@123', salt)
      },
      {
        id: 'usr-student-2',
        username: 'student.selam',
        email: 'selam.alemu@hu.edu.et',
        fullName: 'Selamawit Alemu',
        role: 'STUDENT',
        phone: '+251 92 567 8901',
        studentId: 'HU/15881/14',
        active: true,
        createdAt: '2026-02-05T14:20:00.000Z',
        passwordHash: bcrypt.hashSync('Student@123', salt)
      },
      {
        id: 'usr-student-3',
        username: 'student.dawit',
        email: 'dawit.haile@hu.edu.et',
        fullName: 'Dawit Haile',
        role: 'STUDENT',
        phone: '+251 92 678 9012',
        studentId: 'HU/16109/15',
        active: true,
        createdAt: '2026-02-10T16:00:00.000Z',
        passwordHash: bcrypt.hashSync('Student@123', salt)
      }
    ];

    const students: Student[] = [
      {
        id: 'stu-1',
        userId: 'usr-student-1',
        fullName: 'Abebe Bikila',
        studentId: 'HU/14022/13',
        institutionalEmail: 'abebe.bikila@hu.edu.et',
        department: 'Software Engineering',
        faculty: 'Institute of Technology (IoT)',
        academicYear: 4,
        phone: '+251 92 456 7890',
        accountStatus: 'ACTIVE',
        createdAt: '2026-02-01T11:00:00.000Z'
      },
      {
        id: 'stu-2',
        userId: 'usr-student-2',
        fullName: 'Selamawit Alemu',
        studentId: 'HU/15881/14',
        institutionalEmail: 'selam.alemu@hu.edu.et',
        department: 'Computer Science',
        faculty: 'Institute of Technology (IoT)',
        academicYear: 3,
        phone: '+251 92 567 8901',
        accountStatus: 'ACTIVE',
        createdAt: '2026-02-05T14:20:00.000Z'
      },
      {
        id: 'stu-3',
        userId: 'usr-student-3',
        fullName: 'Dawit Haile',
        studentId: 'HU/16109/15',
        institutionalEmail: 'dawit.haile@hu.edu.et',
        department: 'Electrical & Computer Engineering',
        faculty: 'Institute of Technology (IoT)',
        academicYear: 2,
        phone: '+251 92 678 9012',
        accountStatus: 'ACTIVE',
        createdAt: '2026-02-10T16:00:00.000Z'
      }
    ];

    const gates: Gate[] = [
      {
        id: 'gate-1',
        code: 'GATE-01',
        name: 'Main Campus Gate (North)',
        location: 'Main Administrative Boulevard',
        active: true
      },
      {
        id: 'gate-2',
        code: 'GATE-02',
        name: 'Polytechnic Technology Gate',
        location: 'IoT Engineering Complex',
        active: true
      },
      {
        id: 'gate-3',
        code: 'GATE-03',
        name: 'Awassa Lake Campus Gate',
        location: 'Southern Residential Sector',
        active: true
      },
      {
        id: 'gate-4',
        code: 'GATE-04',
        name: 'Agricultural Campus Gate',
        location: 'College of Agriculture Boulevard',
        active: true
      }
    ];

    const registrations: LaptopRegistration[] = [
      {
        id: 'reg-1',
        studentId: 'stu-1',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        department: 'Software Engineering',
        faculty: 'Institute of Technology (IoT)',
        brand: 'Dell',
        model: 'Latitude 5420',
        serialNumber: 'SN-DL-882914',
        deviceType: 'Laptop',
        processor: 'Intel Core i7-1185G7',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        os: 'Ubuntu Linux 24.04 LTS',
        color: 'Titanium Gray',
        physicalDescription: 'Small Hawassa University IoT sticker on bottom chassis edge',
        status: 'APPROVED',
        registrationDate: '2026-02-02T10:00:00.000Z',
        submittedByRole: 'STUDENT',
        submittedByUserId: 'usr-student-1',
        reviewedByOfficerId: 'usr-officer-1',
        reviewedByOfficerName: 'Inspector Kebede Wolde',
        reviewDate: '2026-02-02T14:30:00.000Z',
        pcId: 'CG-LPT-000001'
      },
      {
        id: 'reg-2',
        studentId: 'stu-1',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        department: 'Software Engineering',
        faculty: 'Institute of Technology (IoT)',
        brand: 'HP',
        model: 'ProBook 450 G8',
        serialNumber: 'SN-HP-339102',
        deviceType: 'Laptop',
        processor: 'Intel Core i5-1135G7',
        ram: '8GB DDR4',
        storage: '256GB SSD',
        os: 'Windows 11 Pro',
        color: 'Natural Silver',
        physicalDescription: 'Minor scratch near HDMI port',
        status: 'APPROVED',
        registrationDate: '2026-02-03T11:15:00.000Z',
        submittedByRole: 'OFFICER',
        submittedByUserId: 'usr-officer-1',
        reviewedByOfficerId: 'usr-officer-1',
        reviewedByOfficerName: 'Inspector Kebede Wolde',
        reviewDate: '2026-02-03T11:20:00.000Z',
        pcId: 'CG-LPT-000002'
      },
      {
        id: 'reg-3',
        studentId: 'stu-2',
        studentName: 'Selamawit Alemu',
        studentIdNumber: 'HU/15881/14',
        department: 'Computer Science',
        faculty: 'Institute of Technology (IoT)',
        brand: 'Lenovo',
        model: 'ThinkPad T14 Gen 2',
        serialNumber: 'SN-LN-994112',
        deviceType: 'Laptop',
        processor: 'AMD Ryzen 7 PRO 5850U',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        os: 'Windows 11 Pro',
        color: 'Matte Black',
        physicalDescription: 'Red TrackPoint cap, small engraving on hinge',
        status: 'APPROVED',
        registrationDate: '2026-02-06T09:00:00.000Z',
        submittedByRole: 'STUDENT',
        submittedByUserId: 'usr-student-2',
        reviewedByOfficerId: 'usr-officer-1',
        reviewedByOfficerName: 'Inspector Kebede Wolde',
        reviewDate: '2026-02-06T13:00:00.000Z',
        pcId: 'CG-LPT-000003'
      },
      {
        id: 'reg-4',
        studentId: 'stu-3',
        studentName: 'Dawit Haile',
        studentIdNumber: 'HU/16109/15',
        department: 'Electrical & Computer Engineering',
        faculty: 'Institute of Technology (IoT)',
        brand: 'Apple',
        model: 'MacBook Air M2',
        serialNumber: 'SN-AP-771029',
        deviceType: 'Laptop',
        processor: 'Apple M2 8-core',
        ram: '16GB Unified',
        storage: '512GB SSD',
        os: 'macOS Sequoia',
        color: 'Midnight Navy',
        physicalDescription: 'Matte protective skin on top lid',
        status: 'PENDING',
        registrationDate: '2026-03-01T08:45:00.000Z',
        submittedByRole: 'STUDENT',
        submittedByUserId: 'usr-student-3'
      }
    ];

    const laptops: Laptop[] = [
      {
        id: 'lpt-1',
        pcId: 'CG-LPT-000001',
        registrationId: 'reg-1',
        studentId: 'stu-1',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        department: 'Software Engineering',
        faculty: 'Institute of Technology (IoT)',
        brand: 'Dell',
        model: 'Latitude 5420',
        serialNumber: 'SN-DL-882914',
        deviceType: 'Laptop',
        processor: 'Intel Core i7-1185G7',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        os: 'Ubuntu Linux 24.04 LTS',
        color: 'Titanium Gray',
        physicalDescription: 'Small Hawassa University IoT sticker on bottom chassis edge',
        status: 'APPROVED',
        securityStatus: 'NORMAL',
        qrToken: 'cg_tok_4a8f9b2c1d0e3f4a5b6c7d8e9f0a1b2c',
        currentMovementStatus: 'IN',
        lastMovementDate: '2026-03-02T08:15:00.000Z',
        lastMovementGate: 'Main Campus Gate (North)',
        lastMovementOfficer: 'Officer Girma Tesfaye',
        createdAt: '2026-02-02T14:30:00.000Z'
      },
      {
        id: 'lpt-2',
        pcId: 'CG-LPT-000002',
        registrationId: 'reg-2',
        studentId: 'stu-1',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        department: 'Software Engineering',
        faculty: 'Institute of Technology (IoT)',
        brand: 'HP',
        model: 'ProBook 450 G8',
        serialNumber: 'SN-HP-339102',
        deviceType: 'Laptop',
        processor: 'Intel Core i5-1135G7',
        ram: '8GB DDR4',
        storage: '256GB SSD',
        os: 'Windows 11 Pro',
        color: 'Natural Silver',
        physicalDescription: 'Minor scratch near HDMI port',
        status: 'APPROVED',
        securityStatus: 'NORMAL',
        qrToken: 'cg_tok_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
        currentMovementStatus: 'OUT',
        lastMovementDate: '2026-03-01T17:45:00.000Z',
        lastMovementGate: 'Polytechnic Technology Gate',
        lastMovementOfficer: 'Inspector Kebede Wolde',
        createdAt: '2026-02-03T11:20:00.000Z'
      },
      {
        id: 'lpt-3',
        pcId: 'CG-LPT-000003',
        registrationId: 'reg-3',
        studentId: 'stu-2',
        studentName: 'Selamawit Alemu',
        studentIdNumber: 'HU/15881/14',
        department: 'Computer Science',
        faculty: 'Institute of Technology (IoT)',
        brand: 'Lenovo',
        model: 'ThinkPad T14 Gen 2',
        serialNumber: 'SN-LN-994112',
        deviceType: 'Laptop',
        processor: 'AMD Ryzen 7 PRO 5850U',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        os: 'Windows 11 Pro',
        color: 'Matte Black',
        physicalDescription: 'Red TrackPoint cap, small engraving on hinge',
        status: 'APPROVED',
        securityStatus: 'REPORTED_LOST',
        qrToken: 'cg_tok_9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
        currentMovementStatus: 'OUT',
        lastMovementDate: '2026-02-28T16:00:00.000Z',
        lastMovementGate: 'Main Campus Gate (North)',
        lastMovementOfficer: 'Officer Girma Tesfaye',
        createdAt: '2026-02-06T13:00:00.000Z'
      }
    ];

    const lostReports: LostReport[] = [
      {
        id: 'rep-1',
        laptopId: 'lpt-3',
        pcId: 'CG-LPT-000003',
        brand: 'Lenovo',
        model: 'ThinkPad T14 Gen 2',
        serialNumber: 'SN-LN-994112',
        reportingStudentId: 'stu-2',
        reportingStudentName: 'Selamawit Alemu',
        studentIdNumber: 'HU/15881/14',
        incidentType: 'STOLEN_DORM',
        incidentDate: '2026-03-01T21:30:00.000Z',
        incidentLocation: 'Female Dormitory Block 42, Room 304',
        description: 'Laptop was charging on desk while student went to common study hall. On return at 22:30, laptop and charger were missing. Window latch was forced.',
        contactPhone: '+251 92 567 8901',
        status: 'CONFIRMED',
        reviewedByOfficerId: 'usr-officer-1',
        reviewedByOfficerName: 'Inspector Kebede Wolde',
        reviewNotes: 'Confirmed by dormitory proctor. Dispatched immediate campus gate perimeter alert.',
        createdAt: '2026-03-02T06:30:00.000Z'
      }
    ];

    const alerts: SecurityAlert[] = [
      {
        id: 'alt-1',
        type: 'LOST_DEVICE',
        title: 'ALERT: Confirmed Stolen Laptop [CG-LPT-000003]',
        message: 'Lenovo ThinkPad T14 (SN: SN-LN-994112) reported stolen from Female Dorm Block 42. Detain device at all gate terminals and notify Campus Police Union immediately.',
        severity: 'HIGH',
        laptopId: 'lpt-3',
        pcId: 'CG-LPT-000003',
        lostReportId: 'rep-1',
        active: true,
        createdAt: '2026-03-02T06:45:00.000Z',
        acknowledgements: [
          {
            officerId: 'usr-gate-1',
            officerName: 'Officer Girma Tesfaye',
            timestamp: '2026-03-02T07:05:00.000Z'
          }
        ]
      }
    ];

    const securityEvents: SecurityEvent[] = [
      {
        id: 'evt-1',
        laptopId: 'lpt-1',
        pcId: 'CG-LPT-000001',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        brand: 'Dell',
        model: 'Latitude 5420',
        serialNumber: 'SN-DL-882914',
        gateId: 'gate-1',
        gateName: 'Main Campus Gate (North)',
        officerId: 'usr-gate-1',
        officerName: 'Officer Girma Tesfaye',
        movementType: 'IN',
        verificationMethod: 'QR_SCAN',
        verificationResult: 'VALID',
        notes: 'Regular morning entry with verified student ID card',
        timestamp: '2026-03-02T08:15:00.000Z'
      },
      {
        id: 'evt-2',
        laptopId: 'lpt-2',
        pcId: 'CG-LPT-000002',
        studentName: 'Abebe Bikila',
        studentIdNumber: 'HU/14022/13',
        brand: 'HP',
        model: 'ProBook 450 G8',
        serialNumber: 'SN-HP-339102',
        gateId: 'gate-2',
        gateName: 'Polytechnic Technology Gate',
        officerId: 'usr-officer-1',
        officerName: 'Inspector Kebede Wolde',
        movementType: 'OUT',
        verificationMethod: 'MANUAL_SEARCH',
        verificationResult: 'VALID',
        notes: 'Student departing for internship project off-campus',
        timestamp: '2026-03-01T17:45:00.000Z'
      }
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'aud-1',
        actorId: 'usr-admin-1',
        actorName: 'Dr. Tadesse Bekele',
        actorRole: 'ADMIN',
        action: 'SYSTEM_BOOTSTRAP',
        targetEntity: 'SYSTEM',
        targetId: 'CAMPUSGUARD-HU',
        timestamp: '2026-01-10T08:00:00.000Z',
        ipAddress: '10.20.1.5',
        outcome: 'SUCCESS',
        details: 'Initial system deployment and database structure initialization for Hawassa University'
      },
      {
        id: 'aud-2',
        actorId: 'usr-officer-1',
        actorName: 'Inspector Kebede Wolde',
        actorRole: 'OFFICER',
        action: 'LAPTOP_REGISTRATION_APPROVE',
        targetEntity: 'LaptopRegistration',
        targetId: 'reg-1',
        timestamp: '2026-02-02T14:30:00.000Z',
        ipAddress: '10.20.4.12',
        outcome: 'SUCCESS',
        details: 'Approved Dell Latitude 5420 registration for student Abebe Bikila (HU/14022/13). Issued PC ID CG-LPT-000001.'
      },
      {
        id: 'aud-3',
        actorId: 'usr-officer-1',
        actorName: 'Inspector Kebede Wolde',
        actorRole: 'OFFICER',
        action: 'SECURITY_ALERT_BROADCAST',
        targetEntity: 'SecurityAlert',
        targetId: 'alt-1',
        timestamp: '2026-03-02T06:45:00.000Z',
        ipAddress: '10.20.4.12',
        outcome: 'SUCCESS',
        details: 'Broadcast HIGH priority alert for stolen Lenovo ThinkPad [CG-LPT-000003] to all campus gate terminals.'
      }
    ];

    return {
      nextPcIdSequence: 4,
      users,
      students,
      gates,
      registrations,
      laptops,
      securityEvents,
      lostReports,
      alerts,
      auditLogs
    };
  }

  // --- Helpers ---
  public getNextPcId(): string {
    const seq = this.db.nextPcIdSequence;
    this.db.nextPcIdSequence += 1;
    this.save();
    return `CG-LPT-${String(seq).padStart(6, '0')}`;
  }

  public generateQrToken(): string {
    return `cg_tok_${crypto.randomBytes(16).toString('hex')}`;
  }

  public logAudit(
    actor: { id: string; fullName: string; role: any },
    action: string,
    targetEntity: string,
    targetId: string,
    outcome: 'SUCCESS' | 'FAILURE',
    details: string,
    ipAddress = '127.0.0.1'
  ): AuditLog {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      actorId: actor.id,
      actorName: actor.fullName,
      actorRole: actor.role,
      action,
      targetEntity,
      targetId,
      timestamp: new Date().toISOString(),
      ipAddress,
      outcome,
      details
    };
    this.db.auditLogs.unshift(log);
    this.save();
    return log;
  }

  // --- Real-time SSE Alerts ---
  public registerSseClient(handler: (alert: SecurityAlert) => void): () => void {
    this.sseClients.push(handler);
    return () => {
      this.sseClients = this.sseClients.filter(c => c !== handler);
    };
  }

  public broadcastAlert(alert: SecurityAlert): void {
    for (const client of this.sseClients) {
      try {
        client(alert);
      } catch (err) {
        console.error('Error broadcasting to SSE client:', err);
      }
    }
  }

  // --- Users & Auth ---
  public getUsers() {
    return this.db.users.map(({ passwordHash, ...rest }) => rest);
  }

  public getUserById(id: string) {
    const u = this.db.users.find(u => u.id === id);
    if (!u) return null;
    const { passwordHash, ...rest } = u;
    return rest;
  }

  public getUserByUsernameOrEmail(identifier: string) {
    const norm = identifier.trim().toLowerCase();
    return this.db.users.find(
      u => u.username.toLowerCase() === norm || u.email.toLowerCase() === norm
    );
  }

  public createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: any;
    phone?: string;
    studentId?: string;
    gateId?: string;
  }, actor: any) {
    const existing = this.getUserByUsernameOrEmail(userData.username) || this.getUserByUsernameOrEmail(userData.email);
    if (existing) {
      throw new Error('User with this username or institutional email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser = {
      id,
      username: userData.username.trim(),
      email: userData.email.trim().toLowerCase(),
      fullName: userData.fullName.trim(),
      role: userData.role,
      phone: userData.phone,
      studentId: userData.studentId,
      gateId: userData.gateId,
      active: true,
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(userData.password, salt)
    };

    this.db.users.push(newUser);

    if (userData.role === 'STUDENT' && userData.studentId) {
      const studentPhoto = (userData as any).photoUrl || (userData as any).studentPhotoUrl;
      const studentNameAmharic = (userData as any).studentNameAmharic;
      const studentRecord: Student = {
        id: `stu-${Date.now()}`,
        userId: id,
        fullName: userData.fullName.trim(),
        studentNameAmharic: studentNameAmharic?.trim(),
        studentId: userData.studentId.trim(),
        institutionalEmail: userData.email.trim().toLowerCase(),
        department: (userData as any).department?.trim() || 'Software Engineering',
        faculty: (userData as any).faculty?.trim() || 'Institute of Technology (IoT)',
        academicYear: (userData as any).academicYear ? parseInt((userData as any).academicYear) : 1,
        phone: userData.phone,
        photoUrl: studentPhoto,
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      this.db.students.push(studentRecord);

      // If PC / Laptop details were provided during student creation
      const laptopData = (userData as any).laptopDetails;
      let createdLaptop: Laptop | undefined = undefined;
      if (laptopData && laptopData.serialNumber && laptopData.model) {
        const reg = this.createRegistration({
          studentId: studentRecord.id,
          brand: laptopData.brand || 'Dell',
          model: laptopData.model,
          serialNumber: laptopData.serialNumber,
          deviceType: laptopData.deviceType || 'Laptop',
          processor: laptopData.processor,
          ram: laptopData.ram,
          storage: laptopData.storage,
          os: laptopData.os,
          color: laptopData.color,
          physicalDescription: laptopData.physicalDescription,
          ownerPhone: laptopData.ownerPhone || studentRecord.phone,
          studentPhotoUrl: laptopData.studentPhotoUrl || studentPhoto,
          studentNameAmharic: laptopData.studentNameAmharic || studentNameAmharic,
          department: laptopData.department || studentRecord.department,
          faculty: laptopData.faculty || studentRecord.faculty,
          submittedByRole: actor.role === 'ADMIN' ? 'OFFICER' : (actor.role || 'OFFICER'),
          submittedByUserId: actor.id,
          autoApprove: true
        }, actor);
        createdLaptop = this.db.laptops.find(l => l.pcId === reg.pcId);
      }
      this.logAudit(actor, 'USER_CREATE', 'User', id, 'SUCCESS', `Created ${userData.role} user account for ${userData.fullName} (${userData.email})${createdLaptop ? ` with Laptop ${createdLaptop.pcId}` : ''}`);
      this.save();
      const { passwordHash, ...rest } = newUser;
      return { ...rest, student: studentRecord, createdLaptop };
    }

    this.logAudit(actor, 'USER_CREATE', 'User', id, 'SUCCESS', `Created ${userData.role} user account for ${userData.fullName} (${userData.email})`);
    this.save();
    const { passwordHash, ...rest } = newUser;
    return rest;
  }

  // --- Students ---
  public getStudents() {
    return this.db.students;
  }

  public getStudentById(id: string) {
    return this.db.students.find(s => s.id === id || s.userId === id);
  }

  public getStudentByStudentId(studentId: string) {
    return this.db.students.find(s => s.studentId.toLowerCase() === studentId.trim().toLowerCase());
  }

  public updateStudent(id: string, updates: Partial<Student>, actor: any) {
    const idx = this.db.students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found');
    this.db.students[idx] = { ...this.db.students[idx], ...updates };
    this.logAudit(actor, 'STUDENT_UPDATE', 'Student', id, 'SUCCESS', `Updated student details for ${this.db.students[idx].fullName}`);
    this.save();
    return this.db.students[idx];
  }

  // --- Gates ---
  public getGates() {
    return this.db.gates;
  }

  // --- Laptop Registrations ---
  public getRegistrations(filterStatus?: string) {
    if (filterStatus) {
      return this.db.registrations.filter(r => r.status === filterStatus);
    }
    return this.db.registrations;
  }

  public getRegistrationById(id: string) {
    return this.db.registrations.find(r => r.id === id);
  }

  public createRegistration(data: {
    studentId: string;
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
    studentPhotoUrl?: string;
    studentNameAmharic?: string;
    department?: string;
    faculty?: string;
    submittedByRole: 'STUDENT' | 'OFFICER';
    submittedByUserId: string;
    autoApprove?: boolean;
  }, actor: any) {
    const student = this.db.students.find(s => s.id === data.studentId || s.userId === data.studentId);
    if (!student) throw new Error('Student not found');

    const cleanSerial = data.serialNumber.trim().toUpperCase();
    // Prevent duplicate active serial numbers
    const existingActive = this.db.laptops.find(
      l => l.serialNumber.toUpperCase() === cleanSerial && l.status === 'APPROVED'
    );
    if (existingActive) {
      throw new Error(`Duplicate Serial Number: Laptop with serial ${cleanSerial} is already registered under PC ID ${existingActive.pcId}`);
    }

    const ownerPhone = (data.ownerPhone || student.phone || '')?.trim();
    const department = (data.department || student.department || 'Computer Science').trim();
    const faculty = (data.faculty || student.faculty || 'Institute of Technology (IoT)').trim();
    const studentPhotoUrl = data.studentPhotoUrl || student.photoUrl;
    const studentNameAmharic = data.studentNameAmharic || student.studentNameAmharic;

    const regId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newReg: LaptopRegistration = {
      id: regId,
      studentId: student.id,
      studentName: student.fullName,
      studentNameAmharic,
      studentIdNumber: student.studentId,
      studentPhotoUrl,
      department,
      faculty,
      brand: data.brand.trim(),
      model: data.model.trim(),
      serialNumber: cleanSerial,
      deviceType: data.deviceType.trim(),
      processor: data.processor?.trim(),
      ram: data.ram?.trim(),
      storage: data.storage?.trim(),
      os: data.os?.trim(),
      color: data.color?.trim(),
      physicalDescription: data.physicalDescription?.trim(),
      ownerPhone,
      status: data.autoApprove ? 'APPROVED' : 'PENDING',
      registrationDate: new Date().toISOString(),
      submittedByRole: data.submittedByRole,
      submittedByUserId: data.submittedByUserId
    };

    if (data.autoApprove) {
      const pcId = this.getNextPcId();
      const qrToken = this.generateQrToken();
      newReg.pcId = pcId;
      newReg.reviewedByOfficerId = actor.id;
      newReg.reviewedByOfficerName = actor.fullName;
      newReg.reviewDate = new Date().toISOString();

      const newLaptop: Laptop = {
        id: `lpt-${Date.now()}`,
        pcId,
        registrationId: regId,
        studentId: student.id,
        studentName: student.fullName,
        studentNameAmharic,
        studentIdNumber: student.studentId,
        studentPhotoUrl,
        department,
        faculty,
        brand: newReg.brand,
        model: newReg.model,
        serialNumber: cleanSerial,
        deviceType: newReg.deviceType,
        processor: newReg.processor,
        ram: newReg.ram,
        storage: newReg.storage,
        os: newReg.os,
        color: newReg.color,
        physicalDescription: newReg.physicalDescription,
        ownerPhone,
        status: 'APPROVED',
        securityStatus: 'NORMAL',
        qrToken,
        currentMovementStatus: 'UNKNOWN',
        createdAt: new Date().toISOString()
      };

      this.db.laptops.push(newLaptop);
      this.logAudit(actor, 'LAPTOP_REGISTRATION_OFFICER_DIRECT', 'Laptop', newLaptop.id, 'SUCCESS', `Officer registered and approved laptop ${newReg.brand} ${newReg.model} for ${student.fullName}. Issued ${pcId}.`);
    } else {
      this.logAudit(actor, 'LAPTOP_REGISTRATION_SUBMIT', 'LaptopRegistration', regId, 'SUCCESS', `Student ${student.fullName} submitted registration for ${newReg.brand} ${newReg.model} (${cleanSerial})`);
    }

    this.db.registrations.unshift(newReg);
    this.save();
    return newReg;
  }

  public approveRegistration(regId: string, actor: any) {
    const reg = this.db.registrations.find(r => r.id === regId);
    if (!reg) throw new Error('Registration request not found');
    if (reg.status !== 'PENDING') throw new Error(`Cannot approve registration with status ${reg.status}`);

    // Re-check duplicate serial
    const cleanSerial = reg.serialNumber.trim().toUpperCase();
    const existing = this.db.laptops.find(l => l.serialNumber.toUpperCase() === cleanSerial && l.status === 'APPROVED');
    if (existing) {
      throw new Error(`Cannot approve: Serial number ${cleanSerial} already registered under ${existing.pcId}`);
    }

    const pcId = this.getNextPcId();
    const qrToken = this.generateQrToken();
    const student = this.db.students.find(s => s.id === reg.studentId);

    reg.status = 'APPROVED';
    reg.pcId = pcId;
    reg.reviewedByOfficerId = actor.id;
    reg.reviewedByOfficerName = actor.fullName;
    reg.reviewDate = new Date().toISOString();

    const newLaptop: Laptop = {
      id: `lpt-${Date.now()}`,
      pcId,
      registrationId: reg.id,
      studentId: reg.studentId,
      studentName: reg.studentName,
      studentNameAmharic: reg.studentNameAmharic || student?.studentNameAmharic,
      studentIdNumber: reg.studentIdNumber,
      studentPhotoUrl: reg.studentPhotoUrl || student?.photoUrl,
      department: reg.department || student?.department || 'Computer Science',
      faculty: reg.faculty || student?.faculty || 'Institute of Technology (IoT)',
      brand: reg.brand,
      model: reg.model,
      serialNumber: cleanSerial,
      deviceType: reg.deviceType,
      processor: reg.processor,
      ram: reg.ram,
      storage: reg.storage,
      os: reg.os,
      color: reg.color,
      physicalDescription: reg.physicalDescription,
      ownerPhone: reg.ownerPhone || student?.phone,
      status: 'APPROVED',
      securityStatus: 'NORMAL',
      qrToken,
      currentMovementStatus: 'UNKNOWN',
      createdAt: new Date().toISOString()
    };

    this.db.laptops.push(newLaptop);
    this.logAudit(actor, 'LAPTOP_REGISTRATION_APPROVE', 'Laptop', newLaptop.id, 'SUCCESS', `Approved registration for ${reg.studentName} (${reg.brand} ${reg.model}). Generated PC ID: ${pcId}.`);
    this.save();
    return { registration: reg, laptop: newLaptop };
  }

  public rejectRegistration(regId: string, reason: string, actor: any) {
    const reg = this.db.registrations.find(r => r.id === regId);
    if (!reg) throw new Error('Registration request not found');
    if (reg.status !== 'PENDING') throw new Error(`Cannot reject registration with status ${reg.status}`);

    reg.status = 'REJECTED';
    reg.rejectionReason = reason || 'Documentation or ownership verification failed';
    reg.reviewedByOfficerId = actor.id;
    reg.reviewedByOfficerName = actor.fullName;
    reg.reviewDate = new Date().toISOString();

    this.logAudit(actor, 'LAPTOP_REGISTRATION_REJECT', 'LaptopRegistration', reg.id, 'SUCCESS', `Rejected registration for ${reg.studentName}: ${reg.rejectionReason}`);
    this.save();
    return reg;
  }

  // --- Laptops ---
  public getLaptops() {
    return this.db.laptops;
  }

  public getLaptopById(id: string) {
    return this.db.laptops.find(l => l.id === id || l.pcId === id);
  }

  public getLaptopsByStudentId(studentId: string) {
    return this.db.laptops.filter(l => l.studentId === studentId);
  }

  public reissueQrToken(laptopId: string, actor: any) {
    const laptop = this.db.laptops.find(l => l.id === laptopId || l.pcId === laptopId);
    if (!laptop) throw new Error('Laptop not found');
    const oldToken = laptop.qrToken;
    laptop.qrToken = this.generateQrToken();
    this.logAudit(actor, 'QR_TOKEN_REISSUE', 'Laptop', laptop.id, 'SUCCESS', `Reissued security QR token for PC ID ${laptop.pcId}. Revoked old token.`);
    this.save();
    return laptop;
  }

  // --- Verification ---
  public verifyDevice(query: { qrToken?: string; identifier?: string }) {
    let laptop: Laptop | undefined;

    if (query.qrToken) {
      laptop = this.db.laptops.find(l => l.qrToken === query.qrToken?.trim());
    } else if (query.identifier) {
      const clean = query.identifier.trim().toUpperCase();
      laptop = this.db.laptops.find(
        l => l.pcId.toUpperCase() === clean || l.serialNumber.toUpperCase() === clean
      );
    }

    if (!laptop) {
      return {
        outcome: 'NOT_FOUND' as VerificationResult,
        message: 'No registered laptop matches this verification token or identifier.'
      };
    }

    const student = this.db.students.find(s => s.id === laptop!.studentId);
    const activeLost = this.db.lostReports.find(
      r => r.laptopId === laptop!.id && (r.status === 'CONFIRMED' || r.status === 'UNDER_REVIEW')
    );

    let outcome: VerificationResult = 'VALID';
    let message = 'Device is registered and authorized for campus access.';

    if (laptop.securityStatus === 'REPORTED_LOST' || activeLost) {
      outcome = 'REPORTED_LOST';
      message = 'SECURITY ALERT: This laptop has been reported LOST or STOLEN! Detain device immediately according to university police protocol.';
    } else if (laptop.status === 'SUSPENDED') {
      outcome = 'SUSPENDED';
      message = 'Device registration has been temporarily SUSPENDED. Refer student to Security Office.';
    } else if (laptop.status === 'REVOKED') {
      outcome = 'REVOKED';
      message = 'Device registration has been REVOKED. Unauthorized device.';
    }

    const resp: VerificationResponse = {
      outcome,
      message,
      laptop,
      student: student ? {
        fullName: student.fullName,
        studentId: student.studentId,
        department: student.department,
        faculty: student.faculty,
        phone: student.phone,
        accountStatus: student.accountStatus
      } : undefined,
      previousMovement: {
        status: laptop.currentMovementStatus,
        timestamp: laptop.lastMovementDate,
        gateName: laptop.lastMovementGate
      },
      activeLostReport: activeLost
    };

    return resp;
  }

  // --- Gate Movements ---
  public recordMovement(data: {
    laptopId: string;
    gateId: string;
    movementType: MovementType;
    verificationMethod: VerificationMethod;
    verificationResult: VerificationResult;
    notes?: string;
    overrideConsecutive?: boolean;
  }, actor: any): SecurityEvent {
    const laptop = this.db.laptops.find(l => l.id === data.laptopId || l.pcId === data.laptopId);
    if (!laptop) throw new Error('Laptop not found');

    const gate = this.db.gates.find(g => g.id === data.gateId) || this.db.gates[0];

    // Concurrency / Duplicate consecutive state check
    if (!data.overrideConsecutive && laptop.currentMovementStatus === data.movementType) {
      throw new Error(`CONSECUTIVE_MOVEMENT_WARNING: Laptop is currently already recorded as ${data.movementType}. Confirmation required to record another consecutive ${data.movementType}.`);
    }

    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const event: SecurityEvent = {
      id: eventId,
      laptopId: laptop.id,
      pcId: laptop.pcId,
      studentName: laptop.studentName,
      studentIdNumber: laptop.studentIdNumber,
      brand: laptop.brand,
      model: laptop.model,
      serialNumber: laptop.serialNumber,
      gateId: gate.id,
      gateName: gate.name,
      officerId: actor.id,
      officerName: actor.fullName,
      movementType: data.movementType,
      verificationMethod: data.verificationMethod,
      verificationResult: data.verificationResult,
      notes: data.notes?.trim(),
      timestamp: new Date().toISOString()
    };

    // Update laptop state
    laptop.currentMovementStatus = data.movementType;
    laptop.lastMovementDate = event.timestamp;
    laptop.lastMovementGate = gate.name;
    laptop.lastMovementOfficer = actor.fullName;

    this.db.securityEvents.unshift(event);
    this.logAudit(
      actor,
      `GATE_MOVEMENT_${data.movementType}`,
      'SecurityEvent',
      eventId,
      'SUCCESS',
      `Gate ${gate.code} recorded ${data.movementType} for PC ID ${laptop.pcId} (${laptop.studentName}). Method: ${data.verificationMethod}. Result: ${data.verificationResult}.`
    );

    this.save();
    return event;
  }

  public getSecurityEvents(limit = 100) {
    return this.db.securityEvents.slice(0, limit);
  }

  // --- Lost & Stolen Management ---
  public getLostReports() {
    return this.db.lostReports;
  }

  public createLostReport(data: {
    laptopId: string;
    incidentType: any;
    incidentDate: string;
    incidentLocation: string;
    description: string;
    contactPhone: string;
  }, actor: any): LostReport {
    const laptop = this.db.laptops.find(l => l.id === data.laptopId || l.pcId === data.laptopId);
    if (!laptop) throw new Error('Laptop not found');

    const repId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const report: LostReport = {
      id: repId,
      laptopId: laptop.id,
      pcId: laptop.pcId,
      brand: laptop.brand,
      model: laptop.model,
      serialNumber: laptop.serialNumber,
      reportingStudentId: laptop.studentId,
      reportingStudentName: laptop.studentName,
      studentIdNumber: laptop.studentIdNumber,
      incidentType: data.incidentType,
      incidentDate: data.incidentDate,
      incidentLocation: data.incidentLocation.trim(),
      description: data.description.trim(),
      contactPhone: data.contactPhone.trim(),
      status: actor.role === 'STUDENT' ? 'SUBMITTED' : 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    // If filed by officer or confirmed immediately
    if (report.status === 'CONFIRMED') {
      laptop.securityStatus = 'REPORTED_LOST';
      const alert = this.createSecurityAlert({
        type: 'LOST_DEVICE',
        title: `ALERT: Stolen/Lost Laptop [${laptop.pcId}]`,
        message: `${laptop.brand} ${laptop.model} (SN: ${laptop.serialNumber}) reported missing at ${data.incidentLocation}. Stop at gate if scanned.`,
        severity: 'HIGH',
        laptopId: laptop.id,
        pcId: laptop.pcId,
        lostReportId: repId
      }, actor);
      report.reviewedByOfficerId = actor.id;
      report.reviewedByOfficerName = actor.fullName;
    }

    this.db.lostReports.unshift(report);
    this.logAudit(actor, 'LOST_REPORT_SUBMIT', 'LostReport', repId, 'SUCCESS', `Reported lost/stolen device PC ID ${laptop.pcId} (${data.incidentType})`);
    this.save();
    return report;
  }

  public reviewLostReport(reportId: string, status: any, notes: string, actor: any) {
    const rep = this.db.lostReports.find(r => r.id === reportId);
    if (!rep) throw new Error('Report not found');

    rep.status = status;
    rep.reviewNotes = notes;
    rep.reviewedByOfficerId = actor.id;
    rep.reviewedByOfficerName = actor.fullName;

    const laptop = this.db.laptops.find(l => l.id === rep.laptopId);
    if (laptop) {
      if (status === 'CONFIRMED' || status === 'UNDER_EXECUTION') {
        laptop.securityStatus = 'REPORTED_LOST';
        if (status === 'UNDER_EXECUTION') {
          this.createSecurityAlert({
            type: 'LOST_DEVICE',
            title: `ACTION: Stolen PC Under Execution [${laptop.pcId}]`,
            message: `${laptop.brand} ${laptop.model} investigation & gate guard tracking is actively UNDER EXECUTION. Notes: ${notes}`,
            severity: 'HIGH',
            laptopId: laptop.id,
            pcId: laptop.pcId,
            lostReportId: rep.id
          }, actor);
        } else {
          this.createSecurityAlert({
            type: 'LOST_DEVICE',
            title: `ALERT: Confirmed Lost Laptop [${laptop.pcId}]`,
            message: `${laptop.brand} ${laptop.model} reported missing. Student: ${rep.reportingStudentName}. Gate officers: detain device upon scan.`,
            severity: 'HIGH',
            laptopId: laptop.id,
            pcId: laptop.pcId,
            lostReportId: rep.id
          }, actor);
        }
      } else if (status === 'FOUND' || status === 'RESOLVED') {
        laptop.securityStatus = 'NORMAL';
        rep.status = 'FOUND';
        rep.resolvedAt = new Date().toISOString();
        const alt = this.db.alerts.find(a => a.lostReportId === reportId);
        if (alt) alt.active = false;
      } else if (status === 'REJECTED') {
        laptop.securityStatus = 'NORMAL';
      }
    }

    this.logAudit(actor, `LOST_REPORT_${status}`, 'LostReport', reportId, 'SUCCESS', `Reviewed lost report ${reportId}: status set to ${status}. Notes: ${notes}`);
    this.save();
    return rep;
  }

  public resolveLostReport(reportId: string, resolutionNotes: string, actor: any) {
    const rep = this.db.lostReports.find(r => r.id === reportId);
    if (!rep) throw new Error('Report not found');

    rep.status = 'FOUND';
    rep.reviewNotes = (rep.reviewNotes ? rep.reviewNotes + ' | ' : '') + `Device Found: ${resolutionNotes}`;
    rep.resolvedAt = new Date().toISOString();

    const laptop = this.db.laptops.find(l => l.id === rep.laptopId);
    if (laptop) {
      laptop.securityStatus = 'NORMAL';
    }

    // Deactivate corresponding alert
    const alt = this.db.alerts.find(a => a.lostReportId === reportId);
    if (alt) {
      alt.active = false;
    }

    this.logAudit(actor, 'LOST_REPORT_FOUND', 'LostReport', reportId, 'SUCCESS', `Device FOUND and verified for ${rep.pcId}. Device security status restored to NORMAL.`);
    this.save();
    return rep;
  }

  // --- Alerts ---
  public getAlerts() {
    return this.db.alerts;
  }

  public createSecurityAlert(data: {
    type: 'LOST_DEVICE' | 'SECURITY_WARNING' | 'ANNOUNCEMENT';
    title: string;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'INFO';
    laptopId?: string;
    pcId?: string;
    lostReportId?: string;
  }, actor: any): SecurityAlert {
    const alertId = `alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const alert: SecurityAlert = {
      id: alertId,
      type: data.type,
      title: data.title.trim(),
      message: data.message.trim(),
      severity: data.severity,
      laptopId: data.laptopId,
      pcId: data.pcId,
      lostReportId: data.lostReportId,
      active: true,
      createdAt: new Date().toISOString(),
      acknowledgements: []
    };

    this.db.alerts.unshift(alert);
    this.logAudit(actor, 'SECURITY_ALERT_CREATE', 'SecurityAlert', alertId, 'SUCCESS', `Broadcast alert: ${data.title}`);
    this.save();
    this.broadcastAlert(alert);
    return alert;
  }

  public acknowledgeAlert(alertId: string, actor: any) {
    const alert = this.db.alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');

    const alreadyAcked = alert.acknowledgements.some(ack => ack.officerId === actor.id);
    if (!alreadyAcked) {
      alert.acknowledgements.push({
        officerId: actor.id,
        officerName: actor.fullName,
        timestamp: new Date().toISOString()
      });
      this.logAudit(actor, 'ALERT_ACKNOWLEDGE', 'SecurityAlert', alertId, 'SUCCESS', `Officer ${actor.fullName} acknowledged alert [${alert.title}]`);
      this.save();
    }
    return alert;
  }

  // --- Audit Logs ---
  public getAuditLogs(limit = 150) {
    return this.db.auditLogs.slice(0, limit);
  }

  // --- Dashboard Statistics ---
  public getDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    const todayEvents = this.db.securityEvents.filter(
      e => e.timestamp.startsWith(todayStr)
    );
    const todayIn = todayEvents.filter(e => e.movementType === 'IN').length;
    const todayOut = todayEvents.filter(e => e.movementType === 'OUT').length;

    const totalStudents = this.db.students.length;
    const totalLaptops = this.db.laptops.length;
    const pendingRegs = this.db.registrations.filter(r => r.status === 'PENDING').length;
    const approvedRegs = this.db.registrations.filter(r => r.status === 'APPROVED').length;
    const rejectedRegs = this.db.registrations.filter(r => r.status === 'REJECTED').length;
    const activeLost = this.db.laptops.filter(l => l.securityStatus === 'REPORTED_LOST').length;
    const totalOfficers = this.db.users.filter(u => u.role === 'OFFICER' || u.role === 'GATE_OFFICER').length;
    const totalGates = this.db.gates.length;

    return {
      totalStudents,
      totalLaptops,
      pendingRegistrations: pendingRegs,
      approvedRegistrations: approvedRegs,
      rejectedRegistrations: rejectedRegs,
      activeLostReports: activeLost,
      totalSecurityOfficers: totalOfficers,
      totalCampusGates: totalGates,
      todayInMovements: todayIn,
      todayOutMovements: todayOut,
      recentEvents: this.db.securityEvents.slice(0, 10),
      recentAlerts: this.db.alerts.filter(a => a.active).slice(0, 5),
      recentAudits: this.db.auditLogs.slice(0, 8),
      departmentDistribution: this.getDepartmentStats(),
      brandDistribution: this.getBrandStats()
    };
  }

  private getDepartmentStats() {
    const map: Record<string, number> = {};
    for (const l of this.db.laptops) {
      const dept = l.department || 'Other';
      map[dept] = (map[dept] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }

  private getBrandStats() {
    const map: Record<string, number> = {};
    for (const l of this.db.laptops) {
      const b = l.brand || 'Other';
      map[b] = (map[b] || 0) + 1;
    }
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }
}

export const dbService = new DatabaseService();
