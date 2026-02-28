import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

let _uid = 50;
const nextUid = () => { _uid += 1; return _uid; };

const ROOMS = ["All Rooms", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Garage", "Office"];
const DEVICE_ICONS = ["🏠","🔌","💡","🍳","❄️","📺","🖥️","🔧","🚿","🎮"];
const ICON_COLORS  = { "🏠":"#f59e0b","🔌":"#3b82f6","💡":"#fbbf24","🍳":"#22c55e","❄️":"#0ea5e9","📺":"#8b5cf6","🖥️":"#6366f1","🔧":"#78716c","🚿":"#06b6d4","🎮":"#ec4899" };

const EXTRA_INIT = [
  { id:"hvac", name:"HVAC System", room:"Bedroom",     icon:"❄️", enabled:true,  online:true,  wattage:1800, voltage:220, current:"8.18", signal:92, firmware:"v3.1.2", relays:[] },
  { id:"tv",   name:"Smart TV",    room:"Living Room", icon:"📺", enabled:false, online:true,  wattage:120,  voltage:220, current:"0.55", signal:78, firmware:"v1.4.0", relays:[] },
  { id:"lamp", name:"Office Lamp", room:"Office",      icon:"💡", enabled:true,  online:true,  wattage:60,   voltage:220, current:"0.27", signal:85, firmware:"v2.0.1", relays:[] },
];

/* ── Signal bars ── */
const SignalBars = ({ pct }) => {
  const col = pct > 70 ? "#22c55e" : pct > 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:2 }}>
      {[30,50,70,100].map(t => (
        <div key={t} style={{ width:3.5, borderRadius:2, height:t===30?6:t===50?9:t===70?12:15, background:pct>=t?col:"#e5e7eb" }} />
      ))}
    </div>
  );
};

