-- ====================================================================
-- CAMPUSGUARD: HAWASSA UNIVERSITY, ETHIOPIA
-- Migration: V3__add_student_photo_amharic_phone.sql
-- Add student portrait photo, Amharic name, and owner phone columns
-- ====================================================================

-- 1. Students: add photo URL and Amharic full name
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS student_name_amharic VARCHAR(150);

-- 2. Laptop Registrations: add student photo URL, Amharic name, and mandatory owner contact phone
ALTER TABLE laptop_registrations
ADD COLUMN IF NOT EXISTS student_photo_url TEXT,
ADD COLUMN IF NOT EXISTS student_name_amharic VARCHAR(150),
ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(30);

-- 3. Laptops: add student photo URL, Amharic name, and owner contact phone for official ID passes
ALTER TABLE laptops
ADD COLUMN IF NOT EXISTS student_photo_url TEXT,
ADD COLUMN IF NOT EXISTS student_name_amharic VARCHAR(150),
ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(30);

-- 4. Additional indexes for gate scanning and verification performance
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON laptop_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON laptop_registrations(status);
CREATE INDEX IF NOT EXISTS idx_lost_reports_laptop_id ON lost_reports(laptop_id);
CREATE INDEX IF NOT EXISTS idx_lost_reports_status ON lost_reports(status);
