import React, { useState, useEffect } from "react";
import useDashboard from "../../context/useDashboard";

const Overlay = ({ onClick, children }) => (
  <div
    onClick={onClick}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(5,14,45,0.45)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "fadeOverlay 0.2s ease both",
    }}
  >
    <style>{`
      @keyframes fadeOverlay { from { opacity:0 } to { opacity:1 } }
      @keyframes slideModal { from { opacity:0; transform:translateY(20px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
    `}</style>
    {children}
  </div>
);

const Card = ({ children, width = 420 }) => (
  <div
    onClick={e => e.stopPropagation()}
    style={{
      background: "#fff",
      borderRadius: 20,
      padding: "28px 28px 24px",
      width, maxWidth: "calc(100vw - 32px)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
      animation: "slideModal 0.25s cubic-bezier(0.34,1.3,0.64,1) both",
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", onClick, style = {} }) => {
  const styles = {
    primary: { background: "#f59e0b", color: "#fff", border: "none" },
    danger:  { background: "#ef4444", color: "#fff", border: "none" },
    ghost:   { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant],
      borderRadius: 10, padding: "9px 20px",
      fontSize: 13, fontWeight: 700,
      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
      transition: "opacity 0.15s",
      ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
};

/* ── Confirm Modal ── */
const ConfirmModal = ({ payload, onClose }) => {
  const { title = "Are you sure?", message, confirmLabel = "Confirm", variant = "danger", onConfirm } = payload;
  return (
    <Card width={380}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>
        {variant === "danger" ? "🗑️" : "⚠️"}
      </div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.5, marginBottom: 24 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant={variant} onClick={() => { onConfirm?.(); onClose(); }}>{confirmLabel}</Btn>
      </div>
    </Card>
  );
};

/* ── Threshold Settings Modal ── */
const ThresholdModal = ({ onClose }) => {
  const { updateThreshold, threshold, alertsEnabled, setAlertsEnabled } = useDashboard();
  const [val, setVal] = useState(threshold);
  const [enabled, setEnabled] = useState(alertsEnabled);

  const save = () => {
    updateThreshold(val);
    setAlertsEnabled(enabled);
    onClose();
  };

  return (
    <Card width={420}>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 4 }}>
        ⚡ Threshold Settings
      </h3>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>Configure your power consumption alerts</p>

      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
        Power Threshold (W)
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <input
          type="range" min={500} max={5000} step={50}
          value={val} onChange={e => setVal(+e.target.value)}
          style={{ flex: 1, accentColor: "#f59e0b" }}
        />
        <div style={{
          background: "#fffbeb", border: "1.5px solid #fde68a",
          borderRadius: 10, padding: "8px 14px",
          fontFamily: "'Outfit', sans-serif", fontWeight: 800,
          fontSize: 17, color: "#f59e0b", minWidth: 90, textAlign: "center",
        }}>
          {val} W
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#f9fafb", borderRadius: 12, padding: "13px 15px", marginBottom: 24,
        border: "1px solid #e5e7eb",
      }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>Enable Alerts</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Get notified when threshold is exceeded</div>
        </div>
        <label className="switch" style={{ flexShrink: 0 }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          <span className="slider"></span>
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Save Changes</Btn>
      </div>
    </Card>
  );
};

/* ── Schedule Modal ── */
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const ScheduleModal = ({ payload, onClose }) => {
  const { addToast } = useDashboard();
  const { relayLabel } = payload;
  const [days, setDays] = useState(["Mon","Tue","Wed","Thu","Fri"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime]     = useState("22:00");

  const toggleDay = d => setDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const save = () => {
    addToast(`Schedule saved for ${relayLabel}`, "success");
    onClose();
  };

  return (
    <Card width={440}>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 4 }}>
        🕐 Schedule — {relayLabel}
      </h3>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 22 }}>Set automated on/off schedule</p>

      <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Active Days</label>
      <div style={{ display: "flex", gap: 7, marginBottom: 22, flexWrap: "wrap" }}>
        {DAYS.map(d => (
          <button key={d} onClick={() => toggleDay(d)} style={{
            padding: "7px 12px", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            background: days.includes(d) ? "#f59e0b" : "#f3f4f6",
            color: days.includes(d) ? "#fff" : "#6b7280",
            border: days.includes(d) ? "none" : "1px solid #e5e7eb",
            transition: "all 0.15s",
          }}>{d}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[["Start Time", startTime, setStartTime], ["End Time", endTime, setEndTime]].map(([label, val, set]) => (
          <div key={label}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>{label}</label>
            <input type="time" value={val} onChange={e => set(e.target.value)} style={{
              width: "100%", padding: "9px 12px", borderRadius: 10,
              border: "1.5px solid #e5e7eb", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
              accentColor: "#f59e0b",
            }} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Save Schedule</Btn>
      </div>
    </Card>
  );
};

/* ── Device Menu Modal ── */
const DeviceMenuModal = ({ payload, onClose }) => {
  const { addToast } = useDashboard();
  const { deviceName } = payload;

  const actions = [
    { icon: "📊", label: "View Analytics", action: () => { addToast(`Opening analytics for ${deviceName}`, "info"); onClose(); } },
    { icon: "⚙️", label: "Device Settings", action: () => { addToast(`Settings opened for ${deviceName}`, "info"); onClose(); } },
    { icon: "🔄", label: "Restart Device",  action: () => { addToast(`Restarting ${deviceName}…`, "warning"); onClose(); } },
    { icon: "📋", label: "View Logs",        action: () => { addToast(`Loading logs for ${deviceName}`, "info"); onClose(); } },
  ];

  return (
    <Card width={340}>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: "#111827", marginBottom: 18 }}>
        {deviceName}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {actions.map(a => (
          <button key={a.label} onClick={a.action} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12,
            border: "1px solid #f3f4f6", background: "#fafafa",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5, fontWeight: 500, color: "#374151",
            transition: "all 0.15s", textAlign: "left",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#f3f4f6"; }}
          >
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
      </div>
    </Card>
  );
};

/* ── Search Modal ── */
const SEARCH_ITEMS = [
  { icon: "📊", label: "Dashboard",     page: "dashboard",  category: "Pages" },
  { icon: "📈", label: "Analytics",     page: "analytics",  category: "Pages" },
  { icon: "🖥️", label: "Devices",       page: "devices",    category: "Pages" },
  { icon: "⚡", label: "Real-Time Data",page: "realtime",   category: "Pages" },
  { icon: "🔋", label: "Energy Flow",   page: "energyflow", category: "Pages" },
  { icon: "🎛️", label: "Control Panel", page: "control",    category: "Pages" },
  { icon: "🕐", label: "Scheduling",    page: "scheduling", category: "Pages" },
  { icon: "💰", label: "Cost & Budget", page: "cost",       category: "Pages" },
  { icon: "📄", label: "Reports",       page: "reports",    category: "Pages" },
  { icon: "📜", label: "History",       page: "history",    category: "Pages" },
  { icon: "🔔", label: "Alerts",        page: "alerts",     category: "Pages" },
  { icon: "⚙️", label: "Settings",      page: "settings",   category: "Pages" },
  { icon: "❓", label: "Help",          page: "help",       category: "Pages" },
  { icon: "🏠", label: "Home Main",     page: "devices",    category: "Devices" },
  { icon: "🍳", label: "Kitchen Outlet",page: "devices",    category: "Devices" },
];

const SearchModal = ({ onClose }) => {
  const { addToast, setCurrentPage } = useDashboard();
  const [query, setQuery] = useState("");
  const results = query.length > 0
    ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_ITEMS;

  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <Card width={520}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
        border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "10px 14px",
        background: "#f9fafb",
      }}>
        <span style={{ fontSize: 16, color: "#9ca3af" }}>🔍</span>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search devices, alerts, reports…"
          style={{
            border: "none", background: "none", flex: 1, outline: "none",
            fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#111827",
          }}
        />
        <kbd style={{ fontSize: 11, background: "#e5e7eb", borderRadius: 6, padding: "2px 7px", color: "#6b7280", fontFamily: "monospace" }}>ESC</kbd>
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {Object.entries(
          results.reduce((acc, item) => {
            (acc[item.category] = acc[item.category] || []).push(item);
            return acc;
          }, {})
        ).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.8px", textTransform: "uppercase", padding: "4px 4px", fontFamily: "'Outfit', sans-serif" }}>
              {cat}
            </div>
            {items.map(item => (
              <button key={item.label} onClick={() => { setCurrentPage(item.page); addToast(`Navigating to ${item.label}`, "info"); onClose(); }} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: "none", cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "#374151",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: 17 }}>{item.icon}</span>
                {item.label}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#d1d5db" }}>/{item.page}</span>
              </button>
            ))}
          </div>
        ))}
        {results.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 14 }}>
            No results found for "{query}"
          </div>
        )}
      </div>
    </Card>
  );
};

/* ── Master Modal Renderer ── */
const ModalManager = () => {
  const { modal, closeModal, searchOpen, setSearchOpen } = useDashboard();

  if (searchOpen) {
    return <Overlay onClick={() => setSearchOpen(false)}><SearchModal onClose={() => setSearchOpen(false)} /></Overlay>;
  }
  if (!modal) return null;

  const map = {
    confirm:    ConfirmModal,
    threshold:  ThresholdModal,
    schedule:   ScheduleModal,
    deviceMenu: DeviceMenuModal,
  };

  const Component = map[modal.type];
  if (!Component) return null;

  return <Overlay onClick={closeModal}><Component payload={modal.payload} onClose={closeModal} /></Overlay>;
};

export default ModalManager;