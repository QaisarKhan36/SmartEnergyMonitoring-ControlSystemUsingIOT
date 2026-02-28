import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12;
  return `${h}:00 ${i < 12 ? "AM" : "PM"}`;
});

const PRESET_SCHEDULES = [
  { name: "Morning Routine",  icon: "🌅", start: "06:00", end: "09:00", days: ["Mon","Tue","Wed","Thu","Fri"], color: "#f59e0b" },
  { name: "Work Hours",       icon: "💼", start: "09:00", end: "17:00", days: ["Mon","Tue","Wed","Thu","Fri"], color: "#3b82f6" },
  { name: "Evening",          icon: "🌆", start: "17:00", end: "22:00", days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], color: "#8b5cf6" },
  { name: "Weekend",          icon: "🎉", start: "08:00", end: "23:00", days: ["Sat","Sun"], color: "#22c55e" },
];

const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#8b5cf6", "#ef4444", "#ec4899"];

let _nextId = 100;
const nextId = () => { _nextId += 1; return _nextId; };

const initialSchedules = [
  { id: 1, name: "Morning Routine", relay: "Home Main — Relay 1", device: "home-main", relayId: "r1", days: ["Mon","Tue","Wed","Thu","Fri"], start: "06:00", end: "09:00", enabled: true, color: "#f59e0b" },
  { id: 2, name: "Work Hours",      relay: "Home Main — Relay 2", device: "home-main", relayId: "r2", days: ["Mon","Tue","Wed","Thu","Fri"], start: "09:00", end: "17:00", enabled: true, color: "#3b82f6" },
];

const Btn = ({ children, onClick, variant = "primary", style = {} }) => {
  const styles = {
    primary: { background: "#f59e0b", color: "#fff", border: "none" },
    ghost:   { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" },
    danger:  { background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], borderRadius: 10, padding: "8px 16px",
      fontSize: 13, fontWeight: 600, cursor: "pointer",
      fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s", ...style,
    }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
    >{children}</button>
  );
};

