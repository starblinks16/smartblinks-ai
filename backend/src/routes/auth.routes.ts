import { Router } from "express";
import { cTraderService } from "../services/ctrader.service.js";

const router = Router();

// Get authorization URL
router.get("/auth-url", (req, res) => {
  try {
    const authUrl = cTraderService.getAuthorizationUrl();
    res.json({
      success: true,
      data: { url: authUrl },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to generate auth URL",
    });
  }
});

// OAuth callback
router.get("/callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.error("OAuth error:", error);
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/?auth_error=${encodeURIComponent(String(error))}`);
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "No authorization code provided",
      });
    }

    // Exchange code for tokens
    const tokens = await cTraderService.exchangeCodeForTokens(String(code));

    // Store tokens in environment for WebSocket access
    process.env.CTRADER_ACCESS_TOKEN = tokens.access_token;
    process.env.CTRADER_REFRESH_TOKEN = tokens.refresh_token;

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/?auth_success=true`);
  } catch (error) {
    console.error("Callback error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/?auth_error=token_exchange_failed`);
  }
});

// Check connection status
router.get("/status", (req, res) => {
  try {
    const status = cTraderService.getConnectionStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get connection status",
    });
  }
});

// Disconnect
router.post("/disconnect", (req, res) => {
  try {
    cTraderService.disconnect();
    res.json({
      success: true,
      message: "Disconnected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to disconnect",
    });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    await cTraderService.refreshAccessToken();
    res.json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to refresh token",
    });
  }
});

export default router;