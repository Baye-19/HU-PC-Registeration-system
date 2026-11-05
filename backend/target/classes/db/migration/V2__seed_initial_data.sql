-- ====================================================================
-- CAMPUSGUARD: HAWASSA UNIVERSITY, ETHIOPIA
-- Migration: V2__seed_initial_data.sql
-- Seed Roles, Users, Faculties, Departments, Gates, Initial Laptops
-- ====================================================================

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
('role-admin', 'ADMIN', 'Institutional System Administrator with full oversight'),
('role-officer', 'OFFICER', 'Campus Police Union Security Officer for laptop registration and review'),
('role-student', 'STUDENT', 'Hawassa University Student with self-service asset management'),
('role-gate', 'GATE_OFFICER', 'Perimeter Gate Security Officer for scanning and movement control');

-- 2. Faculties & Departments
INSERT INTO faculties (id, name, code) VALUES
('fac-iot', 'Institute of Technology (IoT)', 'IOT'),
('fac-cns', 'College of Natural & Computational Sciences', 'CNCS'),
('fac-cbe', 'College of Business & Economics', 'CBE'),
('fac-cmhs', 'College of Medicine & Health Sciences', 'CMHS');

INSERT INTO departments (id, faculty_id, name, code) VALUES
('dept-se', 'fac-iot', 'Software Engineering', 'SE'),
('dept-cs', 'fac-iot', 'Computer Science', 'CS'),
('dept-ece', 'fac-iot', 'Electrical & Computer Engineering', 'ECE'),
('dept-mech', 'fac-iot', 'Mechanical Engineering', 'ME'),
('dept-acc', 'fac-cbe', 'Accounting & Finance', 'ACC'),
('dept-med', 'fac-cmhs', 'Medicine', 'MED');

-- 3. Gates
INSERT INTO gates (id, code, name, location, active) VALUES
('gate-1', 'GATE-01', 'Main Campus Gate (North)', 'Main Administrative Boulevard', true),
('gate-2', 'GATE-02', 'Polytechnic Technology Gate', 'IoT Engineering Complex', true),
('gate-3', 'GATE-03', 'Awassa Lake Campus Gate', 'Southern Residential Sector', true),
('gate-4', 'GATE-04', 'Agricultural Campus Gate', 'College of Agriculture Boulevard', true);

-- 4. Initial Users (Passwords: Admin@123, Officer@123, Student@123, Gate@123)
-- BCrypt hashes generated with cost 10
INSERT INTO users (id, username, email, password_hash, full_name, role, phone, active) VALUES
('usr-admin-1', 'admin', 'admin@hu.edu.et', '$2a$10$wT8K4/7.uBvCfxwZzW90Iu6BmsX7lGgT/Z3hK0H1sS9Xo6c2.0yY.', 'Dr. Tadesse Bekele', 'ADMIN', '+251 91 123 4567', true),
('usr-officer-1', 'officer.kebede', 'kebede@security.hu.edu.et', '$2a$10$9Gv1/4Yq8kHwz2Hq8dK0e.V4Hw7aM2wR5tK6sA7hP9qE1rC3bF2a.', 'Inspector Kebede Wolde', 'OFFICER', '+251 91 234 5678', true),
('usr-gate-1', 'gate.main', 'gate1@security.hu.edu.et', '$2a$10$oY1e3X/3sJ8FqW5wV6gHk.B1oZ3mB2nC5vB4tN6yK8jL0mK2eR4w.', 'Officer Girma Tesfaye', 'GATE_OFFICER', '+251 91 345 6789', true),
('usr-student-1', 'student.abebe', 'abebe.bikila@hu.edu.et', '$2a$10$yX3w4Q/8kR9zP1eT2vB3n.V5oY7mN2bC4vB6tK8yJ0mL2mN4eQ6w.', 'Abebe Bikila', 'STUDENT', '+251 92 456 7890', true),
('usr-student-2', 'student.selam', 'selam.alemu@hu.edu.et', '$2a$10$yX3w4Q/8kR9zP1eT2vB3n.V5oY7mN2bC4vB6tK8yJ0mL2mN4eQ6w.', 'Selamawit Alemu', 'STUDENT', '+251 92 567 8901', true);

-- 5. Students
INSERT INTO students (id, user_id, full_name, student_id, institutional_email, department_id, department_name, faculty_name, academic_year, phone, account_status) VALUES
('stu-1', 'usr-student-1', 'Abebe Bikila', 'HU/14022/13', 'abebe.bikila@hu.edu.et', 'dept-se', 'Software Engineering', 'Institute of Technology (IoT)', 4, '+251 92 456 7890', 'ACTIVE'),
('stu-2', 'usr-student-2', 'Selamawit Alemu', 'HU/15881/14', 'selam.alemu@hu.edu.et', 'dept-cs', 'Computer Science', 'Institute of Technology (IoT)', 3, '+251 92 567 8901', 'ACTIVE');
