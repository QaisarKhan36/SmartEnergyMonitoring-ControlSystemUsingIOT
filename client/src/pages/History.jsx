import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

/* ── Seed history data ── */
const EVENT_TYPES = ["Device On", "Device Off", "Threshold Breach", "Alert Cleared", "Relay Toggle", "Schedule Triggered", "Firmware Update"];
const DEVICES_LIST = ["Home Main", "Kitchen Outlet", "HVAC System", "Smart TV", "Office Lamp"];
const TYPE_META = {
  "Device On":          { icon:"🟢", color:"#22c55e", bg:"#f0fdf4" },
  "Device Off":         { icon:"🔴", color:"#ef4444", bg:"#fef2f2" },
  "Threshold Breach":   { icon:"⚠️", color:"#f59e0b", bg:"#fffbeb" },
  "Alert Cleared":      { icon:"✅", color:"#16a34a", bg:"#f0fdf4" },
  "Relay Toggle":       { icon:"🔄", color:"#3b82f6", bg:"#eff6ff" },
  "Schedule Triggered": { icon:"🕐", color:"#8b5cf6", bg:"#f5f3ff" },
  "Firmware Update":    { icon:"📦", color:"#6366f1", bg:"#eef2ff" },
};

const HISTORY_DATA = [
  { id:1,  ts:"2025-01-20 14:25", type:"Threshold Breach",   device:"Home Main",    detail:"Power reached 1,146W — exceeded 1,000W limit", value:"1,146 W" },
  { id:2,  ts:"2025-01-20 14:00", type:"Alert Cleared",      device:"System",       detail:"All alerts acknowledged by user",               value:""        },
  { id:3,  ts:"2025-01-20 09:12", type:"Schedule Triggered", device:"Home Main",    detail:"Morning Routine schedule started Relay 1",       value:"ON"      },
  { id:4,  ts:"2025-01-20 06:00", type:"Relay Toggle",       device:"Home Main",    detail:"Relay 2 turned off via schedule",                value:"OFF"     },
  { id:5,  ts:"2025-01-19 22:30", type:"Device Off",         device:"Smart TV",     detail:"Device powered off",                            value:""        },
  { id:6,  ts:"2025-01-19 18:45", type:"Device On",          device:"HVAC System",  detail:"HVAC System turned on, 1,800W",                  value:"1,800 W" },
  { id:7,  ts:"2025-01-19 13:10", type:"Threshold Breach",   device:"Home Main",    detail:"Power reached 1,280W — exceeded 1,000W limit",  value:"1,280 W" },
  { id:8,  ts:"2025-01-19 09:00", type:"Schedule Triggered", device:"Kitchen Outlet",detail:"Work Hours schedule activated",                 value:"ON"      },
  { id:9,  ts:"2025-01-18 22:00", type:"Relay Toggle",       device:"Home Main",    detail:"Relay 3 toggled manually",                      value:"ON"      },
  { id:10, ts:"2025-01-18 15:45", type:"Threshold Breach",   device:"Home Main",    detail:"Power reached 1,150W — exceeded limit",          value:"1,150 W" },
  { id:11, ts:"2025-01-18 11:20", type:"Device On",          device:"Office Lamp",  detail:"Office Lamp turned on",                          value:"60 W"    },
  { id:12, ts:"2025-01-17 20:15", type:"Firmware Update",    device:"System",       detail:"SmartEnergy firmware updated to v2.4.1",         value:"v2.4.1"  },
  { id:13, ts:"2025-01-17 14:00", type:"Device Off",         device:"HVAC System",  detail:"HVAC System powered off by schedule",            value:""        },
  { id:14, ts:"2025-01-17 08:30", type:"Schedule Triggered", device:"Home Main",    detail:"Morning Routine schedule — all relays on",       value:"ON"      },
  { id:15, ts:"2025-01-16 18:00", type:"Alert Cleared",      device:"System",       detail:"Daily alert summary cleared",                    value:""        },
  { id:16, ts:"2025-01-16 12:00", type:"Threshold Breach",   device:"Home Main",    detail:"Highest power event — 1,410W",                   value:"1,410 W" },
  { id:17, ts:"2025-01-15 09:00", type:"Device On",          device:"Smart TV",     detail:"Smart TV powered on",                            value:"120 W"   },
  { id:18, ts:"2025-01-14 22:00", type:"Relay Toggle",       device:"Kitchen Outlet",detail:"Kitchen relay toggled off",                     value:"OFF"     },
  { id:19, ts:"2025-01-14 17:30", type:"Firmware Update",    device:"Home Main",    detail:"Home Main controller updated to v2.4.0",         value:"v2.4.0"  },
  { id:20, ts:"2025-01-13 11:00", type:"Schedule Triggered", device:"Home Main",    detail:"Work Hours schedule activated",                  value:"ON"      },
];

