import { useEffect, useState } from "react";
import { FiLink, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { api } from "../../services/api";
import { useAccountStore, useNotificationStore } from "../../store";
import styles from "../../styles/Connection.module.css";

export default function Connection() {
  const { isConnected, account, setConnectionStatus, setAccount } = useAccountStore();
  const { addNotification } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get("auth_success");
    const authError = params.get("auth_error");

    if (authSuccess) {
      handleAuthSuccess();
    } else if (authError) {
      handleAuthError(authError);
    }

    // Get auth URL
    loadAuthUrl();
  }, []);

  const loadAuthUrl = async () => {
    try {
      const url = await api.getAuthUrl();
      setAuthUrl(url);
    } catch (error) {
      console.error("Failed to get auth URL:", error);
    }
  };

  const handleAuthSuccess = async () => {
    setIsLoading(true);
    try {
      const status = await api.getConnectionStatus();
      setConnectionStatus(status.isConnected);

      if (status.isConnected) {
        const accountData = await api.getAccountInfo() as any;
        setAccount(accountData);
        addNotification({
          id: `auth_${Date.now()}`,
          type: "SUCCESS",
          title: "Connected to cTrader",
          message: `Connected to ${status.brokerName || "Broker"} account`,
          timestamp: Date.now(),
          read: false,
        });
      }

      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Auth success handling failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: string) => {
    addNotification({
      id: `auth_error_${Date.now()}`,
      type: "ERROR",
      title: "Authentication Failed",
      message: `Error: ${error}`,
      timestamp: Date.now(),
      read: false,
    });
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm("Are you sure you want to disconnect from cTrader?")) {
      setIsLoading(true);
      try {
        await api.disconnect();
        setConnectionStatus(false);
        addNotification({
          id: `disconnect_${Date.now()}`,
          type: "INFO",
          title: "Disconnected",
          message: "Disconnected from cTrader",
          timestamp: Date.now(),
          read: false,
        });
      } catch (error) {
        console.error("Disconnect failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiLink className={styles.headerIcon} />
        <div className={styles.headerText}>
          <h1 className={styles.title}>cTrader Connection</h1>
          <p className={styles.subtitle}>Connect your cTrader account to SmartBlinks AI</p>
        </div>
      </div>

      <div className={styles.content}>
        {isConnected ? (
          <div className={styles.connectedState}>
            <div className={styles.successBanner}>
              <FiCheck className={styles.successIcon} />
              <span>Connected to cTrader</span>
            </div>

            {account && (
              <div className={styles.accountDetails}>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>Broker</span>
                  <span className={styles.accountValue}>{account.brokerName}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>Account Type</span>
                  <span className={styles.accountValue}>{account.accountType}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>Account ID</span>
                  <span className={styles.accountValue}>{account.id}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>Balance</span>
                  <span className={styles.accountValue}>${account.balance.toFixed(2)}</span>
                </div>
                <div className={styles.accountRow}>
                  <span className={styles.accountLabel}>Leverage</span>
                  <span className={styles.accountValue}>{account.leverage}:1</span>
                </div>
              </div>
            )}

            <button className={styles.disconnectButton} onClick={handleDisconnect} disabled={isLoading}>
              <FiX />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <div className={styles.disconnectedState}>
            <div className={styles.infoCard}>
              <h3>How to Connect</h3>
              <ol className={styles.instructions}>
                <li>Enter your cTrader Client ID and Client Secret in the environment variables</li>
                <li>Set your Render deployment URL as the Callback URL</li>
                <li>Click "Connect to cTrader" below</li>
                <li>Authorize SmartBlinks AI in the cTrader window</li>
              </ol>
            </div>

            <button 
              className={styles.connectButton} 
              onClick={handleConnect}
              disabled={isLoading || !authUrl}
            >
              {isLoading ? (
                <>
                  <FiRefreshCw className={styles.spinning} />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <FiLink />
                  <span>Connect to cTrader</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <p>Connection uses OAuth 2.0 for secure authentication</p>
        <p>Your credentials are never stored on our servers</p>
      </div>
    </div>
  );
}