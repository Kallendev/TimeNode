// src/pages/AdminDashboard.jsx
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetAllRecordsQuery,
  useGetWeeklyReportQuery,
  useLazyGetWeeklyReportQuery,
} from "@/app/slices/usersApiSlice";
import { logout as logoutAction } from "@/app/slices/authSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, FileDown } from "lucide-react";

const accentColor = "hsl(192.9 82.3% 31%)";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch all records
  const { data: records, isLoading } = useGetAllRecordsQuery();

  // Weekly report query (lazy trigger)
  const { refetch: fetchWeekly } = useGetWeeklyReportQuery(undefined, {
    skip: true, // don’t auto-fetch
  });

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/");
  };
const [triggerWeekly] = useLazyGetWeeklyReportQuery();

const handleDownloadReport = async () => {
  try {
    const res = await triggerWeekly().unwrap(); // unwrap gives plain data
    if (res) {
      const blob = new Blob([res], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance-week.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Error downloading report:", err);
  }
};

  const isLate = (checkIn) => {
    if (!checkIn) return false;
    const date = new Date(checkIn);
    const lateThreshold = new Date(date);
    lateThreshold.setHours(8, 0, 0, 0); // 8:00 AM
    return date > lateThreshold;
  };

  return (
    <div className="min-h-screen bg-white p-6 text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: accentColor }}>
          Admin Dashboard
        </h1>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="rounded-xl"
          style={{ borderColor: "red", color: "red" }}
        >
          <LogOut size={16} className="mr-2" /> Logout
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button
          style={{ background: accentColor, color: "white" }}
          onClick={handleDownloadReport}
        >
          <FileDown className="mr-2" size={16} />
          Download Weekly Report
        </Button>
      </div>

      {/* Records Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading records...</p>
          ) : (
            <table className="w-full border">
              <thead style={{ background: "rgba(0,0,0,0.05)" }}>
                <tr>
                  <th className="p-2 border">User</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Day</th>
                  <th className="p-2 border">Check In</th>
                  <th className="p-2 border">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {records?.data?.map((r) => (
                  <tr key={`${r.userId}-${r.day}`}>
                    <td className="p-2 border">{r.user.name}</td>
                    <td className="p-2 border">{r.user.email}</td>
                    <td className="p-2 border">
                      {new Date(r.day).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      {r.checkIn ? (
                        <>
                          {new Date(r.checkIn).toLocaleTimeString()}
                          {isLate(r.checkIn) && (
                            <span className="ml-2 text-red-600 font-bold">
                              (Late)
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2 border">
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
