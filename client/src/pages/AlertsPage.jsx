import React, { useState, useEffect } from "react";
import useDashboard from "../context/useDashboard";
import { alerts as alertApi } from "../services/api";

const SEVERITY = {
  critical: { label:"Critical", color:"#dc2626", bg:"#fef2f2", border:"#fca5a5" },
  warning:  { label:"Warning",  color:"#d97706", bg:"#fffbeb", border:"#fde68a" },
  info:     { label:"Info",     color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
};

const METRIC_UNITS = { power:"W", energy:"kWh", voltage:"V", current:"A", frequency:"Hz" };

// ── Rule form (unchanged layout) ──────────────────────────────────
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
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Metric</label>
          <select value={form.metric} onChange={e => set("metric",e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none" }}>
            {Object.keys(METRIC_UNITS).map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Condition</label>
          <select value={form.condition} onChange={e => set("condition",e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none" }}>
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
            onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
        </div>
        <div>
          <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>Severity</label>
          <select value={form.severity} onChange={e => set("severity",e.target.value)}
            style={{ width:"100%", padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none" }}>
            {Object.entries(SEVERITY).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <button onClick={() => set("enabled",!form.enabled)} style={{ width:44, height:24, borderRadius:999, border:"none", background:form.enabled?"#f59e0b":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
          <div style={{ position:"absolute", top:2, left:form.enabled?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
        </button>
        <span style={{ fontSize:13, color:"#6b7280" }}>Rule {form.enabled ? "enabled" : "disabled"}</span>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => onSave(form)} style={{ flex:1, background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none", borderRadius:11, padding:"11px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
          {initial ? "Update Rule" : "Create Rule"}
        </button>
        <button onClick={onCancel} style={{ padding:"11px 20px", border:"1.5px solid #e5e7eb", borderRadius:11, background:"#f9fafb", color:"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
const AlertsPage = () => {
  const { alerts, clearAlerts, dismissAlert, threshold, alertsEnabled, setAlertsEnabled, updateThreshold, addToast } = useDashboard();

  const [rules,    setRules]    = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [tab,      setTab]      = useState("active");
  const [loading,  setLoading]  = useState(true);
  const [notifPrefs, setNotifPrefs] = useState({ email:true, push:false, sms:false, cooldown:15 });

  // ── Load rules ─────────────────────────────────────────────────
  useEffect(() => {
    alertApi.listRules()
      .then(res => setRules(res.data || []))
      .catch(err => console.error("[Alerts] rules load failed:", err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRule = async (form) => {
    try {
      const res = await alertApi.createRule(form);
      setRules(r => [...r, res.data || res.rule || form]);
      setShowForm(false);
      addToast("Rule created", "success");
    } catch (err) {
      addToast(err.message || "Failed to create rule", "error");
    }
  };

  const handleUpdateRule = async (form) => {
    const id = form._id || editRule?._id;
    try {
      await alertApi.updateRule(id, form);
      setRules(r => r.map(x => (x._id||x.id)===id ? { ...x, ...form } : x));
      setEditRule(null);
      addToast("Rule updated", "success");
    } catch (err) {
      addToast(err.message || "Failed to update rule", "error");
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await alertApi.deleteRule(id);
      setRules(r => r.filter(x => (x._id||x.id) !== id));
      addToast("Rule deleted", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete rule", "error");
    }
  };

  const handleToggleRule = async (rule) => {
    const id = rule._id || rule.id;
    const updated = { ...rule, enabled: !rule.enabled };
    try {
      await alertApi.updateRule(id, updated);
      setRules(r => r.map(x => (x._id||x.id)===id ? updated : x));
    } catch (err) {
      addToast("Failed to toggle rule", "error");
    }
  };

  const TabBtn = ({ label, count, id }) => (
    <button onClick={() => setTab(id)} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:tab===id?"#fff":"transparent", color:tab===id?"#f59e0b":"#6b7280", fontWeight:tab===id?700:500, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:tab===id?"0 1px 3px rgba(0,0,0,0.08)":"none", display:"flex", alignItems:"center", gap:6 }}>
      {label}{count != null && <span style={{ background:tab===id?"#fef3c7":"#f3f4f6", color:tab===id?"#92400e":"#6b7280", fontSize:10, fontWeight:800, padding:"1px 7px", borderRadius:999 }}>{count}</span>}
    </button>
  );

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, fontFamily:"'DM Sans',sans-serif", background:"#eef1f8", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Alerts</h1>
        <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Active alerts, rules, and notification settings</p>
      </div>

      {/* Tabs */}
      <div style={{ background:"#fff", borderRadius:14, padding:4, display:"flex", gap:2, width:"fit-content", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <TabBtn label="Active Alerts" count={alerts.length} id="active" />
        <TabBtn label="Rules" count={rules.length} id="rules" />
        <TabBtn label="Notifications" id="notifications" />
      </div>

      {/* ── Active Alerts ── */}
      {tab === "active" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>Active Alerts ({alerts.length})</h3>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13, color:"#6b7280" }}>Alerts {alertsEnabled ? "ON" : "OFF"}</span>
                  <button onClick={() => setAlertsEnabled(v => !v)} style={{ width:44, height:24, borderRadius:999, border:"none", background:alertsEnabled?"#f59e0b":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                    <div style={{ position:"absolute", top:2, left:alertsEnabled?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                  </button>
                </div>
                {alerts.length > 0 && (
                  <button onClick={clearAlerts} style={{ padding:"6px 14px", borderRadius:9, border:"none", background:"#fef2f2", color:"#ef4444", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>Clear All</button>
                )}
              </div>
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding:"48px 22px", textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
                <p style={{ fontSize:15, fontWeight:700, color:"#374151", margin:"0 0 6px" }}>All Clear</p>
                <p style={{ fontSize:13, color:"#9ca3af", margin:0 }}>No active alerts. System is running normally.</p>
              </div>
            ) : (
              alerts.map((alert, i) => {
                const sev = SEVERITY[alert.type] || SEVERITY.warning;
                return (
                  <div key={alert._id||alert.id} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"16px 22px", borderBottom:i<alerts.length-1?"1px solid #f9fafb":"none", animation:`fadeUp 0.4s ${i*0.05}s both` }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:sev.bg, border:`1px solid ${sev.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>⚠️</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:"#111827", margin:"0 0 3px" }}>{alert.msg}</p>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:11, fontWeight:700, color:sev.color, background:sev.bg, padding:"1px 8px", borderRadius:5 }}>{sev.label}</span>
                        <span style={{ fontSize:11.5, color:"#9ca3af" }}>{alert.time || new Date(alert.createdAt||alert.ts).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => dismissAlert(alert._id||alert.id)} style={{ background:"none", border:"none", color:"#d1d5db", cursor:"pointer", fontSize:20, lineHeight:1, padding:2 }}
                      onMouseEnter={e=>e.currentTarget.style.color="#6b7280"}
                      onMouseLeave={e=>e.currentTarget.style.color="#d1d5db"}>×</button>
                  </div>
                );
              })
            )}
          </div>

          {/* Threshold setting */}
          <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", marginTop:16 }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 14px" }}>Power Threshold</h3>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <input type="number" defaultValue={threshold} onBlur={e => updateThreshold(+e.target.value)} step={100} min={100} max={5000}
                style={{ width:120, padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:16, fontWeight:700, fontFamily:"'Outfit',sans-serif", outline:"none", textAlign:"center" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"} />
              <span style={{ fontSize:14, color:"#6b7280", fontWeight:500 }}>W — Alert fires when power exceeds this value</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Rules Tab ── */}
      {tab === "rules" && (
        <div style={{ animation:"fadeUp 0.3s both", display:"flex", flexDirection:"column", gap:14 }}>
          {(showForm || editRule) && (
            <RuleForm
              initial={editRule}
              onSave={editRule ? handleUpdateRule : handleCreateRule}
              onCancel={() => { setShowForm(false); setEditRule(null); }}
            />
          )}

          <div style={{ background:"#fff", borderRadius:18, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>Alert Rules</h3>
              <button onClick={() => { setEditRule(null); setShowForm(true); }} style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                + New Rule
              </button>
            </div>

            {loading ? (
              <div style={{ padding:"24px 22px", color:"#9ca3af", textAlign:"center" }}>Loading rules…</div>
            ) : rules.length === 0 ? (
              <div style={{ padding:"32px", textAlign:"center", color:"#9ca3af" }}>No rules yet. Create one above.</div>
            ) : (
              rules.map((rule, i) => {
                const sev = SEVERITY[rule.severity] || SEVERITY.warning;
                return (
                  <div key={rule._id||rule.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 22px", borderBottom:i<rules.length-1?"1px solid #f9fafb":"none" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:sev.bg, border:`1px solid ${sev.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🔔</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif" }}>{rule.name}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:sev.color, background:sev.bg, padding:"1px 7px", borderRadius:5 }}>{sev.label}</span>
                        {rule.triggered && <span style={{ fontSize:11, fontWeight:700, color:"#dc2626", background:"#fef2f2", padding:"1px 7px", borderRadius:5 }}>TRIGGERED</span>}
                      </div>
                      <p style={{ fontSize:12.5, color:"#6b7280", margin:0 }}>
                        {rule.metric} {rule.condition} {rule.value} {METRIC_UNITS[rule.metric]}
                      </p>
                    </div>
                    <button onClick={() => handleToggleRule(rule)} style={{ width:44, height:24, borderRadius:999, border:"none", background:rule.enabled?"#f59e0b":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                      <div style={{ position:"absolute", top:2, left:rule.enabled?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                    </button>
                    <button onClick={() => { setEditRule(rule); setShowForm(false); }} style={{ padding:"6px 12px", borderRadius:9, border:"1.5px solid #e5e7eb", background:"#f9fafb", color:"#6b7280", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>Edit</button>
                    <button onClick={() => handleDeleteRule(rule._id||rule.id)} style={{ padding:"6px 12px", borderRadius:9, border:"1.5px solid #fca5a5", background:"#fef2f2", color:"#ef4444", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>Delete</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Notifications Tab ── */}
      {tab === "notifications" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 18px" }}>Notification Preferences</h3>
            {[
              ["email","📧","Email Notifications","Receive alerts via email"],
              ["push", "📱","Push Notifications", "Browser push notifications"],
              ["sms",  "💬","SMS Alerts",         "Text message alerts"],
            ].map(([key,icon,label,desc]) => (
              <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{icon}</span>
                  <div>
                    <p style={{ fontSize:13.5, fontWeight:600, color:"#374151", margin:0 }}>{label}</p>
                    <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{desc}</p>
                  </div>
                </div>
                <button onClick={() => setNotifPrefs(p => ({ ...p, [key]:!p[key] }))} style={{ width:44, height:24, borderRadius:999, border:"none", background:notifPrefs[key]?"#f59e0b":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left:notifPrefs[key]?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                </button>
              </div>
            ))}
            <div style={{ marginTop:18 }}>
              <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:7, fontFamily:"'Outfit',sans-serif" }}>Alert Cooldown (minutes)</label>
              <input type="number" value={notifPrefs.cooldown} onChange={e => setNotifPrefs(p => ({ ...p, cooldown:+e.target.value }))} min={1} max={60}
                style={{ width:100, padding:"9px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", textAlign:"center" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
