-- ====================================================================
-- CAMPUSGUARD: HAWASSA UNIVERSITY, ETHIOPIA
-- Migration: V1__init_schema.sql
-- Normalized Relational Database Schema
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
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

-- 7. Laptops
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

-- 8. Auditable Gate Security Events
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

-- 9. Lost & Stolen Incident Reports
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

-- 10. Security Alerts
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

-- Indexes
CREATE INDEX idx_laptops_pc_id ON laptops(pc_id);
CREATE INDEX idx_laptops_serial ON laptops(serial_number);
CREATE INDEX idx_laptops_qr_token ON laptops(qr_token);
CREATE INDEX idx_events_timestamp ON security_events(timestamp DESC);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);
