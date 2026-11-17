import React, { useState, useEffect } from "react";
import useDashboard from "../context/useDashboard";
import { auth } from "../services/api";

const SaveBtn = ({ onClick, saved, loading }) => (
  <button onClick={onClick} disabled={loading} style={{
    background: saved ? "#22c55e" : "linear-gradient(135deg,#f59e0b,#d97706)",
    color:"#fff", border:"none", borderRadius:11, padding:"10px 24px",
    fontSize:13.5, fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
    fontFamily:"'Outfit',sans-serif", transition:"all 0.3s",
    boxShadow: saved ? "0 4px 12px rgba(34,197,94,0.3)" : "0 4px 12px rgba(245,158,11,0.3)",
    opacity: loading ? 0.7 : 1,
  }}>
    {loading ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
  </button>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, type="text", placeholder, readOnly, style={} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
    style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", background: readOnly ? "#f9fafb" : "#fff", color: readOnly ? "#9ca3af" : "#111827", ...style }}
    onFocus={e => { if (!readOnly) e.target.style.borderColor="#f59e0b"; }}
    onBlur={e => e.target.style.borderColor="#e5e7eb"}
  />
);

const TabBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding:"9px 18px", borderRadius:10, border:"none", background: active ? "#fff" : "transparent", color: active ? "#f59e0b" : "#6b7280", fontWeight: active ? 700 : 500, fontSize:13, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition:"all 0.15s" }}>{label}</button>
);

