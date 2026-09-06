'use client';
import { api } from './api';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ─── Notices / Announcements ───────────────────────────────────────────────

export const noticesApi = {
  list: (params?: { status?: string; category?: string; priority?: string; page?: number; limit?: number }) =>
    api.get('/notices', { params }).then(r => r.data.data ?? r.data),

  getOne: (id: string) =>
    api.get(`/notices/${id}`).then(r => r.data.data ?? r.data),

  create: (body: { title: string; content: string; category?: string; priority?: string; isPinned?: boolean; requiresAck?: boolean; publishedAt?: string }) =>
    api.post('/notices', body).then(r => r.data.data ?? r.data),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/notices/${id}`, body).then(r => r.data.data ?? r.data),

  publish: (id: string) =>
    api.patch(`/notices/${id}/publish`).then(r => r.data.data ?? r.data),

  archive: (id: string) =>
    api.patch(`/notices/${id}/archive`).then(r => r.data.data ?? r.data),

  acknowledge: (id: string) =>
    api.post(`/notices/${id}/acknowledge`).then(r => r.data.data ?? r.data),

  addComment: (id: string, content: string) =>
    api.post(`/notices/${id}/comments`, { content }).then(r => r.data.data ?? r.data),

  deleteComment: (commentId: string) =>
    api.delete(`/notices/comments/${commentId}`).then(r => r.data.data ?? r.data),
};

// ─── KRA ──────────────────────────────────────────────────────────────────

export const kraApi = {
  listCycles: (status?: string) =>
    api.get('/kra/cycles', { params: { status } }).then(r => r.data.data ?? r.data),

  createCycle: (body: { name: string; description?: string; periodFrom: string; periodTo: string }) =>
    api.post('/kra/cycles', body).then(r => r.data.data ?? r.data),

  updateCycleStatus: (id: string, status: string) =>
    api.patch(`/kra/cycles/${id}/status`, { status }).then(r => r.data.data ?? r.data),

  listObjectives: (params?: { cycleId?: string; employeeId?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/kra/objectives', { params }).then(r => r.data.data ?? r.data),

  createObjective: (body: { cycleId: string; employeeId: string; title: string; description?: string; weightage?: number; target?: string; unit?: string }) =>
    api.post('/kra/objectives', body).then(r => r.data.data ?? r.data),

  submitObjective: (id: string) =>
    api.patch(`/kra/objectives/${id}/submit`).then(r => r.data.data ?? r.data),

  getRatings: (objectiveId: string) =>
    api.get(`/kra/objectives/${objectiveId}/ratings`).then(r => r.data.data ?? r.data),

  submitRating: (objectiveId: string, raterType: string, rating: number, remarks?: string) =>
    api.post(`/kra/objectives/${objectiveId}/ratings`, { raterType, rating, remarks }).then(r => r.data.data ?? r.data),
};

// ─── Leave ────────────────────────────────────────────────────────────────

export const leaveApi = {
  listTypes: (includeInactive?: boolean) =>
    api.get('/leave/types', { params: { includeInactive } }).then(r => r.data.data ?? r.data),

  createType: (body: Record<string, unknown>) =>
    api.post('/leave/types', body).then(r => r.data.data ?? r.data),

  updateType: (id: string, body: Record<string, unknown>) =>
    api.patch(`/leave/types/${id}`, body).then(r => r.data.data ?? r.data),

  myBalances: (year?: number) =>
    api.get('/leave/balances/me', { params: { year } }).then(r => r.data.data ?? r.data),

  employeeBalances: (employeeId: string, year?: number) =>
    api.get(`/leave/balances/${employeeId}`, { params: { year } }).then(r => r.data.data ?? r.data),

  allocate: (body: { employeeId: string; leaveTypeId: string; year: number; allocated: number; carryForward?: number }) =>
    api.post('/leave/balances/allocate', body).then(r => r.data.data ?? r.data),

  listApplications: (params?: { employeeId?: string; leaveTypeId?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/leave/applications', { params }).then(r => r.data.data ?? r.data),

  myApplications: (params?: { status?: string; page?: number }) =>
    api.get('/leave/applications/my', { params }).then(r => r.data.data ?? r.data),

  apply: (body: { leaveTypeId: string; fromDate: string; toDate: string; isHalfDay?: boolean; reason?: string }) =>
    api.post('/leave/applications', body).then(r => r.data.data ?? r.data),

  review: (id: string, body: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) =>
    api.patch(`/leave/applications/${id}/review`, body).then(r => r.data.data ?? r.data),

  cancel: (id: string) =>
    api.patch(`/leave/applications/${id}/cancel`).then(r => r.data.data ?? r.data),
};

// ─── Attendance ───────────────────────────────────────────────────────────

export const attendanceApi = {
  list: (params?: { employeeId?: string; fromDate?: string; toDate?: string; status?: string; page?: number }) =>
    api.get('/attendance', { params }).then(r => r.data.data ?? r.data),

  myAttendance: (params?: { page?: number; limit?: number }) =>
    api.get('/attendance/my', { params }).then(r => r.data.data ?? r.data),

  checkIn: (checkIn?: string) =>
    api.post('/attendance/check-in', { checkIn }).then(r => r.data.data ?? r.data),

  checkOut: (checkOut?: string) =>
    api.post('/attendance/check-out', { checkOut }).then(r => r.data.data ?? r.data),

  monthlyReport: (employeeId: string, year: number, month: number) =>
    api.get(`/attendance/report/${employeeId}`, { params: { year, month } }).then(r => r.data.data ?? r.data),

  requestRegularization: (body: { attendanceId: string; reason: string; requestedIn?: string; requestedOut?: string }) =>
    api.post('/attendance/regularizations', body).then(r => r.data.data ?? r.data),

  reviewRegularization: (id: string, body: { status: 'APPROVED' | 'REJECTED'; reviewNote?: string }) =>
    api.patch(`/attendance/regularizations/${id}/review`, body).then(r => r.data.data ?? r.data),

  listShifts: () =>
    api.get('/attendance/shifts').then(r => r.data.data ?? r.data),

  createShift: (body: Record<string, unknown>) =>
    api.post('/attendance/shifts', body).then(r => r.data.data ?? r.data),

  listHolidays: (year?: number) =>
    api.get('/attendance/holidays', { params: { year } }).then(r => r.data.data ?? r.data),

  createHoliday: (body: Record<string, unknown>) =>
    api.post('/attendance/holidays', body).then(r => r.data.data ?? r.data),
};

// ─── Notifications ────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (status?: string) =>
    api.get('/notifications', { params: { status } }).then(r => r.data.data ?? r.data),

  unreadCount: () =>
    api.get('/notifications/unread-count').then(r => r.data.data ?? r.data),

  markRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data.data ?? r.data),

  markAllRead: () =>
    api.patch('/notifications/read-all').then(r => r.data.data ?? r.data),

  getPreferences: () =>
    api.get('/notifications/preferences').then(r => r.data.data ?? r.data),

  updatePreferences: (prefs: Record<string, boolean>) =>
    api.patch('/notifications/preferences', prefs).then(r => r.data.data ?? r.data),
};

// ─── Tasks (existing) ─────────────────────────────────────────────────────

export const tasksApi = {
  list: (params?: { status?: string; priority?: string; assigneeId?: string; taskType?: string }) =>
    api.get('/tasks', { params }).then(r => r.data.data ?? r.data),

  myTasks: (params?: { status?: string; priority?: string }) =>
    api.get('/tasks/my', { params }).then(r => r.data.data ?? r.data),

  getOne: (id: string) =>
    api.get(`/tasks/${id}`).then(r => r.data.data ?? r.data),

  create: (body: Record<string, unknown>) =>
    api.post('/tasks', body).then(r => r.data.data ?? r.data),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/tasks/${id}`, body).then(r => r.data.data ?? r.data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }).then(r => r.data.data ?? r.data),

  addComment: (id: string, content: string) =>
    api.post(`/tasks/${id}/comments`, { content }).then(r => r.data.data ?? r.data),
};

