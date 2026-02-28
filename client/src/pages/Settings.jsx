import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

const TABS = [
  { id:"profile",    icon:"👤", label:"Profile"     },
  { id:"system",     icon:"⚙️", label:"System"      },
  { id:"appearance", icon:"🎨", label:"Appearance"  },
  { id:"security",   icon:"🔒", label:"Security"    },
  { id:"data",       icon:"🗄️", label:"Data & Privacy"},
];

const Section = ({ title, desc, children }) => (
  <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)", marginBottom:16 }}>
    <div style={{ marginBottom:18 }}>
      <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>{title}</h3>
      {desc && <p style={{ fontSize:12.5, color:"#9ca3af", margin:"3px 0 0" }}>{desc}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom:18 }}>
    <label style={{ fontSize:12.5, fontWeight:600, color:"#374151", display:"block", marginBottom:6, fontFamily:"'Outfit',sans-serif" }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize:11.5, color:"#9ca3af", margin:"5px 0 0" }}>{hint}</p>}
  </div>
);

const Input = ({ value, onChange, type="text", placeholder, disabled }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
    style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", boxSizing:"border-box", background:disabled?"#f9fafb":"#fff", color:disabled?"#9ca3af":"#111827", transition:"border-color 0.15s" }}
    onFocus={e=>!disabled&&(e.target.style.borderColor="#f59e0b")} onBlur={e=>e.target.style.borderColor="#e5e7eb"}
  />
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0", borderBottom:"1px solid #f9fafb" }}>
    <div>
      <p style={{ fontSize:13.5, fontWeight:600, color:"#111827", margin:0 }}>{label}</p>
      {desc && <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{desc}</p>}
    </div>
    <label className="switch" style={{ flexShrink:0 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
    </label>
  </div>
);

const SaveBtn = ({ onClick, saved }) => (
  <button onClick={onClick} style={{ padding:"11px 28px", borderRadius:12, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", boxShadow:saved?"0 4px 14px rgba(34,197,94,0.3)":"0 4px 14px rgba(245,158,11,0.35)", transition:"all 0.3s" }}>
    {saved ? "✓ Saved!" : "Save Changes"}
  </button>
);

/* ════════════════════════════
   SETTINGS PAGE
════════════════════════════ */
const Settings = () => {
  const { threshold, updateThreshold, alertsEnabled, setAlertsEnabled, addToast } = useDashboard();

  const [activeTab, setActiveTab] = useState("profile");
  const [saved,     setSaved]     = useState(false);

  /* Privacy toggles */
  const [privAnalytics, setPrivAnalytics] = useState(true);
  const [privCrash,     setPrivCrash]     = useState(true);
  const [privLocation,  setPrivLocation]  = useState(false);

  /* Profile */
  const [profile, setProfile] = useState({ name:"Asif Khan", email:"asif@smartenergy.com", role:"Administrator", phone:"+92 300 1234567", timezone:"Asia/Karachi", language:"English" });
  const setP = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  /* System */
  const [sys, setSys] = useState({ dataInterval:1, autoRefresh:true, logRetention:30, unitSystem:"metric", currency:"USD", dateFormat:"DD/MM/YYYY" });
  const setS = (k, v) => setSys(p => ({ ...p, [k]: v }));

  /* Appearance */
  const [appearance, setAppearance] = useState({ theme:"light", accentColor:"#f59e0b", sidebarCollapsed:false, compactMode:false, animations:true, chartStyle:"smooth" });
  const setA = (k, v) => setAppearance(p => ({ ...p, [k]: v }));

  /* Security */
  const [security, setSecurity] = useState({ twoFactor:false, sessionTimeout:60, apiKey:"sk_live_xxxxxxxxxxxxxxxxxxxx", loginAlerts:true });
  const setSec = (k, v) => setSecurity(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    addToast("Settings saved successfully", "success");
    setTimeout(() => setSaved(false), 2500);
  };

  const ACCENT_COLORS = ["#f59e0b","#3b82f6","#22c55e","#ef4444","#8b5cf6","#ec4899","#06b6d4","#f97316"];

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:0, background:"#eef1f8", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Settings</h1>
        <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Manage your account, system preferences & security</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20, alignItems:"start" }}>

        {/* ── Sidebar nav ── */}
        <div style={{ background:"#fff", borderRadius:18, padding:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid rgba(0,0,0,0.04)", position:"sticky", top:90 }}>
          <div style={{ marginBottom:16, padding:"0 6px" }}>
            <div style={{ width:52, height:52, borderRadius:15, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, marginBottom:10 }}>👤</div>
            <p style={{ fontSize:14, fontWeight:800, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{profile.name}</p>
            <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{profile.role}</p>
          </div>
          <div style={{ height:1, background:"#f3f4f6", margin:"8px 0 12px" }} />
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:11, border:"none", textAlign:"left",
              background:activeTab===t.id?"#0a1628":"transparent",
              color:activeTab===t.id?"#fff":"#6b7280",
              fontSize:13.5, fontWeight:activeTab===t.id?700:500,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              marginBottom:2, transition:"all 0.15s",
            }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
          <div style={{ height:1, background:"#f3f4f6", margin:"12px 0 8px" }} />
          <button style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:11, border:"none", textAlign:"left", background:"transparent", color:"#ef4444", fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
            onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{ fontSize:16 }}>🚪</span> Sign Out
          </button>
        </div>

        {/* ── Content ── */}
        <div>
          {/* PROFILE */}
          {activeTab === "profile" && (
            <div style={{ animation:"fadeUp 0.3s both" }}>
              <Section title="Personal Information" desc="Update your account details and preferences">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <Field label="Full Name"><Input value={profile.name} onChange={e => setP("name",e.target.value)} /></Field>
                  <Field label="Email Address"><Input value={profile.email} onChange={e => setP("email",e.target.value)} type="email" /></Field>
                  <Field label="Phone Number"><Input value={profile.phone} onChange={e => setP("phone",e.target.value)} /></Field>
                  <Field label="Role"><Input value={profile.role} disabled /></Field>
                  <Field label="Timezone">
                    <select value={profile.timezone} onChange={e => setP("timezone",e.target.value)} style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
                      {["Asia/Karachi","UTC","America/New_York","Europe/London","Asia/Dubai","Asia/Kolkata"].map(tz => <option key={tz}>{tz}</option>)}
                    </select>
                  </Field>
                  <Field label="Language">
                    <select value={profile.language} onChange={e => setP("language",e.target.value)} style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
                      {["English","Urdu","Arabic","French","Spanish"].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              <Section title="Profile Photo" desc="Upload a photo for your account">
                <div style={{ display:"flex", alignItems:"center", gap:18 }}>
                  <div style={{ width:72, height:72, borderRadius:20, background:"linear-gradient(135deg,#0a1628,#1e3a8a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>👤</div>
                  <div>
                    <button style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid #e5e7eb", background:"#f3f4f6", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginRight:8 }}>Upload Photo</button>
                    <button style={{ padding:"9px 18px", borderRadius:10, border:"1.5px solid #fca5a5", background:"#fef2f2", color:"#ef4444", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Remove</button>
                    <p style={{ fontSize:12, color:"#9ca3af", margin:"8px 0 0" }}>PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </Section>

              <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn onClick={handleSave} saved={saved} /></div>
            </div>
          )}

          {/* SYSTEM */}
          {activeTab === "system" && (
            <div style={{ animation:"fadeUp 0.3s both" }}>
              <Section title="System Preferences" desc="Configure data collection and display settings">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:4 }}>
                  <Field label="Data Update Interval" hint="How often live readings refresh">
                    <select value={sys.dataInterval} onChange={e => setS("dataInterval",+e.target.value)} style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
                      {[[0.5,"0.5 seconds"],[1,"1 second"],[2,"2 seconds"],[5,"5 seconds"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Log Retention" hint="Days to keep historical data">
                    <select value={sys.logRetention} onChange={e => setS("logRetention",+e.target.value)} style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
                      {[7,14,30,60,90,365].map(d => <option key={d} value={d}>{d} days</option>)}
                    </select>
                  </Field>
                  <Field label="Unit System">
                    <div style={{ display:"flex", gap:8 }}>
                      {["metric","imperial"].map(u => (
                        <button key={u} onClick={() => setS("unitSystem",u)} style={{ flex:1, padding:"10px 0", borderRadius:10, border:`1.5px solid ${sys.unitSystem===u?"#f59e0b":"#e5e7eb"}`, background:sys.unitSystem===u?"#fffbeb":"#fafafa", color:sys.unitSystem===u?"#92400e":"#6b7280", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", textTransform:"capitalize", transition:"all 0.15s" }}>{u}</button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Currency">
                    <select value={sys.currency} onChange={e => setS("currency",e.target.value)} style={{ width:"100%", padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}>
                      {["USD","EUR","GBP","PKR","AED","INR"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Toggle label="Auto Refresh Dashboard" desc="Automatically refresh all charts and readings" checked={sys.autoRefresh} onChange={e => setS("autoRefresh",e.target.checked)} />
              </Section>

              <Section title="Alert System" desc="Global alert configuration">
                <Toggle label="Enable Alerts" desc="Receive alerts when thresholds are breached" checked={alertsEnabled} onChange={e => { setAlertsEnabled(e.target.checked); addToast(e.target.checked?"Alerts enabled":"Alerts disabled", e.target.checked?"success":"warning"); }} />
                <div style={{ marginTop:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Global Power Threshold</span>
                    <span style={{ fontSize:15, fontWeight:800, color:"#f59e0b", fontFamily:"'Outfit',sans-serif" }}>{threshold.toLocaleString()} W</span>
                  </div>
                  <input type="range" min={500} max={5000} step={100} value={threshold} onChange={e => updateThreshold(+e.target.value)} style={{ width:"100%", accentColor:"#f59e0b", cursor:"pointer" }} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <span style={{ fontSize:11.5, color:"#9ca3af" }}>500 W</span>
                    <span style={{ fontSize:11.5, color:"#9ca3af" }}>5,000 W</span>
                  </div>
                </div>
              </Section>

              <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn onClick={handleSave} saved={saved} /></div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <div style={{ animation:"fadeUp 0.3s both" }}>
              <Section title="Theme" desc="Choose how the dashboard looks">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:6 }}>
                  {[["light","☀️","Light"],["dark","🌙","Dark"],["auto","💻","System"]].map(([v,ic,lbl]) => (
                    <button key={v} onClick={() => setA("theme",v)} style={{ padding:"16px 0", borderRadius:14, border:`2px solid ${appearance.theme===v?"#f59e0b":"#e5e7eb"}`, background:appearance.theme===v?"#fffbeb":"#fafafa", cursor:"pointer", textAlign:"center", transition:"all 0.15s" }}>
                      <div style={{ fontSize:28, marginBottom:6 }}>{ic}</div>
                      <p style={{ fontSize:13, fontWeight:700, color:appearance.theme===v?"#92400e":"#6b7280", fontFamily:"'Outfit',sans-serif", margin:0 }}>{lbl}</p>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Accent Color" desc="Pick the primary color used across the UI">
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => setA("accentColor",c)} style={{ width:36, height:36, borderRadius:11, background:c, border:"none", cursor:"pointer", outline:appearance.accentColor===c?`3px solid ${c}`:"none", outlineOffset:3, transform:appearance.accentColor===c?"scale(1.18)":"scale(1)", transition:"all 0.15s" }} />
                  ))}
                </div>
              </Section>

              <Section title="Layout & Effects" desc="Customize the dashboard layout behaviour">
                <Toggle label="Compact Mode"       desc="Reduce spacing for more data density"        checked={appearance.compactMode}       onChange={e => setA("compactMode",e.target.checked)} />
                <Toggle label="Enable Animations"  desc="Smooth transitions and loading effects"       checked={appearance.animations}        onChange={e => setA("animations",e.target.checked)} />
                <Toggle label="Collapsed Sidebar"  desc="Start with sidebar minimised"                checked={appearance.sidebarCollapsed}  onChange={e => setA("sidebarCollapsed",e.target.checked)} />
              </Section>

              <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn onClick={handleSave} saved={saved} /></div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div style={{ animation:"fadeUp 0.3s both" }}>
              <Section title="Authentication" desc="Manage login and access security">
                <Toggle label="Two-Factor Authentication" desc="Require a code on each login" checked={security.twoFactor} onChange={e => setSec("twoFactor",e.target.checked)} />
                <Toggle label="Login Alerts"              desc="Email me on new sign-ins"     checked={security.loginAlerts} onChange={e => setSec("loginAlerts",e.target.checked)} />
                <div style={{ marginTop:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Session Timeout</span>
                    <span style={{ fontSize:15, fontWeight:800, color:"#2563eb", fontFamily:"'Outfit',sans-serif" }}>{security.sessionTimeout} min</span>
                  </div>
                  <input type="range" min={15} max={480} step={15} value={security.sessionTimeout} onChange={e => setSec("sessionTimeout",+e.target.value)} style={{ width:"100%", accentColor:"#2563eb", cursor:"pointer" }} />
                </div>
              </Section>

              <Section title="Change Password" desc="Update your login credentials">
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <Field label="Current Password"><Input type="password" value="" onChange={() => {}} placeholder="••••••••" /></Field>
                  <Field label="New Password"><Input type="password" value="" onChange={() => {}} placeholder="••••••••" /></Field>
                  <Field label="Confirm New Password"><Input type="password" value="" onChange={() => {}} placeholder="••••••••" /></Field>
                </div>
                <div style={{ marginTop:16 }}>
                  <button onClick={() => addToast("Password updated successfully", "success")} style={{ padding:"10px 22px", borderRadius:11, border:"none", background:"#0a1628", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Update Password</button>
                </div>
              </Section>

              <Section title="API Access" desc="Use your API key to connect external tools">
                <Field label="API Key" hint="Keep this secret. Regenerate if compromised.">
                  <div style={{ display:"flex", gap:10 }}>
                    <input type="password" value={security.apiKey} readOnly style={{ flex:1, padding:"10px 13px", border:"1.5px solid #e5e7eb", borderRadius:11, fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#f9fafb", color:"#9ca3af" }} />
                    <button onClick={() => addToast("API key copied to clipboard", "success")} style={{ padding:"10px 16px", borderRadius:11, border:"1.5px solid #e5e7eb", background:"#f3f4f6", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>Copy</button>
                    <button onClick={() => { setSec("apiKey","sk_live_"+Math.random().toString(36).slice(2,22)); addToast("New API key generated", "warning"); }} style={{ padding:"10px 16px", borderRadius:11, border:"1.5px solid #fde68a", background:"#fffbeb", color:"#92400e", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif" }}>Regenerate</button>
                  </div>
                </Field>
              </Section>

              <div style={{ display:"flex", justifyContent:"flex-end" }}><SaveBtn onClick={handleSave} saved={saved} /></div>
            </div>
          )}

          {/* DATA & PRIVACY */}
          {activeTab === "data" && (
            <div style={{ animation:"fadeUp 0.3s both" }}>
              <Section title="Data Management" desc="Export, backup, or clear your system data">
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { icon:"📦", lbl:"Export All Data",    desc:"Download all logs and settings as JSON",  btn:"Export", color:"#22c55e", action:() => addToast("Data export started", "success") },
                    { icon:"🔄", lbl:"Backup Configuration",desc:"Save current settings to a file",         btn:"Backup", color:"#3b82f6", action:() => addToast("Configuration backed up", "success") },
                    { icon:"♻️", lbl:"Clear History",      desc:"Permanently delete event history",        btn:"Clear",  color:"#f59e0b", action:() => addToast("History cleared", "warning") },
                    { icon:"🗑️", lbl:"Reset All Settings", desc:"Restore factory default configuration",   btn:"Reset",  color:"#ef4444", action:() => addToast("Settings reset to defaults", "warning") },
                  ].map(item => (
                    <div key={item.lbl} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"#f9fafb", borderRadius:14, border:"1px solid #f3f4f6" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:22 }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize:13.5, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif", margin:0 }}>{item.lbl}</p>
                          <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={item.action} style={{ padding:"8px 18px", borderRadius:10, border:`1.5px solid ${item.color}40`, background:item.color+"12", color:item.color, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0, transition:"all 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=item.color+"22"} onMouseLeave={e=>e.currentTarget.style.background=item.color+"12"}>
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Privacy" desc="Control what data is collected and stored">
                <Toggle label="📊 Usage Analytics" desc="Help improve SmartEnergy by sharing anonymous usage data" checked={privAnalytics} onChange={e => setPrivAnalytics(e.target.checked)} />
                <Toggle label="🐛 Crash Reports"   desc="Automatically send error reports"                         checked={privCrash}     onChange={e => setPrivCrash(e.target.checked)} />
                <Toggle label="📍 Location Data"   desc="Allow location-based energy recommendations"               checked={privLocation}   onChange={e => setPrivLocation(e.target.checked)} />
              </Section>

              <div style={{ background:"linear-gradient(135deg,#fef2f2,#fff5f5)", borderRadius:16, padding:"18px 20px", border:"1.5px solid #fca5a5" }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#dc2626", margin:"0 0 8px" }}>⚠️ Danger Zone</h3>
                <p style={{ fontSize:13, color:"#ef4444", margin:"0 0 14px" }}>Permanently delete your account and all associated data. This cannot be undone.</p>
                <button onClick={() => addToast("Account deletion requires email confirmation", "warning")} style={{ padding:"10px 20px", borderRadius:11, border:"2px solid #dc2626", background:"transparent", color:"#dc2626", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="#dc2626";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#dc2626";}}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;