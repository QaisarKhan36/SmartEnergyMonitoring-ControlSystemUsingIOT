import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import useDashboard from "../context/useDashboard";
import { analytics } from "../services/api";

// ── Skeleton loader ───────────────────────────────────────────────
const Skeleton = ({ h = 180, r = 12 }) => (
  <div style={{ height: h, borderRadius: r, background: "linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
);

// ── Tooltip ───────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, unit = "W" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 13px", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", fontFamily:"'DM Sans',sans-serif" }}>
      <p style={{ fontSize:11, color:"#9ca3af", marginBottom:2 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:14, fontWeight:800, color:p.color||"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>
          {p.value?.toLocaleString()} <span style={{ fontSize:11, fontWeight:600 }}>{unit}</span>
        </p>
      ))}
    </div>
  );
};

const StatPill = ({ label, value, unit, sub, color="#f59e0b", icon }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", gap:4 }}>
    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ fontSize:11.5, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'Outfit',sans-serif" }}>{label}</span>
    </div>
    <div style={{ fontSize:30, fontWeight:900, color, fontFamily:"'Outfit',sans-serif", lineHeight:1 }}>
      {value}<span style={{ fontSize:14, fontWeight:600, marginLeft:3 }}>{unit}</span>
    </div>
    {sub && <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{sub}</div>}
  </div>
);

const SectionCard = ({ title, subtitle, children, action }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <div>
        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:active?"#fff":"transparent", color:active?"#f59e0b":"#6b7280", fontWeight:active?700:500, fontSize:12.5, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:active?"0 1px 3px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>{label}</button>
);

