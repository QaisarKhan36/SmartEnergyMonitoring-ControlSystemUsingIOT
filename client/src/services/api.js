// src/services/api.js
// ─────────────────────────────────────────────────────────────────
//  Single source of truth for ALL backend communication.
//  Every page imports from here — never fetches directly.
//
//  AUTH:  JWT stored in localStorage under "se_token"
//  BASE:  http://localhost:5000/api  (change via VITE_API_URL in .env)
//  WS:    ws://localhost:5000        (change via VITE_WS_URL in .env)
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const WS_URL   = import.meta.env.VITE_WS_URL  || "ws://localhost:5000";

// ── Token helpers ─────────────────────────────────────────────────
export const getToken  = ()      => localStorage.getItem("se_token");
export const setToken  = (token) => localStorage.setItem("se_token", token);
export const clearToken = ()     => localStorage.removeItem("se_token");
export const isLoggedIn = ()     => !!getToken();

// ── Core fetch wrapper ────────────────────────────────────────────
// Returns parsed JSON on success, throws { message } on error.
const request = async (path, options = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
};

// Shorthand helpers
const get    = (path)        => request(path);
const post   = (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) });
const put    = (path, body)  => request(path, { method: "PUT",    body: JSON.stringify(body) });
const patch  = (path, body)  => request(path, { method: "PATCH",  body: JSON.stringify(body) });
const del    = (path)        => request(path, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════════
//  AUTH
// ══════════════════════════════════════════════════════════════════
export const auth = {
  /** POST /auth/login → stores token, returns { user } */
  login: async (email, password) => {
    const data = await post("/auth/login", { email, password });
    setToken(data.token);
    return data.user;
  },

  /** POST /auth/register */
  register: (name, email, password) =>
    post("/auth/register", { name, email, password }),

  /** GET /auth/me → returns { user } */
  me: () => get("/auth/me"),

  /** PUT /auth/profile */
  updateProfile: (updates) => put("/auth/profile", updates),

  /** PUT /auth/password */
  changePassword: (current, newPassword) =>
    put("/auth/password", { currentPassword: current, newPassword }),

  /** POST /auth/regenerate-key */
  regenerateApiKey: () => post("/auth/regenerate-key"),

  /** Clear token and reload */
  logout: () => {
    clearToken();
    window.location.href = "/";
  },
};

// ══════════════════════════════════════════════════════════════════
//  DEVICES
// ══════════════════════════════════════════════════════════════════
export const devices = {
  /** GET /devices → [device, ...] */
  list: () => get("/devices"),

  /** GET /devices/:id */
  get: (id) => get(`/devices/${id}`),

  /** POST /devices */
  create: (body) => post("/devices", body),

  /** PUT /devices/:id */
  update: (id, body) => put(`/devices/${id}`, body),

  /** DELETE /devices/:id */
  delete: (id) => del(`/devices/${id}`),

  /** PATCH /devices/:id/toggle  — flips device enabled state */
  toggle: (id) => patch(`/devices/${id}/toggle`),

  /** PATCH /devices/:id/relay/:relayId  — flips one relay */
  toggleRelay: (deviceId, relayId) =>
    patch(`/devices/${deviceId}/relay/${relayId}`),
};

// ══════════════════════════════════════════════════════════════════
//  ALERTS
// ══════════════════════════════════════════════════════════════════
export const alerts = {
  /** GET /alerts */
  list: () => get("/alerts"),

  /** DELETE /alerts/:id — dismiss one */
  dismiss: (id) => del(`/alerts/${id}`),

  /** DELETE /alerts — clear all */
  clearAll: () => del("/alerts"),

  // ── Rules ──
  /** GET /alerts/rules */
  listRules: () => get("/alerts/rules"),

  /** POST /alerts/rules */
  createRule: (body) => post("/alerts/rules", body),

  /** PUT /alerts/rules/:id */
  updateRule: (id, body) => put(`/alerts/rules/${id}`, body),

  /** DELETE /alerts/rules/:id */
  deleteRule: (id) => del(`/alerts/rules/${id}`),

  // ── Threshold ──
  /** GET /alerts/threshold */
  getThreshold: () => get("/alerts/threshold"),

  /** PUT /alerts/threshold */
  setThreshold: (value) => put("/alerts/threshold", { threshold: value }),
};

// ══════════════════════════════════════════════════════════════════
//  SCHEDULES
// ══════════════════════════════════════════════════════════════════
export const schedules = {
  /** GET /schedules */
  list: () => get("/schedules"),

  /** POST /schedules */
  create: (body) => post("/schedules", body),

  /** PUT /schedules/:id */
  update: (id, body) => put(`/schedules/${id}`, body),

  /** DELETE /schedules/:id */
  delete: (id) => del(`/schedules/${id}`),

  /** PATCH /schedules/:id/toggle */
  toggle: (id) => patch(`/schedules/${id}/toggle`),
};

// ══════════════════════════════════════════════════════════════════
//  READINGS
// ══════════════════════════════════════════════════════════════════
export const readings = {
  /** GET /readings/latest?deviceId= */
  latest: (deviceId) =>
    get(`/readings/latest${deviceId ? `?deviceId=${deviceId}` : ""}`),

  /** GET /readings/history?deviceId=&limit=&from=&to= */
  history: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/readings/history${q ? `?${q}` : ""}`);
  },

  /** GET /readings/summary */
  summary: () => get("/readings/summary"),
};

// ══════════════════════════════════════════════════════════════════
//  ANALYTICS
// ══════════════════════════════════════════════════════════════════
export const analytics = {
  weekly:     () => get("/analytics/weekly"),
  monthly:    () => get("/analytics/monthly"),
  hourly:     () => get("/analytics/hourly"),
  breakdown:  () => get("/analytics/breakdown"),
  comparison: () => get("/analytics/comparison"),
  cost:       () => get("/analytics/cost"),
  breaches:   () => get("/analytics/threshold-breaches"),

  /** GET /analytics/export?type=daily|device|alerts|monthly&from=&to= */
  export: (type, from, to) => {
    const q = new URLSearchParams({ type, ...(from ? { from } : {}), ...(to ? { to } : {}) });
    return get(`/analytics/export?${q}`);
  },
};

// ══════════════════════════════════════════════════════════════════
//  HISTORY
// ══════════════════════════════════════════════════════════════════
export const history = {
  /** GET /history?page=&limit=&type=&deviceId=&search= */
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/history${q ? `?${q}` : ""}`);
  },

  /** POST /history */
  create: (body) => post("/history", body),

  /** DELETE /history */
  clearAll: () => del("/history"),
};

