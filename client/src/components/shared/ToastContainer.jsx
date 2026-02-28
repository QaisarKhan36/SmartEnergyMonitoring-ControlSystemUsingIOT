import React from "react";
import useDashboard from "../../context/useDashboard";

const icons = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

const colors = {
  success: { bg: "#f0fdf4", border: "#86efac", icon: "#16a34a", text: "#166534" },
  error:   { bg: "#fef2f2", border: "#fca5a5", icon: "#dc2626", text: "#991b1b" },
  warning: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706", text: "#92400e" },
  info:    { bg: "#eff6ff", border: "#93c5fd", icon: "#2563eb", text: "#1e40af" },
};

const ToastContainer = () => {
  const { toasts } = useDashboard();

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {toasts.map(t => {
        const c = colors[t.variant] || colors.info;
        return (
          <div key={t.id} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: c.bg,
            border: `1.5px solid ${c.border}`,
            borderRadius: 12,
            padding: "11px 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: 260,
            animation: "toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            fontFamily: "'DM Sans', sans-serif",
            pointerEvents: "all",
          }}>
            <span style={{
              width: 22, height: 22,
              borderRadius: "50%",
              background: c.icon,
              color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800,
              flexShrink: 0,
            }}>{icons[t.variant] || icons.info}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{t.msg}</span>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(30px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;