# CampusGuard: Automated Campus Laptop Registration and Gate Security Management System

**Institution:** Hawassa University, Ethiopia  
**Project Domain:** Automated Campus Laptop Registration, Cryptographic QR Gate Verification, Real-Time Perimeter Security Alerts, and Auditable IN/OUT Movement Tracking.

---

## 1. System Overview

CampusGuard digitizes the laptop registration process at Hawassa University, replacing vulnerable paper logs with an integrated enterprise security platform.

### Core Modules
1. **Administrative Security Dashboard**: Live KPIs, movement ratios, registration processing stats, and immutable audit streams.
2. **Student Management**: Full CRUD, faculty/department organization, hardware ownership mapping, and duplicate prevention.
3. **Laptop Registration Workflows**:
   - *Student Self-Service*: Online application with hardware validation entering `PENDING` status.
   - *Officer-Assisted (In-Person)*: Registration performed directly at the Campus Police Union office with instant approval and card printing.
4. **Unique PC ID Generation**: Atomic sequence generator (e.g. `CG-LPT-000001`, `CG-LPT-000002`).
5. **Cryptographic QR Code Tokens**: High-density QR stickers and printable passes containing unpredictable opaque tokens (no private student PII or database structures exposed).
6. **High-Speed Gate Verification**:
   - Optical camera QR scanner + manual fallback by PC ID or serial number.
   - Outcomes: `VALID`, `REPORTED_LOST` (immediate danger warning & police protocol instructions), `SUSPENDED`, `REVOKED`, `NOT_FOUND`.
7. **Auditable IN/OUT Movement Tracking**:
   - Records movement type, gate terminal ID, duty officer ID, timestamp, and notes.
   - Prevents duplicate consecutive IN or OUT transitions without authorized supervisor confirmation.
8. **Lost and Stolen Device Management**:
   - Missing laptop reporting with dormitory/library location tagging.
   - Incident confirmation immediately updates device status to `REPORTED_LOST` and pushes real-time alerts.
9. **Real-Time Security Broadcasts**:
   - Server-Sent Events (SSE) / WebSocket push to all connected campus gates.
   - Instant perimeter alert popups with officer acknowledgement logs.
10. **Immutable Security Audit Log & CSV Export**:
    - Comprehensive record of every login, registration, approval, verification, and alert acknowledgement.

---

## 2. Test User Accounts

| Role | Username / Email | Password | Full Name & Title |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@hu.edu.et` | `Admin@123` | Dr. Tadesse Bekele (Director of ICT) |
| **Security Police Officer** | `kebede@security.hu.edu.et` | `Officer@123` | Inspector Kebede Wolde (Police Union) |
| **Student (4th Year SE)** | `abebe.bikila@hu.edu.et` | `Student@123` | Abebe Bikila (`HU/14022/13`) |
| **Student (3rd Year CS)** | `selam.alemu@hu.edu.et` | `Student@123` | Selamawit Alemu (`HU/15881/14`) |
| **Gate Security Officer** | `gate1@security.hu.edu.et` | `Gate@123` | Officer Girma Tesfaye (Main Gate 1) |

*Note: You can switch between any of these roles instantly using the role dropdown in the top navigation bar.*

---

## 3. Quick Local Development Setup

### Running with Docker Compose (Recommended)
```bash
docker compose up -d
```
- Frontend: `http://localhost:3000`
- Spring Boot Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (Database: `campusguard_db`)

### Running Locally on Windows / Linux

#### 1. Start PostgreSQL
```bash
docker run --name campusguard-pg -e POSTGRES_DB=campusguard_db -e POSTGRES_USER=campusguard_user -e POSTGRES_PASSWORD=HawassaSecurity2026! -p 5432:5432 -d postgres:16-alpine
```

#### 2. Start Spring Boot Backend
```cmd
cd backend
mvn spring-boot:run
```

#### 3. Start Frontend & Live Server
```cmd
npm install
npm run dev
```

---

## 4. API Endpoints Contract

- `POST /api/v1/auth/login` - Authenticate institutional user
- `GET /api/v1/auth/me` - Current session profile
- `GET /api/v1/students` - List all registered students
- `GET /api/v1/registrations` - List laptop registration applications
- `POST /api/v1/registrations` - Submit new laptop registration
- `POST /api/v1/registrations/{id}/approve` - Approve & issue PC ID + QR token
- `POST /api/v1/registrations/{id}/reject` - Reject with reason
- `GET /api/v1/laptops` - Registered laptops catalog
- `POST /api/v1/verification/verify` - Verify QR token or PC ID
- `POST /api/v1/verification/movement` - Log entrance (IN) or exit (OUT)
- `GET /api/v1/lost-reports` - Missing device incident reports
- `POST /api/v1/lost-reports/{id}/review` - Confirm or reject stolen report
- `POST /api/v1/lost-reports/{id}/resolve` - Mark device recovered
- `GET /api/v1/alerts/stream` - Real-time SSE alert channel for gate posts
- `GET /api/v1/audit-logs` - Immutable audit log stream
- `GET /api/v1/dashboard/stats` - University-wide security KPI analytics
