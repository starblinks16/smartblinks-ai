import { FiShield, FiAlertTriangle, FiActivity, FiTrendingDown } from "react-icons/fi";
import { useAccountStore, useAIStore } from "../../store";
import styles from "../../styles/RiskEngine.module.css";

export default function RiskEngine() {
  const { account, positions } = useAccountStore();
  const { status } = useAIStore();

  const getHealthStatus = () => {
    if (!account) return { label: "UNKNOWN", color: "var(--text-muted)", level: 0 };
    
    const drawdown = account.balance > 0 ? ((account.balance - account.equity) / account.balance) * 100 : 0;
    
    if (drawdown > 15) return { label: "CRITICAL", color: "var(--danger)", level: 100 };
    if (drawdown > 10) return { label: "DANGER", color: "var(--danger)", level: 80 };
    if (drawdown > 5) return { label: "CAUTION", color: "var(--warning)", level: 60 };
    if (drawdown > 2) return { label: "SAFE", color: "var(--success)", level: 40 };
    if (drawdown > 0) return { label: "STRONG", color: "var(--success)", level: 20 };
    return { label: "PERFECT", color: "var(--accent-gold)", level: 0 };
  };

  const getRiskLevel = () => {
    if (!status) return { label: "LOW", color: "var(--success)" };
    
    const riskColors: Record<string, string> = {
      LOW: "var(--success)",
      MEDIUM: "var(--warning)",
      HIGH: "var(--warning)",
      EXTREME: "var(--danger)",
    };
    
    return { label: status.riskLevel, color: riskColors[status.riskLevel] || "var(--success)" };
  };

  const health = getHealthStatus();
  const risk = getRiskLevel();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiShield className={styles.headerIcon} />
        <span className={styles.headerTitle}>Risk Engine</span>
      </div>

      <div className={styles.content}>
        {/* Account Health */}
        <div className={styles.healthSection}>
          <div className={styles.healthHeader}>
            <span className={styles.healthLabel}>Account Health</span>
            <span className={styles.healthStatus} style={{ color: health.color }}>
              {health.label}
            </span>
          </div>
          
          <div className={styles.healthBar}>
            <div 
              className={styles.healthFill}
              style={{ 
                width: `${health.level}%`,
                backgroundColor: health.color,
              }}
            />
          </div>

          <div className={styles.healthStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Balance</span>
              <span className={styles.statValue}>${formatCurrency(account?.balance || 0)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Equity</span>
              <span className={styles.statValue}>${formatCurrency(account?.equity || 0)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Unrealized P&L</span>
              <span className={`${styles.statValue} ${(account?.unrealizedPnL || 0) >= 0 ? styles.positive : styles.negative}`}>
                ${formatCurrency(account?.unrealizedPnL || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className={styles.riskSection}>
          <div className={styles.riskItem}>
            <FiActivity className={styles.riskIcon} />
            <div className={styles.riskInfo}>
              <span className={styles.riskLabel}>Risk Level</span>
              <span className={styles.riskValue} style={{ color: risk.color }}>
                {risk.label}
              </span>
            </div>
          </div>

          <div className={styles.riskItem}>
            <FiTrendingDown className={styles.riskIcon} />
            <div className={styles.riskInfo}>
              <span className={styles.riskLabel}>Drawdown</span>
              <span className={styles.riskValue}>
                {account?.balance > 0 
                  ? `${(((account.balance - account.equity) / account.balance) * 100).toFixed(2)}%`
                  : "0.00%"}
              </span>
            </div>
          </div>

          <div className={styles.riskItem}>
            <FiAlertTriangle className={styles.riskIcon} />
            <div className={styles.riskInfo}>
              <span className={styles.riskLabel}>Margin Level</span>
              <span className={styles.riskValue}>
                {account?.marginLevel?.toFixed(0) || "0"}%
              </span>
            </div>
          </div>
        </div>

        {/* Exposure */}
        <div className={styles.exposureSection}>
          <span className={styles.exposureTitle}>Exposure</span>
          
          <div className={styles.exposureBar}>
            <div 
              className={styles.exposureFill}
              style={{ width: `${(positions.length / 3) * 100}%` }}
            />
          </div>
          
          <div className={styles.exposureStats}>
            <span>Open Positions: {positions.length}/3</span>
          </div>
        </div>

        {/* Capital Protection */}
        <div className={styles.protectionSection}>
          <div className={styles.protectionHeader}>
            <FiShield className={styles.protectionIcon} />
            <span>Capital Protection Status</span>
          </div>
          
          <div className={styles.protectionIndicator}>
            <div className={`${styles.protectionDot} ${health.level < 60 ? styles.active : ""}`} />
            <span>{health.level < 60 ? "Active Protection" : "Normal Operations"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}