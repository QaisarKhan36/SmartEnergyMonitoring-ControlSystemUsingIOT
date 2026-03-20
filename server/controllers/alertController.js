// controllers/alertController.js
const Alert     = require("../models/Alert");
const AlertRule = require("../models/AlertRule");
const User      = require("../models/User");

// ─── ALERT EVENTS ───────────────────────────────────────────────

// GET /api/alerts   — active (not dismissed) alerts shown in AlertsPage + TopBar badge
exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ owner: req.user._id, dismissed: false })
      .sort({ time: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    next(err);
  }
};

// POST /api/alerts  — create alert (called by readingController auto-trigger)
exports.createAlert = async (req, res, next) => {
  try {
    const { msg, type, deviceId, metric, triggerValue } = req.body;
    if (!msg) return res.status(400).json({ success: false, message: "msg is required" });

    const alert = await Alert.create({
      owner: req.user._id,
      msg, deviceId,
      type: type || "warning",
      metric, triggerValue,
      time: new Date(),
    });
    res.status(201).json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts/:id  — dismiss one alert (× button in AlertsPage)
exports.dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { dismissed: true },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, message: "Alert dismissed" });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts   — clear ALL alerts (AlertsCard "Clear All", AlertsPage)
exports.clearAlerts = async (req, res, next) => {
  try {
    await Alert.updateMany({ owner: req.user._id, dismissed: false }, { dismissed: true });
    res.json({ success: true, message: "All alerts cleared" });
  } catch (err) {
    next(err);
  }
};

// ─── ALERT RULES ────────────────────────────────────────────────

// GET /api/alerts/rules
exports.getRules = async (req, res, next) => {
  try {
    const rules = await AlertRule.find({ owner: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, rules });
  } catch (err) {
    next(err);
  }
};

// POST /api/alerts/rules   — "New Rule" in AlertsPage Rules tab
exports.createRule = async (req, res, next) => {
  try {
    const { name, metric, condition, value, severity, enabled } = req.body;
    if (!name || !metric || !condition || value === undefined) {
      return res.status(400).json({ success: false, message: "name, metric, condition and value are required" });
    }
    const rule = await AlertRule.create({
      owner: req.user._id,
      name, metric, condition, value,
      severity: severity || "warning",
      enabled:  enabled !== undefined ? enabled : true,
    });
    res.status(201).json({ success: true, rule });
  } catch (err) {
    next(err);
  }
};

// PUT /api/alerts/rules/:id  — edit rule form
exports.updateRule = async (req, res, next) => {
  try {
    const allowed = ["name", "metric", "condition", "value", "severity", "enabled", "triggered"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const rule = await AlertRule.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
    res.json({ success: true, rule });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/alerts/rules/:id  — 🗑️ button in rule list
exports.deleteRule = async (req, res, next) => {
  try {
    const rule = await AlertRule.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!rule) return res.status(404).json({ success: false, message: "Rule not found" });
    res.json({ success: true, message: "Rule deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── GLOBAL THRESHOLD ────────────────────────────────────────────
// Shared between AlertsCard, RealTimeCard, AlertsPage slider, ThresholdModal

// GET /api/alerts/threshold
exports.getThreshold = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("alertThreshold alertsEnabled");
    res.json({
      success:       true,
      threshold:     user.alertThreshold,
      alertsEnabled: user.alertsEnabled,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/alerts/threshold   — ThresholdModal "Save Changes"
exports.updateThreshold = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.threshold     !== undefined) updates.alertThreshold = req.body.threshold;
    if (req.body.alertsEnabled !== undefined) updates.alertsEnabled  = req.body.alertsEnabled;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({
      success:       true,
      threshold:     user.alertThreshold,
      alertsEnabled: user.alertsEnabled,
    });
  } catch (err) {
    next(err);
  }
};