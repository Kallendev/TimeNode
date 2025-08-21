import { USERS_URL } from "../../constants/constants.js";
import { apiSlice } from "./apiSlice.js";

const PASSWORD_URL = "/api/password-reset";
const ATTENDANCE_URL = "/api/attendance";

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
} = usersApiSlice;
