import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine,
} from "recharts";
import useDashboard from "../../context/useDashboard";

const chartData = {
  Daily: [
    { time: "12 AM", value: 85   },
    { time: "3 AM",  value: 160  },
    { time: "6 AM",  value: 420  },
    { time: "9 AM",  value: 730  },
    { time: "12 PM", value: 1180 },
    { time: "3 PM",  value: 1050 },
    { time: "6 PM",  value: 820  },
    { time: "9 PM",  value: 580  },
    { time: "12 AM", value: 290  },
  ],
  Weekly: [
    { time: "Mon", value: 4200  },
    { time: "Tue", value: 5100  },
    { time: "Wed", value: 4780  },
    { time: "Thu", value: 6200  },
    { time: "Fri", value: 5900  },
    { time: "Sat", value: 3400  },
    { time: "Sun", value: 2800  },
  ],
  Monthly: [
    { time: "Jan",  value: 142000 },
    { time: "Feb",  value: 128000 },
    { time: "Mar",  value: 155000 },
    { time: "Apr",  value: 138000 },
    { time: "May",  value: 162000 },
    { time: "Jun",  value: 178000 },
    { time: "Jul",  value: 195000 },
    { time: "Aug",  value: 188000 },
    { time: "Sep",  value: 171000 },
    { time: "Oct",  value: 159000 },
    { time: "Nov",  value: 144000 },
    { time: "Dec",  value: 151000 },
  ],
};

const subtitles = {
  Daily:   "(Last 24 Hours)",
  Weekly:  "(Last 7 Days)",
  Monthly: "(Last 12 Months)",
};

const yFormatter = (tab) => (v) => {
  if (tab === "Monthly") return `${(v / 1000).toFixed(0)}k W`;
  if (tab === "Weekly")  return `${(v / 1000).toFixed(1)}k W`;
  return `${v} W`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "white", border: "1px solid #e5e7eb",
        borderRadius: 10, padding: "8px 13px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        fontFamily: "DM Sans, sans-serif",
      }}>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b", fontFamily: "Outfit, sans-serif" }}>
          {payload[0].value.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 600 }}>W</span>
        </p>
      </div>
    );
  }
  return null;
};

const EnergyChart = () => {
  const { chartTab, setChartTab, threshold } = useDashboard();

  const data = chartData[chartTab];

  return (
    <div className="chart-card anim-3">
      <div className="chart-header">
        <h3 className="chart-title">
          Energy Consumption{" "}
          <span className="chart-subtitle">{subtitles[chartTab]}</span>
        </h3>
        <div className="chart-tabs">
          {["Daily", "Weekly", "Monthly"].map((tab) => (
            <button
              key={tab}
              className={`chart-tab-btn ${chartTab === tab ? "active" : ""}`}
              onClick={() => setChartTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans, sans-serif" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tickFormatter={yFormatter(chartTab)}
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans, sans-serif" }}
            axisLine={false} tickLine={false} width={56}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#f59e0b", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          {chartTab === "Daily" && (
            <ReferenceLine
              y={threshold}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "Limit", position: "right", fontSize: 10, fill: "#ef4444" }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#energyGrad)"
            dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "white" }}
            activeDot={{ r: 6, fill: "#f59e0b", stroke: "white", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="last-updated">Last updated: 2025-01-20 02:20 PM</p>
    </div>
  );
};

export default EnergyChart;