import { Router } from "express";
import { aiEngine } from "../services/ai-engine.service.js";
import { newsService } from "../services/news.service.js";

const router = Router();

// Get AI status
router.get("/status", (req, res) => {
  try {
    const status = aiEngine.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get AI status",
    });
  }
});

// Start AI
router.post("/start", async (req, res) => {
  try {
    await aiEngine.start();
    res.json({
      success: true,
      message: "AI started",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to start AI",
    });
  }
});

// Stop AI
router.post("/stop", async (req, res) => {
  try {
    await aiEngine.stop();
    res.json({
      success: true,
      message: "AI stopped",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to stop AI",
    });
  }
});

// Pause AI
router.post("/pause", (req, res) => {
  try {
    aiEngine.pause();
    res.json({
      success: true,
      message: "AI paused",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to pause AI",
    });
  }
});

// Resume AI
router.post("/resume", async (req, res) => {
  try {
    await aiEngine.resume();
    res.json({
      success: true,
      message: "AI resumed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to resume AI",
    });
  }
});

// Emergency stop
router.post("/emergency-stop", (req, res) => {
  try {
    aiEngine.emergencyStop();
    res.json({
      success: true,
      message: "Emergency stop activated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to emergency stop",
    });
  }
});

// Get commentary history
router.get("/commentary", (req, res) => {
  try {
    const history = aiEngine.getCommentaryHistory();
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get commentary",
    });
  }
});

// Get AI state
router.get("/state", (req, res) => {
  try {
    const state = aiEngine.getState();
    const isActive = aiEngine.isActive();
    res.json({
      success: true,
      data: { state, isActive },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get state",
    });
  }
});

// News routes
router.get("/news/upcoming", (req, res) => {
  try {
    const events = newsService.getUpcomingEvents();
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get news",
    });
  }
});

router.get("/news/next-major", (req, res) => {
  try {
    const event = newsService.getNextMajorEvent();
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get next major event",
    });
  }
});

router.get("/news/impact", (req, res) => {
  try {
    const assessment = newsService.getMarketImpactAssessment();
    const shouldPause = newsService.shouldPauseTrading();
    res.json({
      success: true,
      data: {
        assessment,
        shouldPause: shouldPause.shouldPause,
        reason: shouldPause.reason,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get impact assessment",
    });
  }
});

export default router;