import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

const SCENES = [
  { id: "away",    icon: "🏃", name: "Away Mode",      desc: "Turn off all non-essential devices",    color: "#3b82f6" },
  { id: "sleep",   icon: "🌙", name: "Sleep Mode",     desc: "Minimal power — bedroom only",          color: "#8b5cf6" },
  { id: "home",    icon: "🏠", name: "Home Mode",      desc: "Full house — all devices active",       color: "#22c55e" },
  { id: "eco",     icon: "🌿", name: "Eco Mode",       desc: "Reduce consumption by ~40%",            color: "#059669" },
  { id: "entertain","icon": "🎉", name: "Entertain",   desc: "Living room & kitchen at full power",   color: "#f59e0b" },
  { id: "work",    icon: "💼", name: "Work Mode",      desc: "Office devices only",                   color: "#0ea5e9" },
];

const QUICK_ACTIONS = [
  { icon: "💡", label: "All Lights Off",   action: "lights_off",   color: "#f59e0b" },
  { icon: "❄️", label: "HVAC Off",         action: "hvac_off",     color: "#0ea5e9" },
  { icon: "🔌", label: "All Off",          action: "all_off",      color: "#ef4444" },
  { icon: "✅", label: "All On",           action: "all_on",       color: "#22c55e" },
  { icon: "🔄", label: "Restart All",      action: "restart",      color: "#6366f1" },
  { icon: "📊", label: "Save State",       action: "save_state",   color: "#8b5cf6" },
];

const SliderControl = ({ label, icon, value, onChange, min, max, unit, color }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "18px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", fontFamily: "'Outfit', sans-serif" }}>{label}</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 900, color, fontFamily: "'Outfit', sans-serif" }}>
        {value}<span style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginLeft: 2 }}>{unit}</span>
      </span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={e => onChange(+e.target.value)}
      style={{ width: "100%", accentColor: color, cursor: "pointer", height: 6 }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
      <span style={{ fontSize: 11, color: "#9ca3af" }}>{min}{unit}</span>
      <span style={{ fontSize: 11, color: "#9ca3af" }}>{max}{unit}</span>
    </div>
  </div>
);

