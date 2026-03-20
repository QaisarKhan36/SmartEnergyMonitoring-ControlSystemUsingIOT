import React from "react";
import {
  FaHome, FaMicrochip, FaBolt, FaHistory,
  FaBell, FaCog, FaPlug, FaChartLine, FaFileAlt,
  FaCalendarAlt, FaDollarSign, FaSlidersH, FaQuestionCircle,
} from "react-icons/fa";
import useDashboard from "../../context/useDashboard";

const ICON_MAP = {
  home:       <FaHome />,
  analytics:  <FaChartLine />,
  devices:    <FaMicrochip />,
  realtime:   <FaPlug />,
  energyflow: <FaBolt />,
  schedule:   <FaCalendarAlt />,
  cost:       <FaDollarSign />,
  reports:    <FaFileAlt />,
  history:    <FaHistory />,
  alerts:     <FaBell />,
  settings:   <FaCog />,
  control:    <FaSlidersH />,
  help:       <FaQuestionCircle />,
};

const navSections = [
  {
    label: "MAIN",
    items: [
      { iconKey: "home",       label: "Dashboard",      page: "dashboard"  },
      { iconKey: "analytics",  label: "Analytics",      page: "analytics"  },
    ],
  },
  {
    label: "DEVICES",
    items: [
      { iconKey: "devices",    label: "Devices",        page: "devices"    },
      { iconKey: "realtime",   label: "Real-Time Data", page: "realtime"   },
      { iconKey: "energyflow", label: "Energy Flow",    page: "energyflow" },
      { iconKey: "control",    label: "Control Panel",  page: "control"    },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { iconKey: "schedule",   label: "Scheduling",     page: "scheduling" },
      { iconKey: "cost",       label: "Cost & Budget",  page: "cost"       },
      { iconKey: "reports",    label: "Reports",        page: "reports"    },
      { iconKey: "history",    label: "History",        page: "history"    },
      { iconKey: "alerts",     label: "Alerts",         page: "alerts",    badge: true },
      { iconKey: "settings",   label: "Settings",       page: "settings"   },
      { iconKey: "help",       label: "Help",           page: "help"       },
    ],
  },
];

const Sidebar = () => {
  const { alerts, sidebarOpen, currentPage, setCurrentPage } = useDashboard();

  return (
    <aside
      className="sidebar"
      style={{
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        opacity: sidebarOpen ? 1 : 0,
        width: sidebarOpen ? "232px" : "0px",
        minWidth: sidebarOpen ? "232px" : "0px",
        overflow: "hidden",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease, width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: sidebarOpen ? "auto" : "none",
      }}
    >
      {/* ── Today's Usage widget ── */}
      <div className="sidebar-energy-widget">
        <div className="sidebar-widget-top">
          <span className="sidebar-widget-label">Today&apos;s Usage</span>
          <span className="sidebar-widget-value">5.25 kWh</span>
        </div>
        <div className="sidebar-widget-bar-track">
          <div className="sidebar-widget-bar-fill" style={{ width: "62%" }} />
        </div>
        <div className="sidebar-widget-bottom">
          <span className="sidebar-widget-pct">62% of daily target</span>
        </div>
      </div>

      {/* ── Nav sections ── */}
      {navSections.map((section) => (
        <div key={section.label} className="sidebar-section">
          <p className="sidebar-section-label">{section.label}</p>
          {section.items.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <div
                key={item.label}
                className={`sidebar-item ${isActive ? "sidebar-item--active" : ""}`}
                onClick={() => setCurrentPage(item.page)}
              >
                <span className="sidebar-item-icon">{ICON_MAP[item.iconKey]}</span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge && alerts.length > 0 && (
                  <span className="sidebar-badge">{alerts.length}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-icon"><FaBolt /></div>
        <div className="sidebar-footer-text">
          <span className="sidebar-footer-title">SmartEnergy</span>
          <span className="sidebar-footer-version">v2.4.1</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;