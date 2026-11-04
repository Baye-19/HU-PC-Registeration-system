import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'c2VjdXJlX2hhd2Fzc2FfdW5pdmVyc2l0eV9jYW1wdXNndWFyZF9qd3Rfc2VjcmV0X2tleV8yMDI2';

app.use(express.json());

// Secure signed token generation & verification (HMAC-SHA256 with 24-hr expiry)
function createToken(user: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    exp: Date.now() + 86400000 // 24 hours
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && Date.now() > decoded.exp) {
      return null; // Expired token
    }

    const user = dbService.getUserById(decoded.id);
    return user || null;
  } catch {
    return null;
  }
}

// Authentication Middleware - strictly blocks unauthorized requests (no admin fallback)
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired institutional token. Please log in again.' });
  }

  (req as any).user = user;
  next();
}

// Role-Based Authorization Guard
function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Access Denied: Role '${user.role}' lacks permission for this endpoint. Required: [${allowedRoles.join(', ')}]`
      });
    }
    next();
  };
}

// --- API ROUTES ---

// 1. Auth routes
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const userWithHash = dbService.getUserByUsernameOrEmail(username);
    if (!userWithHash) {
      dbService.logAudit(
        { id: 'anonymous', fullName: username, role: 'STUDENT' },
        'LOGIN_FAILURE',
        'User',
        username,
        'FAILURE',
        `Failed login attempt for unknown user: ${username}`
      );
      return res.status(401).json({ error: 'Invalid institutional credentials' });
    }

    const valid = bcrypt.compareSync(password, userWithHash.passwordHash);
    if (!valid) {
      dbService.logAudit(
        { id: userWithHash.id, fullName: userWithHash.fullName, role: userWithHash.role },
        'LOGIN_FAILURE',
        'User',
        userWithHash.id,
        'FAILURE',
        `Incorrect password provided for user: ${userWithHash.username}`
      );
      return res.status(401).json({ error: 'Invalid institutional credentials' });
    }

    const { passwordHash, ...user } = userWithHash;
    const token = createToken(user);

    dbService.logAudit(
      user,
      'LOGIN_SUCCESS',
      'User',
      user.id,
      'SUCCESS',
      `Successful login by ${user.fullName} [${user.role}]`
    );

    res.json({
      token,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login error' });
  }
});

app.get('/api/v1/auth/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ user });
});

// Role switch for role testing
app.post('/api/v1/auth/switch-account', (req: Request, res: Response) => {
  const { role } = req.body;
  const users = dbService.getUsers();
  const target = users.find(u => u.role === role) || users[0];
  const token = createToken(target);
  dbService.logAudit(
    target,
    'ROLE_SWITCH_TEST',
    'User',
    target.id,
    'SUCCESS',
    `Role perspective switched to ${target.role} (${target.fullName})`
  );
  res.json({ token, user: target });
});

// 2. Students
app.get('/api/v1/students', authenticate, (req: Request, res: Response) => {
  const students = dbService.getStudents();
  res.json(students);
});

app.get('/api/v1/students/:id', authenticate, (req: Request, res: Response) => {
  const student = dbService.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.put('/api/v1/students/:id', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const updated = dbService.updateStudent(req.params.id, req.body, actor);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Laptop Registrations
app.get('/api/v1/registrations', authenticate, (req: Request, res: Response) => {
  const actor = (req as any).user;
  const status = req.query.status as string;
  let regs = dbService.getRegistrations(status);
  if (actor && actor.role === 'STUDENT') {
    regs = regs.filter(
      r =>
        r.studentIdNumber === actor.studentId ||
        r.studentId === actor.studentId ||
        r.studentId === actor.id ||
        r.submittedByUserId === actor.id ||
        r.studentName.toLowerCase() === actor.fullName.toLowerCase()
    );
  }
  res.json(regs);
});

app.post('/api/v1/registrations', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const reg = dbService.createRegistration(req.body, actor);
    res.status(201).json(reg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/registrations/:id/approve', authenticate, requireRole('OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const result = dbService.approveRegistration(req.params.id, actor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/registrations/:id/reject', authenticate, requireRole('OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is strictly mandatory' });
    }
    const reg = dbService.rejectRegistration(req.params.id, reason, actor);
    res.json(reg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Laptops (Students strictly restricted to only their own registered PCs)
app.get('/api/v1/laptops', authenticate, (req: Request, res: Response) => {
  const actor = (req as any).user;
  let laptops = dbService.getLaptops();
  if (actor && actor.role === 'STUDENT') {
    laptops = laptops.filter(
      l =>
        l.studentIdNumber === actor.studentId ||
        l.studentId === actor.studentId ||
        l.studentId === actor.id ||
        l.studentName.toLowerCase() === actor.fullName.toLowerCase()
    );
  }
  res.json(laptops);
});

app.get('/api/v1/laptops/:id', authenticate, (req: Request, res: Response) => {
  const actor = (req as any).user;
  const laptop = dbService.getLaptopById(req.params.id);
  if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
  if (actor && actor.role === 'STUDENT') {
    const isOwner =
      laptop.studentIdNumber === actor.studentId ||
      laptop.studentId === actor.studentId ||
      laptop.studentId === actor.id ||
      laptop.studentName.toLowerCase() === actor.fullName.toLowerCase();
    if (!isOwner) {
      return res.status(403).json({ error: 'Access denied: You can only view your own registered PC' });
    }
  }
  res.json(laptop);
});

app.get('/api/v1/laptops/student/:studentId', authenticate, (req: Request, res: Response) => {
  const actor = (req as any).user;
  if (actor && actor.role === 'STUDENT') {
    if (actor.studentId !== req.params.studentId && actor.id !== req.params.studentId) {
      return res.status(403).json({ error: 'Access denied: You can only query your own laptops' });
    }
  }
  const laptops = dbService.getLaptopsByStudentId(req.params.studentId);
  res.json(laptops);
});

app.post('/api/v1/laptops/:id/reissue-qr', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const laptop = dbService.reissueQrToken(req.params.id, actor);
    res.json(laptop);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Verification & Gate Movements
app.post('/api/v1/verification/verify', authenticate, requireRole('GATE_OFFICER', 'OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  const result = dbService.verifyDevice(req.body);
  res.json(result);
});

app.post('/api/v1/verification/movement', authenticate, requireRole('GATE_OFFICER', 'OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const event = dbService.recordMovement(req.body, actor);
    res.status(201).json(event);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/v1/verification/events', authenticate, (req: Request, res: Response) => {
  const events = dbService.getSecurityEvents(100);
  res.json(events);
});

// 6. Lost Reports
app.get('/api/v1/lost-reports', authenticate, (req: Request, res: Response) => {
  const actor = (req as any).user;
  let reports = dbService.getLostReports();
  if (actor && actor.role === 'STUDENT') {
    reports = reports.filter(
      r =>
        r.studentIdNumber === actor.studentId ||
        r.reportingStudentId === actor.studentId ||
        r.reportingStudentId === actor.id ||
        r.reportingStudentName.toLowerCase() === actor.fullName.toLowerCase()
    );
  }
  res.json(reports);
});

app.post('/api/v1/lost-reports', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const report = dbService.createLostReport(req.body, actor);
    res.status(201).json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/lost-reports/:id/review', authenticate, requireRole('OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { status, notes } = req.body;
    const report = dbService.reviewLostReport(req.params.id, status, notes, actor);
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/lost-reports/:id/resolve', authenticate, requireRole('OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { notes } = req.body;
    const report = dbService.resolveLostReport(req.params.id, notes, actor);
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Security Alerts & Real-Time SSE
app.get('/api/v1/alerts', authenticate, (req: Request, res: Response) => {
  const alerts = dbService.getAlerts();
  res.json(alerts);
});

app.post('/api/v1/alerts', authenticate, requireRole('OFFICER', 'ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const alert = dbService.createSecurityAlert(req.body, actor);
    res.status(201).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/alerts/:id/acknowledge', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const alert = dbService.acknowledgeAlert(req.params.id, actor);
    res.json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Real-Time Server-Sent Events endpoint
app.get('/api/v1/alerts/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const unregister = dbService.registerSseClient((alert) => {
    res.write(`data: ${JSON.stringify({ type: 'NEW_ALERT', alert })}\n\n`);
  });

  req.on('close', () => {
    unregister();
  });
});

// 8. Gates & Audits & Stats (Strictly Protected by Role)
app.get('/api/v1/gates', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getGates());
});

app.get('/api/v1/audit-logs', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  res.json(dbService.getAuditLogs());
});

app.get('/api/v1/dashboard/stats', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getDashboardStats());
});

app.get('/api/v1/users', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  res.json(dbService.getUsers());
});

app.post('/api/v1/users', authenticate, requireRole('ADMIN'), (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const user = dbService.createUser(req.body, actor);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Vite Middleware Integration ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CampusGuard Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
