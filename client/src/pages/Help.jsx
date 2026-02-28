import React, { useState } from "react";
import useDashboard from "../context/useDashboard";

const FAQ_DATA = [
  {
    section: "Getting Started",
    icon: "🚀",
    items: [
      { q: "How do I add a new device?",                  a: "Go to the Devices page and click '+ Add Device'. Follow the 2-step wizard to enter the device name, room, icon, wattage, and voltage." },
      { q: "What is the Energy Flow diagram?",            a: "The Energy Flow page shows a live visual map of how power flows from the grid (and solar, if enabled) to your devices in real time." },
      { q: "How do I connect a real hardware device?",   a: "SmartEnergy connects via the hardware API. Go to Settings → API Access to retrieve your API key and check the hardware documentation folder." },
    ],
  },
  {
    section: "Alerts & Thresholds",
    icon: "🔔",
    items: [
      { q: "How do I set a power threshold?",             a: "Click the threshold bar on the dashboard, or go to Alerts → Rules to set global and per-metric thresholds. You can also use the Settings → System page." },
      { q: "Why am I getting too many alerts?",           a: "Increase the cooldown period in Alerts → Notifications, or raise the threshold on the Rules tab. You can also toggle alerts off temporarily from the top-bar switch." },
      { q: "What is the difference between an alert rule and a global threshold?", a: "The global threshold applies to total power consumption. Alert rules let you set per-metric conditions (voltage, current, frequency, etc.) with individual severity levels." },
    ],
  },
  {
    section: "Scheduling",
    icon: "🕐",
    items: [
      { q: "How do schedules work?",                      a: "Schedules automate relay on/off times based on the days and time window you define. Use the Scheduling page to create, edit, or delete schedules, or apply a quick preset." },
      { q: "Can I schedule a whole device (not just a relay)?", a: "Currently schedules target individual relays. To schedule an entire device, create one schedule per relay." },
    ],
  },
  {
    section: "Reports & Data",
    icon: "📊",
    items: [
      { q: "How do I export my data?",                    a: "Go to Reports & Export, select a report type and date range, then click 'Export CSV'. The file will download immediately to your device." },
      { q: "How long is data retained?",                  a: "Default retention is 30 days. You can change this in Settings → System → Log Retention (up to 365 days)." },
    ],
  },
  {
    section: "Cost Calculator",
    icon: "💰",
    items: [
      { q: "How accurate are the cost projections?",      a: "Projections are based on your selected tariff plan and recent consumption data. For the most accurate results, use the Time-of-Use plan if your utility supports it." },
      { q: "What is a TOU tariff?",                       a: "Time-of-Use (TOU) pricing charges different rates at different times of day — typically cheaper at night (off-peak) and more expensive during midday (on-peak)." },
    ],
  },
];

const SHORTCUTS = [
  { keys: ["⌘", "K"],       desc: "Open global search"          },
  { keys: ["Esc"],           desc: "Close any modal or dialog"   },
  { keys: ["Click legend"], desc: "Filter chart data"           },
  { keys: ["⏸ / ▶"],         desc: "Pause/resume real-time data" },
];

const CONTACT_CARDS = [
  { icon: "📧", label: "Email Support",    value: "support@smartenergy.io",  color: "#3b82f6" },
  { icon: "📖", label: "Documentation",    value: "docs.smartenergy.io",     color: "#22c55e" },
  { icon: "🐛", label: "Report a Bug",     value: "github.com/smartenergy",  color: "#ef4444" },
  { icon: "💬", label: "Community Forum",  value: "community.smartenergy.io",color: "#8b5cf6" },
];

