import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

/* ── CSV export helper ── */
const downloadCSV = (data, filename) => {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => Object.values(row).join(",")).join("\n");
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

/* ── Dummy report data ── */
const DAILY_DATA = Array.from({ length: 20 }, (_, i) => ({
  date: `2025-01-${String(i + 1).padStart(2, "0")}`,
  kwh: (15 + Math.random() * 10).toFixed(2),
  cost_usd: (2.4 + Math.random() * 1.6).toFixed(2),
  peak_w: Math.round(900 + Math.random() * 600),
  avg_w: Math.round(600 + Math.random() * 300),
  alerts: Math.floor(Math.random() * 3),
}));

const DEVICE_DATA = [
  { device: "Home Main",     location: "Living Room", kwh_month: "28.40", cost_usd: "4.54", runtime_hrs: "168", status: "Online" },
  { device: "Kitchen Outlet",location: "Kitchen",     kwh_month: "12.10", cost_usd: "1.94", runtime_hrs: "142", status: "Online" },
  { device: "HVAC",          location: "Central",     kwh_month: "7.30",  cost_usd: "1.17", runtime_hrs: "96",  status: "Online" },
];

const ALERT_LOG = [
  { datetime: "2025-01-20 14:25", type: "High Power",   value: "1146.0 W", threshold: "1000 W", duration: "18 min" },
  { datetime: "2025-01-20 14:00", type: "High Energy",  value: "5.20 kWh", threshold: "5.0 kWh",duration: "N/A" },
  { datetime: "2025-01-18 13:10", type: "High Power",   value: "1280.0 W", threshold: "1000 W", duration: "31 min" },
  { datetime: "2025-01-15 15:45", type: "High Power",   value: "1150.0 W", threshold: "1000 W", duration: "9 min" },
];

const REPORT_TYPES = [
  { id: "daily",   icon: "📅", label: "Daily Usage",    desc: "Day-by-day kWh, cost, peak demand" },
  { id: "device",  icon: "🖥️", label: "Device Summary", desc: "Per-device consumption & runtime" },
  { id: "alerts",  icon: "🔔", label: "Alert Log",      desc: "Full history of threshold breaches" },
  { id: "monthly", icon: "📊", label: "Monthly Summary",desc: "Aggregated monthly report" },
];

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom"];

const Btn = ({ children, onClick, variant = "primary", icon, disabled = false }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" },
    ghost:   { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
    green:   { background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(34,197,94,0.3)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      borderRadius: 10, padding: "9px 18px",
      fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", gap: 7,
      opacity: disabled ? 0.5 : 1,
      transition: "opacity 0.15s",
    }}>{icon && <span>{icon}</span>}{children}</button>
  );
};

