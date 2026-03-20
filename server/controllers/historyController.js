// controllers/historyController.js
const HistoryEvent = require("../models/HistoryEvent");

// ── GET /api/history ──────────────────────────────────────────────
// Paginated event log — powers History.jsx table with all its filters
// Query: type, device, from, to, search, page, limit
exports.getHistory = async (req, res, next) => {
  try {
    const { type, device, from, to, search, page = 1, limit = 20 } = req.query;

    const filter = { owner: req.user._id };
    if (type   && type   !== "All") filter.type   = type;
    if (device && device !== "All") filter.device = device;
    if (from || to) {
      filter.ts = {};
      if (from) filter.ts.$gte = new Date(from);
      if (to)   filter.ts.$lte = new Date(to);
    }
    if (search) {
      filter.$or = [
        { detail: { $regex: search, $options: "i" } },
        { device: { $regex: search, $options: "i" } },
        { type:   { $regex: search, $options: "i" } },
      ];
    }

    const total  = await HistoryEvent.countDocuments(filter);
    const events = await HistoryEvent.find(filter)
      .sort({ ts: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    res.json({
      success: true,
      total,
      page:  +page,
      pages: Math.ceil(total / +limit),
      events,
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/history ─────────────────────────────────────────────
// Manually log an event (e.g. from frontend or hardware)
exports.createEvent = async (req, res, next) => {
  try {
    const { type, device, deviceId, detail, value } = req.body;
    if (!type || !device) {
      return res.status(400).json({ success: false, message: "type and device are required" });
    }
    const event = await HistoryEvent.create({
      owner: req.user._id,
      type, device, deviceId, detail, value,
    });
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/history ───────────────────────────────────────────
// "Clear History" button (future feature in History.jsx)
exports.clearHistory = async (req, res, next) => {
  try {
    await HistoryEvent.deleteMany({ owner: req.user._id });
    res.json({ success: true, message: "History cleared" });
  } catch (err) {
    next(err);
  }
};