/* ── Schedule Form ── */
const ScheduleForm = ({ onSave, onCancel, initial = null }) => {
  const { devices } = useDashboard();
  const allRelays = devices.flatMap(d =>
    (d.relays.length > 0 ? d.relays : [{ id: "main", label: "Main" }]).map(r => ({
      key: `${d.id}::${r.id}`, label: `${d.name} — ${r.label}`, deviceId: d.id, relayId: r.id,
    }))
  );

  const [form, setForm] = useState(initial || {
    name: "", relay: allRelays[0]?.key || "", days: ["Mon","Tue","Wed","Thu","Fri"],
    start: "08:00", end: "22:00", color: "#f59e0b", enabled: true,
  });

  const toggleDay = d => setForm(f => ({
    ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d],
  }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    const rel = allRelays.find(r => r.key === form.relay);
    onSave({
      ...form,
      id: initial?.id || nextId(),
      device: rel?.deviceId,
      relayId: rel?.relayId,
      relay: rel?.label || form.relay,
    });
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 18, padding: "24px 26px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb",
      animation: "slideIn 0.25s cubic-bezier(0.34,1.3,0.64,1) both",
    }}>
      <style>{`@keyframes slideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>

      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: "#111827", margin: "0 0 20px" }}>
        {initial ? "Edit Schedule" : "New Schedule"}
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Name */}
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Schedule Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Morning Routine"
            style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Relay select */}
        <div style={{ gridColumn: "1/-1" }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Target Relay</label>
          <select value={form.relay} onChange={e => setForm(f => ({ ...f, relay: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff" }}>
            {allRelays.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>

        {/* Start / End */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Start Time</label>
          <input type="time" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>End Time</label>
          <input type="time" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
        </div>
      </div>

      {/* Days */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Active Days</label>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {DAYS.map(d => (
            <button key={d} onClick={() => toggleDay(d)} style={{
              padding: "7px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              background: form.days.includes(d) ? form.color : "#f3f4f6",
              color: form.days.includes(d) ? "#fff" : "#6b7280",
              border: form.days.includes(d) ? "none" : "1px solid #e5e7eb",
              transition: "all 0.15s",
            }}>{d}</button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Color</label>
        <div style={{ display: "flex", gap: 8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
              width: 26, height: 26, borderRadius: 8, background: c, border: "none",
              cursor: "pointer", outline: form.color === c ? `3px solid ${c}` : "none",
              outlineOffset: 2, transition: "all 0.15s",
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="primary" onClick={handleSave}>Save Schedule</Btn>
      </div>
    </div>
  );
};

/* ── Week grid view ── */
const WeekGrid = ({ schedules }) => {
  const timeToHour = t => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 600 }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
          <div />
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#9ca3af", fontFamily: "'Outfit', sans-serif", padding: "4px 0" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Hour rows (6am–11pm for clarity) */}
        {[6, 8, 10, 12, 14, 16, 18, 20, 22].map(hour => {
          const label = hour <= 12 ? `${hour === 12 ? 12 : hour}${hour < 12 ? "AM" : "PM"}` : `${hour - 12}PM`;
          return (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 4, marginBottom: 2 }}>
              <div style={{ fontSize: 10.5, color: "#9ca3af", textAlign: "right", paddingRight: 8, paddingTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
              {DAYS.map(day => {
                const active = schedules.filter(s =>
                  s.enabled && s.days.includes(day) &&
                  timeToHour(s.start) <= hour && timeToHour(s.end) > hour
                );
                return (
                  <div key={day} style={{
                    height: 28, borderRadius: 6,
                    background: active.length > 0 ? active[0].color + "30" : "#f9fafb",
                    border: `1px solid ${active.length > 0 ? active[0].color + "60" : "#f3f4f6"}`,
                    position: "relative", overflow: "hidden",
                    transition: "all 0.2s",
                  }}>
                    {active.length > 0 && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: active[0].color + "20",
                        borderLeft: `3px solid ${active[0].color}`,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, paddingLeft: 68 }}>
          {schedules.map(s => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#6b7280" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: "inline-block" }} />
              {s.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════
   SCHEDULE MANAGER PAGE
════════════════════════════ */
const ScheduleManager = () => {
  const { addToast } = useDashboard();
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [view, setView]           = useState("list"); // "list" | "grid"

  const handleSave = (s) => {
    if (editItem) {
      setSchedules(prev => prev.map(x => x.id === s.id ? s : x));
      addToast("Schedule updated", "success");
    } else {
      setSchedules(prev => [...prev, s]);
      addToast("Schedule created", "success");
    }
    setShowForm(false);
    setEditItem(null);
  };

  const handleDelete = (id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addToast("Schedule deleted", "warning");
  };

  const handleToggle = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const applyPreset = (preset) => {
    setSchedules(prev => [...prev, {
      ...preset, id: nextId(),
      relay: "Home Main — Relay 1", device: "home-main", relayId: "r1", enabled: true,
    }]);
    addToast(`"${preset.name}" preset applied`, "success");
  };

  return (
    <div style={{
      padding: "22px 24px 36px", display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif", background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#0f1f5c", margin: 0 }}>Scheduling</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>Automate relay on/off times</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", background: "#fff", borderRadius: 10, padding: 3, gap: 2, border: "1.5px solid #e5e7eb" }}>
            {["list", "grid"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 14px", borderRadius: 7, border: "none",
                background: view === v ? "#f59e0b" : "transparent",
                color: view === v ? "#fff" : "#9ca3af",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}>
                {v === "list" ? "☰ List" : "⊞ Week"}
              </button>
            ))}
          </div>
          <Btn onClick={() => { setEditItem(null); setShowForm(true); }}>+ New Schedule</Btn>
        </div>
      </div>

      {/* Preset quick-add */}
      {!showForm && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 12px", fontFamily: "'Outfit', sans-serif" }}>⚡ Quick Presets</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {PRESET_SCHEDULES.map(p => (
              <button key={p.name} onClick={() => applyPreset(p)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 14px", borderRadius: 10,
                background: p.color + "15", border: `1.5px solid ${p.color}40`,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, fontWeight: 600, color: p.color,
                transition: "all 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = p.color + "25"}
              onMouseLeave={e => e.currentTarget.style.background = p.color + "15"}
              >
                <span>{p.icon}</span> {p.name}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{p.start}–{p.end}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <ScheduleForm
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          initial={editItem}
        />
      )}

      {/* Schedule list or grid */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>
            Schedules <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>({schedules.length} total)</span>
          </h3>
        </div>

        {view === "grid" ? (
          <WeekGrid schedules={schedules} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {schedules.length === 0 && (
              <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🕐</div>
                No schedules yet. Create one above!
              </div>
            )}
            {schedules.map((s, i) => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 8px",
                borderBottom: i < schedules.length - 1 ? "1px solid #f3f4f6" : "none",
                animation: `fadeUp 0.3s ${i * 0.05}s both`,
              }}>
                {/* Color bar */}
                <div style={{ width: 4, height: 48, borderRadius: 4, background: s.enabled ? s.color : "#e5e7eb", flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: s.enabled ? "#111827" : "#9ca3af", fontFamily: "'Outfit', sans-serif" }}>{s.name}</span>
                    {!s.enabled && <span style={{ fontSize: 10.5, color: "#9ca3af", background: "#f3f4f6", padding: "1px 7px", borderRadius: 5, fontWeight: 600 }}>PAUSED</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{s.relay}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: s.color, background: s.color + "15", padding: "2px 8px", borderRadius: 5 }}>
                      🕐 {s.start} – {s.end}
                    </span>
                    {s.days.map(d => (
                      <span key={d} style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Toggle */}
                <label className="switch" style={{ flexShrink: 0 }}>
                  <input type="checkbox" checked={s.enabled} onChange={() => handleToggle(s.id)} />
                  <span className="slider"></span>
                </label>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setEditItem(s); setShowForm(true); }} style={{
                    background: "#f3f4f6", border: "none", borderRadius: 8,
                    width: 32, height: 32, cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#e5e7eb"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f3f4f6"}
                  title="Edit">✏️</button>
                  <button onClick={() => handleDelete(s.id)} style={{
                    background: "#fef2f2", border: "none", borderRadius: 8,
                    width: 32, height: 32, cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={e => e.currentTarget.style.background = "#fef2f2"}
                  title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;