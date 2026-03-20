// controllers/deviceController.js
const Device       = require("../models/Device");
const HistoryEvent = require("../models/HistoryEvent");

// ── GET /api/devices ─────────────────────────────────────────────
exports.getDevices = async (req, res, next) => {
  try {
    const devices = await Device.find({ owner: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, count: devices.length, devices });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/devices/:id ─────────────────────────────────────────
exports.getDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, owner: req.user._id });
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });
    res.json({ success: true, device });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/devices ────────────────────────────────────────────
// Called from Devices.jsx "Add Device" modal
exports.createDevice = async (req, res, next) => {
  try {
    const { deviceId, name, location, icon, wattage, voltage, relays } = req.body;
    if (!deviceId || !name) {
      return res.status(400).json({ success: false, message: "deviceId and name are required" });
    }

    const device = await Device.create({
      owner: req.user._id,
      deviceId, name, location, icon,
      wattage: wattage || 0,
      voltage: voltage || 220,
      relays:  relays  || [],
    });

    // Log to history
    await HistoryEvent.create({
      owner: req.user._id, deviceId,
      type: "Device On", device: name,
      detail: `${name} added to the system`,
    });

    res.status(201).json({ success: true, device });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/devices/:id ─────────────────────────────────────────
exports.updateDevice = async (req, res, next) => {
  try {
    const allowed = ["name", "location", "icon", "wattage", "voltage"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });
    res.json({ success: true, device });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/devices/:id ──────────────────────────────────────
exports.deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });

    await HistoryEvent.create({
      owner: req.user._id, deviceId: device.deviceId,
      type: "Device Off", device: device.name,
      detail: `${device.name} removed from the system`,
    });

    res.json({ success: true, message: "Device removed" });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/devices/:id/toggle ───────────────────────────────
// Called from DeviceCard.jsx switch, Control.jsx device toggles
exports.toggleDevice = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, owner: req.user._id });
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });

    device.enabled = !device.enabled;
    device.online  =  device.enabled;
    await device.save();

    await HistoryEvent.create({
      owner: req.user._id, deviceId: device.deviceId,
      type:   device.enabled ? "Device On" : "Device Off",
      device: device.name,
      detail: `${device.name} turned ${device.enabled ? "ON" : "OFF"} manually`,
    });

    res.json({ success: true, enabled: device.enabled, device });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/devices/:id/relay/:relayId ───────────────────────
// Called from DeviceCard.jsx relay buttons, Control.jsx relay toggles
exports.toggleRelay = async (req, res, next) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, owner: req.user._id });
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });

    const relay = device.relays.find((r) => r.relayId === req.params.relayId);
    if (!relay) return res.status(404).json({ success: false, message: "Relay not found" });

    relay.on = !relay.on;
    await device.save();

    await HistoryEvent.create({
      owner: req.user._id, deviceId: device.deviceId,
      type: "Relay Toggle", device: device.name,
      detail: `${relay.label} turned ${relay.on ? "ON" : "OFF"}`,
      value:  relay.on ? "ON" : "OFF",
    });

    res.json({ success: true, relayId: relay.relayId, on: relay.on, device });
  } catch (err) {
    next(err);
  }
};