// controllers/analyticsController.js
// Powers Analytics.jsx, CostCalculator.jsx, and Reports.jsx
// All queries are scoped to req.user._id so data is per-user.

const Reading      = require("../models/Reading");
const Device       = require("../models/Device");
const Alert        = require("../models/Alert");
const HistoryEvent = require("../models/HistoryEvent");
const User         = require("../models/User");

// ── Helpers ───────────────────────────────────────────────────────
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

// Watts → kWh for a time window: kWh = avg_W × hours
const wToKwh = (avgW, hours) => +(avgW * hours / 1000).toFixed(3);

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/weekly
// Returns last 7 days: [{ day:"Mon", kwh, cost, peak }]
// ─────────────────────────────────────────────────────────────────
exports.getWeekly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("flatRate tariffPlan");
    const rate = user.flatRate || 0.16;
    const results = [];

    for (let i = 6; i >= 0; i--) {
      const date  = daysAgo(i);
      const from  = startOfDay(date);
      const to    = endOfDay(date);

      const readings = await Reading.find({
        owner: req.user._id,
        recordedAt: { $gte: from, $lte: to },
      }).select("power recordedAt").lean();

      let kwh  = 0;
      let peak = 0;

      if (readings.length > 1) {
        for (let j = 1; j < readings.length; j++) {
          const dt    = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000; // hours
          const avgW  = (readings[j].power + readings[j - 1].power) / 2;
          kwh        += avgW * dt / 1000;
        }
        peak = Math.round(Math.max(...readings.map(r => r.power)));
      }

      kwh = +kwh.toFixed(3);
      const dayName = from.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue…

      results.push({ day: dayName, kwh, cost: +(kwh * rate).toFixed(2), peak });
    }

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/monthly
// Returns last 6 calendar months: [{ month:"Jan", kwh, cost }]
// ─────────────────────────────────────────────────────────────────
exports.getMonthly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("flatRate");
    const rate = user.flatRate || 0.16;
    const now  = new Date();
    const results = [];

    for (let m = 5; m >= 0; m--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const from  = new Date(d.getFullYear(), d.getMonth(), 1);
      const to    = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const readings = await Reading.find({
        owner: req.user._id,
        recordedAt: { $gte: from, $lte: to },
      }).select("power recordedAt").lean();

      let kwh = 0;
      if (readings.length > 1) {
        for (let j = 1; j < readings.length; j++) {
          const dt   = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
          const avgW = (readings[j].power + readings[j - 1].power) / 2;
          kwh       += avgW * dt / 1000;
        }
      }

      kwh = +kwh.toFixed(1);
      const monthName = from.toLocaleDateString("en-US", { month: "short" }); // Jan, Feb…
      results.push({ month: monthName, kwh, cost: +(kwh * rate).toFixed(2) });
    }

    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/hourly