const Card = ({ children, title, subtitle }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)", marginBottom:16 }}>
    {title && (
      <div style={{ marginBottom:18 }}>
        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
const Settings = () => {
  const { addToast, currentUser, setAppSettings } = useDashboard();

  const [activeTab,     setActiveTab]     = useState("profile");
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [privAnalytics, setPrivAnalytics] = useState(true);
  const [privCrash,     setPrivCrash]     = useState(true);
  const [privLocation,  setPrivLocation]  = useState(false);

  // Profile tab
  const [profile, setProfile] = useState({
    name:"Asif Khan", email:"asif@smartenergy.com", role:"Administrator",
    phone:"+92 300 1234567", timezone:"Asia/Karachi", language:"English",
  });

  // System tab
  const [sys, setSys] = useState({
    dataInterval:1, autoRefresh:true, logRetention:30,
    unitSystem:"metric", currency:"USD", dateFormat:"DD/MM/YYYY",
  });

  // Appearance tab
  const [appearance, setAppearance] = useState({
    theme:"light", accentColor:"#f59e0b", sidebarCollapsed:false,
    compactMode:false, animations:true, chartStyle:"smooth",
  });

  // Security tab
  const [security, setSecurity] = useState({
    twoFactor:false, sessionTimeout:60,
    apiKey:"sk_live_xxxxxxxxxxxxxxxxxxxx", loginAlerts:true,
  });

  // Password change
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" });

  // ── Load from currentUser when available ──────────────────────
  useEffect(() => {
    if (!currentUser) return;
    setProfile(p => ({
      ...p,
      name:     currentUser.name     || p.name,
      email:    currentUser.email    || p.email,
      phone:    currentUser.phone    || p.phone,
      timezone: currentUser.timezone || p.timezone,
      language: currentUser.language || p.language,
    }));
    if (currentUser.apiKey) {
      setSecurity(s => ({ ...s, apiKey: currentUser.apiKey }));
    }
    if (currentUser.system) {
      setSys(currentUser.system);
    }
  }, [currentUser]);

  // ── Save handlers ─────────────────────────────────────────────
  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "profile") {
        await auth.updateProfile({
          name:     profile.name,
          phone:    profile.phone,
          timezone: profile.timezone,
          language: profile.language,
        });
        addToast("Profile saved", "success");
      } else if (activeTab === "system") {
        await auth.updateProfile({ system: sys });
        setAppSettings(s => ({ ...s, ...sys }));
        addToast("System settings saved", "success");
      } else if (activeTab === "appearance") {
        await auth.updateProfile({ appearance });
        addToast("Appearance saved", "success");
      } else if (activeTab === "security") {
        addToast("Security settings saved", "success");
      } else if (activeTab === "privacy") {
        addToast("Privacy settings saved", "success");
      }
      flash();
    } catch (err) {
      addToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw) {
      return addToast("Fill in all password fields", "error");
    }
    if (pwForm.newPw !== pwForm.confirm) {
      return addToast("New passwords don't match", "error");
    }
    if (pwForm.newPw.length < 6) {
      return addToast("Password must be at least 6 characters", "error");
    }
    setSaving(true);
    try {
      await auth.changePassword(pwForm.current, pwForm.newPw);
      setPwForm({ current:"", newPw:"", confirm:"" });
      addToast("Password changed successfully", "success");
      flash();
    } catch (err) {
      addToast(err.message || "Password change failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm("Regenerate API key? Your current key will stop working immediately.")) return;
    setSaving(true);
    try {
      const res = await auth.regenerateApiKey();
      const newKey = res.apiKey || res.data?.apiKey || "sk_live_" + Math.random().toString(36).slice(2,22);
      setSecurity(s => ({ ...s, apiKey: newKey }));
      addToast("New API key generated", "warning");
    } catch (err) {
      addToast(err.message || "Failed to regenerate key", "error");
    } finally {
      setSaving(false);
    }
  };

  const setP = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const setS = (k, v) => setSys(s => ({ ...s, [k]: v }));
  const setSec = (k, v) => setSecurity(s => ({ ...s, [k]: v }));
  const ACCENT_COLORS = ["#f59e0b","#3b82f6","#22c55e","#ef4444","#8b5cf6","#ec4899","#06b6d4","#f97316"];

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:0, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Settings</h1>
        <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Manage your account, system, and preferences</p>
      </div>

      {/* Tab bar */}
      <div style={{ background:"#fff", borderRadius:14, padding:4, display:"flex", gap:2, marginBottom:20, boxShadow:"0 1px 3px rgba(0,0,0,0.06)", width:"fit-content" }}>
        {[["profile","👤 Profile"],["system","⚙️ System"],["appearance","🎨 Appearance"],["security","🔒 Security"],["privacy","🛡️ Privacy"]].map(([tab, label]) => (
          <TabBtn key={tab} label={label} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === "profile" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <Card title="Personal Information">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Full Name"><Input value={profile.name} onChange={e => setP("name",e.target.value)} /></Field>
              <Field label="Email Address"><Input value={profile.email} readOnly /></Field>
              <Field label="Phone Number"><Input value={profile.phone} onChange={e => setP("phone",e.target.value)} /></Field>
              <Field label="Role"><Input value={profile.role} readOnly /></Field>
              <Field label="Timezone">
                <select value={profile.timezone} onChange={e => setP("timezone",e.target.value)}
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
                  {["Asia/Karachi","UTC","America/New_York","America/Los_Angeles","Europe/London","Asia/Dubai"].map(tz => <option key={tz}>{tz}</option>)}
                </select>
              </Field>
              <Field label="Language">
                <select value={profile.language} onChange={e => setP("language",e.target.value)}
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none", fontFamily:"'DM Sans',sans-serif" }}>
                  {["English","Urdu","Arabic"].map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:18 }}>
              <SaveBtn onClick={handleSave} saved={saved} loading={saving} />
            </div>
          </Card>
        </div>
      )}

      {/* ── System Tab ── */}
      {activeTab === "system" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <Card title="System Preferences">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Data Interval (minutes)">
                <Input type="number" value={sys.dataInterval} onChange={e => setS("dataInterval",+e.target.value)} />
              </Field>
              <Field label="Log Retention (days)">
                <Input type="number" value={sys.logRetention} onChange={e => setS("logRetention",+e.target.value)} />
              </Field>
              <Field label="Unit System">
                <div style={{ display:"flex", gap:8 }}>
                  {["metric","imperial"].map(u => (
                    <button key={u} onClick={() => setS("unitSystem",u)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1.5px solid ${sys.unitSystem===u?"#f59e0b":"#e5e7eb"}`, background:sys.unitSystem===u?"#fffbeb":"#fafafa", color:sys.unitSystem===u?"#92400e":"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s", textTransform:"capitalize" }}>{u}</button>
                  ))}
                </div>
              </Field>
              <Field label="Currency">
                <select value={sys.currency} onChange={e => setS("currency",e.target.value)}
                  style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:13.5, background:"#fff", outline:"none" }}>
                  {["USD","EUR","GBP","PKR"].map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:16, padding:"12px 0", borderTop:"1px solid #f3f4f6" }}>
              <div>
                <p style={{ fontSize:13.5, fontWeight:600, color:"#374151", margin:0 }}>Auto Refresh</p>
                <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>Automatically refresh dashboard data</p>
              </div>
              <button onClick={() => setS("autoRefresh",!sys.autoRefresh)} style={{ width:44, height:24, borderRadius:999, border:"none", background: sys.autoRefresh ? "#f59e0b" : "#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ position:"absolute", top:2, left: sys.autoRefresh ? 22 : 2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
              </button>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
              <SaveBtn onClick={handleSave} saved={saved} loading={saving} />
            </div>
          </Card>
        </div>
      )}

      {/* ── Appearance Tab ── */}
      {activeTab === "appearance" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <Card title="Appearance">
            <Field label="Accent Color">
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:4 }}>
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setAppearance(a => ({ ...a, accentColor:c }))} style={{ width:34, height:34, borderRadius:9, border:`3px solid ${appearance.accentColor===c?"#111827":"transparent"}`, background:c, cursor:"pointer", transition:"transform 0.15s", transform:appearance.accentColor===c?"scale(1.15)":"scale(1)" }} />
                ))}
              </div>
            </Field>
            {[["animations","Animations","Enable CSS transitions and animations"],["compactMode","Compact Mode","Reduce spacing for more content visibility"]].map(([key,label,desc]) => (
              <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderTop:"1px solid #f3f4f6" }}>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"#374151", margin:0 }}>{label}</p>
                  <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{desc}</p>
                </div>
                <button onClick={() => setAppearance(a => ({ ...a, [key]:!a[key] }))} style={{ width:44, height:24, borderRadius:999, border:"none", background: appearance[key] ? "#f59e0b" : "#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left: appearance[key] ? 22 : 2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                </button>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
              <SaveBtn onClick={handleSave} saved={saved} loading={saving} />
            </div>
          </Card>
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === "security" && (
        <div style={{ animation:"fadeUp 0.3s both", display:"flex", flexDirection:"column", gap:0 }}>
          <Card title="Change Password">
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Field label="Current Password"><Input type="password" value={pwForm.current} onChange={e => setPwForm(p=>({...p,current:e.target.value}))} placeholder="Enter current password" /></Field>
              <Field label="New Password"><Input type="password" value={pwForm.newPw} onChange={e => setPwForm(p=>({...p,newPw:e.target.value}))} placeholder="At least 6 characters" /></Field>
              <Field label="Confirm New Password"><Input type="password" value={pwForm.confirm} onChange={e => setPwForm(p=>({...p,confirm:e.target.value}))} placeholder="Repeat new password" /></Field>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:18 }}>
              <button onClick={handleChangePassword} disabled={saving} style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", color:"#fff", border:"none", borderRadius:11, padding:"10px 24px", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : "Update Password"}
              </button>
            </div>
          </Card>

          <Card title="API Key">
            <p style={{ fontSize:13, color:"#6b7280", marginTop:0, marginBottom:14 }}>Use this key for direct API access from external tools or hardware.</p>
            <div style={{ display:"flex", gap:10 }}>
              <Input value={security.apiKey} readOnly type="password" style={{ flex:1 }} />
              <button onClick={handleRegenerateKey} disabled={saving} style={{ padding:"10px 16px", borderRadius:11, border:"1.5px solid #fde68a", background:"#fffbeb", color:"#92400e", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
                Regenerate
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Privacy Tab ── */}
      {activeTab === "privacy" && (
        <div style={{ animation:"fadeUp 0.3s both" }}>
          <Card title="Data & Privacy">
            {[
              ["privAnalytics",privAnalytics,setPrivAnalytics,"Analytics Tracking","Help improve the app by sharing usage data"],
              ["privCrash",    privCrash,    setPrivCrash,    "Crash Reports",     "Automatically send crash reports"],
              ["privLocation", privLocation, setPrivLocation, "Location Data",     "Use location for regional pricing"],
            ].map(([key,val,setter,label,desc]) => (
              <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f3f4f6" }}>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"#374151", margin:0 }}>{label}</p>
                  <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{desc}</p>
                </div>
                <button onClick={() => setter(v => !v)} style={{ width:44, height:24, borderRadius:999, border:"none", background: val ? "#f59e0b" : "#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:2, left: val ? 22 : 2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
                </button>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:18 }}>
              <SaveBtn onClick={handleSave} saved={saved} loading={saving} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Settings;
