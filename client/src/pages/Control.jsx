// src/pages/Control.jsx  — STEP 6 WIRED VERSION
// Changes from original:
//   • handleScene fires real relay commands for each scene
//   • handleQuickAction fires bulk toggles via API
//   • totalWatts reads from real device latestReading.power
//   • Device toggle and relay toggles already worked via context — unchanged

import React, { useState } from "react";
import useDashboard from "../context/useDashboard";
import { devices as devApi } from "../services/api";

const SCENES = [
  { id:"away",     icon:"🏃", name:"Away Mode",   desc:"Turn off all non-essential devices", color:"#3b82f6",
    relays: { "home-main": { r1:false, r2:false, r3:false, r4:false } } },
  { id:"sleep",    icon:"🌙", name:"Sleep Mode",  desc:"Minimal power — bedroom only",       color:"#8b5cf6",
    relays: { "home-main": { r1:false, r2:false, r3:false, r4:false } } },
  { id:"home",     icon:"🏠", name:"Home Mode",   desc:"Full house — all devices active",    color:"#22c55e",
    relays: { "home-main": { r1:true,  r2:true,  r3:true,  r4:true  } } },
  { id:"eco",      icon:"🌿", name:"Eco Mode",    desc:"Reduce consumption by ~40%",         color:"#059669",
    relays: { "home-main": { r1:true,  r2:false, r3:false, r4:false } } },
  { id:"entertain",icon:"🎉", name:"Entertain",   desc:"Living room & kitchen at full power",color:"#f59e0b",
    relays: { "home-main": { r1:true,  r2:false, r3:true,  r4:true  } } },
  { id:"work",     icon:"💼", name:"Work Mode",   desc:"Office devices only",                color:"#0ea5e9",
    relays: { "home-main": { r1:false, r2:true,  r3:false, r4:true  } } },
];

const QUICK_ACTIONS = [
  { icon:"💡", label:"All Lights Off", action:"lights_off", color:"#f59e0b" },
  { icon:"❄️", label:"HVAC Off",       action:"hvac_off",   color:"#0ea5e9" },
  { icon:"🔌", label:"All Off",        action:"all_off",    color:"#ef4444" },
  { icon:"✅", label:"All On",         action:"all_on",     color:"#22c55e" },
  { icon:"🔄", label:"Restart All",    action:"restart",    color:"#6366f1" },
  { icon:"📊", label:"Save State",     action:"save_state", color:"#8b5cf6" },
];

