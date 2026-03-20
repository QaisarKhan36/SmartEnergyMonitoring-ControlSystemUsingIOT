// src/pages/History.jsx  — STEP 6 WIRED VERSION
// Changes from original:
//   • HISTORY_DATA array removed — data loaded from GET /api/history
//   • Filters (type, device, search) sent as query params to API
//   • Pagination done server-side
//   • Export CSV uses real fetched data

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { history as histApi } from "../services/api";

const EVENT_TYPES = [
  "Device On",
  "Device Off",
  "Threshold Breach",
  "Alert Cleared",
  "Relay Toggle",
  "Schedule Triggered",
  "Firmware Update",
];
const DEVICES_LIST = [
  "Home Main",
  "Kitchen Outlet",
  "HVAC System",
  "Smart TV",
  "Office Lamp",
  "Ceiling Fan",
];

const TYPE_META = {
  "Device On": { icon: "✅", color: "#16a34a", bg: "#f0fdf4" },
  "Device Off": { icon: "⛔", color: "#dc2626", bg: "#fef2f2" },
  "Threshold Breach": { icon: "⚠️", color: "#d97706", bg: "#fffbeb" },
  "Alert Cleared": { icon: "🔕", color: "#6b7280", bg: "#f9fafb" },
  "Relay Toggle": { icon: "🔀", color: "#2563eb", bg: "#eff6ff" },
  "Schedule Triggered": { icon: "🕐", color: "#7c3aed", bg: "#f5f3ff" },
  "Firmware Update": { icon: "🔧", color: "#0891b2", bg: "#ecfeff" },
};

const downloadCSV = (data) => {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [
    keys.join(","),
    ...data.map((r) => keys.map((k) => r[k] ?? "").join(",")),
  ].join("\n");
  const blob = new Blob([rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "smartenergy_history.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const Skeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 60,
          borderRadius: 10,
          background:
            "linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */
const History = () => {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [devFilter, setDevFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const PER_PAGE = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: PER_PAGE,
        ...(typeFilter !== "All" ? { type: typeFilter } : {}),
        ...(devFilter !== "All" ? { device: devFilter } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };
      const res = await histApi.list(params);
      setEvents(res.data || []);
      setTotal(res.total || res.count || 0);
    } catch (err) {
      console.error("[History] load failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, devFilter, search]);

  // Reload when filters change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [typeFilter, devFilter, search]);
  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(total / PER_PAGE);

  // Stats from current data
  const breachCount = events.filter(
    (e) => e.type === "Threshold Breach"
  ).length;
  const uniqueDevices = new Set(events.map((e) => e.device).filter(Boolean))
    .size;

  return (
    <div
      style={{
        padding: "22px 24px 36px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        fontFamily: "'DM Sans',sans-serif",
        background: "#eef1f8",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 900,
              fontSize: 24,
              color: "#0f1f5c",
              margin: 0,
            }}
          >
            Event History
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            All system activity — {total} total events
          </p>
        </div>
        <button
          onClick={() => downloadCSV(events)}
          style={{
            background: "linear-gradient(135deg,#f59e0b,#d97706)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
          }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
        }}
      >
        {[
          { icon: "📋", label: "Total Events", value: total },
          { icon: "⚠️", label: "Breaches (page)", value: breachCount },
          { icon: "📅", label: "Page", value: `${page}/${totalPages || 1}` },
          { icon: "🖥️", label: "Devices (page)", value: uniqueDevices },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              animation: `fadeUp 0.4s ${i * 0.06}s both`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {s.label}
              </span>
            </div>
            <p
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: "#111827",
                fontFamily: "'Outfit',sans-serif",
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "16px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search events…"
          style={{
            flex: "1 1 200px",
            padding: "9px 13px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 11,
            fontSize: 13.5,
            fontFamily: "'DM Sans',sans-serif",
            outline: "none",
            minWidth: 180,
          }}
          onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: "9px 13px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 11,
            fontSize: 13.5,
            background: "#fff",
            outline: "none",
            fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer",
          }}
        >
          <option value="All">All Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        {/* Device filter */}
        <select
          value={devFilter}
          onChange={(e) => setDevFilter(e.target.value)}
          style={{
            padding: "9px 13px",
            border: "1.5px solid #e5e7eb",
            borderRadius: 11,
            fontSize: 13.5,
            background: "#fff",
            outline: "none",
            fontFamily: "'DM Sans',sans-serif",
            cursor: "pointer",
          }}
        >
          <option value="All">All Devices</option>
          {DEVICES_LIST.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        {/* Clear */}
        {(search || typeFilter !== "All" || devFilter !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("All");
              setDevFilter("All");
            }}
            style={{
              padding: "9px 14px",
              borderRadius: 11,
              border: "1.5px solid #e5e7eb",
              background: "#f9fafb",
              color: "#6b7280",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Event list */}
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            padding: "14px 22px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "#111827",
              margin: 0,
            }}
          >
            Events
          </h3>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Page {page} of {totalPages || 1}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "16px 22px" }}>
            <Skeleton />
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: "48px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
              No events match your filters.
            </p>
          </div>
        ) : (
          events.map((ev, i) => {
            const meta = TYPE_META[ev.type] || {
              icon: "📌",
              color: "#9ca3af",
              bg: "#f3f4f6",
            };
            return (
              <div
                key={ev._id || i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 22px",
                  borderBottom:
                    i < events.length - 1 ? "1px solid #f9fafb" : "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: meta.bg,
                    border: `1px solid ${meta.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#111827",
                        fontFamily: "'Outfit',sans-serif",
                      }}
                    >
                      {ev.type}
                    </span>
                    {ev.device && (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "#9ca3af",
                          background: "#f3f4f6",
                          padding: "1px 8px",
                          borderRadius: 5,
                        }}
                      >
                        {ev.device}
                      </span>
                    )}
                    {ev.value && (
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: meta.color,
                          background: meta.bg,
                          padding: "1px 8px",
                          borderRadius: 5,
                        }}
                      >
                        {ev.value}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>
                    {ev.detail}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "#9ca3af",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {new Date(ev.ts || ev.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "14px 22px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              style={{
                padding: "7px 16px",
                borderRadius: 9,
                border: "1.5px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: 13,
                fontWeight: 600,
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              style={{
                padding: "7px 16px",
                borderRadius: 9,
                border: "1.5px solid #e5e7eb",
                background: "#f9fafb",
                fontSize: 13,
                fontWeight: 600,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
