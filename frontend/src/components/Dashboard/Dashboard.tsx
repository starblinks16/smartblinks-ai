import { useEffect } from "react";
import AICore from "../AI/AICore";
import MarketChart from "../Chart/MarketChart";
import MarketBrain from "../Market/MarketBrain";
import RiskEngine from "../Risk/RiskEngine";
import BotControls from "../Controls/BotControls";
import LiveFeed from "../Dashboard/LiveFeed";
import { api } from "../../services/api";
import { useAccountStore, useAIStore, useMarketStore } from "../../store";
import styles from "../../styles/Dashboard.module.css";

export default function Dashboard() {
  const { account, isConnected, setAccount, setPositions } = useAccountStore();
  const { status } = useAIStore();
  const { marketData } = useMarketStore();

  useEffect(() => {
    // Periodic refresh
    const interval = setInterval(async () => {
      if (isConnected) {
        try {
          const [accountData, positionsData] = await Promise.all([
            api.getAccountInfo(),
            api.getPositions(),
          ]);
          setAccount(accountData as any);
          setPositions(positionsData as any);
        } catch (error) {
          console.error("Failed to refresh data:", error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, setAccount, setPositions]);

  return (
    <div className={styles.dashboard}>
      {/* Top Section - AI Core and Controls */}
      <div className={styles.topSection}>
        <div className={styles.aiSection}>
          <AICore />
        </div>
        
        <div className={styles.controlsSection}>
          <BotControls />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column - Chart */}
        <div className={styles.chartSection}>
          <MarketChart />
        </div>

        {/* Right Column - Market Brain & Risk */}
        <div className={styles.sideSection}>
          <MarketBrain />
          <RiskEngine />
        </div>
      </div>

      {/* Bottom Section - Live Feed */}
      <div className={styles.bottomSection}>
        <LiveFeed />
      </div>
    </div>
  );
}