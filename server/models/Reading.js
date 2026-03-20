// models/Reading.js
// One document = one sensor snapshot from the IoT device
// Drives: RealTimeData.jsx live chart, EnergyChart.jsx, Analytics.jsx, Reports.jsx
const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema(
  {
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId:    { type: String, required: true },    // "home-main"

    // Core measurements (matches RealTimeCard.jsx readings array)
    voltage:     { type: Number, required: true },    // V
    current:     { type: Number, required: true },    // A
    power:       { type: Number, required: true },    // W
    energy:      { type: Number, required: true },    // kWh cumulative
    frequency:   { type: Number, default: 50.0 },    // Hz
    powerFactor: { type: Number, default: 1.0 },

    recordedAt:  { type: Date,   default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

// Fast time-range queries used by charts
readingSchema.index({ owner: 1, deviceId: 1, recordedAt: -1 });

module.exports = mongoose.model("Reading", readingSchema);