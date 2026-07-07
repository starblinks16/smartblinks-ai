import { FiMenu, FiBell, FiX } from "react-icons/fi";
import { useNotificationStore, useAccountStore, useMarketStore } from "../../store";
import styles from "../../styles/Header.module.css";

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
}

export default function Header({ onToggleSidebar, onToggleNotifications }: HeaderProps) {
  const { unreadCount } = useNotificationStore();
  const { account } = useAccountStore();
  const { ticker } = useMarketStore();

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={onToggleSidebar}>
          <FiMenu />
        </button>
        
        <div className={styles.brand}>
          <span className={styles.brandName}>SmartBlinks AI</span>
          <span className={styles.brandTag}>Institutional Trading System</span>
        </div>
      </div>

      <div className={styles.center}>
        {ticker && (
          <div className={styles.ticker}>
            <span className={styles.tickerSymbol}>XAUUSD</span>
            <span className={styles.tickerPrice}>{formatPrice(ticker.bid)}</span>
            <span className={`${styles.tickerChange} ${ticker.change >= 0 ? styles.positive : styles.negative}`}>
              {ticker.change >= 0 ? "+" : ""}{ticker.changePercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>

      <div className={styles.right}>
        {account && (
          <div className={styles.accountInfo}>
            <span className={styles.accountBalance}>${formatPrice(account.balance)}</span>
            <span className={styles.accountEquity}>Equity: ${formatPrice(account.equity)}</span>
          </div>
        )}

        <button className={styles.notificationButton} onClick={onToggleNotifications}>
          <FiBell />
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}