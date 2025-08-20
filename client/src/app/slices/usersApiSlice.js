import { USERS_URL } from "../../constants/constants.js";
import { apiSlice } from "./apiSlice.js";
const PASSWORD_URL = "/api/password-reset";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Authentication endpoints
    
    // Register
    register: builder.mutation({
      query: (userData) => {
        console.log('RTK Query - Register mutation called with:', userData);
        console.log('RTK Query - Making request to:', `${USERS_URL}/register`);
        console.log('RTK Query - Full URL will be:', `${USERS_URL}/register`);
        return {
          url: `${USERS_URL}/register`,
          method: "POST",
          body: userData, // { name, email, password, confirmPassword, role? }
        };
      },
      invalidatesTags: ['User'],
    }),

    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: credentials, // { email, password }
      }),
      invalidatesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ['User'],
    }),

    // Get current user (me)
    getMe: builder.query({
      query: () => ({
        url: `${USERS_URL}/me`,
        method: "GET",
      }),
      providesTags: ['User'],
    }),

    // User management endpoints (Admin only)
    
    // Get all users
    getAllUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // Promote user to admin
    promoteToAdmin: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/promote`,
        method: "PUT", // or PATCH if you prefer
        body: { userId },
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Demote admin to employee
    demoteToEmployee: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/demote`,
        method: "PUT", // or PATCH if you prefer
        body: { userId },
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
      requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: `${PASSWORD_URL}/request-reset`,
        method: "POST",
        body: { email },
      }),
    }),

    // ✅ Reset password (submit OTP + new password)
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: `${PASSWORD_URL}/reset-password`,
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Authentication hooks
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  
  // User management hooks
  useGetAllUsersQuery,
  usePromoteToAdminMutation,
  useDemoteToEmployeeMutation,
  
  //password reset hooks
   useRequestPasswordResetMutation,
   useResetPasswordMutation,
} = usersApiSlice;