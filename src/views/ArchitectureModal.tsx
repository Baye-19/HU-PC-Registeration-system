import React, { useState } from 'react';
import { Database, Server, ShieldCheck, Code, Copy, Check, Terminal, Layers, ArrowLeft } from 'lucide-react';

interface ArchitectureViewProps {
  onNavigateBack?: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FLYWAY' | 'ERD' | 'DOCKER' | 'API'>('OVERVIEW');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const flywaySchemaSql = `-- ====================================================================
-- CAMPUSGUARD - HAWASSA UNIVERSITY, ETHIOPIA
-- Flyway Database Migration: V1__init_schema.sql
-- Automated Campus Laptop Registration and Gate Access Control System
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL REFERENCES roles(name),
    phone VARCHAR(30),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Faculties & Departments
CREATE TABLE faculties (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    faculty_id VARCHAR(36) NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL
);

-- 4. Students
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    institutional_email VARCHAR(150) NOT NULL UNIQUE,
    department_id VARCHAR(36) REFERENCES departments(id),
    department_name VARCHAR(150) NOT NULL,
    faculty_name VARCHAR(150) NOT NULL,
    academic_year INT NOT NULL CHECK (academic_year >= 1 AND academic_year <= 7),
    phone VARCHAR(30),
    account_status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Campus Gates
CREATE TABLE gates (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 6. Laptop Registrations
CREATE TABLE laptop_registrations (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    department VARCHAR(150) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    processor VARCHAR(100),
    ram VARCHAR(50),
    storage VARCHAR(50),
    os VARCHAR(50),
    color VARCHAR(50),
    physical_description TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    submitted_by_role VARCHAR(30) NOT NULL,
    submitted_by_user_id VARCHAR(36) NOT NULL,
    reviewed_by_officer_id VARCHAR(36),
    reviewed_by_officer_name VARCHAR(150),
    review_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    pc_id VARCHAR(50),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Laptops (Approved Registered Assets)
CREATE SEQUENCE IF NOT EXISTS pc_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE laptops (
    id VARCHAR(36) PRIMARY KEY,
    pc_id VARCHAR(50) NOT NULL UNIQUE,
    registration_id VARCHAR(36) NOT NULL UNIQUE REFERENCES laptop_registrations(id),
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    department VARCHAR(150) NOT NULL,
    faculty VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(50) NOT NULL,
    processor VARCHAR(100),
    ram VARCHAR(50),
    storage VARCHAR(50),
    os VARCHAR(50),
    color VARCHAR(50),
    physical_description TEXT,
    status VARCHAR(30) DEFAULT 'APPROVED' NOT NULL,
    security_status VARCHAR(30) DEFAULT 'NORMAL' NOT NULL,
    qr_token VARCHAR(100) NOT NULL UNIQUE,
    current_movement_status VARCHAR(20) DEFAULT 'UNKNOWN' NOT NULL,
    last_movement_date TIMESTAMP WITH TIME ZONE,
    last_movement_gate VARCHAR(150),
    last_movement_officer VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Auditable Gate Security Events (IN/OUT)
CREATE TABLE security_events (
    id VARCHAR(36) PRIMARY KEY,
    laptop_id VARCHAR(36) NOT NULL REFERENCES laptops(id) ON DELETE RESTRICT,
    pc_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    gate_id VARCHAR(36) NOT NULL REFERENCES gates(id),
    gate_name VARCHAR(150) NOT NULL,
    officer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    officer_name VARCHAR(150) NOT NULL,
    movement_type VARCHAR(10) NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
    verification_method VARCHAR(30) NOT NULL,
    verification_result VARCHAR(30) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Lost and Stolen Laptop Reports
CREATE TABLE lost_reports (
    id VARCHAR(36) PRIMARY KEY,
    laptop_id VARCHAR(36) NOT NULL REFERENCES laptops(id),
    pc_id VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL,
    reporting_student_id VARCHAR(36) NOT NULL,
    reporting_student_name VARCHAR(150) NOT NULL,
    student_id_number VARCHAR(50) NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_location VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'SUBMITTED' NOT NULL,
    reviewed_by_officer_id VARCHAR(36),
    reviewed_by_officer_name VARCHAR(150),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 10. Real-time Security Alerts
CREATE TABLE alerts (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'INFO')),
    laptop_id VARCHAR(36),
    pc_id VARCHAR(50),
    lost_report_id VARCHAR(36),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE alert_acknowledgements (
    id VARCHAR(36) PRIMARY KEY,
    alert_id VARCHAR(36) NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    officer_id VARCHAR(36) NOT NULL REFERENCES users(id),
    officer_name VARCHAR(150) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(alert_id, officer_id)
);

-- 11. Security Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(36) NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    outcome VARCHAR(20) NOT NULL,
    details TEXT
);

-- High Performance Indexes
CREATE INDEX idx_laptops_pc_id ON laptops(pc_id);
CREATE INDEX idx_laptops_serial ON laptops(serial_number);
CREATE INDEX idx_laptops_qr_token ON laptops(qr_token);
CREATE INDEX idx_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_events_laptop_id ON security_events(laptop_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_registrations_status ON laptop_registrations(status);
`;

  const dockerComposeYaml = `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: campusguard-postgres
    restart: always
    environment:
      POSTGRES_DB: campusguard_db
      POSTGRES_USER: campusguard_user
      POSTGRES_PASSWORD: HawassaSecurity2026!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U campusguard_user -d campusguard_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: campusguard-spring-boot
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campusguard_db
      SPRING_DATASOURCE_USERNAME: campusguard_user
      SPRING_DATASOURCE_PASSWORD: HawassaSecurity2026!
      JWT_SECRET: c2VjdXJlX2hhd2Fzc2FfdW5pdmVyc2l0eV9jYW1wdXNndWFyZF9qd3Rfc2VjcmV0X2tleV8yMDI2
      SERVER_PORT: 8080

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: campusguard-nextjs
    restart: always
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080/api/v1
    depends_on:
      - backend

volumes:
  pgdata:
`;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 min-w-0">
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
          <div className="flex items-center gap-2 text-blue-600 min-w-0">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider truncate">Enterprise Architecture</span>
          </div>
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          System Architecture & Spring Boot Specifications
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500">
          Hawassa University CampusGuard Technical Documentation, Flyway Migrations, and Deployment Guide
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3 py-1.5 rounded-md transition-colors shrink-0 ${
            activeTab === 'OVERVIEW' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System Topology
        </button>
        <button
          onClick={() => setActiveTab('FLYWAY')}
          className={`px-3 py-1.5 rounded-md transition-colors shrink-0 ${
            activeTab === 'FLYWAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Flyway SQL Schema (V1)
        </button>
        <button
          onClick={() => setActiveTab('ERD')}
          className={`px-3 py-1.5 rounded-md transition-colors shrink-0 ${
            activeTab === 'ERD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Database ER Diagram
        </button>
        <button
          onClick={() => setActiveTab('DOCKER')}
          className={`px-3 py-1.5 rounded-md transition-colors shrink-0 ${
            activeTab === 'DOCKER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Docker & Windows Setup
        </button>
      </div>

      {/* TAB 1: System Topology */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                UI
              </div>
              <h3 className="font-bold text-sm text-slate-900">Frontend Layer</h3>
              <p className="text-xs text-slate-600">
                Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons, ZXing QR optical camera decoder, print-ready CSS engine.
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Port: 3000 · HTTPS client
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded bg-[#142B4A] text-white flex items-center justify-center font-bold text-xs">
                API
              </div>
              <h3 className="font-bold text-sm text-slate-900">Backend Layer</h3>
              <p className="text-xs text-slate-600">
                Spring Boot 3.3, Spring Security (JWT + BCrypt), Spring Data JPA, Hibernate, WebSocket/STOMP alert broadcaster, sequence generator.
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Port: 8080 · REST /api/v1
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="w-8 h-8 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                DB
              </div>
              <h3 className="font-bold text-sm text-slate-900">Database Layer</h3>
              <p className="text-xs text-slate-600">
                PostgreSQL 16, Flyway automated versioned migrations, atomic sequence for CG-LPT-00000X, ACID transactions, immutable audit logs.
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Port: 5432 · campusguard_db
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
            <h4 className="font-bold">Security Compliance Highlights:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Cryptographically secure verification tokens (UUID v4) encoded in QR codes, hiding student PII and backend schema.</li>
              <li>Dual-level verification: Optical scan at gate + manual fallback via unique PC ID sequence or hardware serial number.</li>
              <li>Perimeter defense alert broadcasting: Instantly notifies all gate terminals when a device is reported lost or stolen.</li>
              <li>Consecutive movement conflict detection: Prevents anomalous double-IN or double-OUT transitions without authorized officer override.</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: Flyway Migration SQL */}
      {activeTab === 'FLYWAY' && (
        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                backend/src/main/resources/db/migration/V1__init_schema.sql
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(flywaySchemaSql, 'flyway')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded text-slate-200"
            >
              {copiedSection === 'flyway' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSection === 'flyway' ? 'Copied' : 'Copy SQL'}
            </button>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[450px] p-2 leading-relaxed">
            {flywaySchemaSql}
          </pre>
        </div>
      )}

      {/* TAB 3: Database ERD */}
      {activeTab === 'ERD' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Relational Entity Relationship Model (ERD)
          </h3>
          <p className="text-xs text-slate-500">
            15 normalized relational tables with explicit referential integrity, unique constraints, and atomic sequence generation.
          </p>

          <div className="bg-slate-900 p-4 rounded-xl text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`USERS (id [PK], username [UQ], email [UQ], password_hash, full_name, role)
   │
   ├── (1:1) ──> STUDENTS (id [PK], user_id [FK], student_id [UQ], dept, faculty)
   │                │
   │                └── (1:N) ──> LAPTOPS (id [PK], pc_id [UQ], serial_number [UQ], qr_token [UQ])
   │                                 │
   │                                 ├── (1:N) ──> SECURITY_EVENTS (id [PK], laptop_id [FK], gate_id [FK], movement_type)
   │                                 │
   │                                 └── (1:N) ──> LOST_REPORTS (id [PK], laptop_id [FK], status)
   │                                                  │
   │                                                  └── (1:1) ──> ALERTS (id [PK], severity, active)
   │                                                                   │
   │                                                                   └── (1:N) ──> ALERT_ACKS (alert_id, officer_id)
   │
   ├── (1:N) ──> AUDIT_LOGS (id [PK], actor_id, action, target_entity, timestamp, outcome)
   │
GATES (id [PK], code [UQ], name, location, active)`}
          </div>
        </div>
      )}

      {/* TAB 4: Docker & Windows Setup */}
      {activeTab === 'DOCKER' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Windows & Local Development Instructions
              </h3>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <p>To run the Spring Boot backend on Windows:</p>
              <div className="p-3 bg-slate-900 text-slate-200 font-mono rounded-lg">
                # 1. Start PostgreSQL with Docker<br />
                docker compose up -d postgres<br /><br />
                # 2. Run Flyway Migrations & Spring Boot Backend<br />
                cd backend<br />
                mvn spring-boot:run<br /><br />
                # 3. In another terminal, run Next.js Frontend<br />
                npm install<br />
                npm run dev
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  docker-compose.yml
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(dockerComposeYaml, 'docker')}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded text-slate-200"
              >
                {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'docker' ? 'Copied' : 'Copy YAML'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-[350px] p-2 leading-relaxed">
              {dockerComposeYaml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