/* ── Report preview table ── */
const PreviewTable = ({ type }) => {
  const configs = {
    daily: {
      headers: ["Date", "Usage (kWh)", "Cost ($)", "Peak (W)", "Avg (W)", "Alerts"],
      rows: DAILY_DATA.slice(0, 8).map(r => [r.date, r.kwh, r.cost_usd, r.peak_w, r.avg_w, r.alerts]),
    },
    device: {
      headers: ["Device", "Location", "kWh/month", "Cost ($)", "Runtime (hrs)", "Status"],
      rows: DEVICE_DATA.map(r => [r.device, r.location, r.kwh_month, r.cost_usd, r.runtime_hrs, r.status]),
    },
    alerts: {
      headers: ["Date & Time", "Type", "Value", "Threshold", "Duration"],
      rows: ALERT_LOG.map(r => [r.datetime, r.type, r.value, r.threshold, r.duration]),
    },
    monthly: {
      headers: ["Month", "Total kWh", "Total Cost ($)", "Peak (W)", "Avg Daily kWh"],
      rows: [
        ["January 2025", "558.0", "89.28", "2340", "18.6"],
        ["December 2024","610.0", "97.60", "2590", "19.7"],
        ["November 2024","520.0", "83.20", "2100", "17.3"],
      ],
    },
  };

  const { headers, rows } = configs[type] || configs.daily;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: "10px 14px", textAlign: "left",
                fontSize: 11.5, fontWeight: 700, color: "#9ca3af",
                textTransform: "uppercase", letterSpacing: "0.5px",
                fontFamily: "'Outfit', sans-serif",
                borderBottom: "1px solid #e5e7eb",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "10px 14px", fontSize: 13,
                  color: j === 0 ? "#374151" : "#6b7280",
                  fontWeight: j === 0 ? 600 : 400,
                  fontFamily: j === 0 ? "'Outfit', sans-serif" : "'DM Sans', sans-serif",
                }}>
                  {cell === "Online" ? (
                    <span style={{ color: "#16a34a", background: "#f0fdf4", padding: "2px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>● Online</span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11.5, color: "#9ca3af", margin: "10px 4px 0", fontStyle: "italic" }}>
        Showing preview — full export includes all records
      </p>
    </div>
  );
};

/* ════════════════════════════
   REPORTS PAGE
════════════════════════════ */
const Reports = () => {
  const { addToast } = useDashboard();
  const [selectedType,  setSelectedType]  = useState("daily");
  const [dateRange,     setDateRange]     = useState("Last 30 Days");
  const [exporting,     setExporting]     = useState(false);
  const [lastExported,  setLastExported]  = useState(null);

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const dataMap = {
        daily:   DAILY_DATA,
        device:  DEVICE_DATA,
        alerts:  ALERT_LOG,
        monthly: [
          { month: "January 2025",  kwh: 558, cost: 89.28, peak_w: 2340, avg_daily_kwh: 18.6 },
          { month: "December 2024", kwh: 610, cost: 97.60, peak_w: 2590, avg_daily_kwh: 19.7 },
        ],
      };
      const filename = `smartenergy_${selectedType}_report_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(dataMap[selectedType], filename);
      setExporting(false);
      const now = new Date().toLocaleTimeString();
      setLastExported(now);
      addToast(`CSV exported: ${filename}`, "success");
    }, 900);
  };

  const handlePrint = () => {
    addToast("Opening print dialog…", "info");
    setTimeout(() => window.print(), 300);
  };

  const selectedReport = REPORT_TYPES.find(r => r.id === selectedType);

  return (
    <div style={{
      padding: "22px 24px 36px", display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif", background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media print {
          body > * { display: none !important; }
          .print-area { display: block !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#0f1f5c", margin: 0 }}>Reports & Export</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>Download your energy data as CSV</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={handlePrint} icon="🖨️">Print</Btn>
          <Btn variant="green" onClick={handleExportCSV} disabled={exporting} icon={exporting ? "⏳" : "⬇️"}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Btn>
        </div>
      </div>

      {/* Last export notice */}
      {lastExported && (
        <div style={{
          background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12,
          padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, color: "#166534", fontWeight: 500,
          animation: "fadeUp 0.3s both",
        }}>
          <span>✅</span> Last exported at {lastExported} — check your downloads folder.
        </div>
      )}

      {/* Config row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>

        {/* Report type selector */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 14px" }}>Report Type</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {REPORT_TYPES.map(t => (
              <button key={t.id} onClick={() => setSelectedType(t.id)} style={{
                display: "flex", alignItems: "flex-start", gap: 11,
                padding: "13px 14px", borderRadius: 12,
                border: `1.5px solid ${selectedType === t.id ? "#f59e0b" : "#e5e7eb"}`,
                background: selectedType === t.id ? "#fffbeb" : "#fafafa",
                cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: selectedType === t.id ? "#92400e" : "#111827", margin: "0 0 2px", fontFamily: "'Outfit', sans-serif" }}>{t.label}</p>
                  <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date range + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 12px" }}>Date Range</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {DATE_RANGES.map(r => (
                <button key={r} onClick={() => setDateRange(r)} style={{
                  padding: "8px 12px", borderRadius: 9, border: "none",
                  background: dateRange === r ? "#fffbeb" : "transparent",
                  color: dateRange === r ? "#f59e0b" : "#6b7280",
                  fontWeight: dateRange === r ? 700 : 500, fontSize: 13,
                  cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                  borderLeft: `3px solid ${dateRange === r ? "#f59e0b" : "transparent"}`,
                }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ background: "linear-gradient(135deg, #0f1f5c, #1e3a8a)", borderRadius: 16, padding: "18px 20px", color: "#fff" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 10px", fontFamily: "'Outfit', sans-serif" }}>
              Export Summary
            </p>
            {[
              ["Report",    selectedReport?.label || "—"],
              ["Period",    dateRange],
              ["Records",   selectedType === "daily" ? "20 rows" : selectedType === "device" ? "3 devices" : selectedType === "alerts" ? "4 alerts" : "3 months"],
              ["Format",    "CSV (.csv)"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{k}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>
              {selectedReport?.icon} {selectedReport?.label} — Preview
            </h3>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{dateRange}</p>
          </div>
          <Btn variant="green" onClick={handleExportCSV} disabled={exporting} icon="⬇️">
            Download CSV
          </Btn>
        </div>
        <PreviewTable type={selectedType} />
      </div>

      {/* Data inventory */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 14px" }}>
          Available Data
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: "📅", label: "Daily Logs",    count: "20 days",   size: "~12 KB" },
            { icon: "🖥️", label: "Device Data",   count: "3 devices", size: "~2 KB"  },
            { icon: "🔔", label: "Alert History", count: "4 events",  size: "~1 KB"  },
            { icon: "📊", label: "Monthly Data",  count: "6 months",  size: "~3 KB"  },
          ].map((d, i) => (
            <div key={i} style={{
              background: "#f9fafb", borderRadius: 12, padding: "13px 14px",
              border: "1px solid #f3f4f6",
              animation: `fadeUp 0.4s ${i * 0.07}s both`,
            }}>
              <span style={{ fontSize: 24 }}>{d.icon}</span>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", margin: "8px 0 2px", fontFamily: "'Outfit', sans-serif" }}>{d.label}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{d.count} · {d.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;