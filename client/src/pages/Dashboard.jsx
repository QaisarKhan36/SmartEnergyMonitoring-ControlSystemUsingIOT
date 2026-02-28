import React from "react";

import { DashboardProvider } from "../context/DashboardContext";
import useDashboard from "../context/useDashboard";
import ModalManager from "../components/shared/ModalManager";
import ToastContainer from "../components/shared/ToastContainer";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/TopBar";

import StatCard from "../components/dashboard/StatCard";
import EnergyChart from "../components/dashboard/EnergyChart";
import DeviceCard from "../components/dashboard/DeviceCard";
import RealTimeCard from "../components/dashboard/RealTimeCard";
import AlertsCard from "../components/dashboard/AlertsCard";

import Analytics from "./Analytics";
import EnergyFlow from "./EnergyFlow";
import ScheduleManager from "./ScheduleManager";
import CostCalculator from "./CostCalculator";
import Reports from "./Reports";
import Devices from "./Devices";
import History from "./History";
import AlertsPage from "./AlertsPage";
import RealTimeData from "./RealTimeData";
import Settings from "./Settings";
import Control from "./Control";
import Help from "./Help";

const DashboardHome = () => (
  <div className="dashboard-body">
    <div className="stats-grid">
      <StatCard title="Real-Time Power" value="1,146.6" unit=" W" color="orange" icon="⚡" trend="up" trendValue="+8.2%" trendLabel=" vs yesterday" animClass="anim-1" />
      <StatCard title="Cost Today"      value="2.30"    unit=" $" color="green"  icon="💰" trend="down" trendValue="-3.1%" trendLabel=" vs yesterday" animClass="anim-2" />
      <StatCard title="Energy Usage Today" value="5.25" unit=" kWh" color="blue" icon="⚡" trend="up" trendValue="+1.4%" trendLabel=" vs yesterday" animClass="anim-3" />
    </div>
    <div className="dashboard-main">
      <div className="left-section">
        <EnergyChart />
        <RealTimeCard />
      </div>
      <div className="right-section">
        <DeviceCard />
        <AlertsCard />
      </div>
    </div>
  </div>
);

const PageRouter = () => {
  const { currentPage } = useDashboard();
  const pages = {
    analytics:  <Analytics />,
    energyflow: <EnergyFlow />,
    scheduling: <ScheduleManager />,
    cost:       <CostCalculator />,
    reports:    <Reports />,
    devices:    <Devices />,
    history:    <History />,
    alerts:     <AlertsPage />,
    realtime:   <RealTimeData />,
    settings:   <Settings />,
    control:    <Control />,
    help:       <Help />,
  };
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {pages[currentPage] || <DashboardHome />}
    </div>
  );
};

const DashboardInner = () => (
  <div className="dashboard-layout">
    <Sidebar />
    <div className="dashboard-content">
      <Topbar />
      <PageRouter />
    </div>
    <ModalManager />
    <ToastContainer />
  </div>
);

const Dashboard = () => (
  <DashboardProvider>
    <DashboardInner />
  </DashboardProvider>
);

export default Dashboard;