import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats } from '@/hooks/useTimeTracking';
import { useAuth } from '@/hooks/useAuth';
import { Users, Clock, AlertTriangle, BarChart3, Timer } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, employees, refreshData } = useDashboardStats();

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your team today.</p>
        </div>
        <Button onClick={refreshData} variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-400">Active team members</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeCheckIns}</div>
            <p className="text-xs text-gray-400">Currently working</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Late Entries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.lateEntries}</div>
            <p className="text-xs text-gray-400">After 9:00 AM today</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Hours Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatTime(stats.totalHoursToday)}</div>
            <p className="text-xs text-gray-400">Team productivity</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Employee Status</CardTitle>
          <CardDescription className="text-gray-400">
            Monitor your team's current status and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{employee.name}</h3>
                    <p className="text-gray-400 text-sm">{employee.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white text-sm">
                      Total: {formatTime(employee.totalHours || 0)}
                    </p>
                    {employee.lastActivity && (
                      <p className="text-gray-400 text-xs">
                        Last: {new Date(employee.lastActivity).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  
                  <Badge
                    variant={employee.status === 'checked-in' ? 'default' : 'secondary'}
                    className={employee.status === 'checked-in' 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-600 text-gray-300'
                    }
                  >
                    <Timer className="h-3 w-3 mr-1" />
                    {employee.status === 'checked-in' ? 'Active' : 'Offline'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {employees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No employees found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};