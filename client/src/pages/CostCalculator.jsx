import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import useDashboard from "../context/useDashboard";

const TARIFF_PLANS = [
  { id: "flat",  name: "Flat Rate",    desc: "Same rate all day",         rate: 0.16 },
  { id: "tou",   name: "Time-of-Use",  desc: "Peak/off-peak pricing",     rate: null },
  { id: "tiered",name: "Tiered",       desc: "Rate increases with usage", rate: null },
];

const TOU_RATES = [
  { label: "Off-Peak",  hours: "10PM–6AM",  rate: 0.09, color: "#22c55e" },
  { label: "Mid-Peak",  hours: "6AM–9AM",   rate: 0.14, color: "#f59e0b" },
  { label: "On-Peak",   hours: "9AM–10PM",  rate: 0.22, color: "#ef4444" },
];

const MONTHLY_DATA = [
  { month: "Aug", actual: 76.8,  budget: 90 },
  { month: "Sep", actual: 81.6,  budget: 90 },
  { month: "Oct", actual: 71.2,  budget: 90 },
  { month: "Nov", actual: 83.2,  budget: 90 },
  { month: "Dec", actual: 97.6,  budget: 90 },
  { month: "Jan", actual: 89.3,  budget: 90 },
];

const DEVICE_COSTS = [
  { name: "Home Main",      kwh: 28.4, pct: 54, dailyCost: 1.48, monthlyCost: 44.5 },
  { name: "Kitchen Outlet", kwh: 12.1, pct: 23, dailyCost: 0.63, monthlyCost: 18.9 },
  { name: "HVAC",           kwh: 7.3,  pct: 14, dailyCost: 0.38, monthlyCost: 11.4 },
  { name: "Other",          kwh: 4.7,  pct: 9,  dailyCost: 0.24, monthlyCost:  7.3 },
];

const SAVINGS_TIPS = [
  { icon: "🌙", tip: "Run heavy appliances after 10PM (off-peak)", saving: "$12–18/mo", effort: "Easy" },
  { icon: "🌡️", tip: "Reduce HVAC setpoint by 2°F during peak hours", saving: "$8–12/mo", effort: "Easy" },
  { icon: "💡", tip: "Replace incandescent bulbs with LED", saving: "$5–9/mo",  effort: "One-time" },
  { icon: "📅", tip: "Schedule laundry & dishwasher to off-peak hours", saving: "$6–10/mo", effort: "Easy" },
];