// ══════════════════════════════════════════════════════════════════
//  WEBSOCKET — live VMC feed
// ══════════════════════════════════════════════════════════════════
/**
 * Connect to the VMC WebSocket stream.
 *
 * Usage:
 *   const ws = connectWS({
 *     onReading: (data) => { ... },   // fires on every 2s reading
 *     onRelay:   (data) => { ... },   // fires when a relay is toggled by a schedule
 *     onAlert:   (data) => { ... },   // fires when VMC creates an alert
 *   });
 *   // later: ws.close();
 *
 * The returned object is the raw WebSocket — store it in a ref and
 * call .close() in the useEffect cleanup to avoid memory leaks.
 */
export const connectWS = ({ onReading, onRelay, onAlert, onConnected } = {}) => {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("[WS] Connected to SmartEnergy VMC");
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "connected":
          onConnected?.(msg);
          break;
        case "reading":
          onReading?.(msg.data);
          break;
        case "relay":
          onRelay?.(msg);
          break;
        case "alert":
          onAlert?.(msg);
          break;
        default:
          break;
      }
    } catch (e) {
      console.warn("[WS] Bad message:", e.message);
    }
  };

  ws.onerror = (e) => console.error("[WS] Error:", e);
  ws.onclose = () => console.log("[WS] Disconnected");

  return ws;
};