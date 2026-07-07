import { Router } from "express";
import { marketService } from "../services/market.service.js";
import { cTraderService } from "../services/ctrader.service.js";

const router = Router();

// Get current market analysis
router.get("/analysis", async (req, res) => {
  try {
    const analysis = await marketService.analyzeMarket();
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get market analysis",
    });
  }
});

// Get multi-timeframe analysis
router.get("/timeframes", async (req, res) => {
  try {
    const analysis = await marketService.getMultiTimeframeAnalysis();
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get timeframe analysis",
    });
  }
});

// Get current ticker
router.get("/ticker", async (req, res) => {
  try {
    const ticker = await cTraderService.getTicker(marketService.SYMBOL);
    res.json({
      success: true,
      data: ticker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get ticker",
    });
  }
});

// Get candles for specific timeframe
router.get("/candles/:timeframe", async (req, res) => {
  try {
    const { timeframe } = req.params;
    const count = parseInt(req.query.count as string) || 500;

    const validTimeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: `Invalid timeframe. Use: ${validTimeframes.join(", ")}`,
      });
    }

    const candles = await cTraderService.getCandles(marketService.SYMBOL, timeframe, count);
    res.json({
      success: true,
      data: candles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get candles",
    });
  }
});

// Get key levels
router.get("/levels", async (req, res) => {
  try {
    const analysis = await marketService.analyzeMarket();
    res.json({
      success: true,
      data: analysis.keyLevels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get key levels",
    });
  }
});

// Get current session info
router.get("/session", (req, res) => {
  try {
    const now = new Date();
    const utcHour = now.getUTCHours();

    let session = "AFTER_HOURS";
    let status: "OPEN" | "CLOSED" = "CLOSED";

    if (utcHour >= 0 && utcHour < 8) {
      session = "ASIAN";
      status = "OPEN";
    } else if (utcHour >= 8 && utcHour < 17) {
      session = "LONDON_NEW_YORK";
      status = "OPEN";
    } else if (utcHour >= 17 && utcHour < 21) {
      session = "NEW_YORK";
      status = "OPEN";
    }

    // Calculate session end
    const sessionEndHours: Record<string, number> = {
      ASIAN: 8,
      LONDON_NEW_YORK: 17,
      NEW_YORK: 21,
      AFTER_HOURS: 24,
    };

    const endHour = sessionEndHours[session] || 24;
    const endTime = new Date(now);
    if (endHour < now.getUTCHours()) {
      endTime.setDate(endTime.getDate() + 1);
    }
    endTime.setUTCHours(endHour, 0, 0, 0);

    const timeRemaining = endTime.getTime() - now.getTime();

    res.json({
      success: true,
      data: {
        name: session,
        status,
        timeRemaining,
        nextSession: session === "ASIAN" ? "LONDON" : session === "LONDON_NEW_YORK" ? "NEW_YORK" : "ASIAN",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get session info",
    });
  }
});

export default router;