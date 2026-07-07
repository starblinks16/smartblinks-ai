import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Dashboard/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import Trading from "./components/Dashboard/Trading";
import Settings from "./components/Dashboard/Settings";
import Connection from "./components/Dashboard/Connection";
import { socketService } from "./services/socket";
import { api } from "./services/api";
import { useAccountStore, useAIStore, useMarketStore, useNotificationStore } from "./store";
import type { Account, Position, MarketData, AIStatus, Notification, Candle, Ticker } from "./types";

function App() {
  const { setAccount, setPositions, setConnectionStatus } = useAccountStore();
  const { setStatus, setActive, addCommentary } = useAIStore();
  const { setMarketData, setTicker, setSession, setTimeframeAnalysis, setCandles } = useMarketStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Set up event listeners
    socketService.on("connected", () => {
      console.log("Socket connected");
      checkConnection();
    });

    socketService.on("ai-status", (data) => {
      const status = data as AIStatus;
      setStatus(status);
      if (status.commentary) {
        addCommentary(status.commentary);
      }
    });

    socketService.on("connection-status", (data) => {
      const status = data as { isConnected: boolean; accountId: string | null; brokerName: string | null; accountType: string | null };
      setConnectionStatus(status.isConnected);
    });

    socketService.on("account-update", (data) => {
      setAccount(data as Account);
    });

    socketService.on("positions-update", (data) => {
      setPositions(data as Position[]);
    });

    socketService.on("price-update", (data) => {
      setTicker(data as Ticker);
    });

    socketService.on("notification", (data) => {
      addNotification(data as Notification);
    });

    socketService.on("candle-update", (data) => {
      const candle = data as Candle;
      // Add to appropriate timeframe
      // This would need the timeframe info
    });

    // Check initial connection
    checkConnection();

    // Periodic data refresh
    const refreshInterval = setInterval(() => {
      if (socketService.isConnected()) {
        refreshData();
      }
    }, 10000);

    return () => {
      socketService.disconnect();
      clearInterval(refreshInterval);
    };
  }, []);

  const checkConnection = async () => {
    try {
      const status = await api.getConnectionStatus();
      setConnectionStatus(status.isConnected);

      if (status.isConnected) {
        await refreshData();
      }
    } catch (error) {
      console.error("Failed to check connection:", error);
    }
  };

  const refreshData = async () => {
    try {
      // Fetch account data
      const account = await api.getAccountInfo() as Account;
      setAccount(account);

      // Fetch positions
      const positions = await api.getPositions() as Position[];
      setPositions(positions);

      // Fetch market data
      const marketData = await api.getMarketAnalysis() as MarketData;
      setMarketData(marketData);

      // Fetch session
      const session = await api.getSession() as { name: string; status: string; timeRemaining: number };
      setSession(session);

      // Fetch AI status
      const aiStatus = await api.getAIStatus() as AIStatus;
      setStatus(aiStatus);
      setActive(aiStatus.state !== "STOPPED" && aiStatus.state !== "IDLE");

      // Fetch timeframe analysis
      const tfAnalysis = await api.getTimeframeAnalysis();
      setTimeframeAnalysis(tfAnalysis as { timeframe: string; trend: string; strength: number; keyLevel: number; momentum: number }[]);

    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="trading" element={<Trading />} />
        <Route path="settings" element={<Settings />} />
        <Route path="connection" element={<Connection />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;