import { FiX, FiCheck, FiTrash2 } from "react-icons/fi";
import { useNotificationStore } from "../../store";
import styles from "../../styles/NotificationsPanel.module.css";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)", icon: "✓" };
      case "ERROR":
        return { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.3)", icon: "✗" };
      case "WARNING":
        return { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", icon: "⚠" };
      case "TRADE":
        return { bg: "rgba(255, 215, 0, 0.1)", border: "rgba(255, 215, 0, 0.3)", icon: "📊" };
      default:
        return { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.3)", icon: "ℹ" };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.visible : ""}`} 
        onClick={onClose} 
      />

      {/* Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Notifications</h2>
          <div className={styles.actions}>
            <button className={styles.clearButton} onClick={clearAll}>
              <FiTrash2 />
              <span>Clear All</span>
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔔</span>
              <span className={styles.emptyText}>No notifications yet</span>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map((notification) => {
                const styles = getTypeStyles(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`${styles.card} ${notification.read ? styles.read : ""}`}
                    style={{ 
                      background: styles.bg, 
                      borderColor: styles.border,
                    } as React.CSSProperties}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className={styles.cardIcon}>{styles.icon}</div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        <span className={styles.cardTitle}>{notification.title}</span>
                        <span className={styles.cardTime}>{formatTime(notification.timestamp)}</span>
                      </div>
                      <p className={styles.cardMessage}>{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <div className={styles.unreadDot} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}