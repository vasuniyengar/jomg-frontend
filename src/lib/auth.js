const ACCESS_TOKEN_KEY = "jomg_access_token";
const USER_KEY = "jomg_user";

export function saveAuthSession({ accessToken, user, rememberMe }) {
  if (typeof window === "undefined") {
    return;
  }
  const storage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem(ACCESS_TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(USER_KEY, JSON.stringify(user));

  // Keep token readable from the shared api layer.
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }
  const fromLocal = localStorage.getItem(USER_KEY);
  const fromSession = sessionStorage.getItem(USER_KEY);
  const raw = fromLocal || fromSession;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserDisplayName(user) {
  if (!user) return "";
  const full = [user.firstname, user.lastname].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.email) return String(user.email);
  return "";
}

export function updateStoredUser(patch) {
  if (typeof window === "undefined") {
    return null;
  }
  const current = getStoredUser() || {};
  const next = { ...current, ...patch };
  const raw = JSON.stringify(next);
  localStorage.setItem(USER_KEY, raw);
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY)) {
    sessionStorage.setItem(USER_KEY, raw);
  }
  return next;
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }
  const token =
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return Boolean(token);
}
