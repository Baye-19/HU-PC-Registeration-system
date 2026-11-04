# CampusGuard: Automated Campus Laptop Registration and Gate Security Management System

**Institution:** Hawassa University, Ethiopia  
**Project Domain:** Automated Campus Laptop Registration, Cryptographic QR Gate Verification, Real-Time Perimeter Security Alerts, and Auditable IN/OUT Movement Tracking.

---

## 1. System Overview & Architecture

CampusGuard digitizes the laptop registration process at Hawassa University, replacing vulnerable paper logs with an integrated enterprise security platform.

### Architecture Topology
- **Frontend**: Next.js App Router / React SPA, TypeScript with strict typing, Tailwind CSS, Lucide icons, ZXing camera decoder, and print-ready CSS engine.
- **Backend**: Spring Boot 3.3.0, Spring Security 6 (JWT + BCrypt), Spring Data JPA, Hibernate, Bean Validation, WebSocket/SSE alert broadcaster.
- **Database**: PostgreSQL 16 with Flyway automated versioned migrations (`V1__init_schema.sql`, `V2__seed_initial_data.sql`, `V3__add_student_photo_amharic_phone.sql`).
- **Containerization**: Multi-stage `Dockerfile` (Backend & Frontend) orchestrated with `docker-compose.yml`.

### Core Modules
1. **Administrative Security Dashboard**: Live KPIs, movement ratios, registration processing stats, and immutable audit streams.
2. **Student Management & PC Registry**: Full CRUD, faculty/department organization, hardware ownership mapping, and duplicate prevention.
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

## 2. Test User Accounts & RBAC Matrix

| Role | Username / Email | Password | Full Name & Title | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **ROLE_ADMIN** | `admin@hu.edu.et` | `Admin@123` | Dr. Tadesse Bekele (Director of ICT) | Full system oversight, student/user CRUD, audit logs, analytics |
| **ROLE_OFFICER** | `kebede@security.hu.edu.et` | `Officer@123` | Inspector Kebede Wolde (Police Union) | Review/approve/reject registrations, review lost reports, register PC |
| **ROLE_GATE_OFFICER** | `gate1@security.hu.edu.et` | `Gate@123` | Officer Girma Tesfaye (Main Gate 1) | Optical QR scanning, manual clearance, record IN/OUT transitions |
| **ROLE_STUDENT** | `abebe.bikila@hu.edu.et` | `Student@123` | Abebe Bikila (`HU/14022/13`) | Self-service registration, view own PC & clearance pass, report lost |
| **ROLE_STUDENT** | `selam.alemu@hu.edu.et` | `Student@123` | Selamawit Alemu (`HU/15881/14`) | Self-service registration, view own PC & clearance pass, report lost |

---

## 3. Quick Local Development & Docker Setup

### Running with Docker Compose (Recommended)
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:3000`
- Spring Boot Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (Database: `campusguard_db`)

### Running Locally without Docker

#### 1. Start PostgreSQL
```bash
docker run --name campusguard-pg -e POSTGRES_DB=campusguard_db -e POSTGRES_USER=campusguard_user -e POSTGRES_PASSWORD=HawassaSecurity2026! -p 5432:5432 -d postgres:16-alpine
```

#### 2. Start Spring Boot Backend
```bash
cd backend
mvn clean package
mvn spring-boot:run
```

#### 3. Start Frontend & Dev Server
```bash
npm install
npm run dev
```

### Running Tests
- **Backend Tests (JUnit 5 + Mockito)**:
  ```bash
  cd backend
  mvn test
  ```
- **Frontend Type & Syntax Verification**:
  ```bash
  npm run lint
  npm run build
  ```

---

## 4. API Endpoints Contract

- `POST /api/v1/auth/login` - Authenticate institutional user and return signed JWT
- `GET /api/v1/auth/me` - Current session profile
- `GET /api/v1/students` - List registered students
- `GET /api/v1/registrations` - List laptop registration applications (filtered by role)
- `POST /api/v1/registrations` - Submit new laptop registration (PENDING status)
- `POST /api/v1/registrations/{id}/approve` - Approve & issue PC ID + cryptographic QR token
- `POST /api/v1/registrations/{id}/reject` - Reject with mandatory reason
- `GET /api/v1/laptops` - Registered laptops catalog (role restricted)
- `GET /api/v1/laptops/{id}` - Laptop detail
- `POST /api/v1/laptops/{id}/reissue-qr` - Reissue QR token
- `POST /api/v1/verification/verify` - Verify QR token or PC ID at gate
- `POST /api/v1/verification/movement` - Log entrance (IN) or exit (OUT)
- `GET /api/v1/verification/events` - Recent gate movement logs
- `GET /api/v1/lost-reports` - Missing device incident reports
- `POST /api/v1/lost-reports` - Submit stolen/lost report
- `POST /api/v1/lost-reports/{id}/review` - Confirm or reject stolen report
- `POST /api/v1/lost-reports/{id}/resolve` - Mark device recovered and restore status to NORMAL
- `GET /api/v1/alerts` - Active security broadcasts
- `POST /api/v1/alerts/{id}/acknowledge` - Officer acknowledgement of gate alert
- `GET /api/v1/alerts/stream` - Real-time SSE alert channel for gate posts
- `GET /api/v1/audit-logs` - Immutable audit log stream (ADMIN only)
- `GET /api/v1/dashboard/stats` - University-wide security KPI analytics
