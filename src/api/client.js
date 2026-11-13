// Centralized API client for IFC Backend Spring Boot Services.
// Set VITE_API_BASE_URL in the environment; omit the trailing slash.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AUTH_BASE = "/ifc/v1/auth";
let accessToken = null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = typeof token === "string" && token.trim() ? token : null;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return entry.slice(prefix.length);
  }
}

function csrfHeaders(headers = {}) {
  const token = readCookie("XSRF-TOKEN");
  return token ? { ...headers, "X-XSRF-TOKEN": token } : headers;
}

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  const bodyText = await response.text();
  return bodyText ? { message: bodyText } : null;
}

function createApiError(response, data) {
  const fieldErrors = Array.isArray(data?.fieldErrors)
    ? data.fieldErrors.map((item) => item.message || item.defaultMessage || item.field).filter(Boolean)
    : [];
  const legacyErrors = Array.isArray(data?.errors)
    ? data.errors.map((item) => item.defaultMessage || item.message || item).filter(Boolean)
    : [];
  const details = data?.message || data?.error || data?.detail;
  const error = new Error(
    [...fieldErrors, ...legacyErrors].join(", ") ||
    details ||
    `Request failed (${response.status})`,
  );
  error.status = response.status;
  error.code = data?.code;
  error.data = data;
  return error;
}

function isPublicAuthEndpoint(endpoint) {
  return [
    `${AUTH_BASE}/login`,
    `${AUTH_BASE}/signup`,
    `${AUTH_BASE}/refresh`,
    `${AUTH_BASE}/logout`,
  ].includes(endpoint);
}

