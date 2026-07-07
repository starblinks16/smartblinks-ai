import { FiTrendingUp, FiClock, FiTarget } from "react-icons/fi";
import { useAccountStore } from "../../store";
import styles from "../../styles/Trading.module.css";

export default function Trading() {
  const { positions, account } = useAccountStore();

  const formatPrice = (price: number) => price.toFixed(2);
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatVolume = (volume: number) => volume.toFixed(2);

  const calculateProfitPercentage = (profit: number, openPrice: number, volume: number) => {
    // Simplified calculation
    return (profit / (openPrice * volume * 100) * 100).toFixed(2);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trading Dashboard</h1>
        <span className={styles.subtitle}>Active Positions & Orders</span>
      </div>

      {/* Account Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Balance</span>
          <span className={styles.summaryValue}>${account?.balance?.toFixed(2) || "0.00"}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Equity</span>
          <span className={styles.summaryValue}>${account?.equity?.toFixed(2) || "0.00"}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Unrealized P&L</span>
          <span className={`${styles.summaryValue} ${(account?.unrealizedPnL || 0) >= 0 ? styles.positive : styles.negative}`}>
            ${account?.unrealizedPnL?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Margin</span>
          <span className={styles.summaryValue}>${account?.margin?.toFixed(2) || "0.00"}</span>
        </div>
      </div>

      {/* Open Positions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FiTrendingUp className={styles.sectionIcon} />
          <span>Open Positions ({positions.length})</span>
        </div>

        {positions.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📊</span>
            <span className={styles.emptyText}>No open positions</span>
            <span className={styles.emptyHint}>Start the AI to begin trading</span>
          </div>
        ) : (
          <div className={styles.positionsList}>
            {positions.map((position) => (
              <div key={position.id} className={styles.positionCard}>
                <div className={styles.positionHeader}>
                  <div className={styles.positionSymbol}>
                    <span className={`${styles.positionType} ${position.type === "BUY" ? styles.buy : styles.sell}`}>
                      {position.type}
                    </span>
                    <span className={styles.symbolName}>{position.symbol}</span>
                  </div>
                  <div className={`${styles.positionProfit} ${position.profit >= 0 ? styles.positive : styles.negative}`}>
                    ${position.profit.toFixed(2)}
                    <span className={styles.profitPercent}>
                      ({position.profitPercent?.toFixed(2) || "0.00"}%)
                    </span>
                  </div>
                </div>

                <div className={styles.positionDetails}>
                  <div className={styles.detailItem}>
                    <FiTarget className={styles.detailIcon} />
                    <span className={styles.detailLabel}>Entry</span>
                    <span className={styles.detailValue}>{formatPrice(position.openPrice)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Current</span>
                    <span className={styles.detailValue}>{formatPrice(position.currentPrice)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>SL</span>
                    <span className={styles.detailValue}>{position.stopLoss ? formatPrice(position.stopLoss) : "None"}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>TP</span>
                    <span className={styles.detailValue}>{position.takeProfit ? formatPrice(position.takeProfit) : "None"}</span>
                  </div>
                </div>

                <div className={styles.positionFooter}>
                  <div className={styles.footerItem}>
                    <span className={styles.footerLabel}>Volume</span>
                    <span className={styles.footerValue}>{formatVolume(position.volume)}</span>
                  </div>
                  <div className={styles.footerItem}>
                    <FiClock className={styles.footerIcon} />
                    <span className={styles.footerLabel}>Opened</span>
                    <span className={styles.footerValue}>{formatTime(position.openTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}