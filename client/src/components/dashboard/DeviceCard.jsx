import React from "react";
import { FaHome, FaEllipsisV, FaRegClock } from "react-icons/fa";
import { MdOutlineKitchen } from "react-icons/md";
import useDashboard from "../../context/useDashboard";

const DeviceCard = () => {
  const { devices, toggleDevice, toggleRelay, openModal, addToast } = useDashboard();

  const homeMain = devices.find(d => d.id === "home-main");
  const kitchen  = devices.find(d => d.id === "kitchen");

  const handleDeviceMenu = (deviceName) => {
    openModal("deviceMenu", { deviceName });
  };

  const handleSchedule = (relayLabel) => {
    openModal("schedule", { relayLabel });
  };

  const handleToggleDevice = (device) => {
    toggleDevice(device.id);
    addToast(`${device.name} turned ${device.enabled ? "OFF" : "ON"}`, device.enabled ? "warning" : "success");
  };

  const handleToggleRelay = (device, relay) => {
    toggleRelay(device.id, relay.id);
    addToast(`${relay.label} turned ${relay.on ? "OFF" : "ON"}`, relay.on ? "warning" : "success");
  };

  return (
    <div className="device-card-new anim-3">

      {/* ── Section 1: Home Main ── */}
      {homeMain && (
        <div className="device-section">
          <div className="device-section-header">
            <h3 className="device-section-title">Devices</h3>
            <FaEllipsisV
              className="dots-icon"
              onClick={() => handleDeviceMenu(homeMain.name)}
              title="Device options"
            />
          </div>

          <div className="main-device">
            <div className="device-icon-wrap orange-bg">
              <FaHome className="device-main-icon" />
            </div>
            <div className="device-info">
              <strong>{homeMain.name}</strong>
              <span>
                Living Room{" "}
                <span className="online-dot" style={{ color: homeMain.enabled ? "var(--green-500)" : "var(--gray-300)" }}>●</span>
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={homeMain.enabled}
                onChange={() => handleToggleDevice(homeMain)}
              />
              <span className="slider"></span>
            </label>
          </div>

          {homeMain.relays.map((relay) => (
            <div className="relay-row-new" key={relay.id}>
              <span className="relay-label">{relay.label}</span>
              <div className="relay-right">
                <button
                  className={`status-badge ${relay.on ? "on" : "off"}`}
                  onClick={() => handleToggleRelay(homeMain, relay)}
                  style={{ cursor: "pointer", border: "none", transition: "all 0.15s" }}
                  title={`Toggle ${relay.label}`}
                >
                  {relay.on ? "ON" : "OFF"}
                </button>
                <FaRegClock
                  className="relay-icon-btn"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSchedule(`${homeMain.name} — ${relay.label}`)}
                  title="Set schedule"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section 2: Kitchen Outlet ── */}
      {kitchen && (
        <div className="device-section">
          <div className="device-section-header">
            <h3 className="device-section-title">Devices</h3>
            <FaEllipsisV
              className="dots-icon"
              onClick={() => handleDeviceMenu(kitchen.name)}
              title="Device options"
            />
          </div>

          <div className="main-device">
            <div className="device-icon-wrap green-bg">
              <MdOutlineKitchen className="device-main-icon" />
            </div>
            <div className="device-info">
              <strong>{kitchen.name}</strong>
              <span
                className="online-label"
                style={{ color: kitchen.enabled ? "var(--green-600)" : "var(--gray-400)" }}
              >
                {kitchen.enabled ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={kitchen.enabled}
                onChange={() => handleToggleDevice(kitchen)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeviceCard;