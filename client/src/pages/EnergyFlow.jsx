import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

/* ── Animated flow line ── */
const FlowLine = ({ from, to, active, color = "#f59e0b", value, reverse = false }) => {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;

  return (
    <g>
      {/* Base line */}
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke={active ? color : "#e5e7eb"}
        strokeWidth={active ? 2.5 : 1.5}
        strokeDasharray={active ? "none" : "4 4"}
        style={{ transition: "all 0.4s" }}
      />
      {/* Animated dots */}
      {active && [0, 1, 2].map(i => (
        <circle key={i} r={4} fill={color} opacity={0.9}>
          <animateMotion
            dur={`${1.4 + i * 0.15}s`}
            repeatCount="indefinite"
            begin={`${i * 0.45}s`}
          >
            <mpath href={`#path-${from.x}-${to.x}`} />
          </animateMotion>
        </circle>
      ))}
      {/* Hidden path for animateMotion */}
      <path
        id={`path-${from.x}-${to.x}`}
        d={`M${reverse ? to.x : from.x},${reverse ? to.y : from.y} L${reverse ? from.x : to.x},${reverse ? from.y : to.y}`}
        fill="none" stroke="none"
      />
      {/* Value label */}
      {value && (
        <foreignObject x={mx - 32} y={my - 13} width={64} height={26}>
          <div style={{
            background: color, color: "#fff",
            borderRadius: 6, padding: "2px 7px",
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            textAlign: "center", lineHeight: "22px",
            boxShadow: `0 2px 8px ${color}55`,
          }}>{value}</div>
        </foreignObject>
      )}
    </g>
  );
};

/* ── Node box ── */
const FlowNode = ({ x, y, icon, label, sublabel, color, active, power }) => (
  <foreignObject x={x - 56} y={y - 54} width={112} height={108}>
    <div style={{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: active ? "#fff" : "#f9fafb",
      border: `2px solid ${active ? color : "#e5e7eb"}`,
      borderRadius: 16,
      boxShadow: active ? `0 4px 20px ${color}30` : "0 1px 4px rgba(0,0,0,0.06)",
      transition: "all 0.4s",
      fontFamily: "'DM Sans', sans-serif",
      cursor: "default",
    }}>
      <span style={{ fontSize: 26, marginBottom: 3 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: active ? color : "#9ca3af", fontFamily: "'Outfit', sans-serif", lineHeight: 1.2, textAlign: "center" }}>{label}</span>
      {sublabel && <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 1 }}>{sublabel}</span>}
      {power && <span style={{ fontSize: 11, fontWeight: 800, color, marginTop: 3, fontFamily: "'Outfit', sans-serif" }}>{power}</span>}
    </div>
  </foreignObject>
);

