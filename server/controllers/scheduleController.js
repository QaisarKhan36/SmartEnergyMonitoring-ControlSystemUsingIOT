// controllers/scheduleController.js
const Schedule = require("../models/Schedule");

// GET /api/schedules   — list shown in ScheduleManager.jsx
exports.getSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ owner: req.user._id }).sort({ createdAt: 1 });
    res.json({ success: true, count: schedules.length, schedules });
  } catch (err) {
    next(err);
  }
};

// POST /api/schedules   — ScheduleForm "Save Schedule"
exports.createSchedule = async (req, res, next) => {
  try {
    const { name, relay, deviceId, relayId, days, start, end, color } = req.body;
    if (!name || !relay || !deviceId || !relayId || !start || !end) {
      return res.status(400).json({
        success: false,
        message: "name, relay, deviceId, relayId, start and end are required",
      });
    }

    const schedule = await Schedule.create({
      owner: req.user._id,
      name, relay, deviceId, relayId,
      days:  days  || [],
      start, end,
      color: color || "#f59e0b",
    });
    res.status(201).json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// PUT /api/schedules/:id   — edit schedule form
exports.updateSchedule = async (req, res, next) => {
  try {
    const allowed = ["name", "relay", "deviceId", "relayId", "days", "start", "end", "color", "enabled"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
    res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/schedules/:id/toggle   — enable/disable toggle in ScheduleManager
exports.toggleSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, owner: req.user._id });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });

    schedule.enabled = !schedule.enabled;
    await schedule.save();
    res.json({ success: true, enabled: schedule.enabled, schedule });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!schedule) return res.status(404).json({ success: false, message: "Schedule not found" });
    res.json({ success: true, message: "Schedule deleted" });
  } catch (err) {
    next(err);
  }
};