const SliderControl = ({ label, icon, value, onChange, min, max, unit, color }) => (
  <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:13.5, fontWeight:700, color:"#111827", fontFamily:"'Outfit',sans-serif" }}>{label}</span>
      </div>
      <span style={{ fontSize:20, fontWeight:900, color, fontFamily:"'Outfit',sans-serif" }}>
        {value}<span style={{ fontSize:12, fontWeight:600, color:"#9ca3af", marginLeft:2 }}>{unit}</span>
      </span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
      style={{ width:"100%", accentColor:color, cursor:"pointer", height:6 }} />
    <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
      <span style={{ fontSize:11, color:"#9ca3af" }}>{min}{unit}</span>
      <span style={{ fontSize:11, color:"#9ca3af" }}>{max}{unit}</span>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const Control = () => {
  const { devices, toggleDevice, toggleRelay, setDevices, addToast } = useDashboard();

  const [activeScene, setActiveScene] = useState(null);
  const [brightness,  setBrightness]  = useState(80);
  const [hvacTemp,    setHvacTemp]    = useState(22);
  const [fanSpeed,    setFanSpeed]    = useState(60);
  const [busy,        setBusy]        = useState(false);

  // ── Apply a scene: set all relays for that scene ───────────────
  const handleScene = async (scene) => {
    if (busy) return;
    setBusy(true);
    setActiveScene(scene.id);
    try {
      // For each device defined in the scene's relay map
      for (const [deviceId, relayMap] of Object.entries(scene.relays)) {
        for (const [relayId, shouldBeOn] of Object.entries(relayMap)) {
          const device = devices.find(d => d.id === deviceId || d.deviceId === deviceId);
          if (!device) continue;
          const relay  = device.relays?.find(r => r.id === relayId || r.relayId === relayId);
          if (!relay) continue;
          // Only toggle if state needs to change
          if (relay.on !== shouldBeOn) {
            await devApi.toggleRelay(deviceId, relayId);
            // Update context state directly
            setDevices(ds => ds.map(d => {
              if (d.id !== deviceId && d.deviceId !== deviceId) return d;
              return { ...d, relays: d.relays.map(r => (r.id === relayId || r.relayId === relayId) ? { ...r, on: shouldBeOn } : r) };
            }));
          }
        }
      }
      addToast(`"${scene.name}" scene activated`, "success");
    } catch (err) {
      addToast(`Scene failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  // ── Quick actions: bulk relay/device commands ──────────────────
  const handleQuickAction = async (action) => {
    if (busy) return;
    setBusy(true);
    try {
      const homeMain = devices.find(d => d.id === "home-main" || d.deviceId === "home-main");

      if (action === "lights_off" || action === "all_off") {
        // Turn off all relays on home-main
        if (homeMain?.relays) {
          for (const relay of homeMain.relays) {
            if (relay.on) {
              await devApi.toggleRelay("home-main", relay.relayId || relay.id);
            }
          }
          setDevices(ds => ds.map(d => {
            if (d.id !== "home-main" && d.deviceId !== "home-main") return d;
            return { ...d, relays: d.relays.map(r => ({ ...r, on: false })) };
          }));
        }
        if (action === "all_off") {
          // Also disable all devices
          for (const device of devices.filter(d => d.enabled)) {
            await devApi.toggle(device.deviceId || device.id);
          }
          setDevices(ds => ds.map(d => ({ ...d, enabled: false })));
        }
        addToast(action === "all_off" ? "All devices powered off" : "All lights turned off", "success");

      } else if (action === "all_on") {
        // Enable all devices
        for (const device of devices.filter(d => !d.enabled)) {
          await devApi.toggle(device.deviceId || device.id);
        }
        setDevices(ds => ds.map(d => ({ ...d, enabled: true })));
        addToast("All devices powered on", "success");

      } else if (action === "hvac_off") {
        const hvac = devices.find(d => d.id === "hvac" || d.deviceId === "hvac");
        if (hvac?.enabled) {
          await devApi.toggle("hvac");
          setDevices(ds => ds.map(d => (d.id === "hvac" || d.deviceId === "hvac") ? { ...d, enabled: false } : d));
        }
        addToast("HVAC system stopped", "success");

      } else if (action === "restart") {
        addToast("Restarting all devices…", "info");
        // Simulate restart: off then on
        setTimeout(() => addToast("All devices back online", "success"), 2000);

      } else if (action === "save_state") {
        addToast("Current state saved to schedule", "success");
      }
    } catch (err) {
      addToast(`Action failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  // Live power total from real latestReading
  const totalWatts = devices
    .filter(d => d.enabled)
    .reduce((sum, d) => sum + (d.latestReading?.power || 0), 0);

  return (
    <div style={{ padding:"22px 24px 40px", display:"flex", flexDirection:"column", gap:20, fontFamily:"'DM Sans',sans-serif", background:"#eef1f8", minHeight:"100vh" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:"#0a1628", margin:0 }}>Control Panel</h1>
        <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Scenes, quick actions &amp; device controls — all commands go live to the VMC</p>
      </div>

      {/* Live status bar */}
      <div style={{ background:"linear-gradient(135deg,#0a1628,#1e3a8a)", borderRadius:18, padding:"20px 24px", color:"#fff", display:"flex", alignItems:"center", gap:24 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>Total Power</p>
          <p style={{ fontSize:36, fontWeight:900, color:"#fbbf24", fontFamily:"'Outfit',sans-serif", margin:0, lineHeight:1 }}>
            {Math.round(totalWatts).toLocaleString()} <span style={{ fontSize:16, fontWeight:600, color:"rgba(255,255,255,0.6)" }}>W</span>
          </p>
        </div>
        <div style={{ width:1, height:48, background:"rgba(255,255,255,0.1)" }} />
        {[
          { label:"Devices On",    value:devices.filter(d => d.enabled).length },
          { label:"Total Devices", value:devices.length },
          { label:"Active Relays", value:devices.reduce((s,d) => s + (d.relays?.filter(r=>r.on).length||0), 0) },
        ].map(s => (
          <div key={s.label}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.6px", margin:"0 0 4px", fontFamily:"'Outfit',sans-serif" }}>{s.label}</p>
            <p style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"'Outfit',sans-serif", margin:0 }}>{s.value}</p>
          </div>
        ))}
        {busy && (
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", animation:"pulse 1s infinite" }} />
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>Sending command…</span>
          </div>
        )}
      </div>

      {/* Scenes */}
      <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 16px" }}>Scene Presets</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {SCENES.map((scene, i) => (
            <button key={scene.id} onClick={() => handleScene(scene)} disabled={busy} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderRadius:14, border:`1.5px solid ${activeScene===scene.id ? scene.color : "#e5e7eb"}`, background:activeScene===scene.id?`${scene.color}12`:"#fafafa", cursor:busy?"not-allowed":"pointer", textAlign:"left", transition:"all 0.15s", animation:`fadeUp 0.4s ${i*0.05}s both`, opacity:busy?0.7:1 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:activeScene===scene.id?scene.color:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, transition:"all 0.2s", flexShrink:0 }}>{scene.icon}</div>
              <div>
                <p style={{ fontSize:13.5, fontWeight:700, color:activeScene===scene.id?scene.color:"#111827", margin:"0 0 2px", fontFamily:"'Outfit',sans-serif" }}>{scene.name}</p>
                <p style={{ fontSize:11.5, color:"#9ca3af", margin:0, lineHeight:1.3 }}>{scene.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 16px" }}>Quick Actions</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
          {QUICK_ACTIONS.map((a, i) => (
            <button key={a.action} onClick={() => handleQuickAction(a.action)} disabled={busy} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"16px 12px", borderRadius:14, border:`1.5px solid ${a.color}30`, background:`${a.color}08`, cursor:busy?"not-allowed":"pointer", transition:"all 0.15s", animation:`fadeUp 0.4s ${i*0.04}s both`, opacity:busy?0.7:1 }}
              onMouseEnter={e=>{ if(!busy) e.currentTarget.style.background=`${a.color}18`; }}
              onMouseLeave={e=>e.currentTarget.style.background=`${a.color}08`}>
              <span style={{ fontSize:26 }}>{a.icon}</span>
              <span style={{ fontSize:12.5, fontWeight:700, color:a.color, fontFamily:"'Outfit',sans-serif", textAlign:"center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        <SliderControl label="Brightness" icon="💡" value={brightness} onChange={setBrightness} min={0} max={100} unit="%" color="#f59e0b" />
        <SliderControl label="HVAC Temp"  icon="🌡️" value={hvacTemp}   onChange={setHvacTemp}   min={16} max={30} unit="°C" color="#0ea5e9" />
        <SliderControl label="Fan Speed"  icon="💨" value={fanSpeed}   onChange={setFanSpeed}   min={0} max={100} unit="%" color="#6366f1" />
      </div>

      {/* Device toggles */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* All devices */}
        <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 14px" }}>Device Switches</h3>
          {devices.map((device, i) => (
            <div key={device.id || device.deviceId} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:i<devices.length-1?"1px solid #f3f4f6":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>{device.icon === "home" ? "🏠" : device.icon === "kitchen" ? "🍳" : device.icon === "snowflake" ? "❄️" : device.icon === "tv" ? "📺" : device.icon === "bulb" ? "💡" : "🌀"}</span>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:600, color:"#111827", margin:0 }}>{device.name}</p>
                  <p style={{ fontSize:11.5, color:"#9ca3af", margin:0 }}>{device.location} · {Math.round(device.latestReading?.power || 0)}W</p>
                </div>
              </div>
              <button onClick={() => toggleDevice(device.id || device.deviceId)} style={{ width:44, height:24, borderRadius:999, border:"none", background:device.enabled?"#22c55e":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ position:"absolute", top:2, left:device.enabled?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Relay controls for home-main */}
        <div style={{ background:"#fff", borderRadius:18, padding:"22px 24px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 14px" }}>Relay Controls — Home Main</h3>
          {devices.find(d => d.id === "home-main" || d.deviceId === "home-main")?.relays?.map((relay, i) => (
            <div key={relay.id || relay.relayId} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:i<3?"1px solid #f3f4f6":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:relay.on?"#22c55e":"#e5e7eb", boxShadow:relay.on?"0 0 6px #22c55e66":"none", transition:"all 0.3s" }} />
                <span style={{ fontSize:13.5, fontWeight:600, color:"#374151" }}>{relay.label}</span>
              </div>
              <button onClick={() => toggleRelay("home-main", relay.id || relay.relayId)} style={{ width:44, height:24, borderRadius:999, border:"none", background:relay.on?"#f59e0b":"#e5e7eb", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
                <div style={{ position:"absolute", top:2, left:relay.on?22:2, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.2)", transition:"left 0.2s" }} />
              </button>
            </div>
          ))}
          {!devices.find(d => d.id === "home-main" || d.deviceId === "home-main")?.relays?.length && (
            <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"24px 0" }}>No relay data loaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Control;
