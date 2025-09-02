import { USERS_URL } from "../../constants/constants.js";
import { apiSlice } from "./apiSlice.js";

const PASSWORD_URL = "/api/password-reset";
const ATTENDANCE_URL = "/api/attendance";
const TASKS_URL = "/api/tasks";
const PROJECTS_URL = "/api/projects";


export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // =========================
    // 🔐 Authentication
    // =========================
    register: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    getMe: builder.query({
      query: () => ({
        url: `${USERS_URL}/me`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // =========================
    // 👥 User Management (Admin only)
    // =========================
    getAllUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "User", id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    promoteToAdmin: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/promote`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["User"],
    }),

    demoteToEmployee: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/demote`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["User"],
    }),

    // =========================
    // 🔑 Password Reset
    // =========================
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: `${PASSWORD_URL}/request-reset`,
        method: "POST",
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: `${PASSWORD_URL}/reset-password`,
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),

    // =========================
    // 🕒 Attendance
    // =========================
    getMyToday: builder.query({
      query: () => ({
        url: `${ATTENDANCE_URL}/today`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    getMyHistory: builder.query({
      query: () => ({
        url: `${ATTENDANCE_URL}/history`,
        method: "GET",
      }),
      providesTags: ["Attendance"],
    }),

    checkIn: builder.mutation({
      query: () => ({
        url: `${ATTENDANCE_URL}/checkin`,
        method: "POST",
      }),
      invalidatesTags: ["Attendance"],
    }),

    checkOut: builder.mutation({
      query: () => ({
        url: `${ATTENDANCE_URL}/checkout`,
        method: "POST",
      }),
      invalidatesTags: ["Attendance"],
    }),
    
    // =========================
    // ✅ Tasks
    // =========================
    getAllTasks: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return {
          url: `${TASKS_URL}${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Task"],
    }),
    getMyTasks: builder.query({
      query: (userId) => ({
        url: `${TASKS_URL}/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),
    updateMyTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `${TASKS_URL}/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Task"],
    }),

    // =========================
    // 🧩 Projects
    // =========================
    getAllProjects: builder.query({
      query: () => ({
        url: `${PROJECTS_URL}`,
        method: "GET",
      }),
      providesTags: ["Project"],
    }),
    getMyProjects: builder.query({
      query: (userId) => ({
        url: `${PROJECTS_URL}/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["Project"],
    }),
    createProject: builder.mutation({
      query: ({ name, description, status }) => ({
        url: `${PROJECTS_URL}`,
        method: "POST",
        body: { name, description, status },
      }),
      invalidatesTags: ["Project"],
    }),
    updateProjectStatus: builder.mutation({
      query: ({ projectId, status }) => ({
        url: `${PROJECTS_URL}/${projectId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Project"],
    }),

    createTask: builder.mutation({
      query: ({ title, description, dueDate, userId, projectId, source }) => ({
        url: `${TASKS_URL}`,
        method: "POST",
        body: { title, description, dueDate, userId, projectId, source },
      }),
      invalidatesTags: ["Task"],
    }),
    // --- ADMIN ENDPOINTS ---
      getAllRecords: builder.query({
        query: ({ weekOffset = 0 } = {}) => ({
          url: `${ATTENDANCE_URL}/admin/records?weekOffset=${weekOffset}`,
          method: "GET",
        }),
        providesTags: ["Records"],
      }),

      getWeeklyReport: builder.query({
          query: ({ format = "csv", weekOffset = 0 } = {}) => ({
            url: `${ATTENDANCE_URL}/admin/report/weekly?format=${format}&weekOffset=${weekOffset}`,
            method: "GET",
            // Force network fetch
            cache: "no-store",
            responseHandler: async (response) => {
              // Convert response into Blob
              const blob = await response.blob();
              return blob;
            },
          }),
          // Don't try to parse JSON, just return Blob directly
          transformResponse: (response) => response,
        }),

      // Today's insights for admin dashboard
      getAdminTodayInsights: builder.query({
        query: (weekOffset = 0) => ({
          url: `${ATTENDANCE_URL}/admin/insights/today?weekOffset=${weekOffset}`,
          method: "GET",
        }),
        providesTags: ["Attendance"],
      }),



          }),
});

// =========================
// ✅ Export hooks
// =========================
export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,

  // User management
  useGetAllUsersQuery,
  usePromoteToAdminMutation,
  useDemoteToEmployeeMutation,

  // Password reset
  useRequestPasswordResetMutation,
  useResetPasswordMutation,

  // Attendance
  useGetMyTodayQuery,
  useGetMyHistoryQuery,
  useCheckInMutation,
  useCheckOutMutation,
  // Admin
  useGetAllRecordsQuery,
  useGetWeeklyReportQuery,
  useLazyGetWeeklyReportQuery,
  useGetAdminTodayInsightsQuery,
  // Tasks
  useGetMyTasksQuery,
  useUpdateMyTaskStatusMutation,
  // Projects
  useGetMyProjectsQuery,
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectStatusMutation,
  // Create Task
  useCreateTaskMutation,
  // Admin Tasks
  useGetAllTasksQuery,
  
} = usersApiSlice;
