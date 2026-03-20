// routes/devices.js
const express = require("express");
const router  = express.Router();
const {
  getDevices, getDevice, createDevice,
  updateDevice, deleteDevice, toggleDevice, toggleRelay,
} = require("../controllers/deviceController");
const { protect } = require("../middleware/auth");

// All device routes require a valid JWT
router.use(protect);

router.route("/")
  .get(getDevices)
  .post(createDevice);

router.route("/:id")
  .get(getDevice)
  .put(updateDevice)
  .delete(deleteDevice);

router.patch("/:id/toggle",           toggleDevice);   // enable / disable whole device
router.patch("/:id/relay/:relayId",   toggleRelay);    // toggle one relay channel

module.exports = router;