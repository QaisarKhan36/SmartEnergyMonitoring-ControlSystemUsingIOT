// models/HistoryEvent.js
// Mirrors History.jsx HISTORY_DATA — one doc per discrete event
const mongoose = require("mongoose");

const historyEventSchema = new mongoose.Schema(
  {
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: String, default: "" },

    // Matches History.jsx EVENT_TYPES
    type: {
      type: String,
      enum: [
        "Device On", "Device Off", "Threshold Breach", "Alert Cleared",
        "Relay Toggle", "Schedule Triggered", "Firmware Update", "Manual Override",
      ],
      required: true,
    },
    device: { type: String, required: true },   // display name, e.g. "Home Main"
    detail: { type: String, default: "" },
    value:  { type: String, default: "" },      // "1,146 W", "ON", "v2.4.1"
    ts:     { type: Date,   default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

historyEventSchema.index({ owner: 1, ts: -1 });

module.exports = mongoose.model("HistoryEvent", historyEventSchema);