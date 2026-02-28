import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

let _rid = 10;
const nextRid = () => { _rid += 1; return _rid; };

const SEVERITY = {
  critical: { label:"Critical", color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
  warning:  { label:"Warning",  color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  info:     { label:"Info",     color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
};

const INITIAL_RULES = [
  { id:1, name:"High Power",        metric:"power",     condition:"above", value:1000, severity:"critical", enabled:true,  triggered:true  },
  { id:2, name:"High Energy Usage", metric:"energy",    condition:"above", value:5,    severity:"warning",  enabled:true,  triggered:false },
  { id:3, name:"Low Voltage",       metric:"voltage",   condition:"below", value:210,  severity:"critical", enabled:true,  triggered:false },
  { id:4, name:"High Current",      metric:"current",   condition:"above", value:12,   severity:"warning",  enabled:false, triggered:false },
  { id:5, name:"Frequency Drift",   metric:"frequency", condition:"below", value:49.5, severity:"info",     enabled:true,  triggered:false },
];

const METRIC_UNITS = { power:"W", energy:"kWh", voltage:"V", current:"A", frequency:"Hz" };

/* ── Rule Form ── */
const RuleForm = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState(initial || { name:"", metric:"power", condition:"above", value:1000, severity:"warning", enabled:true });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ background:"#fff", borderRadius:18, padding:"24px 26px", boxShadow:"0 8px 32px rgba(0,0,0,0.1)", border:"1px solid #e5e7eb", animation:"slideIn 0.25s cubic-bezier(0.34,1.3,0.64,1) both" }}>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:17, color:"#111827", margin:"0 0 20px" }}>
        {initial ? "Edit Rule" : "New Alert Rule"}
      </h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Rule Name</label>
          <input value={form.name} onChange={e => set("name",e.target.value)} placeholder="e.g. High Power Alert"
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Metric</label>
          <select value={form.metric} onChange={e => set("metric",e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
            {Object.keys(METRIC_UNITS).map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Condition</label>
          <select value={form.condition} onChange={e => set("condition",e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>
            Threshold ({METRIC_UNITS[form.metric]})
          </label>
          <input type="number" value={form.value} onChange={e => set("value",+e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
          />
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Severity</label>
          <div style={{ display:"flex", gap:8 }}>
            {Object.entries(SEVERITY).map(([key, s]) => (
              <button key={key} onClick={() => set("severity",key)} style={{ flex:1, padding:"8px 0", borderRadius:10, border:`1.5px solid ${form.severity===key?s.color:s.border}`, background:form.severity===key?s.bg:"#fafafa", color:form.severity===key?s.color:"#9ca3af", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Preview */}
      <div style={{ background:"#f9fafb", borderRadius:12, padding:"12px 14px", border:"1px solid #e5e7eb", marginBottom:18 }}>
        <p style={{ fontSize:11.5, color:"#9ca3af", margin:"0 0 4px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Outfit',sans-serif" }}>Preview</p>
        <p style={{ fontSize:14, color:"#374151", margin:0 }}>
          Trigger when <strong style={{ color:SEVERITY[form.severity]?.color }}>{form.metric}</strong> is{" "}
          <strong>{form.condition}</strong> {form.value} {METRIC_UNITS[form.metric]}
        </p>
      </div>
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"9px 20px", borderRadius:11, border:"1.5px solid #e5e7eb", background:"#f3f4f6", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
        <button onClick={() => form.name.trim() && onSave({ ...form, id: initial?.id || nextRid() })} style={{ padding:"9px 20px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}>Save Rule</button>
      </div>
    </div>
  );
};

/* ════════════════════════════
   ALERTS PAGE
════════════════════════════ */
const AlertsPage = () => {
  const { alerts, dismissAlert, clearAlerts, threshold, alertsEnabled, setAlertsEnabled, updateThreshold, addToast } = useDashboard();
  const [rules,    setRules]    = useState(INITIAL_RULES);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [tab,      setTab]      = useState("active"); // "active" | "rules" | "notifications"

  /* Notification prefs */
  const [notifPrefs, setNotifPrefs] = useState({
    email: true, push: false, sms: false,
    cooldown: 15, emailAddr: "admin@smartenergy.com",
  });

  const activeCount   = alerts.length;
  const triggeredRules = rules.filter(r => r.triggered).length;
  const enabledRules   = rules.filter(r => r.enabled).length;

  const handleSaveRule = (rule) => {
    setRules(prev => prev.find(r => r.id === rule.id) ? prev.map(r => r.id === rule.id ? rule : r) : [...prev, rule]);
    addToast(editRule ? "Rule updated" : "Rule created", "success");
    setShowForm(false); setEditRule(null);
  };

  const handleDeleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
    addToast("Rule deleted", "warning");
  };

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Alerts</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Manage alert rules, active alerts & notifications</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>Alerts Enabled</span>
          <label className="switch">
            <input type="checkbox" checked={alertsEnabled} onChange={e => { setAlertsEnabled(e.target.checked); addToast(e.target.checked ? "Alerts enabled" : "Alerts paused", e.target.checked ? "success" : "warning"); }} />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { icon:"🔴", lbl:"Active Alerts",     val:activeCount,    color:"#dc2626", pulse:activeCount>0 },
          { icon:"⚠️", lbl:"Triggered Rules",   val:triggeredRules, color:"#f59e0b", pulse:false },
          { icon:"📋", lbl:"Enabled Rules",     val:enabledRules,   color:"#2563eb", pulse:false },
          { icon:"🎯", lbl:"Threshold",          val:`${(threshold/1000).toFixed(1)}kW`, color:"#22c55e", pulse:false },
        ].map((p,i) => (
          <div key={i} style={{ background:"#fff", borderRadius:16, padding:"16px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)", border:`1px solid ${p.pulse?"#fca5a5":"rgba(0,0,0,0.04)"}`, animation:`fadeUp 0.4s ${i*0.07}s both` }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
              <span style={{ fontSize:18 }}>{p.icon}</span>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.6px", fontFamily:"'Outfit',sans-serif" }}>{p.lbl}</span>
            </div>
            <p style={{ fontSize:26, fontWeight:900, color:p.color, fontFamily:"'Outfit',sans-serif", margin:0 }}>{p.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:"#fff", borderRadius:14, padding:4, gap:3, border:"1.5px solid #e5e7eb", width:"fit-content", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        {[["active","🔔 Active"],["rules","📋 Rules"],["notifications","🔕 Notifications"]].map(([v,lbl]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding:"8px 20px", borderRadius:10, border:"none", background:tab===v?"#0a1628":"transparent", color:tab===v?"#fff":"#6b7280", fontSize:13.5, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>{lbl}</button>
        ))}
      </div>

      {/* ── ACTIVE TAB ── */}
      {tab === "active" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {activeCount === 0 ? (
            <div style={{ background:"#fff", borderRadius:18, padding:"50px 0", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:52, marginBottom:14 }}>✅</div>
              <p style={{ fontSize:16, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>All Clear</p>
              <p style={{ fontSize:13, color:"#9ca3af", margin:"6px 0 0" }}>No active alerts — system is operating normally</p>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={() => { clearAlerts(); addToast("All alerts cleared", "success"); }} style={{ padding:"8px 16px", borderRadius:10, border:"1.5px solid #fca5a5", background:"#fef2f2", color:"#dc2626", fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  Clear All ({activeCount})
                </button>
              </div>
              {alerts.map(a => {
                const sev = a.type === "critical" ? SEVERITY.critical : a.type === "warning" ? SEVERITY.warning : SEVERITY.info;
                return (
                  <div key={a.id} style={{ background:"#fff", borderRadius:16, padding:"16px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:`1.5px solid ${sev.border}`, display:"flex", alignItems:"flex-start", gap:14, animation:"fadeUp 0.3s both" }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:sev.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                      {a.type === "critical" ? "🚨" : a.type === "warning" ? "⚠️" : "ℹ️"}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 8px", borderRadius:5, background:sev.bg, color:sev.color, fontFamily:"'Outfit',sans-serif" }}>{sev.label}</span>
                        <span style={{ fontSize:12, color:"#9ca3af" }}>{a.time}</span>
                      </div>
                      <p style={{ fontSize:14, fontWeight:600, color:"#111827", margin:"0 0 3px" }}>{a.msg}</p>
                    </div>
                    <button onClick={() => { dismissAlert(a.id); addToast("Alert dismissed", "info"); }} style={{ background:"none", border:"none", color:"#d1d5db", cursor:"pointer", fontSize:18, lineHeight:1, padding:"2px 4px" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#9ca3af"} onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}>×</button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── RULES TAB ── */}
      {tab === "rules" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {!showForm && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:13.5, color:"#6b7280", margin:0 }}>Define conditions that trigger alerts automatically</p>
              <button onClick={() => { setEditRule(null); setShowForm(true); }} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}>
                ＋ New Rule
              </button>
            </div>
          )}

          {showForm && <RuleForm initial={editRule} onSave={handleSaveRule} onCancel={() => { setShowForm(false); setEditRule(null); }} />}

          {/* Quick threshold setting */}
          <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:14, color:"#111827", margin:0 }}>Global Power Threshold</h3>
                <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>Triggers high-power alerts across all devices</p>
              </div>
              <span style={{ fontSize:22, fontWeight:900, color:"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>{threshold.toLocaleString()} W</span>
            </div>
            <input type="range" min={500} max={5000} step={100} value={threshold} onChange={e => updateThreshold(+e.target.value)}
              style={{ width:"100%", accentColor:"#f59e0b", height:6, cursor:"pointer" }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:11.5, color:"#9ca3af" }}>500 W</span>
              <span style={{ fontSize:11.5, color:"#9ca3af" }}>5,000 W</span>
            </div>
          </div>

          {/* Rule list */}
          <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
            {rules.map((rule, i) => {
              const sev = SEVERITY[rule.severity];
              return (
                <div key={rule.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 20px", borderBottom:i<rules.length-1?"1px solid #f3f4f6":"none", transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {/* Severity dot */}
                  <div style={{ width:10, height:10, borderRadius:"50%", background:rule.enabled?sev.color:"#e5e7eb", flexShrink:0, boxShadow:rule.triggered?`0 0 8px ${sev.color}`:""  }} />

                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:rule.enabled?"#111827":"#9ca3af", fontFamily:"'Outfit',sans-serif" }}>{rule.name}</span>
                      <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 7px", borderRadius:5, background:sev.bg, color:sev.color, fontFamily:"'Outfit',sans-serif" }}>{sev.label}</span>
                      {rule.triggered && <span style={{ fontSize:10.5, fontWeight:700, padding:"2px 7px", borderRadius:5, background:"#fef2f2", color:"#dc2626", fontFamily:"'Outfit',sans-serif" }}>● TRIGGERED</span>}
                    </div>
                    <p style={{ fontSize:12.5, color:"#9ca3af", margin:0 }}>
                      {rule.metric} {rule.condition} {rule.value} {METRIC_UNITS[rule.metric]}
                    </p>
                  </div>

                  <label className="switch" style={{ transform:"scale(0.88)", transformOrigin:"right center" }}>
                    <input type="checkbox" checked={rule.enabled} onChange={() => setRules(p => p.map(r => r.id===rule.id?{...r,enabled:!r.enabled}:r))} />
                    <span className="slider" />
                  </label>

                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { setEditRule(rule); setShowForm(true); }} style={{ background:"#f3f4f6", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#e5e7eb"} onMouseLeave={e=>e.currentTarget.style.background="#f3f4f6"}>✏️</button>
                    <button onClick={() => handleDeleteRule(rule.id)} style={{ background:"#fef2f2", border:"none", borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"} onMouseLeave={e=>e.currentTarget.style.background="#fef2f2"}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === "notifications" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Channel toggles */}
          <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 16px" }}>Notification Channels</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[
                { key:"email", icon:"📧", lbl:"Email Notifications",  desc:"Send alerts to your email address" },
                { key:"push",  icon:"📱", lbl:"Push Notifications",   desc:"Browser push notifications" },
                { key:"sms",   icon:"💬", lbl:"SMS Alerts",           desc:"Text message for critical alerts only" },
              ].map((ch, i) => (
                <div key={ch.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:i<2?"1px solid #f3f4f6":"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background: notifPrefs[ch.key]?"#fffbeb":"#f3f4f6", border:`1.5px solid ${notifPrefs[ch.key]?"#fde68a":"#e5e7eb"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, transition:"all 0.2s" }}>{ch.icon}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{ch.lbl}</p>
                      <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{ch.desc}</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={notifPrefs[ch.key]} onChange={e => setNotifPrefs(p => ({ ...p, [ch.key]: e.target.checked }))} />
                    <span className="slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Email settings */}
          {notifPrefs.email && (
            <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 14px" }}>Email Settings</h3>
              <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Email Address</label>
              <input value={notifPrefs.emailAddr} onChange={e => setNotifPrefs(p => ({ ...p, emailAddr: e.target.value }))}
                style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
              />
            </div>
          )}

          {/* Cooldown */}
          <div style={{ background:"#fff", borderRadius:18, padding:"20px 22px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>Alert Cooldown</h3>
                <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>Minimum time between repeated alerts</p>
              </div>
              <span style={{ fontSize:20, fontWeight:900, color:"#2563eb", fontFamily:"'Outfit',sans-serif" }}>{notifPrefs.cooldown} min</span>
            </div>
            <input type="range" min={5} max={60} step={5} value={notifPrefs.cooldown} onChange={e => setNotifPrefs(p => ({ ...p, cooldown: +e.target.value }))}
              style={{ width:"100%", accentColor:"#2563eb", height:6, cursor:"pointer" }}
            />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
              <span style={{ fontSize:11.5, color:"#9ca3af" }}>5 min</span>
              <span style={{ fontSize:11.5, color:"#9ca3af" }}>60 min</span>
            </div>
          </div>

          <button onClick={() => addToast("Notification settings saved", "success")} style={{ padding:"13px 0", borderRadius:13, border:"none", background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:"0 4px 16px rgba(245,158,11,0.35)" }}>
            Save Notification Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;