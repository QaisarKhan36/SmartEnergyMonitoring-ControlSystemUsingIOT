import React, { useState, useEffect } from "react";
import useDashboard from "../context/useDashboard";
import { analytics } from "../services/api";

// ── CSV download helper (unchanged) ───────────────────────────────
const downloadCSV = (data, filename) => {
  if (!data?.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows    = data.map(row =>
    Object.values(row).map(v => (typeof v === "string" && v.includes(",") ? `"${v}"` : v)).join(",")
  ).join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// Date range → { from, to } ISO strings
const resolveRange = (range) => {
  const now  = new Date();
  const to   = now.toISOString();
  const days = {
    "Last 7 Days":  7,
    "Last 30 Days": 30,
    "This Month":   now.getDate(),
    "Last Month":   new Date(now.getFullYear(), now.getMonth(), 0).getDate(),
  };
  if (range === "Last Month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const d = days[range] || 30;
  return { from: new Date(now - d * 86400000).toISOString(), to };
};

const REPORT_TYPES = [
  { id:"daily",   icon:"📅", label:"Daily Usage",    desc:"Day-by-day kWh, cost, peak demand" },
  { id:"device",  icon:"🖥️", label:"Device Summary", desc:"Per-device consumption & runtime" },
  { id:"alerts",  icon:"🔔", label:"Alert Log",      desc:"Full history of threshold breaches" },
  { id:"monthly", icon:"📊", label:"Monthly Summary",desc:"Aggregated monthly report" },
];

const DATE_RANGES = ["Last 7 Days","Last 30 Days","This Month","Last Month"];

const Btn = ({ children, onClick, variant="primary", icon, disabled=false }) => {
  const styles = {
    primary: { background:"linear-gradient(135deg,#f59e0b,#d97706)", color:"#fff", border:"none", boxShadow:"0 4px 12px rgba(245,158,11,0.3)" },
    ghost:   { background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb" },
    green:   { background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", boxShadow:"0 4px 12px rgba(34,197,94,0.3)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:7, opacity:disabled?0.5:1, transition:"opacity 0.15s" }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
};

const Skeleton = ({ rows = 5 }) => (
  <div style={{ display:"flex",flexDirection:"column",gap:8,padding:"8px 0" }}>
    {Array.from({length:rows}).map((_,i) => (
      <div key={i} style={{ height:38,borderRadius:8,background:"linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite" }} />
    ))}
  </div>
);

// ── Preview table ──────────────────────────────────────────────────
const PreviewTable = ({ data, loading }) => {
  if (loading) return <Skeleton />;
  if (!data?.length) return <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:"24px 0" }}>No data available for this range.</p>;

  const headers = Object.keys(data[0]);

  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
        <thead>
          <tr style={{ background:"#f9fafb" }}>
            {headers.map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11.5, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.5px", fontFamily:"'Outfit',sans-serif", borderBottom:"1px solid #e5e7eb" }}>
                {h.replace(/_/g," ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 8).map((row, i) => (
            <tr key={i} style={{ borderBottom:"1px solid #f3f4f6" }}
              onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {headers.map((h, j) => (
                <td key={h} style={{ padding:"10px 14px", fontSize:13, color:j===0?"#374151":"#6b7280", fontWeight:j===0?600:400 }}>
                  {row[h] === "Online" ? (
                    <span style={{ color:"#16a34a",background:"#f0fdf4",padding:"2px 8px",borderRadius:6,fontSize:11.5,fontWeight:700 }}>● Online</span>
                  ) : String(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 8 && (
        <p style={{ fontSize:11.5, color:"#9ca3af", margin:"10px 4px 0", fontStyle:"italic" }}>
          Showing 8 of {data.length} rows — full export includes all records
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */
const Reports = () => {
  const { addToast } = useDashboard();

  const [selectedType, setSelectedType] = useState("daily");
  const [dateRange,    setDateRange]    = useState("Last 30 Days");
  const [exporting,    setExporting]    = useState(false);
  const [lastExported, setLastExported] = useState(null);
  const [previewData,  setPreviewData]  = useState([]);
  const [loadingPrev,  setLoadingPrev]  = useState(false);

  // Load preview whenever type or range changes
  useEffect(() => {
    const loadPreview = async () => {
      setLoadingPrev(true);
      try {
        const { from, to } = resolveRange(dateRange);
        const res = await analytics.export(selectedType, from, to);
        setPreviewData(res.data || []);
      } catch (err) {
        console.error("[Reports] preview failed:", err.message);
        setPreviewData([]);
      } finally {
        setLoadingPrev(false);
      }
    };
    loadPreview();
  }, [selectedType, dateRange]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const { from, to } = resolveRange(dateRange);
      const res      = await analytics.export(selectedType, from, to);
      const data     = res.data || [];
      const filename = `smartenergy_${selectedType}_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCSV(data, filename);
      setLastExported(new Date().toLocaleTimeString());
      addToast(`CSV exported: ${filename}`, "success");
    } catch (err) {
      addToast(err.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const selectedReport = REPORT_TYPES.find(r => r.id === selectedType);

  return (
    <div style={{ padding:"22px 24px 36px", display:"flex", flexDirection:"column", gap:20, fontFamily:"'DM Sans',sans-serif", background:"#eef1f8", minHeight:"100vh" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:24, color:"#0f1f5c", margin:0 }}>Reports &amp; Export</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>Download your real energy data as CSV</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="ghost" onClick={() => window.print()} icon="🖨️">Print</Btn>
          <Btn variant="green" onClick={handleExportCSV} disabled={exporting} icon={exporting?"⏳":"⬇️"}>
            {exporting ? "Exporting…" : "Export CSV"}
          </Btn>
        </div>
      </div>

      {/* Last export notice */}
      {lastExported && (
        <div style={{ background:"#f0fdf4", border:"1.5px solid #86efac", borderRadius:12, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#166534", fontWeight:500, animation:"fadeUp 0.3s both" }}>
          <span>✅</span> Last exported at {lastExported} — check your downloads folder.
        </div>
      )}

      {/* Config row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:16 }}>

        {/* Report type selector */}
        <div style={{ background:"#fff", borderRadius:16, padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 14px" }}>Report Type</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
            {REPORT_TYPES.map(t => (
              <button key={t.id} onClick={() => setSelectedType(t.id)} style={{ display:"flex", alignItems:"flex-start", gap:11, padding:"13px 14px", borderRadius:12, border:`1.5px solid ${selectedType===t.id?"#f59e0b":"#e5e7eb"}`, background:selectedType===t.id?"#fffbeb":"#fafafa", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{t.icon}</span>
                <div>
                  <p style={{ fontSize:13.5, fontWeight:700, color:selectedType===t.id?"#92400e":"#111827", margin:"0 0 2px", fontFamily:"'Outfit',sans-serif" }}>{t.label}</p>
                  <p style={{ fontSize:11.5, color:"#9ca3af", margin:0, lineHeight:1.4 }}>{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date range + summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"18px 20px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:"0 0 12px" }}>Date Range</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {DATE_RANGES.map(r => (
                <button key={r} onClick={() => setDateRange(r)} style={{ padding:"8px 12px", borderRadius:9, border:"none", background:dateRange===r?"#fffbeb":"transparent", color:dateRange===r?"#f59e0b":"#6b7280", fontWeight:dateRange===r?700:500, fontSize:13, cursor:"pointer", textAlign:"left", borderLeft:`3px solid ${dateRange===r?"#f59e0b":"transparent"}`, transition:"all 0.15s" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background:"linear-gradient(135deg,#0f1f5c,#1e3a8a)", borderRadius:16, padding:"18px 20px", color:"#fff" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 10px", fontFamily:"'Outfit',sans-serif" }}>Export Summary</p>
            {[
              ["Report",  selectedReport?.label || "—"],
              ["Period",  dateRange],
              ["Records", loadingPrev ? "Loading…" : `${previewData.length} rows`],
              ["Format",  "CSV (.csv)"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{k}</span>
                <span style={{ fontSize:12.5, fontWeight:600, color:"rgba(255,255,255,0.9)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background:"#fff", borderRadius:16, padding:"20px 22px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:"#111827", margin:0 }}>
              {selectedReport?.icon} {selectedReport?.label} — Preview
            </h3>
            <p style={{ fontSize:12, color:"#9ca3af", margin:"2px 0 0" }}>{dateRange}</p>
          </div>
          <Btn variant="green" onClick={handleExportCSV} disabled={exporting} icon="⬇️">Download CSV</Btn>
        </div>
        <PreviewTable data={previewData} loading={loadingPrev} />
      </div>
    </div>
  );
};

export default Reports;
