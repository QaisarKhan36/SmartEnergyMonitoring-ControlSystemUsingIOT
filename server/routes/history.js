// routes/history.js
const express = require("express");
const router  = express.Router();
const { getHistory, createEvent, clearHistory } = require("../controllers/historyController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/")
  .get(getHistory)
  .post(createEvent)
  .delete(clearHistory);

module.exports = router;