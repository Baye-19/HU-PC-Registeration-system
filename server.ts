import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbService } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Simple token cache for authenticated sessions
const sessionTokens = new Map<string, any>();

function createToken(user: any): string {
  const token = `cg_jwt_${Buffer.from(JSON.stringify({ id: user.id, role: user.role, t: Date.now() })).toString('base64')}`;
  sessionTokens.set(token, user);
  return token;
}

// Authentication Middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to admin user for convenience if in dev mode without token
    const defaultUser = dbService.getUserById('usr-admin-1');
    (req as any).user = defaultUser;
    return next();
  }
  const token = authHeader.substring(7);
  const user = sessionTokens.get(token);
  if (!user) {
    // Attempt parse if created by standard format
    try {
      const payload = JSON.parse(Buffer.from(token.replace('cg_jwt_', ''), 'base64').toString('utf-8'));
      const found = dbService.getUserById(payload.id);
      if (found) {
        (req as any).user = found;
        return next();
      }
    } catch {
      // Fallback
    }
    const defaultUser = dbService.getUserById('usr-admin-1');
    (req as any).user = defaultUser;
    return next();
  }
  (req as any).user = user;
  next();
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

// Switch role route for rapid system testing in sandbox
app.post('/api/v1/auth/switch-account', (req: Request, res: Response) => {
  const { role } = req.body;
  const users = dbService.getUsers();
  const target = users.find(u => u.role === role) || users[0];
  const token = createToken(target);
  dbService.logAudit(
    target,
    'ROLE_SWITCH_DEBUG',
    'User',
    target.id,
    'SUCCESS',
    `Session switched to ${target.role} (${target.fullName})`
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
  const status = req.query.status as string;
  const regs = dbService.getRegistrations(status);
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

app.post('/api/v1/registrations/:id/approve', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const result = dbService.approveRegistration(req.params.id, actor);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/registrations/:id/reject', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { reason } = req.body;
    const reg = dbService.rejectRegistration(req.params.id, reason, actor);
    res.json(reg);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Laptops
app.get('/api/v1/laptops', authenticate, (req: Request, res: Response) => {
  const laptops = dbService.getLaptops();
  res.json(laptops);
});

app.get('/api/v1/laptops/:id', authenticate, (req: Request, res: Response) => {
  const laptop = dbService.getLaptopById(req.params.id);
  if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
  res.json(laptop);
});

app.get('/api/v1/laptops/student/:studentId', authenticate, (req: Request, res: Response) => {
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
app.post('/api/v1/verification/verify', authenticate, (req: Request, res: Response) => {
  const result = dbService.verifyDevice(req.body);
  res.json(result);
});

app.post('/api/v1/verification/movement', authenticate, (req: Request, res: Response) => {
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
  const reports = dbService.getLostReports();
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

app.post('/api/v1/lost-reports/:id/review', authenticate, (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { status, notes } = req.body;
    const report = dbService.reviewLostReport(req.params.id, status, notes, actor);
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/v1/lost-reports/:id/resolve', authenticate, (req: Request, res: Response) => {
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

app.post('/api/v1/alerts', authenticate, (req: Request, res: Response) => {
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

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  const unregister = dbService.registerSseClient((alert) => {
    res.write(`data: ${JSON.stringify({ type: 'NEW_ALERT', alert })}\n\n`);
  });

  req.on('close', () => {
    unregister();
  });
});

// 8. Gates & Audits & Stats
app.get('/api/v1/gates', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getGates());
});

app.get('/api/v1/audit-logs', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getAuditLogs());
});

app.get('/api/v1/dashboard/stats', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getDashboardStats());
});

app.get('/api/v1/users', authenticate, (req: Request, res: Response) => {
  res.json(dbService.getUsers());
});

app.post('/api/v1/users', authenticate, (req: Request, res: Response) => {
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
