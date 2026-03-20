// models/Alert.js
// Stores fired alert events — shown in AlertsPage.jsx "Active" tab
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    deviceId: { type: String, default: "" },

    // Matches AlertsPage.jsx SEVERITY keys
    type:         { type: String, enum: ["critical", "warning", "info"], default: "warning" },
    msg:          { type: String, required: true },

    // What triggered it
    metric:       { type: String, default: "" },        // "power", "voltage" …
    triggerValue: { type: Number, default: null },

    dismissed:    { type: Boolean, default: false },
    time:         { type: Date,    default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

alertSchema.index({ owner: 1, dismissed: 1, time: -1 });

module.exports = mongoose.model("Alert", alertSchema);