/* ════════════════════════════
   HELP PAGE
════════════════════════════ */
const Help = () => {
  const { addToast } = useDashboard();
  const [openIndex, setOpenIndex] = useState(null); // "sectionIdx-itemIdx"
  const [search, setSearch]       = useState("");

  const toggle = (key) => setOpenIndex(prev => prev === key ? null : key);

  const filteredSections = search.trim()
    ? FAQ_DATA.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.q.toLowerCase().includes(search.toLowerCase()) ||
          i.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : FAQ_DATA;

  return (
    <div style={{
      padding: "22px 24px 40px", display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif", background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes expand{from{opacity:0;max-height:0}to{opacity:1;max-height:400px}}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 26, color: "#0a1628", margin: 0 }}>
          Help & Support
        </h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
          FAQs, keyboard shortcuts & contact info
        </p>
      </div>

      {/* Hero search */}
      <div style={{
        background: "linear-gradient(135deg, #0a1628, #1e3a8a)",
        borderRadius: 20, padding: "32px 28px", textAlign: "center",
        animation: "fadeUp 0.4s both",
      }}>
        <p style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Outfit', sans-serif", margin: "0 0 6px" }}>
          How can we help?
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 20px" }}>Search FAQs or browse topics below</p>
        <div style={{ position: "relative", maxWidth: 440, margin: "0 auto" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            style={{
              width: "100%", padding: "12px 16px 12px 38px",
              borderRadius: 13, border: "none", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
              background: "rgba(255,255,255,0.12)", color: "#fff",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* FAQ accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredSections.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 18, padding: "50px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🤷</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>No results found</p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: "6px 0 0" }}>Try different keywords</p>
            </div>
          ) : (
            filteredSections.map((section, si) => (
              <div key={si} style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", animation: `fadeUp 0.4s ${si * 0.07}s both` }}>
                {/* Section header */}
                <div style={{ padding: "16px 22px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{section.icon}</span>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>{section.section}</h3>
                </div>

                {/* FAQ items */}
                {section.items.map((item, ii) => {
                  const key  = `${si}-${ii}`;
                  const open = openIndex === key;
                  return (
                    <div key={ii} style={{ borderBottom: ii < section.items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <button
                        onClick={() => toggle(key)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "15px 22px", background: open ? "#fffbeb" : "none", border: "none",
                          cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "none"; }}
                      >
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: open ? "#92400e" : "#374151", flex: 1, paddingRight: 16, lineHeight: 1.4 }}>{item.q}</span>
                        <span style={{ fontSize: 18, color: open ? "#f59e0b" : "#9ca3af", flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 22px 16px", animation: "fadeUp 0.2s both" }}>
                          <p style={{ fontSize: 13.5, color: "#6b7280", margin: 0, lineHeight: 1.6, borderLeft: "3px solid #f59e0b", paddingLeft: 14 }}>
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Keyboard shortcuts */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 14px" }}>⌨️ Shortcuts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SHORTCUTS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12.5, color: "#6b7280" }}>{s.desc}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.keys.map((k, j) => (
                      <kbd key={j} style={{ padding: "2px 8px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: "0 0 14px" }}>📬 Contact & Links</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CONTACT_CARDS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => addToast(`Opening ${c.label}…`, "info")}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    border: `1px solid ${c.color}20`,
                    background: c.color + "08",
                    cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = c.color + "16"}
                  onMouseLeave={e => e.currentTarget.style.background = c.color + "08"}
                >
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: c.color, fontFamily: "'Outfit', sans-serif", margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{c.value}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Version info */}
          <div style={{ background: "linear-gradient(135deg, #f9fafb, #f3f4f6)", borderRadius: 16, padding: "16px 18px", border: "1px solid #e5e7eb", textAlign: "center" }}>
            <p style={{ fontSize: 22, margin: "0 0 6px" }}>⚡</p>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>SmartEnergy</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "4px 0 8px" }}>Version 2.4.1 — Jan 2025</p>
            <button
              onClick={() => addToast("You are on the latest version!", "success")}
              style={{ padding: "7px 18px", borderRadius: 9, border: "none", background: "#22c55e", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Check for Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;