import { Router } from "express";
import { cTraderService } from "../services/ctrader.service.js";

const router = Router();

// Get account info
router.get("/info", async (req, res) => {
  try {
    const account = await cTraderService.getAccountInfo();
    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get account info",
    });
  }
});

// Discover account
router.post("/discover", async (req, res) => {
  try {
    const account = await cTraderService.discoverAccount();
    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to discover account",
    });
  }
});

// Get positions
router.get("/positions", async (req, res) => {
  try {
    const positions = await cTraderService.getPositions();
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

// Get orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await cTraderService.getOrders();
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

// Get balance summary
router.get("/summary", async (req, res) => {
  try {
    const account = await cTraderService.getAccountInfo();
    const positions = await cTraderService.getPositions();

    const summary = {
      balance: account.balance,
      equity: account.equity,
      margin: account.margin,
      freeMargin: account.freeMargin,
      unrealizedPnL: account.unrealizedPnL,
      marginLevel: account.marginLevel,
      openPositions: positions.length,
      broker: account.brokerName,
      accountType: account.accountType,
      leverage: account.leverage,
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

export default router;