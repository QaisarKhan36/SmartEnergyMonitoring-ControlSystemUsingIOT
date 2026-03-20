// controllers/readingController.js
const Reading      = require("../models/Reading");
const Alert        = require("../models/Alert");
const HistoryEvent = require("../models/HistoryEvent");
const User         = require("../models/User");
const Device       = require("../models/Device");

// ── POST /api/readings ────────────────────────────────────────────
// IoT hardware calls this endpoint every N seconds to push a sensor snapshot.
// Also auto-fires an alert + history event if power > user's threshold.
exports.ingestReading = async (req, res, next) => {
  try {
    const { deviceId, voltage, current, power, energy, frequency, powerFactor } = req.body;

    if (!deviceId || voltage === undefined || current === undefined ||
        power === undefined || energy === undefined) {
      return res.status(400).json({
        success: false,
        message: "deviceId, voltage, current, power and energy are required",
      });
    }

    // Save sensor snapshot
    const reading = await Reading.create({
      owner: req.user._id,
      deviceId, voltage, current, power, energy,
      frequency:   frequency   ?? 50.0,
      powerFactor: powerFactor ?? 1.0,
    });

    // Update device.latestReading for fast dashboard queries
    await Device.findOneAndUpdate(
      { owner: req.user._id, deviceId },
      {
        "latestReading.voltage":     voltage,
        "latestReading.current":     current,
        "latestReading.power":       power,
        "latestReading.energy":      energy,
        "latestReading.frequency":   frequency   ?? 50.0,
        "latestReading.powerFactor": powerFactor ?? 1.0,
        "latestReading.recordedAt":  new Date(),
        online: true,
      }
    );

    // Auto-trigger threshold alert
    const user = await User.findById(req.user._id).select("alertThreshold alertsEnabled");
    if (user.alertsEnabled && power > user.alertThreshold) {
      await Alert.create({
        owner: req.user._id,
        deviceId,
        msg:          `High Power Consumption Detected (${power.toFixed(1)} W)`,
        type:         "warning",
        metric:       "power",
        triggerValue: power,
        time:         new Date(),
      });

      await HistoryEvent.create({
        owner: req.user._id, deviceId,
        type:   "Threshold Breach",
        device: deviceId,
        detail: `Power reached ${power.toFixed(1)}W — exceeded ${user.alertThreshold}W limit`,
        value:  `${power.toFixed(1)} W`,
      });
    }

    res.status(201).json({ success: true, reading });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/readings/latest ──────────────────────────────────────
// Used by Dashboard stat cards and RealTimeData.jsx initial load
exports.getLatest = async (req, res, next) => {
  try {
    const { deviceId } = req.query;
    const filter = { owner: req.user._id };
    if (deviceId) filter.deviceId = deviceId;

    const reading = await Reading.findOne(filter).sort({ recordedAt: -1 });
    if (!reading) {
      return res.status(404).json({ success: false, message: "No readings found" });
    }
    res.json({ success: true, reading });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/readings/history ─────────────────────────────────────
// Used by EnergyChart.jsx (daily/weekly/monthly tabs) and Analytics.jsx
// Query params: deviceId, from, to, limit (default 200)
exports.getHistory = async (req, res, next) => {
  try {
    const { deviceId, from, to, limit = 200 } = req.query;
    const filter = { owner: req.user._id };
    if (deviceId) filter.deviceId = deviceId;
    if (from || to) {
      filter.recordedAt = {};
      if (from) filter.recordedAt.$gte = new Date(from);
      if (to)   filter.recordedAt.$lte = new Date(to);
    }

    const readings = await Reading.find(filter)
      .sort({ recordedAt: 1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: readings.length, readings });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/readings/summary ─────────────────────────────────────
// Used by Analytics.jsx summary cards and CostCalculator.jsx projections
// Query params: period = "daily" | "weekly" | "monthly"
exports.getSummary = async (req, res, next) => {
  try {
    const { period = "daily", deviceId } = req.query;

    const now  = new Date();
    const from = new Date();
    if (period === "daily")   from.setHours(0, 0, 0, 0);
    if (period === "weekly")  from.setDate(now.getDate() - 7);
    if (period === "monthly") from.setMonth(now.getMonth() - 1);

    const filter = { owner: req.user._id, recordedAt: { $gte: from } };
    if (deviceId) filter.deviceId = deviceId;

    const readings = await Reading.find(filter).sort({ recordedAt: 1 });

    if (!readings.length) {
      return res.json({
        success: true,
        summary: { avgPower: 0, maxPower: 0, totalEnergy: 0, avgVoltage: 0, count: 0, period },
      });
    }

    const powers   = readings.map((r) => r.power);
    const voltages = readings.map((r) => r.voltage);

    res.json({
      success: true,
      summary: {
        period,
        count:       readings.length,
        avgPower:    +(powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(2),
        maxPower:    Math.max(...powers),
        totalEnergy: +(readings[readings.length - 1].energy - readings[0].energy).toFixed(4),
        avgVoltage:  +(voltages.reduce((a, b) => a + b, 0) / voltages.length).toFixed(2),
        from,
        to: now,
      },
    });
  } catch (err) {
    next(err);
  }
};