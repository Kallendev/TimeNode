// src/pages/AdminDashboard.jsx
import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetAllRecordsQuery,
  useLazyGetWeeklyReportQuery,
  useGetAdminTodayInsightsQuery,
  useGetAllUsersQuery,
  useGetAllTasksQuery,
  useUpdateMyTaskStatusMutation,
  useCreateTaskMutation,
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectStatusMutation,
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

  // Week selector: 0 = this week, -1 = last week, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  // Forms state
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", userId: "", projectId: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "", status: "ONGOING" });

  // Fetch all records for selected week
  const { data: records, isLoading } = useGetAllRecordsQuery({ weekOffset });
  const { data: insights, isLoading: loadingInsights } = useGetAdminTodayInsightsQuery(weekOffset);
  const { data: usersData } = useGetAllUsersQuery();
  const { data: tasksData, refetch: refetchTasks } = useGetAllTasksQuery({ source: 'ADMIN' });
  const { data: projectsData, refetch: refetchProjects } = useGetAllProjectsQuery();
  const [updateTaskStatus, { isLoading: updatingTask }] = useUpdateMyTaskStatusMutation();
  const [createTask, { isLoading: creatingTask }] = useCreateTaskMutation();
  const [createProject, { isLoading: creatingProject }] = useCreateProjectMutation();
  const [updateProjectStatus, { isLoading: updatingProject }] = useUpdateProjectStatusMutation();

  // Lazy report trigger
  const [triggerWeekly] = useLazyGetWeeklyReportQuery();

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/");
  };

  // Download handler (supports both csv & pdf)
  const handleDownloadReport = async (format) => {
    try {
      const res = await triggerWeekly({ format, weekOffset }).unwrap(); // blob
      if (res) {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-week.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(`Error downloading ${format} report:`, err);
    }
  };

  const allUsers = usersData?.data || usersData || [];
  const allTasks = tasksData || [];
  const allProjects = projectsData || [];

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.userId) return alert("Title and Assignee are required");
    try {
      await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        dueDate: newTask.dueDate || undefined,
        userId: newTask.userId,
        projectId: newTask.projectId || undefined,
        source: 'ADMIN',
      }).unwrap();
      setNewTask({ title: "", description: "", dueDate: "", userId: "", projectId: "" });
      await refetchTasks();
    } catch (err) {
      alert(err?.data?.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (taskId, status) => {
    try {
      await updateTaskStatus({ taskId, status }).unwrap();
      await refetchTasks();
    } catch (err) {
      alert(err?.data?.message || "Failed to update task");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name) return alert("Project name is required");
    try {
      await createProject({
        name: newProject.name,
        description: newProject.description || undefined,
        status: newProject.status || undefined,
      }).unwrap();
      setNewProject({ name: "", description: "", status: "ONGOING" });
      await refetchProjects();
    } catch (err) {
      alert(err?.data?.message || "Failed to create project");
    }
  };

  const handleUpdateProject = async (projectId, status) => {
    try {
      await updateProjectStatus({ projectId, status }).unwrap();
      await refetchProjects();
    } catch (err) {
      alert(err?.data?.message || "Failed to update project");
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: "overview", label: "Overview" },
          { key: "tasks", label: "Tasks" },
          { key: "projects", label: "Projects" },
          { key: "records", label: "Records" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              activeTab === t.key ? "bg-[rgba(0,0,0,0.04)]" : "bg-white hover:bg-[rgba(0,0,0,0.03)]"
            }`}
            style={{ borderColor: accentColor, color: activeTab === t.key ? accentColor : "inherit" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
      <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {insights?.summary?.totalEmployees ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {insights?.summary?.present ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {insights?.summary?.absent ?? "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Joiners Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {insights?.summary?.newJoinersToday ?? "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      

      {/* Insights Lists (top area) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>New Employees Today</CardTitle>
          </CardHeader>
          <CardContent>
            {(insights?.newEmployeesToday ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No new employees today.</div>
            ) : (
              <ul className="space-y-2">
                {insights.newEmployeesToday.map((u, idx) => (
                  <li key={`${u.id}-${idx}`} className="text-sm">
                    <span className="font-medium">{u.name}</span> — {u.email}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Present Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {(insights?.presentEmployees ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">None yet.</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto pr-2">
                {insights.presentEmployees.map((u, idx) => (
                  <li key={`${u.id}-${idx}`} className="text-sm">
                    <span className="font-medium">{u.name}</span> — {u.email}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Absent Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {(insights?.absentEmployees ?? []).length === 0 ? (
              <div className="text-sm text-muted-foreground">None 🎉</div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto pr-2">
                {insights.absentEmployees.map((u, idx) => (
                  <li key={`${u.id}-${idx}`} className="text-sm">
                    <span className="font-medium">{u.name}</span> — {u.email}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg mb-4">
        <CardHeader>
          <CardTitle>Late Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {(insights?.lateCheckIns ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No late check-ins today.</div>
          ) : (
            <ul className="space-y-2">
              {insights.lateCheckIns.map((p) => (
                <li key={`${p.id}-${new Date(p.checkIn).toISOString()}`} className="text-sm">
                  <span className="font-medium">{p.name}</span> — {p.email} — {new Date(p.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      </>
      )}

      {activeTab === "tasks" && (
      <Card className="shadow-lg mb-4">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
            <input className="border rounded-md px-2 py-2 md:col-span-2" placeholder="Title" value={newTask.title} onChange={(e)=>setNewTask(s=>({...s,title:e.target.value}))} />
            <input className="border rounded-md px-2 py-2 md:col-span-2" placeholder="Description" value={newTask.description} onChange={(e)=>setNewTask(s=>({...s,description:e.target.value}))} />
            <input className="border rounded-md px-2 py-2" type="date" value={newTask.dueDate} onChange={(e)=>setNewTask(s=>({...s,dueDate:e.target.value}))} />
            <select className="border rounded-md px-2 py-2" value={newTask.userId} onChange={(e)=>setNewTask(s=>({...s,userId:e.target.value}))}>
              <option value="">Assign to user…</option>
              {allUsers.map((u)=> (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
            <select className="border rounded-md px-2 py-2" value={newTask.projectId} onChange={(e)=>setNewTask(s=>({...s,projectId:e.target.value}))}>
              <option value="">No project</option>
              {allProjects.map((p)=> (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button type="submit" disabled={creatingTask} style={{ background: accentColor, color: "white" }}>Add Task</Button>
          </form>
          {(allTasks || []).length === 0 ? (
            <div className="text-gray-600">No tasks yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm text-gray-600">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Assignee</th>
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Due</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.map((t)=> (
                    <tr key={t.id} className="border-b border-gray-100 text-sm">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{t.title}</div>
                        {t.description ? (<div className="text-xs text-gray-500">{t.description}</div>) : null}
                      </td>
                      <td className="py-3 pr-4">{t.assignedTo?.name || t.assignedTo?.email || "—"}</td>
                      <td className="py-3 pr-4">{t.project?.name || "—"}</td>
                      <td className="py-3 pr-4">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                      <td className="py-3 pr-4">
                        <select className="border rounded-md px-2 py-1 text-sm" defaultValue={t.status} onChange={(e)=>handleUpdateTask(t.id, e.target.value)} disabled={updatingTask}>
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {activeTab === "projects" && (
      <Card className="shadow-lg mb-4">
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
            <input className="border rounded-md px-2 py-2 md:col-span-2" placeholder="Project name" value={newProject.name} onChange={(e)=>setNewProject(s=>({...s,name:e.target.value}))} />
            <input className="border rounded-md px-2 py-2 md:col-span-2" placeholder="Description" value={newProject.description} onChange={(e)=>setNewProject(s=>({...s,description:e.target.value}))} />
            <select className="border rounded-md px-2 py-2" value={newProject.status} onChange={(e)=>setNewProject(s=>({...s,status:e.target.value}))}>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ON_HOLD">ON_HOLD</option>
            </select>
            <Button type="submit" disabled={creatingProject} style={{ background: accentColor, color: "white" }}>Add Project</Button>
          </form>
          {(allProjects || []).length === 0 ? (
            <div className="text-gray-600">No projects yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allProjects.map((p)=> (
                <div key={p.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{p.name}</div>
                    <select className="border rounded-md px-2 py-1 text-sm" defaultValue={p.status} onChange={(e)=>handleUpdateProject(p.id, e.target.value)} disabled={updatingProject}>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ON_HOLD">ON_HOLD</option>
                    </select>
                  </div>
                  {p.description ? (<div className="text-sm text-gray-600 mt-1">{p.description}</div>) : null}
                  <div className="mt-3 text-xs text-gray-500">{p.tasks?.length || 0} task(s)</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {activeTab === "records" && (
      <>
      {/* Week Selector + Quick Actions (above records table) */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">Week:</span>
          <select
            className="border rounded-md px-2 py-1"
            value={weekOffset}
            onChange={(e) => setWeekOffset(Number(e.target.value))}
          >
            <option value={0}>This Week</option>
            <option value={-1}>Last Week</option>
            <option value={-2}>2 Weeks Ago</option>
            <option value={-3}>3 Weeks Ago</option>
            <option value={-4}>4 Weeks Ago</option>
          </select>
        </div>
        <Button
          style={{ background: accentColor, color: "white" }}
          onClick={() => handleDownloadReport("csv")}
        >
          <FileDown className="mr-2" size={16} />
          Download Weekly Report (CSV)
        </Button>
        <Button
          style={{ background: accentColor, color: "white" }}
          onClick={() => handleDownloadReport("pdf")}
        >
          <FileDown className="mr-2" size={16} />
          Download Weekly Report (PDF)
        </Button>
      </div>

      {/* Records Table (last section) */}
      <Card className="shadow-lg mb-4">
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
      </>
      )}
    </div>
  );
};

export default AdminDashboard;
