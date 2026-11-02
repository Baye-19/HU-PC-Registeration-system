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
  Role,
  MovementType,
  VerificationMethod,
  VerificationResult
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('cg_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('cg_token', token);
    } else {
      localStorage.removeItem('cg_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      let errorMsg = `Request failed: ${res.statusText}`;
      try {
        const body = await res.json();
        if (body.error) errorMsg = body.error;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // --- Auth ---
  public async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async switchAccount(role: Role): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/auth/switch-account', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    this.setToken(data.token);
    return data;
  }

  public logout() {
    this.setToken(null);
  }

  // --- Students ---
  public async getStudents(): Promise<Student[]> {
    return this.request<Student[]>('/students');
  }

  public async getStudent(id: string): Promise<Student> {
    return this.request<Student>(`/students/${id}`);
  }

  public async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    return this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // --- Registrations ---
  public async getRegistrations(status?: string): Promise<LaptopRegistration[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<LaptopRegistration[]>(`/registrations${query}`);
  }

  public async createRegistration(data: Partial<LaptopRegistration> & { autoApprove?: boolean }): Promise<LaptopRegistration> {
    return this.request<LaptopRegistration>('/registrations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async approveRegistration(id: string): Promise<{ registration: LaptopRegistration; laptop: Laptop }> {
    return this.request<{ registration: LaptopRegistration; laptop: Laptop }>(`/registrations/${id}/approve`, {
      method: 'POST'
    });
  }

  public async rejectRegistration(id: string, reason: string): Promise<LaptopRegistration> {
    return this.request<LaptopRegistration>(`/registrations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // --- Laptops ---
  public async getLaptops(): Promise<Laptop[]> {
    return this.request<Laptop[]>('/laptops');
  }

  public async getLaptop(id: string): Promise<Laptop> {
    return this.request<Laptop>(`/laptops/${id}`);
  }

  public async getLaptopsByStudent(studentId: string): Promise<Laptop[]> {
    return this.request<Laptop[]>(`/laptops/student/${studentId}`);
  }

  public async reissueQr(id: string): Promise<Laptop> {
    return this.request<Laptop>(`/laptops/${id}/reissue-qr`, {
      method: 'POST'
    });
  }

  // --- Verification & Gate Movements ---
  public async verifyDevice(params: { qrToken?: string; identifier?: string }): Promise<VerificationResponse> {
    return this.request<VerificationResponse>('/verification/verify', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public async recordMovement(data: {
    laptopId: string;
    gateId: string;
    movementType: MovementType;
    verificationMethod: VerificationMethod;
    verificationResult: VerificationResult;
    notes?: string;
    overrideConsecutive?: boolean;
  }): Promise<SecurityEvent> {
    return this.request<SecurityEvent>('/verification/movement', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async getSecurityEvents(): Promise<SecurityEvent[]> {
    return this.request<SecurityEvent[]>('/verification/events');
  }

  // --- Lost Reports ---
  public async getLostReports(): Promise<LostReport[]> {
    return this.request<LostReport[]>('/lost-reports');
  }

  public async createLostReport(data: {
    laptopId: string;
    incidentType: string;
    incidentDate: string;
    incidentLocation: string;
    description: string;
    contactPhone: string;
  }): Promise<LostReport> {
    return this.request<LostReport>('/lost-reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async reviewLostReport(id: string, status: 'CONFIRMED' | 'REJECTED', notes: string): Promise<LostReport> {
    return this.request<LostReport>(`/lost-reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    });
  }

  public async resolveLostReport(id: string, notes: string): Promise<LostReport> {
    return this.request<LostReport>(`/lost-reports/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  // --- Alerts ---
  public async getAlerts(): Promise<SecurityAlert[]> {
    return this.request<SecurityAlert[]>('/alerts');
  }

  public async createAlert(data: {
    type: 'LOST_DEVICE' | 'SECURITY_WARNING' | 'ANNOUNCEMENT';
    title: string;
    message: string;
    severity: 'HIGH' | 'MEDIUM' | 'INFO';
    laptopId?: string;
    pcId?: string;
    lostReportId?: string;
  }): Promise<SecurityAlert> {
    return this.request<SecurityAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async acknowledgeAlert(id: string): Promise<SecurityAlert> {
    return this.request<SecurityAlert>(`/alerts/${id}/acknowledge`, {
      method: 'POST'
    });
  }

  // --- Gates & Audits & Stats ---
  public async getGates(): Promise<Gate[]> {
    return this.request<Gate[]>('/gates');
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/audit-logs');
  }

  public async getDashboardStats(): Promise<any> {
    return this.request<any>('/dashboard/stats');
  }

  public async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  public async createUser(data: any): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiService();
