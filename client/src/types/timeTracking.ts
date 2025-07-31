export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  clockIn: string;
  clockOut?: string;
  duration?: number;
  date: string;
  status: 'active' | 'completed';
}

export interface DashboardStats {
  totalEmployees: number;
  activeCheckIns: number;
  lateEntries: number;
  totalHoursToday: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status: 'checked-in' | 'checked-out';
  lastActivity?: string;
  totalHours?: number;
}