// routes/alerts.js
const express = require("express");
const router  = express.Router();
const {
  getAlerts, createAlert, dismissAlert, clearAlerts,
  getRules, createRule, updateRule, deleteRule,
  getThreshold, updateThreshold,
} = require("../controllers/alertController");
const { protect } = require("../middleware/auth");

router.use(protect);

// NOTE: specific sub-routes (/rules, /threshold) must come BEFORE /:id
// so Express doesn't treat "rules" as an ID

// Threshold — used by ThresholdModal, AlertsCard, AlertsPage slider
router.route("/threshold")
  .get(getThreshold)
  .put(updateThreshold);

// Alert rules — AlertsPage "Rules" tab
router.route("/rules")
  .get(getRules)
  .post(createRule);

router.route("/rules/:id")
  .put(updateRule)
  .delete(deleteRule);

// Alert events — AlertsPage "Active" tab, TopBar badge, NotificationPanel
router.route("/")
  .get(getAlerts)
  .post(createAlert)
  .delete(clearAlerts);           // clear all

router.delete("/:id", dismissAlert);   // dismiss one

module.exports = router;