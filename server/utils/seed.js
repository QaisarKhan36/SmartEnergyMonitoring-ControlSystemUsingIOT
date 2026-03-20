// utils/seed.js
// Full virtual system seed — 6 devices, 30 days of readings
// Run: npm run seed   |   Login: asif@smartenergy.com / admin123

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose     = require("mongoose");
const User         = require("../models/User");
const Device       = require("../models/Device");
const Alert        = require("../models/Alert");
const AlertRule    = require("../models/AlertRule");
const Schedule     = require("../models/Schedule");
const Reading      = require("../models/Reading");
const HistoryEvent = require("../models/HistoryEvent");

const VIRTUAL_DEVICES = [
  { deviceId:"home-main", name:"Home Main",      location:"Living Room", icon:"home",     wattage:2000, voltage:220, baseW:1146.6, noiseW:40,
    relays:[{relayId:"r1",label:"Living Room Bulb",on:true},{relayId:"r2",label:"Ceiling Fan",on:false},{relayId:"r3",label:"Table Lamp",on:false},{relayId:"r4",label:"Power Strip",on:true}] },
  { deviceId:"kitchen",   name:"Kitchen Outlet", location:"Kitchen",     icon:"kitchen",  wattage:500,  voltage:220, baseW:280,    noiseW:20,  relays:[] },
  { deviceId:"hvac",      name:"HVAC System",    location:"Bedroom",     icon:"snowflake",wattage:1800, voltage:220, baseW:1800,   noiseW:60,  relays:[] },
  { deviceId:"tv",        name:"Smart TV",        location:"Living Room", icon:"tv",       wattage:120,  voltage:220, baseW:120,    noiseW:5,   relays:[] },
  { deviceId:"lamp",      name:"Office Lamp",     location:"Office",      icon:"bulb",     wattage:60,   voltage:220, baseW:60,     noiseW:1,   relays:[] },
  { deviceId:"fan",       name:"Ceiling Fan",     location:"Bedroom",     icon:"fan",      wattage:75,   voltage:220, baseW:75,     noiseW:3,   relays:[] },
];

const HOUR_PROFILE = [
  0.07,0.06,0.05,0.05,0.06,0.10,
  0.28,0.65,0.85,0.72,0.58,0.80,
  1.00,0.98,0.85,0.78,0.72,0.62,
  0.75,0.88,0.80,0.65,0.45,0.22,
];

const jitter = (base, range) => Math.max(0, base + (Math.random() - 0.5) * range);

