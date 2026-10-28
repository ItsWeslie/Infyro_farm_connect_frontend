// Centralized API client for IFC Backend Spring Boot Services.
// Set VITE_API_BASE_URL in the environment; omit the trailing slash.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const isAuthEndpoint = endpoint.startsWith("/ifc/v1/auth/");
  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      // The backend stores the JWT in an HttpOnly access_token cookie.
      credentials: "include",
    });
  } catch (cause) {
    const error = new Error(
      BASE_URL
        ? "Unable to reach the IFC backend. Check the API URL and backend availability."
        : "No API URL is configured. Set VITE_API_BASE_URL in your .env file.",
    );
    error.cause = cause;
    throw error;
  }

  if (response.status === 401 && !isAuthEndpoint) {
    window.dispatchEvent(new CustomEvent("ifc_auth_expired"));
  }

  const contentType = response.headers.get("content-type") || "";
  let data = null;
  if (response.status !== 204) {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const bodyText = await response.text();
      data = bodyText ? { message: bodyText } : null;
    }
  }

  if (!response.ok) {
    const details = data?.message || data?.error || data?.detail;
    const validationMessage = Array.isArray(data?.errors)
      ? data.errors.map((item) => item.defaultMessage || item.message || item).join(", ")
      : null;
    const error = new Error(validationMessage || details || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// Auth API (/ifc/v1/auth)
export const authApi = {
  login: (credentials) => apiRequest("/ifc/v1/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  signup: (payload) => apiRequest("/ifc/v1/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  validate: () => apiRequest("/ifc/v1/auth/validate", { method: "GET" }),
  logout: () => apiRequest("/ifc/v1/auth/logout", { method: "POST" }),
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

// Expense API (/api/farms/{farmId}/expenses)
export const expenseApi = {
  create: (farmId, data) => apiRequest(`/api/farms/${farmId}/expenses`, { method: "POST", body: JSON.stringify(data) }),
  getByFarm: (farmId) => apiRequest(`/api/farms/${farmId}/expenses`, { method: "GET" }),
  getById: (farmId, id) => apiRequest(`/api/farms/${farmId}/expenses/${id}`, { method: "GET" }),
  void: (farmId, id) => apiRequest(`/api/farms/${farmId}/expenses/${id}`, { method: "DELETE" }),
};

// Harvest Record API (/api/crop-plantings/{plantingId}/harvest-records)
export const harvestApi = {
  create: (plantingId, data) => apiRequest(`/api/crop-plantings/${plantingId}/harvest-records`, { method: "POST", body: JSON.stringify(data) }),
  getByPlanting: (plantingId) => apiRequest(`/api/crop-plantings/${plantingId}/harvest-records`, { method: "GET" }),
  getById: (plantingId, id) => apiRequest(`/api/crop-plantings/${plantingId}/harvest-records/${id}`, { method: "GET" }),
  void: (plantingId, id) => apiRequest(`/api/crop-plantings/${plantingId}/harvest-records/${id}`, { method: "DELETE" }),
};

// Farm Summary APIs (/api/farms/{farmId})
export const farmSummaryApi = {
  getSummary: (farmId) => apiRequest(`/api/farms/${farmId}/summary`, { method: "GET" }),
  getExpensesSummary: (farmId, from, to) => apiRequest(`/api/farms/${farmId}/expenses/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
  getHarvestsSummary: (farmId, from, to) => apiRequest(`/api/farms/${farmId}/harvests/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
  getPlantingsSummary: (farmId) => apiRequest(`/api/farms/${farmId}/plantings/summary`, { method: "GET" }),
};

// Calendar API (/api/calendar)
export const calendarApi = {
  getEvents: (from, to) => apiRequest(`/api/calendar/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { method: "GET" }),
};

// Notifications API (/api/notifications)
export const notificationApi = {
  getAll: (unreadOnly = false, page = 0, size = 20) => apiRequest(`/api/notifications?unreadOnly=${unreadOnly}&page=${page}&size=${size}`, { method: "GET" }),
  getUnreadCount: () => apiRequest("/api/notifications/unread-count", { method: "GET" }),
  markRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }),
};
