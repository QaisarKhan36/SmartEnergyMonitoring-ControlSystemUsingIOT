// routes/schedules.js
const express = require("express");
const router  = express.Router();
const {
  getSchedules, createSchedule,
  updateSchedule, toggleSchedule, deleteSchedule,
} = require("../controllers/scheduleController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/")
  .get(getSchedules)
  .post(createSchedule);

router.route("/:id")
  .put(updateSchedule)
  .delete(deleteSchedule);

router.patch("/:id/toggle", toggleSchedule);

module.exports = router;