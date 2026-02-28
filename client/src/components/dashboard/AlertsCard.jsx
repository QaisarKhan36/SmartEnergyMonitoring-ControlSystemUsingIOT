import React from "react";
import useDashboard from "../../context/useDashboard";

const AlertsCard = () => {
  const {
    alerts, clearAlerts, dismissAlert,
    threshold, alertsEnabled,
    openModal,
  } = useDashboard();

  const currentPower = 1146.6;
  const overLimit = currentPower - threshold;

  const handleClearAlerts = () => {
    openModal("confirm", {
      title: "Clear All Alerts?",
      message: "This will remove all active alerts from the dashboard. This action cannot be undone.",
      confirmLabel: "Clear Alerts",
      variant: "danger",
      onConfirm: clearAlerts,
    });
  };

  const handleThresholdSettings = () => {
    openModal("threshold");
  };

  return (
    <div className="alerts-card-new anim-4">

      <div className="alerts-header">
        <h3 className="alerts-title">Alerts</h3>
        <span className="alerts-count-badge">{alerts.length} Active</span>
      </div>

      {/* Threshold info bar — clickable to open settings */}
      <button
        className="alert-top-bar"
        onClick={handleThresholdSettings}
        style={{
          width: "100%", textAlign: "left", cursor: "pointer",
          border: "1.5px solid #fde68a", background: "var(--amber-50)",
          borderRadius: "var(--radius-md)", padding: "9px 11px",
          marginBottom: 11, display: "flex", alignItems: "flex-start", gap: 7,
          transition: "background 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#fef3c7"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--amber-50)"}
        title="Click to edit threshold settings"
      >
        <span className="alert-warning-icon">⚠</span>
        <span className="alert-top-bar-text">
          Threshold: {threshold.toLocaleString()} W | Alerts {alertsEnabled ? "Enabled" : "Disabled"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#b45309", fontWeight: 600, flexShrink: 0 }}>
          Edit ›
        </span>
      </button>

      {/* Over-limit highlight */}
      {overLimit > 0 && (
        <div className="alert-highlight">
          <p className="alert-highlight-label">Current Power:</p>
          <h2 className="alert-highlight-value">+{overLimit.toFixed(1)} W over limit!</h2>
        </div>
      )}

      {/* Alert log entries */}
      {alerts.length === 0 ? (
        <div style={{
          padding: "18px 0", textAlign: "center",
          color: "var(--gray-400)", fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
          No active alerts
        </div>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="alert-log" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="alert-log-time">{a.time}</p>
              <span className="alert-log-msg">{a.msg}</span>
            </div>
            <button
              onClick={() => dismissAlert(a.id)}
              style={{
                background: "none", border: "none", color: "var(--gray-300)",
                cursor: "pointer", fontSize: 18, lineHeight: 1,
                padding: "0 2px", flexShrink: 0, marginTop: 2,
                transition: "color 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--red-500)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--gray-300)"}
              title="Dismiss alert"
            >×</button>
          </div>
        ))
      )}

      <button
        className="clear-alerts-btn"
        onClick={handleClearAlerts}
        disabled={alerts.length === 0}
        style={{ opacity: alerts.length === 0 ? 0.45 : 1 }}
      >
        Clear All Alerts
      </button>
    </div>
  );
};

export default AlertsCard;