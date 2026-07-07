import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config/env.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import marketRoutes from "./routes/market.routes.js";
import tradingRoutes from "./routes/trading.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

// Services
import { cTraderService } from "./services/ctrader.service.js";
import { cTraderWSService } from "./services/websocket.service.js";
import { aiEngine } from "./services/ai-engine.service.js";
import { newsService } from "./services/news.service.js";
import { tradingService } from "./services/trading.service.js";

const app = express();
const httpServer = createServer(app);

// Socket.IO for real-time frontend communication
const io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  const status = cTraderService.getConnectionStatus();
  res.json({
    status: "ok",
    timestamp: Date.now(),
    connected: status.isConnected,
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: config.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);

  // Send initial status
  socket.emit("ai-status", aiEngine.getStatus());
  socket.emit("connection-status", cTraderService.getConnectionStatus());

  // Handle client requests
  socket.on("request-update", async (type: string) => {
    try {
      switch (type) {
        case "account":
          const account = await cTraderService.getAccountInfo();
          socket.emit("account-update", account);
          break;
        case "positions":
          const positions = await tradingService.getActivePositions();
          socket.emit("positions-update", positions);
          break;
        case "ai-status":
          socket.emit("ai-status", aiEngine.getStatus());
          break;
        case "notifications":
          socket.emit("notifications", aiEngine.getNotifications());
          break;
      }
    } catch (error) {
      console.error("Update request error:", error);
    }
  });

  // AI control events
  socket.on("ai-start", async () => {
    await aiEngine.start();
    io.emit("ai-status", aiEngine.getStatus());
  });

  socket.on("ai-stop", async () => {
    await aiEngine.stop();
    io.emit("ai-status", aiEngine.getStatus());
  });

  socket.on("ai-pause", () => {
    aiEngine.pause();
    io.emit("ai-status", aiEngine.getStatus());
  });

  socket.on("ai-resume", async () => {
    await aiEngine.resume();
    io.emit("ai-status", aiEngine.getStatus());
  });

  socket.on("ai-emergency", () => {
    aiEngine.emergencyStop();
    io.emit("ai-status", aiEngine.getStatus());
  });

  socket.on("disconnect", () => {
    console.log("Frontend disconnected:", socket.id);
  });
});

// WebSocket service events forwarding to Socket.IO
cTraderWSService.on("priceUpdate", (data) => {
  io.emit("price-update", data);
});

cTraderWSService.on("positionUpdate", (data) => {
  io.emit("position-update", data);
});

cTraderWSService.on("accountUpdate", (data) => {
  io.emit("account-update", data);
});

// AI engine events
aiEngine.getNotifications().forEach((notification) => {
  io.emit("notification", notification);
});

// Start server
const PORT = config.PORT;

httpServer.listen(PORT, async () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██████╗ ██╗   ██╗████████╗██████╗  ██████╗ ███████╗     ║
║    ██╔═══██╗██║   ██║╚══██╔══╝██╔══██╗██╔═══██╗██╔════╝     ║
║    ██║   ██║██║   ██║   ██║   ██████╔╝██║   ██║███████╗     ║
║    ██║▄▄ ██║██║   ██║   ██║   ██╔══██╗██║   ██║╚════██║     ║
║    ╚██████╔╝╚██████╔╝   ██║   ██║  ██║╚██████╔╝███████║     ║
║     ╚══▀▀═╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ║
║                                                              ║
║         A I   -   I N S T I T U T I O N A L   T R A D I N G ║
║                   O P E R A T I N G   S Y S T E M            ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚀 SmartBlinks AI Backend Server                            ║
║                                                              ║
║  📡 Port: ${PORT}                                            ║
║  🌐 Environment: ${config.NODE_ENV}                           ║
║  🔗 CORS Origin: ${config.CORS_ORIGIN}                        ║
║                                                              ║
║  📊 API Endpoints:                                           ║
║     • /api/auth/* - Authentication                           ║
║     • /api/account/* - Account Management                    ║
║     • /api/market/* - Market Data                            ║
║     • /api/trading/* - Trading Operations                    ║
║     • /api/ai/* - AI Control                                 ║
║     • /api/notifications/* - Notifications                   ║
║                                                              ║
║  🔌 Socket.IO: Enabled for real-time updates                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Start news monitoring
  newsService.start();

  console.log("✅ Services initialized");
  console.log("⏳ Waiting for cTrader connection...");
});

export { app, httpServer, io };