/* ════════════════════════════
   ENERGY FLOW PAGE
════════════════════════════ */
const EnergyFlow = () => {
  const { devices } = useDashboard();
  
  const [gridPower] = useState(1146.6);
  const [solarPower, setSolarPower] = useState(0);
  const [solarEnabled, setSolarEnabled] = useState(false);


  const homeMain = devices.find(d => d.id === "home-main");
  const kitchen  = devices.find(d => d.id === "kitchen");

  const W = 720; const H = 440;

  // Node positions
  const grid    = { x: 100, y: 220 };
  const solar   = { x: 100, y: 100 };
  const home    = { x: W/2, y: 220 };
  const relay1  = { x: W - 100, y: 100 };
  const relay2  = { x: W - 100, y: 220 };
  const relay3  = { x: W - 100, y: 340 };

  const totalIn = gridPower + solarPower;
  const homePower = homeMain?.enabled ? (totalIn * 0.76).toFixed(0) : 0;
  const kitchenPower = kitchen?.enabled ? (totalIn * 0.24).toFixed(0) : 0;

  return (
    <div style={{
      padding: "22px 24px 36px",
      display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif",
      background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.92)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#0f1f5c", margin: 0 }}>
            Energy Flow
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            Live power distribution — real-time
          </p>
        </div>
        {/* Solar toggle */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "12px 18px",
          border: "1.5px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <span style={{ fontSize: 20 }}>☀️</span>
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Solar Panel</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{solarEnabled ? `${solarPower} W generating` : "Not connected"}</p>
          </div>
          <label className="switch" style={{ marginLeft: 8 }}>
            <input type="checkbox" checked={solarEnabled} onChange={e => {
              setSolarEnabled(e.target.checked);
              setSolarPower(e.target.checked ? 340 : 0);
            }} />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { icon: "🔌", label: "Grid Import",  value: `${gridPower.toLocaleString()} W`,  color: "#f59e0b" },
          { icon: "☀️", label: "Solar Input",  value: solarEnabled ? `${solarPower} W` : "— W", color: "#22c55e" },
          { icon: "🏠", label: "Home Consuming",value: `${totalIn.toLocaleString()} W`,   color: "#2563eb" },
          { icon: "♻️", label: "Efficiency",   value: solarEnabled ? "23%" : "0%",        color: "#059669" },
        ].map((p, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 14, padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
            animation: `fadeUp 0.4s ${i * 0.07}s both`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Outfit', sans-serif" }}>{p.label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, color: p.color, fontFamily: "'Outfit', sans-serif", margin: 0 }}>{p.value}</p>
          </div>
        ))}
      </div>

      {/* Flow diagram */}
      <div style={{
        background: "#fff", borderRadius: 20,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
        padding: 24, overflow: "hidden",
      }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: 440 }}>

          {/* Grid → Home */}
          <FlowLine from={grid} to={home} active color="#f59e0b" value={`${gridPower.toFixed(0)}W`} />

          {/* Solar → Home */}
          {solarEnabled && <FlowLine from={solar} to={home} active color="#22c55e" value={`${solarPower}W`} />}
          {!solarEnabled && <FlowLine from={solar} to={home} active={false} />}

          {/* Home → Relay 1 (Home Main) */}
          <FlowLine from={home} to={relay1} active={homeMain?.enabled} color="#3b82f6"
            value={homeMain?.enabled ? `${homePower}W` : null} />

          {/* Home → Kitchen */}
          <FlowLine from={home} to={relay2} active={kitchen?.enabled} color="#22c55e"
            value={kitchen?.enabled ? `${kitchenPower}W` : null} />

          {/* Home → Relay 3 (inactive) */}
          <FlowLine from={home} to={relay3} active={false} />

          {/* Nodes */}
          <FlowNode {...grid}   icon="🔌" label="Grid"        sublabel="Utility" color="#f59e0b" active power={`${gridPower.toFixed(0)}W`} />
          <FlowNode {...solar}  icon="☀️" label="Solar"       sublabel="Panel"   color="#22c55e" active={solarEnabled} power={solarEnabled ? `${solarPower}W` : "Off"} />
          <FlowNode {...home}   icon="🏠" label="Home Main"   sublabel="Panel"   color="#2563eb" active power={`${totalIn.toFixed(0)}W`} />
          <FlowNode {...relay1} icon="💡" label="Home Main"   sublabel={homeMain?.enabled ? "Living Room" : "Offline"} color="#3b82f6" active={homeMain?.enabled} power={homeMain?.enabled ? `${homePower}W` : "Off"} />
          <FlowNode {...relay2} icon="🍳" label="Kitchen"     sublabel={kitchen?.enabled ? "Online" : "Offline"}       color="#22c55e" active={kitchen?.enabled}  power={kitchen?.enabled ? `${kitchenPower}W` : "Off"} />
          <FlowNode {...relay3} icon="➕" label="Add Device"  sublabel="Slot 3"  color="#9ca3af" active={false} />

          {/* Live indicator */}
          <circle cx={W - 20} cy={20} r={6} fill="#22c55e">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <text x={W - 32} y={25} textAnchor="end" fontSize={11} fill="#16a34a" fontFamily="'Outfit', sans-serif" fontWeight={700}>LIVE</text>
        </svg>
      </div>

      {/* Relay status grid */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 16px" }}>
          Relay Power Distribution
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {(homeMain?.relays || []).map((r, i) => {
            const wattage = r.on ? [420, 280, 190, 260][i] : 0;
            return (
              <div key={r.id} style={{
                background: r.on ? "#fffbeb" : "#f9fafb",
                border: `1.5px solid ${r.on ? "#fde68a" : "#e5e7eb"}`,
                borderRadius: 12, padding: "13px 14px",
                transition: "all 0.3s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: r.on ? "#92400e" : "#9ca3af", fontFamily: "'Outfit', sans-serif" }}>{r.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
                    background: r.on ? "#22c55e" : "#e5e7eb",
                    color: r.on ? "#fff" : "#9ca3af",
                    fontFamily: "'Outfit', sans-serif",
                  }}>{r.on ? "ON" : "OFF"}</span>
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: r.on ? "#f59e0b" : "#d1d5db", fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                  {wattage} <span style={{ fontSize: 11, fontWeight: 600 }}>W</span>
                </p>
                {/* Mini bar */}
                <div style={{ background: "#e5e7eb", borderRadius: 4, height: 4, marginTop: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    background: r.on ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "#e5e7eb",
                    width: r.on ? `${(wattage / 500) * 100}%` : "0%",
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnergyFlow;