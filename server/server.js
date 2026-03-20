// server.js — SmartEnergy Backend Entry Point
require("dotenv").config();

const express   = require("express");
const http      = require("http");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const rateLimit = require("express-rate-limit");
const WebSocket = require("ws");

const connectDB                  = require("./config/db");
const errorHandler               = require("./middleware/errorHandler");
const { startVirtualController } = require("./hardware/virtualController");

// ── Route imports ──────────────────────────────────────────────────
const authRoutes      = require("./routes/auth");
const deviceRoutes    = require("./routes/devices");
const alertRoutes     = require("./routes/alerts");
const scheduleRoutes  = require("./routes/schedules");
const readingRoutes   = require("./routes/readings");
const historyRoutes   = require("./routes/history");
const analyticsRoutes = require("./routes/analytics");

// ── Connect to MongoDB ─────────────────────────────────────────────
connectDB();

const app = express();

// ── Security headers ───────────────────────────────────────────────
app.use(helmet());

// ── CORS — allow your React app ────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Request logger (dev: coloured, production: combined) ───────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Rate limiting — 300 requests per 15 min per IP ─────────────────
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests, please slow down" },
}));

// ── Body parser ────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/devices",   deviceRoutes);
app.use("/api/alerts",    alertRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/readings",  readingRoutes);
app.use("/api/history",   historyRoutes);
app.use("/api/analytics", analyticsRoutes);

// ── Health check (no auth needed) ─────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "SmartEnergy API",
    version: "1.0.0",
    status:  "online",
    uptime:  `${process.uptime().toFixed(0)}s`,
    time:    new Date().toISOString(),
  });
});

// ── 404 catch-all ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────────
app.use(errorHandler);

// ══════════════════════════════════════════════════════════════════
//  HTTP + WebSocket Server
// ══════════════════════════════════════════════════════════════════
const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);

// ── WebSocket server (live sensor feed) ───────────────────────────
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  ws.send(JSON.stringify({ type: "connected", message: "SmartEnergy live feed active" }));

  ws.on("close", () => console.log("[WS] Client disconnected"));
  ws.on("error", (err) => console.error("[WS] Error:", err.message));
});

// Broadcast helper — used by VMC and any controller
const broadcast = (payload) => {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
};

// Make broadcast available to routes (device toggle pushes relay state)
app.set("broadcast", broadcast);

// ── Start listening, then launch VMC ──────────────────────────────
server.listen(PORT, () => {
  console.log("\n════════════════════════════════════════");
  console.log("  ⚡  SmartEnergy API Server  v2.0.0");
  console.log("════════════════════════════════════════");
  console.log(`  REST  →  http://localhost:${PORT}/api`);
  console.log(`  WS    →  ws://localhost:${PORT}`);
  console.log(`  Env   →  ${process.env.NODE_ENV || "development"}`);
  console.log("════════════════════════════════════════\n");

  // Start the Virtual Microcontroller after server is bound
  startVirtualController(broadcast);
});

// Graceful shutdown
process.on("SIGTERM", () => server.close(() => process.exit(0)));