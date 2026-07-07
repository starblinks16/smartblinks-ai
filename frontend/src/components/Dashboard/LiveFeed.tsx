import { useAIStore, useNotificationStore, useMarketStore } from "../../store";
import styles from "../../styles/LiveFeed.module.css";

export default function LiveFeed() {
  const { commentary } = useAIStore();
  const { notifications } = useNotificationStore();
  const { ticker } = useMarketStore();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return "✓";
      case "ERROR": return "✗";
      case "WARNING": return "⚠";
      case "TRADE": return "📊";
      default: return "ℹ";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "SUCCESS": return "var(--success)";
      case "ERROR": return "var(--danger)";
      case "WARNING": return "var(--warning)";
      case "TRADE": return "var(--accent-gold)";
      default: return "var(--info)";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Live Feed</span>
        {ticker && (
          <div className={styles.tickerLive}>
            <span className={styles.tickerSymbol}>XAUUSD</span>
            <span className={styles.tickerPrice}>{ticker.bid.toFixed(2)}</span>
            <span className={styles.liveDot} />
          </div>
        )}
      </div>

      <div className={styles.feed}>
        {/* AI Commentary */}
        {commentary.length > 0 && (
          <div className={styles.feedSection}>
            <div className={styles.sectionHeader}>
              <span>AI Commentary</span>
            </div>
            <div className={styles.commentaryList}>
              {commentary.slice(0, 3).map((comment, index) => (
                <div key={index} className={styles.commentaryItem}>
                  <span className={styles.commentaryText}>{comment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notifications */}
        <div className={styles.feedSection}>
          <div className={styles.sectionHeader}>
            <span>Recent Activity</span>
          </div>
          <div className={styles.notificationList}>
            {notifications.slice(0, 5).map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${notification.read ? styles.read : ""}`}
              >
                <span 
                  className={styles.notificationIcon}
                  style={{ color: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </span>
                <div className={styles.notificationContent}>
                  <span className={styles.notificationTitle}>{notification.title}</span>
                  <span className={styles.notificationMessage}>{notification.message}</span>
                </div>
                <span className={styles.notificationTime}>
                  {formatTime(notification.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}