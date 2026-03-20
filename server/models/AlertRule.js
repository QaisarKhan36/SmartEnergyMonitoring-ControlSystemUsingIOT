// models/AlertRule.js
// Matches AlertsPage.jsx INITIAL_RULES and RuleForm fields exactly
const mongoose = require("mongoose");

const alertRuleSchema = new mongoose.Schema(
  {
    owner:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:      { type: String, required: true, trim: true },
    metric:    { type: String, enum: ["power", "energy", "voltage", "current", "frequency"], default: "power" },
    condition: { type: String, enum: ["above", "below"], default: "above" },
    value:     { type: Number, required: true },
    severity:  { type: String, enum: ["critical", "warning", "info"], default: "warning" },
    enabled:   { type: Boolean, default: true },
    triggered: { type: Boolean, default: false },   // true while condition is currently met
  },
  { timestamps: true }
);

alertRuleSchema.index({ owner: 1, enabled: 1 });

module.exports = mongoose.model("AlertRule", alertRuleSchema);