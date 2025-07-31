import { useState, useEffect } from 'react';
import { TimeEntry, DashboardStats, Employee } from '@/types/timeTracking';
import { timeTrackingAPI, timeTrackingStorage } from '@/lib/timeTracking';
import { toast } from '@/hooks/use-toast';

export const useTimeTracking = (userId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      const entries = timeTrackingAPI.getUserTimeEntries(userId);
      setTimeEntries(entries);
      
      const active = entries.find(e => e.status === 'active');
      setCurrentEntry(active || null);
    }
  }, [userId]);

  const clockIn = async (userId: string, userName: string) => {
    try {
      setIsLoading(true);
      const entry = await timeTrackingAPI.clockIn(userId, userName);
      setCurrentEntry(entry);
      setTimeEntries(prev => [entry, ...prev]);
      toast({
        title: 'Clocked in successfully',
        description: `Started at ${new Date(entry.clockIn).toLocaleTimeString()}`,
      });
    } catch (error) {
      toast({
        title: 'Clock in failed',
        description: error instanceof Error ? error.message : 'Failed to clock in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clockOut = async (userId: string) => {
    try {
      setIsLoading(true);
      const entry = await timeTrackingAPI.clockOut(userId);
      setCurrentEntry(null);
      setTimeEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
      toast({
        title: 'Clocked out successfully',
        description: `Duration: ${Math.floor((entry.duration || 0) / 60)}h ${(entry.duration || 0) % 60}m`,
      });
    } catch (error) {
      toast({
        title: 'Clock out failed',
        description: error instanceof Error ? error.message : 'Failed to clock out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    timeEntries,
    currentEntry,
    isLoading,
    clockIn,
    clockOut,
  };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeCheckIns: 0,
    lateEntries: 0,
    totalHoursToday: 0,
  });

  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const updateData = () => {
      setStats(timeTrackingAPI.getDashboardStats());
      setEmployees(timeTrackingStorage.getEmployees());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { stats, employees, refreshData: () => {
    setStats(timeTrackingAPI.getDashboardStats());
    setEmployees(timeTrackingStorage.getEmployees());
  }};
};