import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

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
    const message =
      error?.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Request timed out. Please try again."
        : "Something went wrong. Please try again.");
    const normalizedError = new Error(message);
    normalizedError.status = error?.response?.status || 500;
    normalizedError.payload = error?.response?.data || null;
    return Promise.reject(normalizedError);
  }
);

export async function apiRequest(path, options = {}) {
  const apiStart = Date.now();
  const method = options.method || "GET";
  // #region agent log
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H2-H5",
        location: "api.js:apiRequest:start",
        message: "API request start",
        data: { path, method },
        timestamp: apiStart,
      }),
    }).catch(() => {});
  }
  // #endregion
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

  // #region agent log
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:7896/ingest/3c01d13f-ed86-4d8b-94d5-44668d28043d", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "4a201a" },
      body: JSON.stringify({
        sessionId: "4a201a",
        runId: "pre-fix",
        hypothesisId: "H2-H5",
        location: "api.js:apiRequest:done",
        message: "API request done",
        data: { path, method, durationMs: Date.now() - apiStart, status: response.status },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  return response.data;
}

export function organizerLogout() {
  return apiRequest("/api/organizer/logout", { method: "POST" });
}

export { API_BASE_URL, apiClient };
