// models/Schedule.js
// Matches ScheduleManager.jsx initialSchedules structure exactly
const mongoose = require("mongoose");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const scheduleSchema = new mongoose.Schema(
  {
    owner:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:       { type: String, required: true, trim: true },         // "Morning Routine"
    relay:      { type: String, required: true },                     // "Home Main — Relay 1"
    deviceId:   { type: String, required: true },                     // "home-main"
    relayId:    { type: String, required: true },                     // "r1"
    days:       { type: [String], enum: DAYS, default: [] },
    start:      { type: String, required: true },                     // "06:00"
    end:        { type: String, required: true },                     // "09:00"
    enabled:    { type: Boolean, default: true },
    color:      { type: String,  default: "#f59e0b" },
    lastRanAt:  { type: Date,    default: null },
  },
  { timestamps: true }
);

scheduleSchema.index({ owner: 1, enabled: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);