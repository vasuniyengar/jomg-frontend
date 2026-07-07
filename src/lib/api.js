import axios from "axios";
import { clearAuthSession } from "./auth";

function stripEnvUrl(value) {
  if (!value) return value;
  return String(value).trim().replace(/^["']|["']$/g, "");
}

const API_BASE_URL =
  stripEnvUrl(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://127.0.0.1:4000";

function resolveToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    localStorage.getItem("jomg_access_token") ||
    sessionStorage.getItem("jomg_access_token")
  );
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = resolveToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isSignInRequest =
      requestUrl.includes("/organizer/signin") ||
      requestUrl.includes("/admin/signin");

    if (
      status === 401 &&
      !isSignInRequest &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/admin/login")
    ) {
      clearAuthSession();
      setTimeout(() => {
        window.location.replace("/admin/login");
      }, 0);
    }

    const method = (error?.config?.method || "GET").toUpperCase();
    const requestPath = error?.config?.url || requestUrl;
    const responseData = error?.response?.data;
    const apiMessage =
      responseData && typeof responseData === "object"
        ? responseData.message
        : undefined;
    const htmlNotFound =
      typeof responseData === "string" &&
      /<html/i.test(responseData) &&
      (responseData.includes("Cannot POST") ||
        responseData.includes("Cannot PATCH") ||
        responseData.includes("Cannot GET"));
    const message = apiMessage
      ? apiMessage
      : htmlNotFound
        ? `API route not found for ${method} ${requestPath}. Restart the backend server.`
        : error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : error.code === "ERR_NETWORK"
            ? `Network error calling ${method} ${API_BASE_URL}${requestPath}. Check that the backend is running at ${API_BASE_URL} and matches NEXT_PUBLIC_API_BASE_URL.`
            : error.message || "Something went wrong. Please try again.";
    const normalizedError = new Error(message);
    normalizedError.status =
      error?.response?.status ??
      (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" ? 0 : 500);
    normalizedError.code = error.code;
    normalizedError.payload = error?.response?.data || null;
    return Promise.reject(normalizedError);
  }
);

export async function apiRequest(path, options = {}) {
  let requestData = options.body;
  if (typeof options.body === "string") {
    try {
      requestData = JSON.parse(options.body);
    } catch {
      requestData = options.body;
    }
  }

  const response = await apiClient.request({
    url: path,
    method: options.method || "GET",
    data: requestData,
    headers: options.headers,
  });

  if (response?.data?.error) {
    const err = new Error(response.data.message || "Request failed");
    err.status = response.status;
    err.payload = response.data;
    throw err;
  }

  return response.data;
}

export function organizerLogout() {
  return apiRequest("/api/organizer/logout", { method: "POST" });
}

export function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return apiRequest("/api/users/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword, confirmPassword },
  });
}

export { API_BASE_URL, apiClient };
