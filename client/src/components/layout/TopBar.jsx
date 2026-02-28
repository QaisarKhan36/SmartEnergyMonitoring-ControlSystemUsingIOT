import React, { useState, useRef, useEffect } from "react";
import {
  FaBars, FaBell, FaSearch, FaWifi, FaUserCircle, FaChevronDown,
} from "react-icons/fa";
import useDashboard from "../../context/useDashboard";

const Topbar = () => {
  const {
    alerts, setNotifOpen, notifOpen,
    setSearchOpen,
    setSidebarOpen,
    addToast,
  } = useDashboard();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  const profileActions = [
    { icon: "👤", label: "My Profile",        path: "/profile"   },
    { icon: "⚙️", label: "Account Settings",  path: "/settings"  },
    { icon: "📊", label: "My Reports",        path: "/reports"   },
  ];

  const handleProfileAction = (label) => {
    addToast(`Navigating to ${label}`, "info");
    setShowProfileMenu(false);
  };

  const handleSignOut = () => {
    addToast("Signing out…", "info");
    setShowProfileMenu(false);
  };

  return (
    <header className="topbar">

      {/* ── Left ── */}
      <div className="topbar-left">
        <button
          className="topbar-hamburger"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>

        <div className="topbar-logo">
          <div className="topbar-logo-icon">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
              <circle cx="18" cy="18" r="18" fill="url(#logoGrad)" />
              <path d="M20 6L11 20h8L15 30l13-17h-8.5L20 6z" fill="white" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fbbf24" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="topbar-logo-text">
            <span className="topbar-logo-name">SmartEnergy</span>
            <span className="topbar-logo-sub">Monitoring &amp; Control</span>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div
        className="topbar-search-wrap"
        onClick={() => setSearchOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <FaSearch className="topbar-search-icon" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search devices, alerts, reports…"
          readOnly
          style={{ cursor: "pointer" }}
        />
        <span className="topbar-search-kbd">⌘K</span>
      </div>

      {/* ── Right ── */}
      <div className="topbar-right">

        {/* Live indicator */}
        <div className="topbar-live">
          <span className="topbar-live-dot" />
          <FaWifi className="topbar-live-icon" />
          <span className="topbar-live-label">Live</span>
        </div>

        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-icon-btn"
            aria-label="Notifications"
            onClick={() => setNotifOpen(o => !o)}
            style={{ position: "relative" }}
          >
            <FaBell />
            {alerts.length > 0 && (
              <span className="topbar-notif-badge">{alerts.length}</span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel alerts={alerts} onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* Profile */}
        <div
          ref={profileRef}
          className={`topbar-profile ${showProfileMenu ? "open" : ""}`}
          onClick={() => setShowProfileMenu(v => !v)}
        >
          <div className="topbar-avatar"><FaUserCircle /></div>
          <div className="topbar-profile-text">
            <span className="topbar-profile-name">Asif Khan</span>
            <span className="topbar-profile-role">Admin</span>
          </div>
          <FaChevronDown className={`topbar-chevron ${showProfileMenu ? "rotated" : ""}`} />

          {showProfileMenu && (
            <div className="topbar-dropdown" onClick={e => e.stopPropagation()}>
              <div className="topbar-dropdown-header">
                <div className="dropdown-avatar"><FaUserCircle /></div>
                <div>
                  <p className="dropdown-name">Asif Khan</p>
                  <p className="dropdown-email">asif@smartenergy.io</p>
                </div>
              </div>
              <div className="topbar-dropdown-divider" />
              {profileActions.map(a => (
                <div
                  key={a.label}
                  className="topbar-dropdown-item"
                  onClick={() => handleProfileAction(a.label)}
                >
                  {a.icon} {a.label}
                </div>
              ))}
              <div className="topbar-dropdown-divider" />
              <div
                className="topbar-dropdown-item topbar-dropdown-logout"
                onClick={handleSignOut}
              >
                🚪 Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* ── Notification Panel ── */
const NotificationPanel = ({ alerts, onClose }) => {
  const { clearAlerts, dismissAlert } = useDashboard();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 10px)", right: 0,
      width: 340, background: "#fff",
      borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
      border: "1px solid #e5e7eb", zIndex: 200,
      animation: "slideModal 0.2s cubic-bezier(0.34,1.3,0.64,1) both",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
    }} onClick={e => e.stopPropagation()}>

      <style>{`@keyframes slideModal { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 12px" }}>
        <div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827" }}>Notifications</span>
          {alerts.length > 0 && (
            <span style={{ marginLeft: 8, background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 999 }}>{alerts.length}</span>
          )}
        </div>
        {alerts.length > 0 && (
          <button onClick={() => { clearAlerts(); onClose(); }} style={{
            background: "none", border: "none", fontSize: 12, color: "#ef4444",
            fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>
            Clear all
          </button>
        )}
      </div>

      <div style={{ maxHeight: 320, overflowY: "auto", borderTop: "1px solid #f3f4f6" }}>
        {alerts.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            No active alerts
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 16px", borderBottom: "1px solid #f9fafb",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <span style={{
                width: 30, height: 30, borderRadius: 9,
                background: "#fffbeb", border: "1px solid #fde68a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, flexShrink: 0,
              }}>⚠️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12.5, fontWeight: 500, color: "#374151", lineHeight: 1.4, marginBottom: 3 }}>{a.msg}</p>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>{a.time}</p>
              </div>
              <button onClick={() => dismissAlert(a.id)} style={{
                background: "none", border: "none", color: "#d1d5db",
                cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2,
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#6b7280"}
              onMouseLeave={e => e.currentTarget.style.color = "#d1d5db"}
              >×</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Topbar;