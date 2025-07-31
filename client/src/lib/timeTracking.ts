import { TimeEntry, DashboardStats, Employee } from '@/types/timeTracking';

const TIME_ENTRIES_KEY = 'timenode_entries';
const EMPLOYEES_KEY = 'timenode_employees';

export const timeTrackingStorage = {
  getTimeEntries: (): TimeEntry[] => {
    try {
      const stored = localStorage.getItem(TIME_ENTRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setTimeEntries: (entries: TimeEntry[]): void => {
    localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(entries));
  },

  getEmployees: (): Employee[] => {
    try {
      const stored = localStorage.getItem(EMPLOYEES_KEY);
      return stored ? JSON.parse(stored) : [
        {
          id: '2',
          name: 'John Employee',
          email: 'employee@timenode.com',
          role: 'employee',
          status: 'checked-out',
          totalHours: 0,
        },
        {
          id: '3',
          name: 'Jane Smith',
          email: 'jane@timenode.com',
          role: 'employee',
          status: 'checked-out',
          totalHours: 0,
        },
      ];
    } catch {
      return [];
    }
  },

  setEmployees: (employees: Employee[]): void => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  },
};

export const timeTrackingAPI = {
  clockIn: async (userId: string, userName: string): Promise<TimeEntry> => {
    const entries = timeTrackingStorage.getTimeEntries();
    const activeEntry = entries.find(e => e.userId === userId && e.status === 'active');
    
    if (activeEntry) {
      throw new Error('Already clocked in');
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId,
      userName,
      clockIn: new Date().toISOString(),
      date: new Date().toDateString(),
      status: 'active',
    };

    entries.push(newEntry);
    timeTrackingStorage.setTimeEntries(entries);

    // Update employee status
    const employees = timeTrackingStorage.getEmployees();
    const employeeIndex = employees.findIndex(e => e.id === userId);
    if (employeeIndex !== -1) {
      employees[employeeIndex].status = 'checked-in';
      employees[employeeIndex].lastActivity = new Date().toISOString();
      timeTrackingStorage.setEmployees(employees);
    }

    return newEntry;
  },

  clockOut: async (userId: string): Promise<TimeEntry> => {
    const entries = timeTrackingStorage.getTimeEntries();
    const activeEntry = entries.find(e => e.userId === userId && e.status === 'active');
    
    if (!activeEntry) {
      throw new Error('No active clock-in found');
    }

    const clockOutTime = new Date();
    const clockInTime = new Date(activeEntry.clockIn);
    const duration = Math.floor((clockOutTime.getTime() - clockInTime.getTime()) / 1000 / 60); // minutes

    activeEntry.clockOut = clockOutTime.toISOString();
    activeEntry.duration = duration;
    activeEntry.status = 'completed';

    timeTrackingStorage.setTimeEntries(entries);

    // Update employee status
    const employees = timeTrackingStorage.getEmployees();
    const employeeIndex = employees.findIndex(e => e.id === userId);
    if (employeeIndex !== -1) {
      employees[employeeIndex].status = 'checked-out';
      employees[employeeIndex].lastActivity = clockOutTime.toISOString();
      employees[employeeIndex].totalHours = (employees[employeeIndex].totalHours || 0) + duration / 60;
      timeTrackingStorage.setEmployees(employees);
    }

    return activeEntry;
  },

  getUserTimeEntries: (userId: string): TimeEntry[] => {
    const entries = timeTrackingStorage.getTimeEntries();
    return entries.filter(e => e.userId === userId).sort((a, b) => 
      new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
    );
  },

  getDashboardStats: (): DashboardStats => {
    const entries = timeTrackingStorage.getTimeEntries();
    const employees = timeTrackingStorage.getEmployees();
    const today = new Date().toDateString();

    const todayEntries = entries.filter(e => e.date === today);
    const activeCheckIns = todayEntries.filter(e => e.status === 'active').length;
    const lateEntries = todayEntries.filter(e => {
      const clockInTime = new Date(e.clockIn);
      return clockInTime.getHours() > 9; // Consider late if after 9 AM
    }).length;

    const totalHoursToday = todayEntries
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0) / 60;

    return {
      totalEmployees: employees.filter(e => e.role === 'employee').length,
      activeCheckIns,
      lateEntries,
      totalHoursToday,
    };
  },
};