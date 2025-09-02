import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/constants";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Grab token from auth slice (where you store userInfo after login)
    const token = getState().auth?.userInfo?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Attendance", "Records"],
  endpoints: (builder) => ({}),
  refetchOnFocus: true,
  refetchOnReconnect: true,
});
