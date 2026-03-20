// routes/analytics.js
const express = require("express");
const router  = express.Router();
const protect = require("../middleware/auth");
const {
  getWeekly,
  getMonthly,
  getHourly,
  getBreakdown,
  getComparison,
  getCostSummary,
  getThresholdBreaches,
  getExportData,
} = require("../controllers/analyticsController");

// All analytics endpoints require auth
router.use(protect);

router.get("/weekly",             getWeekly);
router.get("/monthly",            getMonthly);
router.get("/hourly",             getHourly);
router.get("/breakdown",          getBreakdown);
router.get("/comparison",         getComparison);
router.get("/cost",               getCostSummary);
router.get("/threshold-breaches", getThresholdBreaches);
router.get("/export",             getExportData);   // ?type=daily|device|alerts|monthly&from=&to=

module.exports = router;