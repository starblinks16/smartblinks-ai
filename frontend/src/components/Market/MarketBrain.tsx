import { FiTrendingUp, FiTrendingDown, FiActivity, FiTarget } from "react-icons/fi";
import { useMarketStore, useAIStore } from "../../store";
import styles from "../../styles/MarketBrain.module.css";

export default function MarketBrain() {
  const { marketData, timeframeAnalysis, session } = useMarketStore();
  const { status } = useAIStore();

  const getTrendIcon = (trend: string) => {
    return trend === "BULLISH" ? <FiTrendingUp /> : trend === "BEARISH" ? <FiTrendingDown /> : <FiActivity />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "BULLISH") return "var(--success)";
    if (trend === "BEARISH") return "var(--danger)";
    return "var(--text-muted)";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiBrain className={styles.headerIcon} />
        <span className={styles.headerTitle}>Market Brain</span>
      </div>

      <div className={styles.content}>
        {/* Current State */}
        <div className={styles.stateSection}>
          <div className={styles.stateItem}>
            <span className={styles.stateLabel}>Mood</span>
            <span className={styles.stateValue} style={{ color: marketData?.mood === "BULLISH" ? "var(--success)" : marketData?.mood === "BEARISH" ? "var(--danger)" : "var(--text-muted)" }}>
              {marketData?.mood || "NEUTRAL"}
            </span>
          </div>
          
          <div className={styles.stateItem}>
            <span className={styles.stateLabel}>Personality</span>
            <span className={styles.stateValue}>{marketData?.personality || "CHOPPY"}</span>
          </div>

          <div className={styles.stateItem}>
            <span className={styles.stateLabel}>Session</span>
            <span className={styles.stateValue}>{session?.name || "UNKNOWN"}</span>
          </div>

          <div className={styles.stateItem}>
            <span className={styles.stateLabel}>Confidence</span>
            <span className={styles.stateValue}>{marketData ? `${(marketData.confidence * 100).toFixed(0)}%` : "0%"}</span>
          </div>
        </div>

        {/* Structure */}
        <div className={styles.structureSection}>
          <div className={styles.structureItem}>
            <FiTarget className={styles.structureIcon} />
            <span className={styles.structureLabel}>Structure</span>
            <span className={styles.structureValue}>{marketData?.structure || "UNKNOWN"}</span>
          </div>

          <div className={styles.structureItem}>
            <span className={styles.structureIcon}>💧</span>
            <span className={styles.structureLabel}>Liquidity</span>
            <span className={styles.structureValue}>{marketData?.liquidityState || "NORMAL"}</span>
          </div>

          <div className={styles.structureItem}>
            <FiActivity className={styles.structureIcon} />
            <span className={styles.structureLabel}>Volatility</span>
            <span className={styles.structureValue}>{marketData?.volatility?.toFixed(2) || "0"}%</span>
          </div>

          <div className={styles.structureItem}>
            <span className={styles.structureIcon}>⚡</span>
            <span className={styles.structureLabel}>Momentum</span>
            <span className={styles.structureValue}>{marketData?.momentum?.toFixed(2) || "0"}</span>
          </div>
        </div>

        {/* Multi-Timeframe Analysis */}
        <div className={styles.timeframeSection}>
          <span className={styles.sectionTitle}>Multi-Timeframe Analysis</span>
          <div className={styles.timeframeGrid}>
            {timeframeAnalysis.map((tf, index) => (
              <div key={index} className={styles.tfItem}>
                <span className={styles.tfTimeframe}>{tf.timeframe}</span>
                <span 
                  className={styles.tfTrend}
                  style={{ color: getTrendColor(tf.trend) }}
                >
                  {getTrendIcon(tf.trend)}
                </span>
                <span className={styles.tfStrength}>{tf.strength.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Strategy */}
        {status?.currentStrategy && (
          <div className={styles.strategySection}>
            <span className={styles.sectionTitle}>Active Strategy</span>
            <div className={styles.strategyCard}>
              <span className={styles.strategyName}>{status.currentStrategy}</span>
              <span className={styles.strategyMode}>Mode: {status.marketMode}</span>
            </div>
          </div>
        )}

        {/* Key Levels */}
        {marketData?.keyLevels && marketData.keyLevels.length > 0 && (
          <div className={styles.levelsSection}>
            <span className={styles.sectionTitle}>Key Levels</span>
            <div className={styles.levelsGrid}>
              {marketData.keyLevels.map((level, index) => (
                <div key={index} className={styles.levelItem}>
                  <span className={`${styles.levelType} ${level.type === "RESISTANCE" ? styles.resistance : styles.support}`}>
                    {level.type}
                  </span>
                  <span className={styles.levelPrice}>{level.price.toFixed(2)}</span>
                  <span className={styles.levelDistance}>{level.distance.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { FiBrain } from "react-icons/fi";