import { Router } from "express";
import { tradingService } from "../services/trading.service.js";
import type { TradingSignal } from "../types/index.js";

const router = Router();

// Get active positions
router.get("/positions", async (req, res) => {
  try {
    const positions = await tradingService.getActivePositions();
    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get positions",
    });
  }
});

// Get pending orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await tradingService.getPendingOrders();
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get orders",
    });
  }
});

// Open position
router.post("/open", async (req, res) => {
  try {
    const signal: TradingSignal = req.body;

    if (!signal.symbol || !signal.type || !signal.entry) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: symbol, type, entry",
      });
    }

    const result = await tradingService.openPosition(signal);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to open position",
    });
  }
});

// Close position
router.post("/close/:positionId", async (req, res) => {
  try {
    const { positionId } = req.params;
    const result = await tradingService.closePosition(positionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to close position",
    });
  }
});

// Modify position (update SL/TP)
router.patch("/modify/:positionId", async (req, res) => {
  try {
    const { positionId } = req.params;
    const { stopLoss, takeProfit } = req.body;

    const result = await tradingService.modifyPosition(positionId, stopLoss, takeProfit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to modify position",
    });
  }
});

// Cancel order
router.delete("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const success = await tradingService.cancelOrder(orderId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    });
  }
});

// Get position protection status
router.get("/protection/:positionId", async (req, res) => {
  try {
    const { positionId } = req.params;
    const protection = await tradingService.managePositionProtection(positionId);
    res.json({
      success: true,
      data: protection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get protection status",
    });
  }
});

// Get trading summary
router.get("/summary", (req, res) => {
  try {
    const summary = {
      activePositions: tradingService.getActivePositions().length,
      maxPositions: 3,
      totalExposure: tradingService.getTotalExposure(),
      unrealizedPnL: tradingService.getTotalUnrealizedPnL(),
      canOpenPosition: tradingService.canOpenPosition(),
    };
    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get summary",
    });
  }
});

// Emergency close all positions
router.post("/emergency-close", (req, res) => {
  try {
    tradingService.clearAllPositions();
    res.json({
      success: true,
      message: "All positions cleared",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to emergency close",
    });
  }
});

// Sync with broker
router.post("/sync", async (req, res) => {
  try {
    await tradingService.syncWithBroker();
    res.json({
      success: true,
      message: "Synced with broker",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync",
    });
  }
});

export default router;