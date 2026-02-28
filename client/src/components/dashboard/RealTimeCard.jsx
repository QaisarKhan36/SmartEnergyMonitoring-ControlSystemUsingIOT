import React from "react";
import useDashboard from "../../context/useDashboard";

const readings = [
  { label: "Voltage", value: "220.5",   unit: "V",   color: "orange", icon: "⚡" },
  { label: "Current", value: "5.2",     unit: "A",   color: "orange", icon: "🔄" },
  { label: "Power",   value: "1,146.6", unit: "W",   color: "orange", icon: "⚡" },
  { label: "Energy",  value: "1,250.75",unit: "kWh", color: "blue",   icon: "🗄" },
];

const RealTimeCard = () => {
  const { threshold, alertsEnabled, openModal, clearAlerts, alerts } = useDashboard();

  const handleClearAlerts = () => {
    if (alerts.length === 0) return;
    openModal("confirm", {
      title: "Clear All Alerts?",
      message: "This will remove all active alerts. Are you sure?",
      confirmLabel: "Clear",
      variant: "danger",
      onConfirm: clearAlerts,
    });
  };

  const handleThresholdClick = () => {
    openModal("threshold");
  };

  return (
    <div className="realtime-card-new anim-4">
      <h3 className="realtime-title">Real-Time Readings</h3>

      <div className="realtime-grid-new">
        {readings.map((r) => (
          <div key={r.label} className={`reading-box reading-box-${r.color}`}>
            <div className="reading-box-header">
              <span className="reading-icon-new">{r.icon}</span>
              <span className="reading-label">{r.label}</span>
            </div>
            <div className={`reading-value reading-value-${r.color}`}>
              {r.value}
              <span className="reading-unit"> {r.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="threshold-bar-new">
        <span className="threshold-icon">⚠️</span>
        <button
          onClick={handleThresholdClick}
          style={{
            background: "none", border: "none", padding: 0,
            cursor: "pointer", fontFamily: "inherit",
            fontSize: "12.5px", fontWeight: 600, color: "#92400e",
            flexShrink: 0, textDecoration: "underline dotted",
          }}
          title="Click to edit threshold"
        >
          Threshold: {threshold.toLocaleString()} W | Alerts {alertsEnabled ? "Enabled" : "Disabled"}
        </button>
        <div className="threshold-right">
          <p className="threshold-timestamp">2025-01-20 02:15 PM</p>
          <p className="threshold-desc">Threshold limit activated. Monitor Power Consumption. Check Energy.</p>
        </div>
        <button
          className="clear-alerts-inline-btn"
          onClick={handleClearAlerts}
          disabled={alerts.length === 0}
          style={{ opacity: alerts.length === 0 ? 0.45 : 1 }}
        >
          Clear Alerts
        </button>
      </div>
    </div>
  );
};

export default RealTimeCard;