const generateReadings = (userId, device, days) => {
  const docs = [];
  const now  = new Date();
  let energy = 0;
  for (let d = days - 1; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const ts      = new Date(now.getTime() - d * 86400000 - (23 - h) * 3600000);
      const mult    = HOUR_PROFILE[h];
      const power   = +jitter(device.baseW * mult, device.noiseW * mult).toFixed(2);
      const voltage = +jitter(220.0, 2).toFixed(1);
      energy       += power / 1000;
      docs.push({
        owner: userId, deviceId: device.deviceId,
        voltage, current: +(power/voltage).toFixed(3),
        power, energy: +energy.toFixed(4),
        frequency: +jitter(50.0, 0.08).toFixed(2),
        powerFactor: +Math.min(1, jitter(0.95, 0.03)).toFixed(4),
        recordedAt: ts,
      });
    }
  }
  return docs;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅  Connected to MongoDB");

  await Promise.all([
    User.deleteMany({}), Device.deleteMany({}), Alert.deleteMany({}),
    AlertRule.deleteMany({}), Schedule.deleteMany({}),
    Reading.deleteMany({}), HistoryEvent.deleteMany({}),
  ]);
  console.log("🗑️   Cleared existing data");

  const user = await User.create({
    name:"Asif Khan", email:"asif@smartenergy.com", password:"admin123",
    role:"admin", phone:"+92 300 1234567", timezone:"Asia/Karachi",
    alertThreshold:2000, alertsEnabled:true, monthlyBudget:90,
    tariffPlan:"flat", flatRate:0.16,
    notifications:{ email:true, push:false, sms:false, cooldown:15, emailAddr:"asif@smartenergy.com" },
    system:{ dataInterval:1, autoRefresh:true, logRetention:30, unitSystem:"metric", currency:"USD", dateFormat:"DD/MM/YYYY", electricityRate:0.16 },
  });
  console.log(`👤  Created user: ${user.email}`);

  await Device.insertMany(VIRTUAL_DEVICES.map(dev => ({
    owner:user._id, deviceId:dev.deviceId, name:dev.name,
    location:dev.location, icon:dev.icon, enabled:true, online:true,
    wattage:dev.wattage, voltage:dev.voltage, relays:dev.relays,
    latestReading:{ voltage:220.0, current:+(dev.baseW/220).toFixed(2), power:dev.baseW, energy:0, frequency:50.0, powerFactor:0.95, recordedAt:new Date() },
  })));
  console.log(`🔌  Created ${VIRTUAL_DEVICES.length} virtual devices`);

  await AlertRule.insertMany([
    { owner:user._id, name:"High Power",        metric:"power",     condition:"above", value:1000, severity:"critical", enabled:true,  triggered:true  },
    { owner:user._id, name:"High Energy Usage", metric:"energy",    condition:"above", value:5,    severity:"warning",  enabled:true,  triggered:false },
    { owner:user._id, name:"Low Voltage",       metric:"voltage",   condition:"below", value:210,  severity:"critical", enabled:true,  triggered:false },
    { owner:user._id, name:"High Current",      metric:"current",   condition:"above", value:12,   severity:"warning",  enabled:false, triggered:false },
    { owner:user._id, name:"Frequency Drift",   metric:"frequency", condition:"below", value:49.5, severity:"info",     enabled:true,  triggered:false },
  ]);
  console.log("📋  Created 5 alert rules");

  await Alert.insertMany([
    { owner:user._id, deviceId:"home-main", type:"warning", metric:"power", triggerValue:1146, msg:"High Power Consumption (1146.0 W)", time:new Date(Date.now()-2*3600000) },
    { owner:user._id, deviceId:"hvac",      type:"warning", metric:"power", triggerValue:1820, msg:"HVAC System power spike: 1820 W",   time:new Date(Date.now()-8*3600000) },
  ]);
  console.log("🔔  Created 2 alerts");

  await Schedule.insertMany([
    { owner:user._id, name:"Morning Routine", relay:"Home Main — Living Room Bulb", deviceId:"home-main", relayId:"r1", days:["Mon","Tue","Wed","Thu","Fri"], start:"06:00", end:"09:00", enabled:true,  color:"#f59e0b" },
    { owner:user._id, name:"Work Hours",      relay:"Home Main — Ceiling Fan",      deviceId:"home-main", relayId:"r2", days:["Mon","Tue","Wed","Thu","Fri"], start:"09:00", end:"17:00", enabled:true,  color:"#3b82f6" },
    { owner:user._id, name:"Night HVAC Off",  relay:"HVAC System",                  deviceId:"hvac",      relayId:null, days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], start:"23:00", end:"06:00", enabled:false, color:"#0ea5e9" },
  ]);
  console.log("🕐  Created 3 schedules");

  await HistoryEvent.insertMany([
    { owner:user._id, type:"Threshold Breach",   device:"Home Main",   deviceId:"home-main", detail:"Power 1,146W exceeded 1,000W limit",         value:"1,146 W", ts:new Date(Date.now()-2*3600000)  },
    { owner:user._id, type:"Schedule Triggered", device:"Home Main",   deviceId:"home-main", detail:"Morning Routine turned Living Room Bulb ON",  value:"ON",      ts:new Date(Date.now()-6*3600000)  },
    { owner:user._id, type:"Relay Toggle",       device:"Home Main",   deviceId:"home-main", detail:"Ceiling Fan turned ON via Control panel",     value:"ON",      ts:new Date(Date.now()-10*3600000) },
    { owner:user._id, type:"Device On",          device:"HVAC System", deviceId:"hvac",      detail:"HVAC System powered on — 1,800W",             value:"1,800 W", ts:new Date(Date.now()-18*3600000) },
    { owner:user._id, type:"Device Off",         device:"Smart TV",    deviceId:"tv",        detail:"Smart TV powered off",                        value:"",        ts:new Date(Date.now()-26*3600000) },
    { owner:user._id, type:"Threshold Breach",   device:"HVAC System", deviceId:"hvac",      detail:"HVAC spike 1,820W exceeded warning threshold",value:"1,820 W", ts:new Date(Date.now()-32*3600000) },
    { owner:user._id, type:"Alert Cleared",      device:"System",                            detail:"All alerts acknowledged by admin",             value:"",        ts:new Date(Date.now()-48*3600000) },
    { owner:user._id, type:"Firmware Update",    device:"System",                            detail:"SmartEnergy firmware updated to v2.4.1",       value:"v2.4.1",  ts:new Date(Date.now()-72*3600000) },
  ]);
  console.log("📜  Created 8 history events");

  console.log("⚡  Generating 30 days × 24h × 6 devices readings…");
  for (const dev of VIRTUAL_DEVICES) {
    const docs = generateReadings(user._id, dev, 30);
    for (let i = 0; i < docs.length; i += 500) {
      await Reading.insertMany(docs.slice(i, i + 500));
    }
    console.log(`   ✓  ${dev.name}: ${docs.length} readings`);
  }

  const total = await Reading.countDocuments({ owner: user._id });
  console.log(`\n✅  Seed complete!`);
  console.log(`   Devices:  ${VIRTUAL_DEVICES.length}`);
  console.log(`   Readings: ${total} total`);
  console.log(`   Login  →  asif@smartenergy.com  /  admin123`);
  console.log(`   Server →  npm run dev\n`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });