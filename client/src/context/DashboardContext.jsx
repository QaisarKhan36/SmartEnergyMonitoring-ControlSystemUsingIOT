import React, { createContext, useState, useCallback, useEffect } from "react";

const DashboardContext = createContext(null);
export default DashboardContext;

/* ── Initial data ── */
const INITIAL_ALERTS = [
  { id: 1, time: "2025-01-20 02:25 PM", msg: "High Power Consumption Detected (1146.0 W)", type: "warning" },
  { id: 2, time: "2025-01-20 02:00 PM", msg: "High Energy Usage Alarm (5.20 kWh)",        type: "warning" },
];

const INITIAL_DEVICES = [
  {
    id: "home-main",
    name: "Home Main",
    location: "Living Room",
    icon: "home",
    colorClass: "orange-bg",
    enabled: true,
    relays: [
      { id: "r1", label: "Relay 1", on: true  },
      { id: "r2", label: "Relay 2", on: false },
      { id: "r3", label: "Relay 3", on: false },
      { id: "r4", label: "Relay 4", on: false },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen Outlet",
    location: "Kitchen",
    icon: "kitchen",
    colorClass: "green-bg",
    enabled: true,
    relays: [],
  },
];

/* ── Schedules initial data ── */
const INITIAL_SCHEDULES = [
  {
    id: 1,
    name: "Morning Routine",
    relay: "Home Main — Relay 1",
    device: "home-main",
    relayId: "r1",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    start: "06:00",
    end: "09:00",
    enabled: true,
    color: "#f59e0b",
  },
  {
    id: 2,
    name: "Work Hours",
    relay: "Home Main — Relay 2",
    device: "home-main",
    relayId: "r2",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    start: "09:00",
    end: "17:00",
    enabled: true,
    color: "#3b82f6",
  },
];

export const DashboardProvider = ({ children }) => {
  /* ── Alerts ── */
  const [alerts,        setAlerts]        = useState(INITIAL_ALERTS);
  const [threshold,     setThreshold]     = useState(2000);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  /* ── Devices ── */
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  /* ── Schedules (shared across ScheduleManager + modals) ── */
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES);

  /* ── Notifications panel ── */
  const [notifOpen, setNotifOpen] = useState(false);
  const [toasts,    setToasts]    = useState([]);

  /* ── Search ── */
  const [searchOpen, setSearchOpen] = useState(false);

  /* ── Modals ── */
  const [modal, setModal] = useState(null); // { type, payload }

  /* ── Chart tab ── */
  const [chartTab, setChartTab] = useState("Daily");

  /* ── Sidebar ── */
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [currentPage,  setCurrentPage]  = useState("dashboard");

  /* ── Budget (shared with CostCalculator) ── */
  const [budget, setBudget] = useState(90);

  /* ── Settings (shared state for live updates) ── */
  const [appSettings, setAppSettings] = useState({
    dataInterval: 1,
    autoRefresh: true,
    logRetention: 30,
    unitSystem: "metric",
    currency: "USD",
    dateFormat: "DD/MM/YYYY",
    animations: true,
  });

  /* ─────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────── */

  /** Toast notifications */
  const addToast = useCallback((msg, variant = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  /** Alert management */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    addToast("All alerts cleared", "success");
  }, [addToast]);

  const dismissAlert = useCallback((id) => {
    setAlerts(a => a.filter(x => x.id !== id));
  }, []);

  const addAlert = useCallback((msg, type = "warning") => {
    const id = Date.now();
    const time = new Date().toLocaleString("en-US", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
    setAlerts(prev => [{ id, msg, type, time }, ...prev]);
  }, []);

  /** Threshold */
  const updateThreshold = useCallback((val) => {
    setThreshold(val);
    addToast(`Threshold updated to ${val.toLocaleString()} W`, "success");
  }, [addToast]);

  /** Device management */
  const toggleDevice = useCallback((deviceId) => {
    setDevices(ds => ds.map(d =>
      d.id === deviceId ? { ...d, enabled: !d.enabled } : d
    ));
  }, []);

  const toggleRelay = useCallback((deviceId, relayId) => {
    setDevices(ds => ds.map(d => {
      if (d.id !== deviceId) return d;
      return {
        ...d,
        relays: d.relays.map(r =>
          r.id === relayId ? { ...r, on: !r.on } : r
        ),
      };
    }));
  }, []);

  /** Modal management */
  const openModal  = useCallback((type, payload = {}) => setModal({ type, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);

  /** Schedule management */
  const addSchedule = useCallback((schedule) => {
    setSchedules(prev => [...prev, schedule]);
  }, []);

  const updateSchedule = useCallback((schedule) => {
    setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
  }, []);

  const deleteSchedule = useCallback((id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleSchedule = useCallback((id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }, []);

  /** Keyboard shortcut: ⌘K / Ctrl+K → open search */
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

  /* ── Context value ── */
  return (
    <DashboardContext.Provider value={{
      /* Alerts */
      alerts, clearAlerts, dismissAlert, addAlert,
      threshold, alertsEnabled, setAlertsEnabled, updateThreshold,

      /* Devices */
      devices, setDevices, toggleDevice, toggleRelay,

      /* Schedules */
      schedules, addSchedule, updateSchedule, deleteSchedule, toggleSchedule,

      /* Notifications */
      notifOpen, setNotifOpen,
      toasts, addToast,

      /* Search */
      searchOpen, setSearchOpen,

      /* Modal */
      modal, openModal, closeModal,

      /* Chart */
      chartTab, setChartTab,

      /* Navigation */
      sidebarOpen, setSidebarOpen,
      currentPage, setCurrentPage,

      /* Budget */
      budget, setBudget,

      /* Settings */
      appSettings, setAppSettings,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};