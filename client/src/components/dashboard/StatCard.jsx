import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const StatCard = ({ title, value, unit, color, icon, trend, trendValue, trendLabel, animClass }) => {
  return (
    <div className={`stat-card-new stat-card-${color} ${animClass || ""}`}>
      <div className="stat-card-header">
        <div className={`stat-icon-badge stat-icon-${color}`}>
          <span>{icon}</span>
        </div>
        <span className={`stat-title-new stat-title-${color}`}>{title}</span>
      </div>

      <div className={`stat-value-new stat-value-${color}`}>
        {value}
        <span className="stat-unit">{unit}</span>
      </div>

      {trendValue && (
        <div className={`stat-trend ${trend === "up" ? "stat-trend-up" : "stat-trend-down"}`}>
          {trend === "up" ? <FaArrowUp style={{ fontSize: 9 }} /> : <FaArrowDown style={{ fontSize: 9 }} />}
          <span>{trendValue}</span>
          <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;