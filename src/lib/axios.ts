import axios from "axios";

import { appConfig } from "@/lib/config/app";

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const responseData = error.response?.data;
    const message =
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
      typeof responseData.message === "string"
        ? responseData.message
        : error.message || "Request failed.";

    const normalizedError = Object.assign(new Error(message), {
      cause: error,
      statusCode: error.response?.status,
    });

    return Promise.reject(normalizedError);
  },
);

export default api;