const Input = ({ label, value, onChange, prefix, suffix, type = "number", min, max, step }) => (
  <div>
    <label style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      {prefix && <span style={{ padding: "9px 12px", background: "#f9fafb", borderRight: "1px solid #e5e7eb", fontSize: 13, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>{prefix}</span>}
      <input type={type} value={value} onChange={e => onChange(+e.target.value)} min={min} max={max} step={step}
        style={{ flex: 1, padding: "9px 12px", border: "none", outline: "none", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif" }} />
      {suffix && <span style={{ padding: "9px 12px", background: "#f9fafb", borderLeft: "1px solid #e5e7eb", fontSize: 13, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>{suffix}</span>}
    </div>
  </div>
);

const Card = ({ children, title, subtitle }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)" }}>
    {title && (
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

/* ════════════════════════════
   COST CALCULATOR PAGE
════════════════════════════ */
const CostCalculator = () => {
  const { addToast } = useDashboard();

  const [tariffPlan, setTariffPlan] = useState("flat");
  const [flatRate, setFlatRate]     = useState(0.16);
  const [budget, setBudget]         = useState(90);
  const [dailyKwh]                  = useState(18.6);
  const [saved, setSaved]           = useState(false);

  const tariff = tariffPlan === "flat" ? flatRate : 0.16;

  const dailyCost    = useMemo(() => dailyKwh * tariff, [dailyKwh, tariff]);
  const monthlyCost  = useMemo(() => dailyCost * 30, [dailyCost]);
  const yearlyCost   = useMemo(() => dailyCost * 365, [dailyCost]);
  const budgetUsedPct = useMemo(() => Math.min((monthlyCost / budget) * 100, 100), [monthlyCost, budget]);
  const budgetStatus = budgetUsedPct >= 100 ? "over" : budgetUsedPct >= 80 ? "warning" : "ok";

  const statusColors = { ok: "#22c55e", warning: "#f59e0b", over: "#ef4444" };
  const statusColor  = statusColors[budgetStatus];

  const projectedData = MONTHLY_DATA.map(m => ({
    ...m,
    projected: +(m.actual * (tariff / 0.16)).toFixed(1),
    budget,
  }));

  const handleSave = () => {
    setSaved(true);
    addToast("Tariff settings saved", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      padding: "22px 24px 36px", display: "flex", flexDirection: "column", gap: 20,
      fontFamily: "'DM Sans', sans-serif", background: "#eef1f8", minHeight: "100vh",
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 24, color: "#0f1f5c", margin: 0 }}>Cost Calculator</h1>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>Tariff setup, budget tracking & savings</p>
      </div>

      {/* Budget summary banner */}
      <div style={{
        background: budgetStatus === "ok" ? "#f0fdf4" : budgetStatus === "warning" ? "#fffbeb" : "#fef2f2",
        border: `1.5px solid ${statusColor}40`,
        borderRadius: 16, padding: "18px 22px",
        display: "flex", alignItems: "center", gap: 20,
        animation: "fadeUp 0.4s both",
      }}>
        <div style={{ fontSize: 36 }}>
          {budgetStatus === "ok" ? "✅" : budgetStatus === "warning" ? "⚠️" : "🚨"}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: "#111827", margin: "0 0 4px" }}>
            Monthly Budget: ${budget}
          </p>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden", marginBottom: 4 }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: `linear-gradient(90deg, ${statusColor}, ${statusColor}bb)`,
              width: `${budgetUsedPct}%`,
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>
            Projected: <strong style={{ color: statusColor }}>${monthlyCost.toFixed(2)}</strong> of ${budget} — {budgetUsedPct.toFixed(0)}% used
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 28, color: statusColor, margin: 0 }}>
            ${monthlyCost.toFixed(2)}
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>this month</p>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>

        {/* Settings panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Tariff plan */}
          <Card title="⚡ Tariff Plan" subtitle="Select your electricity pricing structure">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {TARIFF_PLANS.map(p => (
                <button key={p.id} onClick={() => setTariffPlan(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12,
                  border: `1.5px solid ${tariffPlan === p.id ? "#f59e0b" : "#e5e7eb"}`,
                  background: tariffPlan === p.id ? "#fffbeb" : "#fafafa",
                  cursor: "pointer", textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: `2px solid ${tariffPlan === p.id ? "#f59e0b" : "#d1d5db"}`,
                    background: tariffPlan === p.id ? "#f59e0b" : "transparent",
                    flexShrink: 0, position: "relative",
                  }}>
                    {tariffPlan === p.id && (
                      <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#fff" }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", margin: 0, fontFamily: "'Outfit', sans-serif" }}>{p.name}</p>
                    <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>{p.desc}{p.rate ? ` — $${p.rate}/kWh` : ""}</p>
                  </div>
                </button>
              ))}
            </div>

            {tariffPlan === "flat" && (
              <Input label="Rate ($/kWh)" value={flatRate} onChange={setFlatRate}
                prefix="$" suffix="/kWh" min={0.01} max={1} step={0.01} />
            )}

            {tariffPlan === "tou" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TOU_RATES.map(r => (
                  <div key={r.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 12px", borderRadius: 10,
                    background: r.color + "12", border: `1px solid ${r.color}30`,
                  }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.color, fontFamily: "'Outfit', sans-serif" }}>{r.label}</span>
                      <span style={{ fontSize: 11.5, color: "#9ca3af", marginLeft: 8 }}>{r.hours}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: r.color, fontFamily: "'Outfit', sans-serif" }}>${r.rate}/kWh</span>
                  </div>
                ))}
              </div>
            )}

            {tariffPlan === "tiered" && (
              <div style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                  Tier 1: $0.12/kWh (0–300 kWh)<br />
                  Tier 2: $0.17/kWh (301–600 kWh)<br />
                  Tier 3: $0.24/kWh (600+ kWh)
                </p>
              </div>
            )}
          </Card>

          {/* Budget */}
          <Card title="🎯 Monthly Budget">
            <Input label="Budget ($)" value={budget} onChange={setBudget}
              prefix="$" suffix="/mo" min={10} max={1000} step={5} />
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[60, 90, 120].map(b => (
                <button key={b} onClick={() => setBudget(b)} style={{
                  padding: "7px 0", borderRadius: 9, border: `1.5px solid ${budget === b ? "#f59e0b" : "#e5e7eb"}`,
                  background: budget === b ? "#fffbeb" : "#f9fafb",
                  color: budget === b ? "#f59e0b" : "#6b7280",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  fontFamily: "'Outfit', sans-serif", transition: "all 0.15s",
                }}>${b}</button>
              ))}
            </div>
          </Card>

          {/* Projections */}
          <Card title="📊 Projections">
            {[
              { label: "Daily",   value: dailyCost,   unit: "/day" },
              { label: "Monthly", value: monthlyCost,  unit: "/month" },
              { label: "Yearly",  value: yearlyCost,   unit: "/year" },
            ].map((p, i) => (
              <div key={p.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none",
              }}>
                <span style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>{p.label}</span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#111827", fontFamily: "'Outfit', sans-serif" }}>
                  ${p.value.toFixed(2)}<span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}> {p.unit}</span>
                </span>
              </div>
            ))}
          </Card>

          <button onClick={handleSave} style={{
            background: saved ? "#22c55e" : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff", border: "none", borderRadius: 12,
            padding: "13px 0", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            transition: "all 0.3s", boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
          }}>
            {saved ? "✓ Saved!" : "Save Tariff Settings"}
          </button>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Budget vs actual chart */}
          <Card title="Budget vs Actual" subtitle="Last 6 months + current month projection">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={projectedData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v, n) => [`$${v}`, n === "actual" ? "Actual" : n === "projected" ? "Projected" : "Budget"]} />
                <ReferenceLine y={budget} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5}
                  label={{ value: "Budget", position: "right", fontSize: 10, fill: "#ef4444" }} />
                <Bar dataKey="actual" fill="#f59e0b" radius={[5, 5, 0, 0]} maxBarSize={30} />
                <Bar dataKey="projected" fill="#3b82f680" radius={[5, 5, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {[["#f59e0b","Actual"], ["#3b82f680","Projected"], ["#ef4444","Budget"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />{l}
                </div>
              ))}
            </div>
          </Card>

          {/* Cost by device */}
          <Card title="Cost by Device" subtitle="Estimated monthly spend per device">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {DEVICE_COSTS.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 0", borderBottom: i < DEVICE_COSTS.length - 1 ? "1px solid #f3f4f6" : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{d.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", fontFamily: "'Outfit', sans-serif" }}>
                        ${(d.monthlyCost * (tariff / 0.16)).toFixed(2)}/mo
                      </span>
                    </div>
                    <div style={{ background: "#f3f4f6", borderRadius: 999, height: 6, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        background: ["#f59e0b","#22c55e","#3b82f6","#9ca3af"][i],
                        width: `${d.pct}%`, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                      }} />
                    </div>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>{d.kwh} kWh — {d.pct}% of total</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Savings tips */}
          <Card title="💡 Savings Recommendations">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SAVINGS_TIPS.map((t, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "11px 13px",
                  background: "#f9fafb", borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  animation: `fadeUp 0.4s ${i * 0.08}s both`,
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 3px" }}>{t.tip}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "1px 7px", borderRadius: 5 }}>
                        Save {t.saving}
                      </span>
                      <span style={{ fontSize: 11.5, color: "#9ca3af", background: "#f3f4f6", padding: "1px 7px", borderRadius: 5 }}>
                        {t.effort}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;