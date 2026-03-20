// models/Device.js
// Matches DashboardContext INITIAL_DEVICES + Devices.jsx add-device form
const mongoose = require("mongoose");

// Each relay channel inside a device (matches DashboardContext relays array)
const relaySchema = new mongoose.Schema(
  {
    relayId: { type: String, required: true },   // "r1", "r2", "r3", "r4"
    label:   { type: String, required: true },   // "Relay 1"
    on:      { type: Boolean, default: false },
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // ── Identity ──────────────────────────────────────────────────
    deviceId: { type: String, required: true },  // "home-main", "kitchen" — used by frontend
    name:     { type: String, required: true, trim: true },
    location: { type: String, default: "" },     // room / area
    icon:     { type: String, default: "plug" }, // icon key shown in DeviceCard

    // ── State ─────────────────────────────────────────────────────
    enabled:  { type: Boolean, default: true },
    online:   { type: Boolean, default: true },

    // ── Relay channels (home-main has 4, kitchen has 0) ───────────
    relays:   [relaySchema],

    // ── Specs (from Devices.jsx add wizard) ──────────────────────
    wattage:  { type: Number, default: 0 },      // rated watts
    voltage:  { type: Number, default: 220 },

    // ── Latest sensor snapshot (updated by IoT hardware) ─────────
    latestReading: {
      voltage:     { type: Number, default: 220.0 },
      current:     { type: Number, default: 0 },
      power:       { type: Number, default: 0 },
      energy:      { type: Number, default: 0 },
      frequency:   { type: Number, default: 50.0 },
      powerFactor: { type: Number, default: 1.0 },
      recordedAt:  { type: Date,   default: Date.now },
    },
  },
  { timestamps: true }
);

// One user can't have two devices with the same deviceId
deviceSchema.index({ owner: 1, deviceId: 1 }, { unique: true });

module.exports = mongoose.model("Device", deviceSchema);