const CHART_DATA = [
  { date:"Jan 13", events:3, breaches:0 },
  { date:"Jan 14", events:4, breaches:0 },
  { date:"Jan 15", events:2, breaches:0 },
  { date:"Jan 16", events:3, breaches:1 },
  { date:"Jan 17", events:4, breaches:0 },
  { date:"Jan 18", events:4, breaches:1 },
  { date:"Jan 19", events:4, breaches:1 },
  { date:"Jan 20", events:3, breaches:1 },
];

/* ════════════════════════════
   HISTORY PAGE
════════════════════════════ */
const History = () => {
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [devFilter,  setDevFilter]  = useState("All");
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 8;

  const allTypes   = ["All", ...EVENT_TYPES];
  const allDevices = ["All", ...DEVICES_LIST];

  const filtered = useMemo(() => HISTORY_DATA.filter(e => {
    const s = search.toLowerCase();
    return (
      (typeFilter === "All" || e.type === typeFilter) &&
      (devFilter  === "All" || e.device === devFilter) &&
      (e.detail.toLowerCase().includes(s) || e.device.toLowerCase().includes(s) || e.type.toLowerCase().includes(s))
    );
  }), [search, typeFilter, devFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const summary = {
    total:    HISTORY_DATA.length,
    breaches: HISTORY_DATA.filter(e => e.type === "Threshold Breach").length,
    today:    HISTORY_DATA.filter(e => e.ts.startsWith("2025-01-20")).length,
    devices:  new Set(HISTORY_DATA.map(e => e.device)).size,
  };

  const handleExport = () => {
    const csv = ["ID,Timestamp,Type,Device,Detail,Value",
      ...filtered.map(e => `${e.id},"${e.ts}","${e.type}","${e.device}","${e.detail}","${e.value}"`)
    ].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="history.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>History</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Full event log — device activity & system events</p>
        </div>
        <button onClick={handleExport} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 14px rgba(34,197,94,0.35)" }}>
          ⬇️ Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { icon:"📋", lbl:"Total Events",   val:summary.total,    color:"#0a1628" },
          { icon:"📅", lbl:"Today",          val:summary.today,    color:"#3b82f6" },
          { icon:"⚠️", lbl:"Breaches",       val:summary.breaches, color:"#f59e0b" },
          { icon:"🖥️", lbl:"Devices Logged", val:summary.devices,  color:"#22c55e" },
        ].map((p,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid rgba(0,0,0,0.04)", animation:`fadeUp 0.4s ${i*0.07}s both` }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <span style={{ fontSize:17 }}>{p.icon}</span>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'Outfit',sans-serif" }}>{p.lbl}</span>
            </div>
            <p style={{ fontSize:28, fontWeight:900, color:p.color, fontFamily:"'Outfit',sans-serif", margin:0 }}>{p.val}</p>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 16px" }}>Event Activity (Last 8 Days)</h3>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={CHART_DATA} margin={{ top:5, right:5, left:-15, bottom:0 }}>
            <defs>
              <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="brGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:10, border:"1px solid #e5e7eb", fontFamily:"'DM Sans',sans-serif", fontSize:12 }} />
            <Area type="monotone" dataKey="events"   stroke="#3b82f6" strokeWidth={2} fill="url(#evGrad)" />
            <Area type="monotone" dataKey="breaches" stroke="#f59e0b" strokeWidth={2} fill="url(#brGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:16, marginTop:8 }}>
          {[["#3b82f6","Events"],["#f59e0b","Breaches"]].map(([c,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#6b7280" }}>
              <span style={{ width:10, height:10, borderRadius:3, background:c, display:"inline-block" }} />{l}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:13 }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…"
            style={{ padding:"8px 12px 8px 32px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff", width:220 }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          style={{ padding:"8px 13px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff", cursor:"pointer" }}>
          {allTypes.map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
        </select>
        <select value={devFilter} onChange={e => { setDevFilter(e.target.value); setPage(1); }}
          style={{ padding:"8px 13px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff", cursor:"pointer" }}>
          {allDevices.map(d => <option key={d} value={d}>{d === "All" ? "All Devices" : d}</option>)}
        </select>
        {(search || typeFilter !== "All" || devFilter !== "All") && (
          <button onClick={() => { setSearch(""); setTypeFilter("All"); setDevFilter("All"); setPage(1); }}
            style={{ padding:"8px 14px", borderRadius:10, border:"none", background:"#fef2f2", color:"#ef4444", fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            ✕ Clear
          </button>
        )}
        <span style={{ fontSize:12.5, color:"#9ca3af", marginLeft:"auto" }}>{filtered.length} events</span>
      </div>

      {/* Event log */}
      <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
        {paged.length === 0 ? (
          <div style={{ padding:"60px 0", textAlign:"center", color:"#9ca3af" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <p style={{ fontSize:15, fontWeight:600, margin:0 }}>No events found</p>
          </div>
        ) : (
          paged.map((ev, i) => {
            const meta = TYPE_META[ev.type] || { icon:"📌", color:"#9ca3af", bg:"#f3f4f6" };
            return (
              <div key={ev.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"15px 22px", borderBottom:i<paged.length-1?"1px solid #f9fafb":"none", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {/* Icon */}
                <div style={{ width:36, height:36, borderRadius:10, background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{meta.icon}</div>

                {/* Content */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:5, background:meta.bg, color:meta.color, fontFamily:"'Outfit',sans-serif" }}>{ev.type}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{ev.device}</span>
                    {ev.value && <span style={{ fontSize:11.5, fontWeight:700, color:meta.color, background:meta.bg, padding:"1px 7px", borderRadius:5, marginLeft:"auto", fontFamily:"'Outfit',sans-serif" }}>{ev.value}</span>}
                  </div>
                  <p style={{ fontSize:13, color:"#6b7280", margin:0, lineHeight:1.4 }}>{ev.detail}</p>
                </div>

                {/* Timestamp */}
                <span style={{ fontSize:11.5, color:"#9ca3af", flexShrink:0, whiteSpace:"nowrap" }}>{ev.ts.split(" ")[1]}<br /><span style={{ fontSize:10.5 }}>{ev.ts.split(" ")[0]}</span></span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:"flex", justifyContent:"center", gap:6, alignItems:"center" }}>
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #e5e7eb", background:page===1?"#f9fafb":"#fff", color:page===1?"#d1d5db":"#374151", fontSize:13, fontWeight:600, cursor:page===1?"default":"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Prev</button>
          {Array.from({length:totalPages},(_,i)=>i+1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ width:34, height:34, borderRadius:9, border:"none", background:page===n?"#0a1628":"#fff", color:page===n?"#fff":"#374151", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #e5e7eb", background:page===totalPages?"#f9fafb":"#fff", color:page===totalPages?"#d1d5db":"#374151", fontSize:13, fontWeight:600, cursor:page===totalPages?"default":"pointer", fontFamily:"'DM Sans',sans-serif" }}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default History;