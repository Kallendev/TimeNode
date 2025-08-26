// src/pages/EmployeeDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut, Clock3, CalendarDays, History } from "lucide-react";

import {
  useGetMyTodayQuery,
  useGetMyHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useLogoutMutation,
} from "@/app/slices/usersApiSlice";
import { logout as logoutAction } from "@/app/slices/authSlice";

const accentColor = "hsl(192.9 82.3% 31%)";

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function msToHMM(ms) {
  if (!ms || ms < 0) return "0h 00m";
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 👤 get logged-in user from Redux
  const { userInfo } = useSelector((state) => state.auth);

  // API logout mutation
  const [apiLogout] = useLogoutMutation();

  // today + history
  const {
    data: today,
    isLoading: loadingToday,
    isFetching: fetchingToday,
    refetch: refetchToday,
    error: todayError,
  } = useGetMyTodayQuery();

  const {
    data: history,
    isLoading: loadingHistory,
    isFetching: fetchingHistory,
    refetch: refetchHistory,
    error: historyError,
  } = useGetMyHistoryQuery({ limit: 10 });

  // mutations
  const [checkIn, { isLoading: checkingIn }] = useCheckInMutation();
  const [checkOut, { isLoading: checkingOut }] = useCheckOutMutation();

  // live elapsed time after check-in
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const checkedIn = !!today?.checkIn && !today?.checkOut;
  const checkedOut = !!today?.checkOut;
  const canCheckIn = !checkedIn && !checkedOut;
  const canCheckOut = checkedIn && !checkedOut;

  const elapsedMs = useMemo(() => {
    if (!today?.checkIn) return 0;
    const start = new Date(today.checkIn).getTime();
    const end = today?.checkOut ? new Date(today.checkOut).getTime() : now;
    return end - start;
  }, [today?.checkIn, today?.checkOut, now]);

  const handleCheckIn = async () => {
    try {
      await checkIn().unwrap();
      await Promise.all([refetchToday(), refetchHistory()]);
    } catch (err) {
      alert(err?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut().unwrap();
      await Promise.all([refetchToday(), refetchHistory()]);
    } catch (err) {
      alert(err?.data?.message || "Failed to check out");
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout().unwrap(); // call API logout
    } catch (err) {
      console.warn("Logout API failed, clearing locally anyway");
    }
    dispatch(logoutAction()); // clear redux + localStorage
    navigate("/"); // back to landing page
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {userInfo
                ? `Welcome, ${userInfo.user?.name || userInfo.user?.email}`
                : "Employee Dashboard"}
            </h1>
            <p className="text-gray-600">
              Track your attendance and working hours with TimeNode.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: `1px solid ${accentColor}`,
                color: accentColor,
              }}
            >
              {fetchingToday || fetchingHistory ? "Syncing…" : "Up to date"}
            </div>
            {/* 🚪 Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-xl"
              style={{ borderColor: "red", color: "red" }}
            >
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* ================== Today Status + Actions ================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-md border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 size={20} style={{ color: accentColor }} />
                <CardTitle>Today’s Status</CardTitle>
              </div>
              <span
                className="text-sm px-2 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(0,0,0,0.06)",
                  border: `1px solid ${accentColor}`,
                  color: accentColor,
                }}
              >
                {checkedOut ? "Completed" : checkedIn ? "On Shift" : "Not Checked In"}
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayError ? (
                <p className="text-red-600">Failed to load today’s status.</p>
              ) : loadingToday ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="animate-spin" size={18} />
                  Loading…
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-lg font-semibold">
                        {formatDate(today?.day || Date.now())}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Check In</p>
                      <p className="text-lg font-semibold">{formatTime(today?.checkIn)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Check Out</p>
                      <p className="text-lg font-semibold">{formatTime(today?.checkOut)}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs text-gray-500">Elapsed</p>
                      <p className="text-lg font-semibold">{msToHMM(elapsedMs)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={handleCheckIn}
                      disabled={!canCheckIn || checkingIn}
                      className="rounded-xl"
                      style={{
                        backgroundColor: accentColor,
                        color: "white",
                        opacity: canCheckIn ? 1 : 0.6,
                      }}
                    >
                      {checkingIn ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} /> Checking in…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <LogIn size={16} /> Check In
                        </span>
                      )}
                    </Button>

                    <Button
                      onClick={handleCheckOut}
                      disabled={!canCheckOut || checkingOut}
                      variant="outline"
                      className="rounded-xl"
                      style={{
                        borderColor: accentColor,
                        color: canCheckOut ? accentColor : "rgba(0,0,0,0.4)",
                      }}
                    >
                      {checkingOut ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="animate-spin" size={16} /> Checking out…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <LogOut size={16} /> Check Out
                        </span>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Summary / Week at a glance */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CalendarDays size={20} style={{ color: accentColor }} />
                <CardTitle>This Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="animate-spin" size={18} />
                  Loading…
                </div>
              ) : historyError ? (
                <p className="text-red-600">Failed to load weekly summary.</p>
              ) : (
                <>
                  {(() => {
                    const last7 = (history?.data || []).slice(0, 7);
                    const totalMs = last7.reduce((sum, r) => {
                      const start = r?.checkIn ? new Date(r.checkIn).getTime() : 0;
                      const end = r?.checkOut ? new Date(r.checkOut).getTime() : 0;
                      const dur = end - start;
                      return sum + (dur > 0 ? dur : 0);
                    }, 0);
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Days recorded</span>
                          <span className="font-medium">{last7.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total time</span>
                          <span className="font-medium">{msToHMM(totalMs)}</span>
                        </div>
                        <div className="pt-2 text-xs text-gray-500">
                          * Summary of your most recent 7 records
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ================== History ================== */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={20} style={{ color: accentColor }} />
              <CardTitle>Attendance History</CardTitle>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                refetchHistory();
                refetchToday();
              }}
              className="rounded-xl"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="animate-spin" size={18} />
                Loading…
              </div>
            ) : historyError ? (
              <p className="text-red-600">Failed to load attendance history.</p>
            ) : (history?.data || []).length === 0 ? (
              <p className="text-gray-600">No attendance records yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-sm text-gray-600">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Check In</th>
                      <th className="py-2 pr-4">Check Out</th>
                      <th className="py-2 pr-4">Total</th>
                      <th className="py-2 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(history?.data || []).map((r) => {
                      const total =
                        r?.checkIn && r?.checkOut
                          ? msToHMM(new Date(r.checkOut) - new Date(r.checkIn))
                          : "—";
                      const status = r?.checkIn
                        ? r?.checkOut
                          ? "Complete"
                          : "Open"
                        : "Absent";
                      return (
                        <tr key={r.id || r.day} className="border-b border-gray-100 text-sm">
                          <td className="py-3 pr-4">{formatDate(r.day)}</td>
                          <td className="py-3 pr-4">{formatTime(r.checkIn)}</td>
                          <td className="py-3 pr-4">{formatTime(r.checkOut)}</td>
                          <td className="py-3 pr-4">{total}</td>
                          <td className="py-3 pr-4">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                border: `1px solid ${accentColor}`,
                                color: accentColor,
                                background: "rgba(0,0,0,0.03)",
                              }}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