// ─── Employees (existing) ─────────────────────────────────────────────────

export const employeesApi = {
  list: (params?: { search?: string; departmentId?: string; status?: string; page?: number; limit?: number }) =>
    api.get('/employees', { params }).then(r => r.data.data ?? r.data),

  getOne: (id: string) =>
    api.get(`/employees/${id}`).then(r => r.data.data ?? r.data),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/employees/${id}`, body).then(r => r.data.data ?? r.data),
};

// ─── Kaizen (existing) ────────────────────────────────────────────────────

export const kaizenApi = {
  list: (params?: { status?: string; categoryId?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/kaizen', { params }).then(r => r.data.data ?? r.data),

  getOne: (id: string) =>
    api.get(`/kaizen/${id}`).then(r => r.data.data ?? r.data),

  create: (body: Record<string, unknown>) =>
    api.post('/kaizen', body).then(r => r.data.data ?? r.data),

  update: (id: string, body: Record<string, unknown>) =>
    api.patch(`/kaizen/${id}`, body).then(r => r.data.data ?? r.data),

  listCategories: () =>
    api.get('/kaizen-categories').then(r => r.data.data ?? r.data),
};

// ─── Organization (existing) ──────────────────────────────────────────────

export const orgApi = {
  listCompanies: () =>
    api.get('/org/companies').then(r => r.data.data ?? r.data),

  listDepartments: (companyId?: string) =>
    api.get('/org/departments', { params: { companyId } }).then(r => r.data.data ?? r.data),

  listDivisions: (companyId?: string) =>
    api.get('/org/divisions', { params: { companyId } }).then(r => r.data.data ?? r.data),

  listDesignations: (companyId?: string) =>
    api.get('/org/designations', { params: { companyId } }).then(r => r.data.data ?? r.data),
};