/* ════════════════════════════
   CONTROL PAGE
════════════════════════════ */
const Control = () => {
  const { devices, toggleDevice, toggleRelay, addToast } = useDashboard();

  const [activeScene, setActiveScene] = useState(null);
  const [brightness,  setBrightness]  = useState(80);
  const [hvacTemp,    setHvacTemp]    = useState(22);
  const [fanSpeed,    setFanSpeed]    = useState(60);

  const handleScene = (scene) => {
    setActiveScene(scene.id);
    addToast(`"${scene.name}" scene activated`, "success");
  };

  const handleQuickAction = (action) => {
    const msgs = {
      lights_off: "All lights turned off",
      hvac_off:   "HVAC system stopped",
      all_off:    "All devices powered off",
      all_on:     "All devices powered on",
      restart:    "Restarting all devices…",
      save_state: "Current state saved",
    };
    addToast(msgs[action] || "Action executed", "success");
  };

  /* Live power total */
  const totalWatts = devices
    .filter(d => d.enabled)
    .reduce((sum, d) => sum + (d.id === "home-main" ? 1146 : 280), 0);

  return (
    <div style={{
      padding: "22px 24px 40px", display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif", background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 26, color: "#0a1628", margin: 0 }}>
          Control Panel
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
          Scenes, quick actions & device sliders — full manual control
        </p>
      </div>

      {/* Live status bar */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628, #1e3a8a)",
        borderRadius: 18, padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        animation: "fadeUp 0.4s both",
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>
            Live Consumption
          </p>
          <p style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif", margin: 0 }}>
            {totalWatts.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>W</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { label: "Devices On",   value: devices.filter(d => d.enabled).length },
            { label: "Total Devices",value: devices.length },
            { label: "Active Scene", value: activeScene ? SCENES.find(s => s.id === activeScene)?.name : "None" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif", margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 16px" }}>
          ⚡ Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.action}
              onClick={() => handleQuickAction(a.action)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                padding: "16px 12px", borderRadius: 14,
                border: `1.5px solid ${a.color}30`,
                background: a.color + "0f",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = a.color + "20"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = a.color + "0f"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span style={{ fontSize: 26 }}>{a.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: a.color, textAlign: "center", fontFamily: "'Outfit', sans-serif" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenes */}
      <div>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 12px" }}>
          🎬 Scenes
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {SCENES.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => handleScene(scene)}
              style={{
                display: "flex", alignItems: "center", gap: 13, padding: "16px 18px",
                borderRadius: 16,
                border: `2px solid ${activeScene === scene.id ? scene.color : "rgba(0,0,0,0.06)"}`,
                background: activeScene === scene.id ? scene.color + "15" : "#fff",
                cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                boxShadow: activeScene === scene.id ? `0 4px 16px ${scene.color}25` : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.2s",
                animation: `fadeUp 0.4s ${i * 0.06}s both`,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{
                width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                background: activeScene === scene.id ? scene.color + "25" : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                transition: "all 0.2s",
              }}>{scene.icon}</div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: activeScene === scene.id ? scene.color : "#111827", fontFamily: "'Outfit', sans-serif", margin: "0 0 2px" }}>{scene.name}</p>
                <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>{scene.desc}</p>
              </div>
              {activeScene === scene.id && (
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: scene.color, background: scene.color + "20", padding: "3px 9px", borderRadius: 6, flexShrink: 0, fontFamily: "'Outfit', sans-serif" }}>
                  ACTIVE
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders + Device toggles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>
            🎛️ Controls
          </h3>
          <SliderControl label="Brightness"    icon="💡" value={brightness} onChange={setBrightness} min={0}  max={100} unit="%" color="#f59e0b" />
          <SliderControl label="HVAC Setpoint" icon="❄️" value={hvacTemp}   onChange={setHvacTemp}   min={16} max={30}  unit="°C" color="#0ea5e9" />
          <SliderControl label="Fan Speed"     icon="🌀" value={fanSpeed}   onChange={setFanSpeed}   min={0}  max={100} unit="%" color="#22c55e" />
        </div>

        {/* Device toggles */}
        <div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 12px" }}>
            🔌 Device Toggles
          </h3>
          <div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
            {devices.map((device, i) => (
              <div key={device.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "15px 20px",
                borderBottom: i < devices.length - 1 ? "1px solid #f3f4f6" : "none",
                transition: "background 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: device.enabled ? "#fffbeb" : "#f3f4f6",
                    border: `1.5px solid ${device.enabled ? "#fde68a" : "#e5e7eb"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, transition: "all 0.2s",
                  }}>
                    {device.id === "home-main" ? "🏠" : "🍳"}
                  </div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", fontFamily: "'Outfit', sans-serif", margin: 0 }}>{device.name}</p>
                    <p style={{ fontSize: 11.5, color: device.enabled ? "#16a34a" : "#9ca3af", margin: "1px 0 0", fontWeight: 600 }}>
                      {device.enabled ? `● Online — ${device.id === "home-main" ? "1,146 W" : "280 W"}` : "○ Offline"}
                    </p>
                  </div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={device.enabled} onChange={() => {
                    toggleDevice(device.id);
                    addToast(`${device.name} turned ${device.enabled ? "OFF" : "ON"}`, device.enabled ? "warning" : "success");
                  }} />
                  <span className="slider" />
                </label>
              </div>
            ))}

            {/* Relay section for home-main */}
            {devices.find(d => d.id === "home-main")?.relays.map((relay, i) => (
              <div key={relay.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px 12px 52px",
                background: "#fafafa",
                borderTop: i === 0 ? "1px dashed #e5e7eb" : "none",
                transition: "background 0.15s",
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>{relay.label}</p>
                  <p style={{ fontSize: 11, color: relay.on ? "#16a34a" : "#9ca3af", margin: 0 }}>{relay.on ? "Active" : "Inactive"}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 5,
                    background: relay.on ? "#22c55e" : "#e5e7eb",
                    color: relay.on ? "#fff" : "#9ca3af",
                    fontFamily: "'Outfit', sans-serif",
                  }}>{relay.on ? "ON" : "OFF"}</span>
                  <label className="switch" style={{ transform: "scale(0.85)" }}>
                    <input type="checkbox" checked={relay.on} onChange={() => {
                      toggleRelay("home-main", relay.id);
                      addToast(`${relay.label} turned ${relay.on ? "OFF" : "ON"}`, relay.on ? "warning" : "success");
                    }} />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;