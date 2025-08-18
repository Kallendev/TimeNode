// src/pages/EmployeeDashboard.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-white p-6 text-black">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Employee Dashboard</h1>

      {/* Attendance Status */}
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Today’s Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold text-green-600">Present ✅</p>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-gray-700">
            <li>Aug 15, 2025 - Present</li>
            <li>Aug 14, 2025 - Present</li>
            <li>Aug 13, 2025 - Absent</li>
            <li>Aug 12, 2025 - Present</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;
