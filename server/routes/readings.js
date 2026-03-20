// routes/readings.js
const express = require("express");
const router  = express.Router();
const { ingestReading, getLatest, getHistory, getSummary } = require("../controllers/readingController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/",         ingestReading);  // IoT hardware pushes snapshots here
router.get ("/latest",   getLatest);      // Dashboard stat cards
router.get ("/history",  getHistory);     // EnergyChart, Analytics
router.get ("/summary",  getSummary);     // Analytics cards, CostCalculator

module.exports = router;