// src/context/DashboardContext.jsx
// ─────────────────────────────────────────────────────────────────
//  UPDATED FOR BACKEND INTEGRATION (Step 4)
//
//  Changes from the original:
//  • Loads devices, alerts, schedules, threshold from API on mount
//  • toggleDevice / toggleRelay / addSchedule etc. now call the API
//    AND update local state (optimistic updates for instant UI feel)
//  • Adds currentUser state (populated from GET /auth/me)
//  • Adds a loading / error state for the initial data fetch
//  • WebSocket connection lives here so all pages share one socket
//
//  Backward-compatible: all context values are the same as before,
//  so NO page-level code needs to change just to get basic data loading.
// ─────────────────────────────────────────────────────────────────

import React, { createContext, useState, useCallback, useEffect, useRef } from "react";
import { auth, devices as devApi, alerts as alertApi, schedules as schedApi, connectWS } from "../services/api";

const DashboardContext = createContext(null);
export default DashboardContext;

export const DashboardProvider = ({ children }) => {

  // ── Loading / error ───────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  // ── Current user ──────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);

  // ── Alerts ────────────────────────────────────────────────────
  const [alerts,        setAlerts]        = useState([]);
  const [threshold,     setThreshold]     = useState(2000);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // ── Devices ───────────────────────────────────────────────────
  const [devices, setDevices] = useState([]);

  // ── Schedules ─────────────────────────────────────────────────
  const [schedules, setSchedules] = useState([]);

  // ── UI state (unchanged from original) ───────────────────────
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [toasts,      setToasts]      = useState([]);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [modal,       setModal]       = useState(null);
  const [chartTab,    setChartTab]    = useState("Daily");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [budget,      setBudget]      = useState(90);
  const [appSettings, setAppSettings] = useState({
    dataInterval: 1, autoRefresh: true, logRetention: 30,
    unitSystem: "metric", currency: "USD", dateFormat: "DD/MM/YYYY", animations: true,
  });

  // ── WebSocket ref ─────────────────────────────────────────────
  const wsRef = useRef(null);

  // ─────────────────────────────────────────────────────────────
  // TOAST
  // ─────────────────────────────────────────────────────────────
  const addToast = useCallback((msg, variant = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // INITIAL LOAD — fetch everything from backend on mount
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        // Run all fetches in parallel for speed
        const [userRes, devRes, alertRes, schedRes, threshRes] = await Promise.all([
          auth.me(),
          devApi.list(),
          alertApi.list(),
          schedApi.list(),
          alertApi.getThreshold(),
        ]);

        setCurrentUser(userRes.user || userRes);

        // Map backend shape → frontend shape
        // Backend Device has deviceId, frontend used id — we keep both
        setDevices((devRes.data || []).map(d => ({
          ...d,
          id: d.deviceId,          // frontend legacy field
          colorClass: "orange-bg", // cosmetic only
        })));

        setAlerts(alertRes.data || []);
        setSchedules((schedRes.data || []).map(s => ({
          ...s,
          id: s._id,               // frontend used numeric id, backend uses _id
          device: s.deviceId,      // frontend used "device", backend uses "deviceId"
        })));

        const t = threshRes.threshold ?? threshRes.data?.threshold ?? 2000;
        setThreshold(t);

        // Sync budget from user profile if available
        const user = userRes.user || userRes;
        if (user?.monthlyBudget) setBudget(user.monthlyBudget);
        if (user?.alertsEnabled !== undefined) setAlertsEnabled(user.alertsEnabled);

      } catch (err) {
        console.error("[DashboardContext] Init failed:", err.message);
        setInitError(err.message);
        // Keep the app usable — pages show empty states
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // WEBSOCKET — connect once, share across all pages
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const ws = connectWS({
      onReading: (data) => {
        // Update the matching device's latestReading snapshot in state
        setDevices(ds => ds.map(d =>
          d.deviceId === data.deviceId
            ? { ...d, latestReading: data, online: true }
            : d
        ));
      },
      onRelay: (msg) => {
        // Schedule-triggered relay change — sync state
        setDevices(ds => ds.map(d => {
          if (d.deviceId !== msg.deviceId) return d;
          return {
            ...d,
            relays: d.relays.map(r =>
              r.relayId === msg.relayId ? { ...r, on: msg.on } : r
            ),
          };
        }));
        addToast(`${msg.schedule || "Schedule"} toggled relay ${msg.relayId} ${msg.on ? "ON" : "OFF"}`, "info");
      },
      onAlert: (msg) => {
        // VMC fired a new alert — add to alert list
        addAlert(msg.msg, "warning");
      },
    });

    wsRef.current = ws;
    return () => ws.close();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────
  // ALERT ACTIONS
  // ─────────────────────────────────────────────────────────────
  const addAlert = useCallback((msg, type = "warning") => {
    const time = new Date().toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
    setAlerts(prev => [{ id: Date.now(), msg, type, time }, ...prev]);
  }, []);

  const dismissAlert = useCallback(async (id) => {
    try {
      await alertApi.dismiss(id);
    } catch (_) { /* optimistic — still remove from UI */ }
    setAlerts(a => a.filter(x => (x._id || x.id) !== id));
  }, []);

  const clearAlerts = useCallback(async () => {
    try {
      await alertApi.clearAll();
    } catch (_) {}
    setAlerts([]);
    addToast("All alerts cleared", "success");
  }, [addToast]);

  const updateThreshold = useCallback(async (val) => {
    try {
      await alertApi.setThreshold(val);
      setThreshold(val);
      addToast(`Threshold updated to ${val.toLocaleString()} W`, "success");
    } catch (err) {
      addToast("Failed to save threshold", "error");
    }
  }, [addToast]);

  // ─────────────────────────────────────────────────────────────
  // DEVICE ACTIONS
  // ─────────────────────────────────────────────────────────────
  const toggleDevice = useCallback(async (deviceId) => {
    // Optimistic update first — instant UI response
    setDevices(ds => ds.map(d =>
      d.id === deviceId || d.deviceId === deviceId
        ? { ...d, enabled: !d.enabled }
        : d
    ));
    try {
      await devApi.toggle(deviceId);
    } catch (err) {
      // Revert on failure
      setDevices(ds => ds.map(d =>
        d.id === deviceId || d.deviceId === deviceId
          ? { ...d, enabled: !d.enabled }
          : d
      ));
      addToast("Failed to toggle device", "error");
    }
  }, [addToast]);

  const toggleRelay = useCallback(async (deviceId, relayId) => {
    // Optimistic update
    setDevices(ds => ds.map(d => {
      if (d.id !== deviceId && d.deviceId !== deviceId) return d;
      return {
        ...d,
        relays: d.relays.map(r =>
          (r.id === relayId || r.relayId === relayId)
            ? { ...r, on: !r.on }
            : r
        ),
      };
    }));
    try {
      await devApi.toggleRelay(deviceId, relayId);
    } catch (err) {
      // Revert
      setDevices(ds => ds.map(d => {
        if (d.id !== deviceId && d.deviceId !== deviceId) return d;
        return {
          ...d,
          relays: d.relays.map(r =>
            (r.id === relayId || r.relayId === relayId)
              ? { ...r, on: !r.on }
              : r
          ),
        };
      }));
      addToast("Failed to toggle relay", "error");
    }
  }, [addToast]);

  // ─────────────────────────────────────────────────────────────
  // SCHEDULE ACTIONS
  // ─────────────────────────────────────────────────────────────
  const addSchedule = useCallback(async (schedule) => {
    try {
      const res = await schedApi.create(schedule);
      const created = res.data || res.schedule || schedule;
      setSchedules(prev => [...prev, { ...created, id: created._id, device: created.deviceId }]);
      addToast("Schedule created", "success");
    } catch (err) {
      addToast("Failed to create schedule", "error");
    }
  }, [addToast]);

  const updateSchedule = useCallback(async (schedule) => {
    const id = schedule._id || schedule.id;
    try {
      await schedApi.update(id, schedule);
      setSchedules(prev => prev.map(s => (s._id || s.id) === id ? { ...schedule, id } : s));
      addToast("Schedule updated", "success");
    } catch (err) {
      addToast("Failed to update schedule", "error");
    }
  }, [addToast]);

  const deleteSchedule = useCallback(async (id) => {
    try {
      await schedApi.delete(id);
      setSchedules(prev => prev.filter(s => (s._id || s.id) !== id));
      addToast("Schedule deleted", "success");
    } catch (err) {
      addToast("Failed to delete schedule", "error");
    }
  }, [addToast]);

  const toggleSchedule = useCallback(async (id) => {
    setSchedules(prev => prev.map(s => (s._id || s.id) === id ? { ...s, enabled: !s.enabled } : s));
    try {
      await schedApi.toggle(id);
    } catch (err) {
      setSchedules(prev => prev.map(s => (s._id || s.id) === id ? { ...s, enabled: !s.enabled } : s));
      addToast("Failed to toggle schedule", "error");
    }
  }, [addToast]);

  // ─────────────────────────────────────────────────────────────
  // MODAL
  // ─────────────────────────────────────────────────────────────
  const openModal  = useCallback((type, payload = {}) => setModal({ type, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);

  // ─────────────────────────────────────────────────────────────
  // KEYBOARD SHORTCUTS (unchanged)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setModal(null);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────────────────────
  return (
    <DashboardContext.Provider value={{
      // Meta
      loading, initError, currentUser,

      // Alerts
      alerts, clearAlerts, dismissAlert, addAlert,
      threshold, alertsEnabled, setAlertsEnabled, updateThreshold,

      // Devices
      devices, setDevices, toggleDevice, toggleRelay,

      // Schedules
      schedules, addSchedule, updateSchedule, deleteSchedule, toggleSchedule,

      // Notifications
      notifOpen, setNotifOpen,
      toasts, addToast,

      // Search
      searchOpen, setSearchOpen,

      // Modal
      modal, openModal, closeModal,

      // Chart
      chartTab, setChartTab,

      // Navigation
      sidebarOpen, setSidebarOpen,
      currentPage, setCurrentPage,

      // Budget
      budget, setBudget,

      // Settings
      appSettings, setAppSettings,

      // WebSocket (expose ref so pages can listen directly if needed)
      wsRef,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};