/* ── Mini stat ── */
const MiniStat = ({ val, unit, lbl }) => (
  <div style={{ textAlign:"center" }}>
    <div style={{ fontSize:17, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", lineHeight:1 }}>
      {val}<span style={{ fontSize:10, color:"#9ca3af" }}> {unit}</span>
    </div>
    <div style={{ fontSize:10.5, color:"#9ca3af", marginTop:2 }}>{lbl}</div>
  </div>
);

/* ── Add Device Modal ── */
const AddModal = ({ onClose, onAdd }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", room:"Living Room", icon:"🔌", wattage:100, voltage:220 });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, id:`custom-${nextUid()}`, enabled:false, online:false, current:((form.wattage/form.voltage)).toFixed(2), signal:0, firmware:"v1.0.0", relays:[] });
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(5,14,45,0.55)", backdropFilter:"blur(6px)", zIndex:900, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`@keyframes mIn{from{opacity:0;transform:translateY(24px) scale(0.96)}to{opacity:1;transform:none}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:22, width:460, maxWidth:"calc(100vw - 32px)", boxShadow:"0 28px 80px rgba(0,0,0,0.22)", overflow:"hidden", animation:"mIn 0.28s cubic-bezier(0.34,1.3,0.64,1) both" }}>

        <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:17, color:"#fff", margin:0 }}>Add New Device</h3>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:"3px 0 0" }}>Step {step} of 2 — {step===1?"Basic Info":"Specifications"}</p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", borderRadius:9, width:32, height:32, color:"#fff", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        <div style={{ height:3, background:"#f3f4f6" }}>
          <div style={{ height:"100%", width:step===1?"50%":"100%", background:"linear-gradient(90deg,#f59e0b,#d97706)", transition:"width 0.35s ease" }} />
        </div>

        <div style={{ padding:"24px 26px 26px" }}>
          {step === 1 ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Device Name *</label>
                <input value={form.name} onChange={e => set("name",e.target.value)} placeholder="e.g. Bedroom AC" autoFocus
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
                  onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
                />
              </div>
              <div>
                <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Room</label>
                <select value={form.room} onChange={e => set("room",e.target.value)}
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff", boxSizing:"border-box" }}>
                  {ROOMS.filter(r => r !== "All Rooms").map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:8, fontFamily:"'Outfit',sans-serif" }}>Icon</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {DEVICE_ICONS.map(ic => (
                    <button key={ic} onClick={() => set("icon",ic)} style={{ width:42, height:42, borderRadius:11, border:`2px solid ${form.icon===ic?"#f59e0b":"#e5e7eb"}`, background:form.icon===ic?"#fffbeb":"#f9fafb", fontSize:21, cursor:"pointer", transition:"all 0.15s", transform:form.icon===ic?"scale(1.12)":"scale(1)" }}>{ic}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[["Wattage (W)","wattage"],["Voltage (V)","voltage"]].map(([lbl,key]) => (
                  <div key={key}>
                    <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>{lbl}</label>
                    <input type="number" value={form[key]} onChange={e => set(key,+e.target.value)}
                      style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
                      onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
                    />
                  </div>
                ))}
              </div>
              <div style={{ background:"#f9fafb", borderRadius:12, padding:"12px 15px", border:"1px solid #e5e7eb" }}>
                <p style={{ fontSize:11, color:"#9ca3af", margin:"0 0 4px", fontWeight:700, fontFamily:"'Outfit',sans-serif", textTransform:"uppercase", letterSpacing:"0.5px" }}>Computed Current</p>
                <p style={{ fontSize:22, fontWeight:800, color:"#f59e0b", fontFamily:"'Outfit',sans-serif", margin:0 }}>{(form.wattage/form.voltage).toFixed(2)} <span style={{ fontSize:12, color:"#9ca3af", fontWeight:600 }}>A</span></p>
              </div>
              <div style={{ background:"linear-gradient(135deg,#fffbeb,#fef3c7)", borderRadius:14, padding:"14px 16px", border:"1.5px solid #fde68a", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:46, height:46, borderRadius:13, background:"#fff", border:"1.5px solid #fde68a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{form.icon}</div>
                <div>
                  <p style={{ fontSize:14.5, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{form.name || "Your Device"}</p>
                  <p style={{ fontSize:12, color:"#92400e", margin:"2px 0 0" }}>{form.room} · {form.wattage}W · {form.voltage}V</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:22 }}>
            <button onClick={step===1?onClose:()=>setStep(1)} style={{ padding:"9px 20px", borderRadius:11, border:"1.5px solid #e5e7eb", background:"#f3f4f6", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              {step===1?"Cancel":"← Back"}
            </button>
            {step===1 ? (
              <button onClick={() => form.name.trim() && setStep(2)} style={{ padding:"9px 22px", borderRadius:11, border:"none", background:form.name.trim()?"#f59e0b":"#e5e7eb", color:form.name.trim()?"#fff":"#9ca3af", fontSize:13, fontWeight:700, cursor:form.name.trim()?"pointer":"not-allowed", fontFamily:"'DM Sans',sans-serif" }}>Next →</button>
            ) : (
              <button onClick={submit} style={{ padding:"9px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}>Add Device ✓</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Device Card ── */
const DeviceCard = ({ device, onToggle, onDelete, onRelayToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const accent = ICON_COLORS[device.icon] || "#f59e0b";

  return (
    <div style={{ background:"#fff", borderRadius:18, border:`1px solid ${device.enabled&&device.online?accent+"28":"rgba(0,0,0,0.05)"}`, boxShadow:device.enabled?`0 4px 20px ${accent}12`:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden", transition:"all 0.25s" }}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
    >
      <div style={{ height:3, background:device.online?(device.enabled?accent:"#fde68a"):"#e5e7eb" }} />
      <div style={{ padding:"18px 18px 16px" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:50, height:50, borderRadius:15, background:device.enabled?accent+"18":"#f9fafb", border:`1.5px solid ${device.enabled?accent+"44":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, transition:"all 0.3s" }}>{device.icon}</div>
            <div>
              <h3 style={{ fontSize:14.5, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:"0 0 4px" }}>{device.name}</h3>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:11.5, color:"#9ca3af" }}>{device.room}</span>
                <span style={{ color:"#d1d5db", fontSize:8 }}>●</span>
                <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:5, background:device.online?"#f0fdf4":"#f3f4f6", color:device.online?"#16a34a":"#9ca3af", fontFamily:"'Outfit',sans-serif" }}>
                  {device.online?"● Online":"○ Offline"}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <label className="switch"><input type="checkbox" checked={!!device.enabled} onChange={() => onToggle(device.id)} /><span className="slider" /></label>
            <div style={{ position:"relative" }}>
              <button onClick={() => setMenuOpen(o=>!o)} style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", color:"#9ca3af", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>⋮</button>
              {menuOpen && (
                <div onClick={() => setMenuOpen(false)} style={{ position:"absolute", right:0, top:"calc(100% + 6px)", background:"#fff", borderRadius:13, boxShadow:"0 10px 30px rgba(0,0,0,0.14)", border:"1px solid #e5e7eb", width:166, zIndex:50, overflow:"hidden" }}>
                  {["✏️  Edit","📊  Analytics","🔄  Restart"].map(a => (
                    <button key={a} style={{ width:"100%", padding:"10px 15px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#374151", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"block" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="none"}>{a}</button>
                  ))}
                  <div style={{ height:1, background:"#f3f4f6" }} />
                  <button onClick={() => onDelete(device.id)} style={{ width:"100%", padding:"10px 15px", border:"none", background:"none", textAlign:"left", fontSize:13, color:"#ef4444", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"block" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"} onMouseLeave={e=>e.currentTarget.style.background="none"}>🗑️  Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, background:"#f9fafb", borderRadius:13, padding:"12px 10px", marginBottom:12 }}>
          <MiniStat val={device.enabled?device.wattage:0} unit="W" lbl="Power" />
          <MiniStat val={device.voltage} unit="V" lbl="Voltage" />
          <MiniStat val={device.current} unit="A" lbl="Current" />
          <div style={{ textAlign:"center" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}><SignalBars pct={device.signal} /></div>
            <div style={{ fontSize:10.5, color:"#9ca3af" }}>{device.signal}%</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:11, color:"#d1d5db" }}>FW {device.firmware}</span>
          {device.relays && device.relays.length > 0 && (
            <button onClick={() => setExpanded(e => !e)} style={{ background:"none", border:"none", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", color:accent, padding:0 }}>
              {expanded ? "▲ Hide" : `▼ Relays (${device.relays.length})`}
            </button>
          )}
        </div>

        {expanded && device.relays && device.relays.length > 0 && (
          <div style={{ marginTop:12, borderTop:"1px solid #f3f4f6", paddingTop:12, display:"flex", flexDirection:"column", gap:7 }}>
            {device.relays.map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 11px", background:r.on?"#f0fdf4":"#f9fafb", borderRadius:11, border:`1px solid ${r.on?"#bbf7d0":"#e5e7eb"}`, transition:"all 0.2s" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{r.label}</span>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 9px", borderRadius:5, background:r.on?"#22c55e":"#e5e7eb", color:r.on?"#fff":"#9ca3af", fontFamily:"'Outfit',sans-serif" }}>{r.on?"ON":"OFF"}</span>
                  <label className="switch" style={{ transform:"scale(0.82)", transformOrigin:"right center" }}><input type="checkbox" checked={!!r.on} onChange={() => onRelayToggle(device.id, r.id)} /><span className="slider" /></label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════
   DEVICES PAGE
════════════════════════════ */
const Devices = () => {
  const { devices, toggleDevice, toggleRelay, addToast } = useDashboard();
  const [extra,      setExtra]      = useState(EXTRA_INIT);
  const [showModal,  setShowModal]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [roomFilter, setRoomFilter] = useState("All Rooms");
  const [viewMode,   setViewMode]   = useState("grid");

  const contextMapped = devices.map(d => ({
    ...d,
    icon: d.id === "home-main" ? "🏠" : "🍳",
    wattage:  d.id === "home-main" ? 1146 : 280,
    voltage:  220,
    current:  d.id === "home-main" ? "5.20" : "1.27",
    signal:   d.id === "home-main" ? 96 : 88,
    firmware: "v2.4.1",
    online:   true,
    room:     d.id === "home-main" ? "Living Room" : "Kitchen",
  }));

  const all = [...contextMapped, ...extra];

  const filtered = all.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) &&
    (roomFilter === "All Rooms" || d.room === roomFilter)
  );

  const stats = {
    total:  all.length,
    online: all.filter(d => d.online).length,
    active: all.filter(d => d.enabled).length,
    watts:  all.filter(d => d.enabled).reduce((s, d) => s + Number(d.wattage), 0),
  };

  const handleAdd    = (d)  => { setExtra(p => [...p, d]); addToast(`"${d.name}" added`, "success"); };
  const handleDelete = (id) => { setExtra(p => p.filter(d => d.id !== id)); addToast("Device removed", "warning"); };
  const handleToggle = (id) => {
    devices.find(d => d.id === id) ? toggleDevice(id) : setExtra(p => p.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
    addToast("Device updated", "success");
  };

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Devices</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Manage and monitor all connected devices</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none", borderRadius:13, padding:"11px 20px", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 16px rgba(245,158,11,0.4)" }}>
          ＋ Add Device
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { icon:"🖥️", lbl:"Total Devices",    val:stats.total,                    unit:"",  color:"#0a1628" },
          { icon:"🟢", lbl:"Online",           val:stats.online,                   unit:"",  color:"#16a34a" },
          { icon:"⚡", lbl:"Active Now",       val:stats.active,                   unit:"",  color:"#f59e0b" },
          { icon:"🔋", lbl:"Live Consumption", val:stats.watts.toLocaleString(),   unit:"W", color:"#2563eb" },
        ].map((p,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:"1px solid rgba(0,0,0,0.04)", animation:`fadeUp 0.4s ${i*0.07}s both` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:18 }}>{p.icon}</span>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'Outfit',sans-serif" }}>{p.lbl}</span>
            </div>
            <p style={{ fontSize:28, fontWeight:900, color:p.color, fontFamily:"'Outfit',sans-serif", margin:0 }}>
              {p.val}<span style={{ fontSize:13, color:"#9ca3af", fontWeight:600, marginLeft:3 }}>{p.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:13 }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search devices…"
            style={{ padding:"9px 13px 9px 34px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff", width:220 }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
          {ROOMS.map(r => (
            <button key={r} onClick={() => setRoomFilter(r)} style={{ padding:"7px 14px", borderRadius:9, border:"none", cursor:"pointer", background:roomFilter===r?"#0a1628":"#fff", color:roomFilter===r?"#fff":"#6b7280", fontSize:12.5, fontWeight:600, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", transition:"all 0.15s" }}>{r}</button>
          ))}
        </div>
        <div style={{ display:"flex", background:"#fff", borderRadius:11, padding:3, gap:2, border:"1.5px solid #e5e7eb" }}>
          {[["grid","⊞"],["list","☰"]].map(([v,ic]) => (
            <button key={v} onClick={() => setViewMode(v)} style={{ padding:"6px 12px", borderRadius:8, border:"none", background:viewMode===v?"#f59e0b":"transparent", color:viewMode===v?"#fff":"#9ca3af", fontSize:15, cursor:"pointer", transition:"all 0.15s" }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#9ca3af" }}>
          <div style={{ fontSize:52, marginBottom:14 }}>🔌</div>
          <p style={{ fontSize:15, fontWeight:600, margin:0 }}>No devices found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16 }}>
          {filtered.map(d => <DeviceCard key={d.id} device={d} onToggle={handleToggle} onDelete={handleDelete} onRelayToggle={toggleRelay} />)}
        </div>
      ) : (
        <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 80px 80px 110px", padding:"11px 20px", background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
            {["Device","Room","Power","Voltage","Current","Signal","Status"].map(h => (
              <span key={h} style={{ fontSize:11.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Outfit',sans-serif" }}>{h}</span>
            ))}
          </div>
          {filtered.map((d, i) => (
            <div key={d.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 80px 80px 80px 80px 110px", padding:"13px 20px", borderBottom:i<filtered.length-1?"1px solid #f3f4f6":"none", alignItems:"center", transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>{d.icon}</span>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{d.name}</p>
                  <p style={{ fontSize:11, color:"#9ca3af", margin:0 }}>FW {d.firmware}</p>
                </div>
              </div>
              <span style={{ fontSize:13, color:"#374151" }}>{d.room}</span>
              <span style={{ fontSize:13, fontWeight:700, color:"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>{d.enabled?d.wattage:0}W</span>
              <span style={{ fontSize:13, color:"#374151" }}>{d.voltage}V</span>
              <span style={{ fontSize:13, color:"#374151" }}>{d.current}A</span>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}><SignalBars pct={d.signal} /><span style={{ fontSize:11, color:"#9ca3af" }}>{d.signal}%</span></div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:10.5, fontWeight:700, padding:"3px 9px", borderRadius:6, background:d.enabled?"#22c55e":"#e5e7eb", color:d.enabled?"#fff":"#9ca3af", fontFamily:"'Outfit',sans-serif" }}>{d.enabled?"ON":"OFF"}</span>
                <label className="switch" style={{ transform:"scale(0.82)", transformOrigin:"left center" }}><input type="checkbox" checked={!!d.enabled} onChange={() => handleToggle(d.id)} /><span className="slider" /></label>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
};

export default Devices;