async function send(endpoint, options = {}, { withAuth = true } = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(withAuth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await parseResponse(response);
  if (!response.ok) throw createApiError(response, data);
  return data;
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const headers = csrfHeaders({ Accept: "application/json" });
      const response = await fetch(`${BASE_URL}${AUTH_BASE}/refresh`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      const data = await parseResponse(response);
      if (!response.ok) {
        clearAccessToken();
        throw createApiError(response, data);
      }
      if (!data?.accessToken) {
        clearAccessToken();
        throw new Error("The refresh response did not include an access token.");
      }
      setAccessToken(data.accessToken);
      return data;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest(endpoint, options = {}) {
  const publicAuthEndpoint = isPublicAuthEndpoint(endpoint);
  const csrfRequired = options.method === "POST" &&
    (endpoint === `${AUTH_BASE}/logout` || endpoint === `${AUTH_BASE}/refresh`);
  const requestOptions = csrfRequired
    ? { ...options, headers: csrfHeaders(options.headers) }
    : options;

  try {
    return await send(endpoint, requestOptions, { withAuth: !publicAuthEndpoint });
  } catch (error) {
    // A protected request gets one refresh attempt and one retry. Never recurse
    // on auth endpoints or retry a second time if the new access token is rejected.
    if (error.status !== 401 || publicAuthEndpoint || options.__retried) {
      if (error.status === 401 && !publicAuthEndpoint) {
        clearAccessToken();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ifc_auth_expired"));
        }
      }
      throw error;
    }

    try {
      await refreshAccessToken();
      return await send(endpoint, { ...requestOptions, __retried: true }, { withAuth: true });
    } catch (refreshError) {
      clearAccessToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ifc_auth_expired"));
      }
      throw refreshError.status ? refreshError : error;
    }
  }
}

// Auth API (/ifc/v1/auth)
export const authApi = {
  login: async (credentials) => {
    const response = await apiRequest(`${AUTH_BASE}/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    setAccessToken(response?.accessToken);
    return response;
  },
  signup: (payload) => apiRequest(`${AUTH_BASE}/signup`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  validate: () => apiRequest(`${AUTH_BASE}/validate`, { method: "GET" }),
  refresh: refreshAccessToken,
  logout: async () => {
    try {
      return await apiRequest(`${AUTH_BASE}/logout`, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },
  logoutAll: async () => {
    try {
      return await apiRequest(`${AUTH_BASE}/logout-all`, { method: "POST" });
    } finally {
      clearAccessToken();
    }
  },
};

// Farm API (/ifc/v1/farm)
export const farmApi = {
  create: (data) => apiRequest("/ifc/v1/farm/create", { method: "POST", body: JSON.stringify(data) }),
  getOwnedFarms: () => apiRequest("/ifc/v1/farm/owned-farms", { method: "GET" }),
  getById: (id) => apiRequest(`/ifc/v1/farm/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/ifc/v1/farm/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/ifc/v1/farm/${id}`, { method: "DELETE" }),
};

// Field API (/ifc/v1/field)
export const fieldApi = {
  create: (farmId, data) => apiRequest(`/ifc/v1/field/${farmId}/fields`, { method: "POST", body: JSON.stringify(data) }),
  getByFarm: (farmId) => apiRequest(`/ifc/v1/field/farm/${farmId}`, { method: "GET" }),
  getById: (fieldId) => apiRequest(`/ifc/v1/field/${fieldId}`, { method: "GET" }),
  update: (fieldId, data) => apiRequest(`/ifc/v1/field/${fieldId}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (fieldId) => apiRequest(`/ifc/v1/field/${fieldId}`, { method: "DELETE" }),
};

// Crop Types API (/ifc/v1/crop-types)
export const cropTypeApi = {
  create: (farmId, data) => apiRequest(`/ifc/v1/crop-types/${farmId}`, { method: "POST", body: JSON.stringify(data) }),
  getAll: (farmId) => apiRequest(`/ifc/v1/crop-types/${farmId}`, { method: "GET" }),
  getById: (farmId, id) => apiRequest(`/ifc/v1/crop-types/${farmId}/${id}`, { method: "GET" }),
  update: (farmId, id, data) => apiRequest(`/ifc/v1/crop-types/${farmId}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (farmId, id) => apiRequest(`/ifc/v1/crop-types/${farmId}/${id}`, { method: "DELETE" }),
};

// Crop Planting API (/ifc/v1/crop-plantings)
export const cropPlantingApi = {
  create: (fieldId, data) => apiRequest(`/ifc/v1/crop-plantings/fields/${fieldId}`, { method: "POST", body: JSON.stringify(data) }),
  getAll: () => apiRequest("/ifc/v1/crop-plantings", { method: "GET" }),
  getByField: (fieldId) => apiRequest(`/ifc/v1/crop-plantings/fields/${fieldId}`, { method: "GET" }),
  getById: (id) => apiRequest(`/ifc/v1/crop-plantings/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/ifc/v1/crop-plantings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiRequest(`/ifc/v1/crop-plantings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id) => apiRequest(`/ifc/v1/crop-plantings/${id}`, { method: "DELETE" }),
};

// Crop Activity API (/ifc/v1/crop-activities)
export const cropActivityApi = {
  create: (data) => apiRequest("/ifc/v1/crop-activities", { method: "POST", body: JSON.stringify(data) }),
  getByPlanting: (plantingId) => apiRequest(`/ifc/v1/crop-activities/planting/${plantingId}`, { method: "GET" }),
  getById: (id) => apiRequest(`/ifc/v1/crop-activities/${id}`, { method: "GET" }),
  update: (id, data) => apiRequest(`/ifc/v1/crop-activities/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiRequest(`/ifc/v1/crop-activities/${id}/status?status=${encodeURIComponent(status)}`, { method: "PATCH" }),
  delete: (id) => apiRequest(`/ifc/v1/crop-activities/${id}`, { method: "DELETE" }),
};

// Expense API (/ifc/v1/farms/{farmId}/expenses)
export const expenseApi = {
  create: (farmId, data) => apiRequest(`/ifc/v1/farms/${farmId}/expenses`, { method: "POST", body: JSON.stringify(data) }),
  getByFarm: (farmId) => apiRequest(`/ifc/v1/farms/${farmId}/expenses`, { method: "GET" }),
  getById: (farmId, id) => apiRequest(`/ifc/v1/farms/${farmId}/expenses/${id}`, { method: "GET" }),
  void: (farmId, id) => apiRequest(`/ifc/v1/farms/${farmId}/expenses/${id}`, { method: "DELETE" }),
};

// Harvest Record API (/ifc/v1/crop-plantings/{plantingId}/harvest-records)
export const harvestApi = {
  create: (plantingId, data) => apiRequest(`/ifc/v1/crop-plantings/${plantingId}/harvest-records`, { method: "POST", body: JSON.stringify(data) }),
  getByPlanting: (plantingId) => apiRequest(`/ifc/v1/crop-plantings/${plantingId}/harvest-records`, { method: "GET" }),
  getById: (plantingId, id) => apiRequest(`/ifc/v1/crop-plantings/${plantingId}/harvest-records/${id}`, { method: "GET" }),
  void: (plantingId, id) => apiRequest(`/ifc/v1/crop-plantings/${plantingId}/harvest-records/${id}`, { method: "DELETE" }),
};

// Farm Summary APIs (/ifc/v1/farms/{farmId})
export const farmSummaryApi = {
  getSummary: (farmId) => apiRequest(`/ifc/v1/farms/${farmId}/summary`, { method: "GET" }),
  getExpensesSummary: (farmId, from, to) => apiRequest(`/ifc/v1/farms/${farmId}/expenses/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
  getHarvestsSummary: (farmId, from, to) => apiRequest(`/ifc/v1/farms/${farmId}/harvests/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
  getPlantingsSummary: (farmId) => apiRequest(`/ifc/v1/farms/${farmId}/plantings/summary`, { method: "GET" }),
};

// Calendar API (/ifc/v1/calendar)
export const calendarApi = {
  getEvents: (from, to) => apiRequest(`/ifc/v1/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
};

// Notifications API (/api/notifications)
export const notificationApi = {
  getAll: (unreadOnly = false, page = 0, size = 20) => apiRequest(`/api/notifications?unreadOnly=${unreadOnly}&page=${page}&size=${size}`, { method: "GET" }),
  getUnreadCount: () => apiRequest("/api/notifications/unread-count", { method: "GET" }),
  markRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }),
};