// ═══════════════════════════════════════════════════════════════
const Analytics = () => {
  const { threshold } = useDashboard();

  const [chartRange,  setChartRange]  = useState("Weekly");
  const [peakView,    setPeakView]    = useState("Today");

  // ── API data ─────────────────────────────────────────────────
  const [weekly,      setWeekly]      = useState([]);
  const [monthly,     setMonthly]     = useState([]);
  const [hourly,      setHourly]      = useState([]);
  const [breakdown,   setBreakdown]   = useState([]);
  const [comparison,  setComparison]  = useState([]);
  const [breaches,    setBreaches]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [w, m, h, b, c, br] = await Promise.all([
          analytics.weekly(),
          analytics.monthly(),
          analytics.hourly(),
          analytics.breakdown(),
          analytics.comparison(),
          analytics.breaches(),
        ]);
        setWeekly(w.data     || []);
        setMonthly(m.data    || []);
        setHourly(h.data     || []);
        setBreakdown(b.data  || []);
        setComparison(c.data || []);
        setBreaches(br.data  || []);
      } catch (err) {
        console.error("[Analytics] load failed:", err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartSource = chartRange === "Weekly" ? weekly : monthly;
  const chartKey    = chartRange === "Weekly" ? "day" : "month";

  // Derived KPI pills from real data
  const thisMonth   = comparison.find(c => c.label === "This Month");
  const lastMonth   = comparison.find(c => c.label === "Last Month");
  const peakW       = weekly.length ? Math.max(...weekly.map(d => d.peak || 0)) : 0;
  const co2Kg       = thisMonth ? +(thisMonth.kwh * 0.45).toFixed(0) : 0;
  const budgetPct   = thisMonth ? Math.round((thisMonth.cost / 90) * 100) : 0;

  const now = new Date();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ padding:"22px 24px 36px", display:"flex", flexDirection:"column", gap:20, fontFamily:"'DM Sans',sans-serif", background:"#eef1f8", minHeight:"100vh" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:24, color:"#0f1f5c", margin:0 }}>Analytics</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Energy insights — {monthLabel}</p>
        </div>
        <div style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"8px 14px", fontSize:12.5, color:"#374151", fontWeight:500, display:"flex", alignItems:"center", gap:6 }}>
          <span>📅</span> {monthLabel}
        </div>
      </div>

      {/* KPI pills */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[0,1,2,3].map(i => <Skeleton key={i} h={100} />)}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          <StatPill icon="⚡" label="Total This Month"  value={thisMonth?.kwh?.toFixed(0) || "0"} unit="kWh"
            sub={lastMonth ? `↑ ${comparison[0]?.change ?? 0}% vs last month` : "No prior data"} color="#f59e0b" />
          <StatPill icon="💰" label="Cost This Month"   value={`$${thisMonth?.cost?.toFixed(2) || "0"}`} unit=""
            sub={`Budget: $90 (${budgetPct}% used)`} color="#16a34a" />
          <StatPill icon="📈" label="Peak Demand"       value={peakW.toLocaleString()} unit="W"
            sub="Highest this week" color="#2563eb" />
          <StatPill icon="🌿" label="CO₂ Equivalent"    value={co2Kg} unit="kg"
            sub="≈ trees/month offset needed" color="#059669" />
        </div>
      )}

      {/* Comparison cards */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {[0,1,2,3].map(i => <Skeleton key={i} h={90} />)}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {comparison.map((c, i) => (
            <div key={i} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid rgba(0,0,0,0.04)", animation:`fadeUp 0.4s ${i*0.06}s both` }}>
              <p style={{ fontSize:11, fontWeight:600, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px", margin:"0 0 8px", fontFamily:"'Outfit',sans-serif" }}>{c.label}</p>
              <p style={{ fontSize:22, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:"0 0 2px" }}>{c.kwh} <span style={{ fontSize:12, fontWeight:600, color:"#9ca3af" }}>kWh</span></p>
              <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>${c.cost}</p>
              {c.change != null && (
                <span style={{ display:"inline-block", marginTop:8, fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:6, background:c.change>0?"#fef2f2":"#f0fdf4", color:c.change>0?"#dc2626":"#16a34a" }}>
                  {c.change > 0 ? "↑" : "↓"} {Math.abs(c.change)}% vs prev
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:16 }}>
        <SectionCard title="Energy Usage & Cost" subtitle="kWh consumed and estimated cost"
          action={
            <div style={{ display:"flex", background:"#f3f4f6", borderRadius:10, padding:3, gap:2 }}>
              {["Weekly","Monthly"].map(t => <TabBtn key={t} label={t} active={chartRange===t} onClick={() => setChartRange(t)} />)}
            </div>
          }>
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartSource} margin={{ top:5,right:5,left:-15,bottom:0 }} barGap={4}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey={chartKey} tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="kWh" />} cursor={{ fill:"rgba(245,158,11,0.05)" }} />
                <Bar dataKey="kwh"  fill="#f59e0b" radius={[6,6,0,0]} maxBarSize={36} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[6,6,0,0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:"flex", gap:16, marginTop:10 }}>
            {[["#f59e0b","Energy (kWh)"],["#3b82f6","Cost ($)"]].map(([color,label]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#6b7280" }}>
                <span style={{ width:10,height:10,borderRadius:3,background:color,display:"inline-block" }} />{label}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="By Device" subtitle="Usage share this month">
          {loading ? <Skeleton h={160} /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={breakdown} dataKey="kwh" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v} kWh`]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:8 }}>
                {breakdown.map((d, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:10,height:10,borderRadius:3,background:d.color,flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:12.5, color:"#374151", fontWeight:500 }}>{d.name}</span>
                    <span style={{ fontSize:12, color:"#9ca3af" }}>{d.kwh} kWh</span>
                    <span style={{ fontSize:11, fontWeight:700, color:d.color, minWidth:34, textAlign:"right" }}>{d.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Peak hours + Trend row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <SectionCard title="Peak Hour Analysis" subtitle="Average power draw by hour"
          action={
            <div style={{ display:"flex", background:"#f3f4f6", borderRadius:10, padding:3, gap:2 }}>
              {["Today","7-Day Avg"].map(t => <TabBtn key={t} label={t} active={peakView===t} onClick={() => setPeakView(t)} />)}
            </div>
          }>
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={hourly} margin={{ top:5,right:5,left:-15,bottom:0 }}>
                <defs>
                  <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}W`} width={48} />
                <Tooltip content={<ChartTooltip unit="W" />} />
                <Area type="monotone" dataKey="w" stroke="#3b82f6" strokeWidth={2} fill="url(#peakGrad)" dot={{ r:3, fill:"#3b82f6", strokeWidth:2, stroke:"white" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div style={{ marginTop:12, background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:10, padding:"10px 13px", display:"flex", gap:8, alignItems:"flex-start" }}>
            <span style={{ fontSize:16 }}>💡</span>
            <div>
              <p style={{ fontSize:12.5, fontWeight:600, color:"#1e40af", margin:0 }}>Saving Tip</p>
              <p style={{ fontSize:12, color:"#3b82f6", margin:"2px 0 0", lineHeight:1.4 }}>Shifting heavy loads from 12PM–2PM to after 9PM could save ~$8/month.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="6-Month Trend" subtitle="Monthly consumption history">
          {loading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthly} margin={{ top:5,right:5,left:-15,bottom:0 }}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip unit="kWh" />} />
                <Line type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={2.5}
                  dot={{ r:4, fill:"#f59e0b", strokeWidth:2, stroke:"white" }}
                  activeDot={{ r:6, fill:"#f59e0b", stroke:"white", strokeWidth:2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {!loading && monthly.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:14 }}>
              {[
                { label:"Average", value:`${(monthly.reduce((s,m)=>s+m.kwh,0)/monthly.length).toFixed(0)} kWh` },
                { label:"Highest", value:`${Math.max(...monthly.map(m=>m.kwh)).toFixed(0)} kWh` },
                { label:"Lowest",  value:`${Math.min(...monthly.map(m=>m.kwh)).toFixed(0)} kWh` },
              ].map(s => (
                <div key={s.label} style={{ background:"#f9fafb", borderRadius:10, padding:"10px 12px", textAlign:"center", border:"1px solid #f3f4f6" }}>
                  <p style={{ fontSize:10.5, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>{s.label}</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Threshold breach log */}
      <SectionCard title="Threshold Breach Log" subtitle={`Limit: ${threshold.toLocaleString()} W`}>
        {loading ? <Skeleton h={120} /> : breaches.length === 0 ? (
          <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"24px 0" }}>No threshold breaches recorded.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {breaches.slice(0, 6).map((row, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px", padding:"11px 4px", borderBottom:i<breaches.length-1?"1px solid #f3f4f6":"none", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{row.time}</span>
                <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>{row.peak}</span>
                <span style={{ fontSize:11.5, fontWeight:700, color:"#dc2626", background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:6, padding:"2px 8px", textAlign:"center" }}>{row.over}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default Analytics;
