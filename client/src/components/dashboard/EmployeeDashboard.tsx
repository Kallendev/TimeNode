import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Play, Square, Timer, History } from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { timeEntries, currentEntry, isLoading, clockIn, clockOut } = useTimeTracking(user?.id);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentDuration = () => {
    if (!currentEntry) return '0h 0m';
    
    const start = new Date(currentEntry.clockIn);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    const todayEntries = timeEntries.filter(entry => 
      new Date(entry.clockIn).toDateString() === today && entry.duration
    );
    
    const totalMinutes = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return formatTime(totalMinutes);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Good morning, {user?.name}!</h1>
          <p className="text-gray-400 mt-1">Ready to make today productive?</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Current Time</p>
          <p className="text-xl font-mono text-white">{currentTime.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Timer className="h-5 w-5 text-blue-400" />
              <span>Time Tracker</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Track your work hours efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <Badge
                variant={currentEntry ? 'default' : 'secondary'}
                className={`text-lg px-4 py-2 ${
                  currentEntry 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 mr-2" />
                {currentEntry ? 'Checked In' : 'Checked Out'}
              </Badge>
            </div>

            {/* Current Duration */}
            {currentEntry && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">Current Session</p>
                <p className="text-3xl font-mono font-bold text-blue-400">
                  {getCurrentDuration()}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Started at {new Date(currentEntry.clockIn).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {!currentEntry ? (
                <Button
                  onClick={() => user && clockIn(user.id, user.name)}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  {isLoading ? 'Clocking In...' : 'Clock In'}
                </Button>
              ) : (
                <Button
                  onClick={() => user && clockOut(user.id)}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                  size="lg"
                >
                  <Square className="h-5 w-5 mr-2" />
                  {isLoading ? 'Clocking Out...' : 'Clock Out'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <History className="h-5 w-5 text-purple-400" />
              <span>Today's Summary</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your productivity overview for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-white">{getTodayTotal()}</p>
              </div>
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-sm">Sessions</p>
                <p className="text-2xl font-bold text-white">
                  {timeEntries.filter(entry => 
                    new Date(entry.clockIn).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>

            {currentEntry && (
              <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                <p className="text-blue-400 text-sm font-medium">Active Session</p>
                <p className="text-white">
                  Started: {new Date(currentEntry.clockIn).toLocaleTimeString()}
                </p>
                <p className="text-blue-300 font-mono text-lg">
                  Duration: {getCurrentDuration()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Time Entries */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Time Entries</CardTitle>
          <CardDescription className="text-gray-400">
            Your latest work sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    entry.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">
                      {new Date(entry.clockIn).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(entry.clockIn).toLocaleTimeString()} - 
                      {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : 'Active'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono">
                    {entry.duration ? formatTime(entry.duration) : getCurrentDuration()}
                  </p>
                  <Badge
                    variant={entry.status === 'active' ? 'default' : 'secondary'}
                    className={entry.status === 'active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {timeEntries.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No time entries yet</p>
                <p className="text-gray-500 text-sm">Clock in to start your first session</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};