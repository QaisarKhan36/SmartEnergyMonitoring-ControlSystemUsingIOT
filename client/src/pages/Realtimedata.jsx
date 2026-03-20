// src/pages/Realtimedata.jsx  — STEP 5 WIRED VERSION
// Changes from original:
//   • Removed jitter() simulator and setInterval
//   • Connected to real VMC WebSocket via connectWS from api.js
//   • Pausing disconnects from WS, resuming reconnects
//   • Everything else (gauges, sparklines, table) is unchanged

import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import useDashboard from "../context/useDashboard";
import { connectWS } from "../services/api";

// ── Gauge component (unchanged) ────────────────────────────────────
const RadialGauge = ({ value, min, max, unit, label, color, size = 140 }) => {
  const pct   = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const angle = -135 + pct * 270;
  const R = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;

  const arcPath = (startDeg, endDeg, r) => {
    const toRad = d => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const needleRad = (angle * Math.PI) / 180;
  const nx = cx + (R - 8) * Math.cos(needleRad);
  const ny = cy + (R - 8) * Math.sin(needleRad);

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <path d={arcPath(-135, 135, R)} fill="none" stroke="#e5e7eb" strokeWidth={8} strokeLinecap="round" />
      <path d={arcPath(-135, -135 + pct * 270, R)} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}60)`, transition: "all 0.4s ease" }} />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round"
        style={{ transformOrigin: `${cx}px ${cy}px`, transition: "all 0.4s ease" }} />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={18} fontWeight={800} fill="#111827" fontFamily="'Outfit',sans-serif">
        {typeof value === "number" ? value.toLocaleString() : value}
      </text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontSize={10} fill="#9ca3af" fontFamily="'DM Sans',sans-serif">{unit}</text>
      <text x={cx} y={cy - R + 2} textAnchor="middle" fontSize={10} fontWeight={700} fill={color} fontFamily="'Outfit',sans-serif">{label}</text>
    </svg>
  );
};

// ── MetricCard with sparkline (unchanged) ──────────────────────────
const MetricCard = ({ label, value, unit, prev, color, data, dataKey, icon, min, max }) => {
  const delta = prev ? value - prev : 0;
  const up    = delta >= 0;
  return (
    <div style={{ background:"#fff", borderRadius:18, padding:"20px 20px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:`1px solid ${color}18`, overflow:"hidden", position:"relative" }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 6px 24px ${color}18`}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)"}
    >
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color, opacity:0.7, borderRadius:"18px 18px 0 0" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
            <span style={{ fontSize:20 }}>{icon}</span>
            <span style={{ fontSize:11.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'Outfit',sans-serif" }}>{label}</span>
          </div>
          <div style={{ fontSize:32, fontWeight:900, color:"#111827", fontFamily:"'Outfit',sans-serif", lineHeight:1 }}>
            {typeof value === "number" ? value.toLocaleString() : value}
            <span style={{ fontSize:14, fontWeight:600, color:"#9ca3af", marginLeft:4 }}>{unit}</span>
          </div>
        </div>
        <div style={{ background: up ? "#f0fdf4" : "#fef2f2", padding:"4px 10px", borderRadius:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color: up ? "#16a34a" : "#dc2626" }}>
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
          </span>
        </div>
      </div>
      <div style={{ height:4, background:"#f3f4f6", borderRadius:999, marginBottom:10, overflow:"hidden" }}>
        <div style={{ height:"100%", background:color, borderRadius:999, width:`${Math.min(((value-min)/(max-min))*100,100)}%`, transition:"width 0.5s ease" }} />
      </div>
      <ResponsiveContainer width="100%" height={52}>
        <AreaChart data={data.slice(-20)} margin={{ top:2, right:0, left:0, bottom:0 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#spark-${dataKey})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ── Waveform card (unchanged) ──────────────────────────────────────
const WaveformCard = ({ data, color, label }) => (
  <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>{label}</h3>
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"#f0fdf4", padding:"4px 10px", borderRadius:8 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:"#22c55e", animation:"livePulse 1.8s ease-in-out infinite" }} />
        <span style={{ fontSize:11.5, fontWeight:700, color:"#16a34a", fontFamily:"'Outfit',sans-serif" }}>LIVE</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={130}>
      <LineChart data={data} margin={{ top:5, right:5, left:-20, bottom:0 }}>
        <CartesianGrid stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius:10, border:"1px solid #e5e7eb", fontFamily:"'DM Sans',sans-serif", fontSize:12 }} />
        <Line type="monotone" dataKey="power" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// ── QualityMeter (unchanged) ───────────────────────────────────────
const QualityMeter = ({ pf, freq }) => {
  const quality = pf > 0.95 && Math.abs(freq - 50) < 0.1 ? "Excellent" : pf > 0.9 ? "Good" : "Fair";
  const qColor  = quality === "Excellent" ? "#16a34a" : quality === "Good" ? "#f59e0b" : "#ef4444";
  const qBg     = quality === "Excellent" ? "#f0fdf4" : quality === "Good" ? "#fffbeb" : "#fef2f2";
  return (
    <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
      <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 16px" }}>Power Quality</h3>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
        <div style={{ background:qBg, border:`1.5px solid ${qColor}40`, borderRadius:14, padding:"12px 20px", flex:1, textAlign:"center" }}>
          <p style={{ fontSize:11, fontWeight:700, color:qColor, textTransform:"uppercase", letterSpacing:"0.6px", margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>Overall Quality</p>
          <p style={{ fontSize:22, fontWeight:900, color:qColor, fontFamily:"'Outfit',sans-serif", margin:0 }}>{quality}</p>
        </div>
      </div>
      {[
        { label:"Power Factor", value: pf.toFixed(3),          ideal:"1.000",    pct: pf*100,                       color:"#3b82f6" },
        { label:"Frequency",    value:`${freq.toFixed(2)} Hz`, ideal:"50.00 Hz", pct: (1-Math.abs(freq-50)/0.5)*100, color:"#22c55e" },
        { label:"THD (est.)",   value:"2.4%",                  ideal:"< 5%",     pct: 76,                            color:"#f59e0b" },
        { label:"Imbalance",    value:"0.8%",                  ideal:"< 2%",     pct: 90,                            color:"#8b5cf6" },
      ].map(m => (
        <div key={m.label} style={{ marginBottom:13 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12.5, fontWeight:600, color:"#374151" }}>{m.label}</span>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ fontSize:11.5, color:"#9ca3af" }}>Ideal: {m.ideal}</span>
              <span style={{ fontSize:13, fontWeight:800, color:m.color, fontFamily:"'Outfit',sans-serif" }}>{m.value}</span>
            </div>
          </div>
          <div style={{ height:6, background:"#f3f4f6", borderRadius:999, overflow:"hidden" }}>
            <div style={{ height:"100%", background:m.color, borderRadius:999, width:`${Math.max(0,Math.min(m.pct,100))}%`, transition:"width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Blank starting point ────────────────────────────────────────────
const BLANK = { t: 0, voltage: 220.5, current: 5.2, power: 1146, pf: 0.97, frequency: 50.0 };
const initHistory = () => Array.from({ length: 30 }, (_, i) => ({ ...BLANK, t: i }));

// ════════════════════════════════════════════════════════════════
const RealTimeData = () => {
  const { threshold, alertsEnabled } = useDashboard();
  const [history,     setHistory]     = useState(initHistory);
  const [paused,      setPaused]      = useState(false);
  const [intervalMs,  setIntervalMs]  = useState(1000);
  const [connected,   setConnected]   = useState(false);

  const wsRef   = useRef(null);
  const tickRef = useRef(30);

  // ── Connect / disconnect WebSocket based on paused state ─────────
  useEffect(() => {
    if (paused) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnected(false);
      return;
    }

    const ws = connectWS({
      onConnected: () => setConnected(true),
      onReading: (data) => {
        // Only use "home-main" readings for the main display
        // (you can extend this to per-device selection later)
        if (data.deviceId !== "home-main") return;
        tickRef.current += 1;
        const pt = {
          t:         tickRef.current,
          voltage:   data.voltage,
          current:   data.current,
          power:     data.power,
          pf:        data.powerFactor,
          frequency: data.frequency,
        };
        setHistory(h => [...h.slice(-59), pt]);
      },
    });

    wsRef.current = ws;
    // Mark connected after a moment (ws.onopen fires before onConnected callback)
    const timer = setTimeout(() => setConnected(true), 500);

    return () => {
      clearTimeout(timer);
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [paused]);

  const latest = history[history.length - 1];
  const prev   = history[history.length - 2];
  const overThreshold = latest.power > threshold;

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
        @keyframes alertPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Real-Time Data</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>
            Live VMC feed — {connected ? "connected" : "connecting…"}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          {/* Speed note — kept for visual parity; WS pushes at 2s fixed */}
          <div style={{ display:"flex", background:"#fff", borderRadius:11, padding:3, gap:2, border:"1.5px solid #e5e7eb" }}>
            {[[500,"0.5s"],[1000,"1s"],[2000,"2s"]].map(([ms,lbl]) => (
              <button key={ms} onClick={() => setIntervalMs(ms)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:intervalMs===ms?"#0a1628":"transparent", color:intervalMs===ms?"#fff":"#9ca3af", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>{lbl}</button>
            ))}
          </div>
          <button onClick={() => setPaused(p => !p)} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:11, border:"none", background: paused ? "#22c55e" : "#ef4444", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow: paused ? "0 4px 14px rgba(34,197,94,0.35)" : "0 4px 14px rgba(239,68,68,0.35)", transition:"all 0.2s" }}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* Threshold alert */}
      {overThreshold && alertsEnabled && (
        <div style={{ background:"linear-gradient(135deg,#fef2f2,#fff5f5)", border:"1.5px solid #fca5a5", borderRadius:14, padding:"12px 18px", display:"flex", alignItems:"center", gap:12, animation:"alertPulse 2s ease-in-out infinite" }}>
          <span style={{ fontSize:22 }}>🚨</span>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:800, color:"#dc2626", fontFamily:"'Outfit',sans-serif", margin:0 }}>Threshold Exceeded</p>
            <p style={{ fontSize:12.5, color:"#ef4444", margin:"2px 0 0" }}>
              Current power {latest.power.toFixed(0)}W exceeds limit of {threshold.toLocaleString()}W
            </p>
          </div>
          <span style={{ fontSize:20, fontWeight:900, color:"#dc2626", fontFamily:"'Outfit',sans-serif" }}>+{(latest.power - threshold).toFixed(0)}W</span>
        </div>
      )}

      {/* Gauges */}
      <div style={{ background:"#fff", borderRadius:20, padding:"24px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>Live Gauges</h3>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: paused ? "#9ca3af" : "#22c55e", animation: paused ? "none" : "livePulse 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize:12, fontWeight:700, color: paused ? "#9ca3af" : "#16a34a", fontFamily:"'Outfit',sans-serif" }}>{paused ? "PAUSED" : "LIVE"}</span>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center", flexWrap:"wrap", gap:20 }}>
          <RadialGauge value={latest.voltage}   min={200} max={240}  unit="V"   label="Voltage"    color="#f59e0b" size={150} />
          <RadialGauge value={latest.current}   min={0}   max={16}   unit="A"   label="Current"    color="#3b82f6" size={150} />
          <RadialGauge value={latest.power}     min={0}   max={3500} unit="W"   label="Power"      color="#ef4444" size={150} />
          <RadialGauge value={latest.pf}        min={0}   max={1}    unit="PF"  label="Pwr Factor" color="#22c55e" size={150} />
          <RadialGauge value={latest.frequency} min={49}  max={51}   unit="Hz"  label="Frequency"  color="#8b5cf6" size={150} />
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
        {[
          { label:"Voltage",   value:latest.voltage,   prev:prev?.voltage,   unit:"V",  color:"#f59e0b", dataKey:"voltage",   icon:"⚡", min:200, max:240 },
          { label:"Current",   value:latest.current,   prev:prev?.current,   unit:"A",  color:"#3b82f6", dataKey:"current",   icon:"🔄", min:0,   max:16 },
          { label:"Power",     value:latest.power,     prev:prev?.power,     unit:"W",  color:"#ef4444", dataKey:"power",     icon:"💡", min:0,   max:3500 },
          { label:"Frequency", value:latest.frequency, prev:prev?.frequency, unit:"Hz", color:"#8b5cf6", dataKey:"frequency", icon:"📡", min:49,  max:51 },
        ].map(m => <MetricCard key={m.label} {...m} data={history} />)}
      </div>

      {/* Waveform + Quality */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:16 }}>
        <WaveformCard data={history} color="#f59e0b" label="Power Waveform (W)" />
        <QualityMeter pf={latest.pf} freq={latest.frequency} />
      </div>

      {/* Log table */}
      <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>Recent Readings</h3>
          <span style={{ fontSize:12, color:"#9ca3af" }}>Last {Math.min(history.length, 10)} samples</span>
        </div>
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", padding:"10px 22px", background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
            {["#","Voltage (V)","Current (A)","Power (W)","Frequency (Hz)"].map(h => (
              <span key={h} style={{ fontSize:11.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Outfit',sans-serif" }}>{h}</span>
            ))}
          </div>
          {[...history].reverse().slice(0, 10).map((row, i) => (
            <div key={row.t} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", padding:"11px 22px", borderBottom:i<9?"1px solid #f9fafb":"none", background: row.power > threshold ? "#fef9f0" : "transparent" }}
              onMouseEnter={e=>e.currentTarget.style.background=row.power>threshold?"#fef3e2":"#f9fafb"}
              onMouseLeave={e=>e.currentTarget.style.background=row.power>threshold?"#fef9f0":"transparent"}
            >
              <span style={{ fontSize:12.5, color:"#9ca3af" }}>#{row.t}</span>
              <span style={{ fontSize:13, fontWeight:600, color:"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>{row.voltage}</span>
              <span style={{ fontSize:13, fontWeight:600, color:"#3b82f6", fontFamily:"'Outfit',sans-serif" }}>{row.current}</span>
              <span style={{ fontSize:13, fontWeight:600, color: row.power > threshold ? "#ef4444" : "#111827", fontFamily:"'Outfit',sans-serif" }}>
                {row.power?.toFixed(0)}{row.power > threshold && " ⚠️"}
              </span>
              <span style={{ fontSize:13, fontWeight:600, color:"#8b5cf6", fontFamily:"'Outfit',sans-serif" }}>{row.frequency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeData;
