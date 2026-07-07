import { Router } from "express";
import { aiEngine } from "../services/ai-engine.service.js";

const router = Router();

// Get all notifications
router.get("/", (req, res) => {
  try {
    const notifications = aiEngine.getNotifications();
    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get notifications",
    });
  }
});

// Mark notification as read
router.patch("/:id/read", (req, res) => {
  try {
    const { id } = req.params;
    aiEngine.markNotificationRead(id);
    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark notification",
    });
  }
});

// Get unread count
router.get("/unread-count", (req, res) => {
  try {
    const notifications = aiEngine.getNotifications();
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to get unread count",
    });
  }
});

export default router;