// Returns 24 hourly averages for today: [{ hour:"12a", w }]
// ─────────────────────────────────────────────────────────────────
exports.getHourly = async (req, res, next) => {
  try {
    const from = startOfDay(new Date());
    const to   = endOfDay(new Date());

    const readings = await Reading.find({
      owner: req.user._id,
      recordedAt: { $gte: from, $lte: to },
    }).select("power recordedAt").lean();

    const buckets = Array.from({ length: 24 }, () => ({ sum: 0, count: 0 }));
    readings.forEach(r => {
      const h = new Date(r.recordedAt).getHours();
      buckets[h].sum   += r.power;
      buckets[h].count += 1;
    });

    const HOUR_LABELS = [
      "12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a",
      "12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p",
    ];

    const data = buckets.map((b, i) => ({
      hour: HOUR_LABELS[i],
      w: b.count ? Math.round(b.sum / b.count) : 0,
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/breakdown
// Per-device kWh + percentage for the current month
// [{ name, kwh, pct, color }]
// ─────────────────────────────────────────────────────────────────
exports.getBreakdown = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("flatRate");
    const rate = user.flatRate || 0.16;

    const now  = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to   = endOfDay(now);

    const devices = await Device.find({ owner: req.user._id }).select("deviceId name").lean();

    const COLORS = ["#f59e0b","#22c55e","#3b82f6","#8b5cf6","#ef4444","#06b6d4","#ec4899","#9ca3af"];
    const results = [];
    let totalKwh = 0;

    for (const dev of devices) {
      const readings = await Reading.find({
        owner: req.user._id,
        deviceId: dev.deviceId,
        recordedAt: { $gte: from, $lte: to },
      }).select("power recordedAt").lean();

      let kwh = 0;
      if (readings.length > 1) {
        for (let j = 1; j < readings.length; j++) {
          const dt   = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
          const avgW = (readings[j].power + readings[j - 1].power) / 2;
          kwh       += avgW * dt / 1000;
        }
      }
      kwh = +kwh.toFixed(2);
      totalKwh += kwh;
      results.push({ name: dev.name, kwh, deviceId: dev.deviceId });
    }

    const data = results.map((r, i) => ({
      name:       r.name,
      kwh:        r.kwh,
      pct:        totalKwh > 0 ? Math.round((r.kwh / totalKwh) * 100) : 0,
      color:      COLORS[i % COLORS.length],
      dailyCost:  +(r.kwh / now.getDate() * rate).toFixed(2),
      monthlyCost: +(r.kwh * rate).toFixed(2),
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/comparison
// { thisWeek, lastWeek, thisMonth, lastMonth }
// each: { kwh, cost, change (pct vs prior period) }
// ─────────────────────────────────────────────────────────────────
exports.getComparison = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("flatRate");
    const rate = user.flatRate || 0.16;

    const calcKwh = async (from, to) => {
      const readings = await Reading.find({
        owner: req.user._id,
        recordedAt: { $gte: from, $lte: to },
      }).select("power recordedAt").lean();

      let kwh = 0;
      if (readings.length > 1) {
        for (let j = 1; j < readings.length; j++) {
          const dt   = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
          const avgW = (readings[j].power + readings[j - 1].power) / 2;
          kwh       += avgW * dt / 1000;
        }
      }
      return +kwh.toFixed(2);
    };

    const now = new Date();
    const thisWeekStart  = daysAgo(6);
    const lastWeekStart  = daysAgo(13);
    const lastWeekEnd    = daysAgo(7);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [twKwh, lwKwh, tmKwh, lmKwh] = await Promise.all([
      calcKwh(thisWeekStart,  now),
      calcKwh(lastWeekStart,  lastWeekEnd),
      calcKwh(thisMonthStart, now),
      calcKwh(lastMonthStart, lastMonthEnd),
    ]);

    const pct = (cur, prev) =>
      prev > 0 ? +((((cur - prev) / prev) * 100).toFixed(1)) : null;

    res.json({
      success: true,
      data: [
        { label: "This Week",  kwh: twKwh, cost: +(twKwh * rate).toFixed(2), change: pct(twKwh, lwKwh) },
        { label: "Last Week",  kwh: lwKwh, cost: +(lwKwh * rate).toFixed(2), change: null },
        { label: "This Month", kwh: tmKwh, cost: +(tmKwh * rate).toFixed(2), change: pct(tmKwh, lmKwh) },
        { label: "Last Month", kwh: lmKwh, cost: +(lmKwh * rate).toFixed(2), change: null },
      ],
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/cost
// { dailyKwh, dailyCost, monthlyCost, yearlyCost,
//   budgetUsedPct, budgetStatus, tariffPlan }
// ─────────────────────────────────────────────────────────────────
exports.getCostSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("flatRate tariffPlan monthlyBudget").lean();

    const rate   = user.flatRate   || 0.16;
    const budget = user.monthlyBudget || 90;

    // Today's average power
    const todayFrom = startOfDay(new Date());
    const todayTo   = new Date();

    const todayReadings = await Reading.find({
      owner: req.user._id,
      recordedAt: { $gte: todayFrom, $lte: todayTo },
    }).select("power").lean();

    const avgW     = todayReadings.length
      ? todayReadings.reduce((s, r) => s + r.power, 0) / todayReadings.length
      : 0;
    const dailyKwh  = wToKwh(avgW, 24);
    const dailyCost = +(dailyKwh * rate).toFixed(2);

    // Month-to-date cost
    const monthFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthReadings = await Reading.find({
      owner: req.user._id,
      recordedAt: { $gte: monthFrom },
    }).select("power recordedAt").lean();

    let mtdKwh = 0;
    if (monthReadings.length > 1) {
      for (let j = 1; j < monthReadings.length; j++) {
        const dt   = (monthReadings[j].recordedAt - monthReadings[j - 1].recordedAt) / 3_600_000;
        const avgPow = (monthReadings[j].power + monthReadings[j - 1].power) / 2;
        mtdKwh    += avgPow * dt / 1000;
      }
    }
    mtdKwh = +mtdKwh.toFixed(2);
    const monthlyCost    = +(mtdKwh * rate).toFixed(2);
    const yearlyCost     = +(dailyCost * 365).toFixed(2);
    const budgetUsedPct  = Math.min(+(( monthlyCost / budget ) * 100).toFixed(1), 100);
    const budgetStatus   = budgetUsedPct >= 100 ? "over" : budgetUsedPct >= 80 ? "warning" : "ok";

    res.json({
      success: true,
      data: {
        dailyKwh,
        dailyCost,
        monthlyCost,
        yearlyCost,
        budgetUsedPct,
        budgetStatus,
        budget,
        tariffPlan: user.tariffPlan,
        flatRate:   rate,
      },
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/threshold-breaches
// Returns recent times power exceeded user threshold
// ─────────────────────────────────────────────────────────────────
exports.getThresholdBreaches = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("alertThreshold").lean();
    const threshold = user.alertThreshold || 2000;

    const breaches = await Alert.find({
      owner: req.user._id,
      metric: "power",
    })
      .sort({ time: -1 })
      .limit(20)
      .select("time triggerValue deviceId msg")
      .lean();

    const data = breaches.map(b => ({
      time:     new Date(b.time).toLocaleString(),
      peak:     `${b.triggerValue.toFixed(0)} W`,
      over:     `+${(b.triggerValue - threshold).toFixed(0)} W`,
      deviceId: b.deviceId,
    }));

    res.json({ success: true, data, threshold });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────
// GET /api/analytics/export?type=daily|device|alerts|monthly&from=&to=
// Returns structured data for CSV export
// ─────────────────────────────────────────────────────────────────
exports.getExportData = async (req, res, next) => {
  try {
    const { type = "daily", from, to } = req.query;
    const user = await User.findById(req.user._id).select("flatRate").lean();
    const rate = user.flatRate || 0.16;

    const fromDate = from ? new Date(from) : daysAgo(30);
    const toDate   = to   ? new Date(to)   : new Date();

    let data = [];

    if (type === "daily") {
      // Bucket readings by day
      const days = Math.ceil((toDate - fromDate) / 86_400_000);
      for (let i = 0; i < days; i++) {
        const dayStart = startOfDay(new Date(fromDate.getTime() + i * 86_400_000));
        const dayEnd   = endOfDay(dayStart);
        const readings = await Reading.find({
          owner: req.user._id,
          recordedAt: { $gte: dayStart, $lte: dayEnd },
        }).select("power recordedAt").lean();

        let kwh = 0, peak = 0;
        if (readings.length > 1) {
          for (let j = 1; j < readings.length; j++) {
            const dt   = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
            const avg  = (readings[j].power + readings[j - 1].power) / 2;
            kwh       += avg * dt / 1000;
          }
          peak = Math.round(Math.max(...readings.map(r => r.power)));
        }
        kwh = +kwh.toFixed(2);
        const avgW = readings.length
          ? readings.reduce((s, r) => s + r.power, 0) / readings.length : 0;

        data.push({
          date:     dayStart.toISOString().split("T")[0],
          kwh,
          cost_usd: +(kwh * rate).toFixed(2),
          peak_w:   peak,
          avg_w:    Math.round(avgW),
          samples:  readings.length,
        });
      }

    } else if (type === "device") {
      const devices = await Device.find({ owner: req.user._id }).lean();
      for (const dev of devices) {
        const readings = await Reading.find({
          owner: req.user._id,
          deviceId: dev.deviceId,
          recordedAt: { $gte: fromDate, $lte: toDate },
        }).select("power recordedAt").lean();

        let kwh = 0;
        if (readings.length > 1) {
          for (let j = 1; j < readings.length; j++) {
            const dt  = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
            const avg = (readings[j].power + readings[j - 1].power) / 2;
            kwh      += avg * dt / 1000;
          }
        }
        kwh = +kwh.toFixed(2);
        data.push({
          device:        dev.name,
          location:      dev.location,
          kwh_period:    kwh,
          cost_usd:      +(kwh * rate).toFixed(2),
          online:        dev.online ? "Online" : "Offline",
          latest_power_w: dev.latestReading?.power || 0,
        });
      }

    } else if (type === "alerts") {
      const alerts = await Alert.find({
        owner: req.user._id,
        time: { $gte: fromDate, $lte: toDate },
      }).sort({ time: -1 }).lean();

      data = alerts.map(a => ({
        datetime:  new Date(a.time).toISOString(),
        type:      a.type,
        metric:    a.metric,
        value:     `${a.triggerValue} ${a.metric === "power" ? "W" : "kWh"}`,
        message:   a.msg,
        device:    a.deviceId,
        dismissed: a.dismissed ? "Yes" : "No",
      }));

    } else if (type === "monthly") {
      const now = new Date();
      for (let m = 5; m >= 0; m--) {
        const start = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const end   = new Date(now.getFullYear(), now.getMonth() - m + 1, 0, 23, 59, 59, 999);

        const readings = await Reading.find({
          owner: req.user._id,
          recordedAt: { $gte: start, $lte: end },
        }).select("power recordedAt").lean();

        let kwh = 0, peak = 0;
        if (readings.length > 1) {
          for (let j = 1; j < readings.length; j++) {
            const dt   = (readings[j].recordedAt - readings[j - 1].recordedAt) / 3_600_000;
            const avg  = (readings[j].power + readings[j - 1].power) / 2;
            kwh       += avg * dt / 1000;
          }
          peak = Math.round(Math.max(...readings.map(r => r.power)));
        }
        kwh = +kwh.toFixed(1);

        data.push({
          month:          start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          total_kwh:      kwh,
          total_cost_usd: +(kwh * rate).toFixed(2),
          peak_w:         peak,
          avg_daily_kwh:  +(kwh / new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()).toFixed(1),
          readings_count: readings.length,
        });
      }
    }

    res.json({ success: true, type, from: fromDate, to: toDate, count: data.length, data });
  } catch (err) { next(err); }
};