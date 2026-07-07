import { useState } from "react";
import { FiSettings, FiBell, FiDatabase, FiInfo } from "react-icons/fi";
import { useNotificationStore } from "../../store";
import styles from "../../styles/Settings.module.css";

export default function Settings() {
  const { unreadCount } = useNotificationStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiSettings className={styles.headerIcon} />
        <div className={styles.headerText}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Configure your SmartBlinks AI experience</p>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Notifications */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FiBell className={styles.sectionIcon} />
            <span>Notifications</span>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Push Notifications</span>
                <span className={styles.settingDescription}>
                  Receive real-time notifications about AI activity and trades
                </span>
              </div>
              <button 
                className={`${styles.toggleButton} ${notificationsEnabled ? styles.active : ""}`}
                onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : handleEnableNotifications}
              >
                <span className={styles.toggleSlider} />
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Sound Alerts</span>
                <span className={styles.settingDescription}>
                  Play sounds for important events
                </span>
              </div>
              <button className={`${styles.toggleButton} ${styles.active}`}>
                <span className={styles.toggleSlider} />
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Unread Notifications</span>
                <span className={styles.settingDescription}>
                  You have {unreadCount} unread notifications
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FiDatabase className={styles.sectionIcon} />
            <span>Trading Configuration</span>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.infoBox}>
              <FiInfo className={styles.infoIcon} />
              <div className={styles.infoText}>
                <p>Trading parameters are configured through environment variables on the backend server.</p>
                <p>Contact your administrator to modify trading settings.</p>
              </div>
            </div>

            <div className={styles.configList}>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Trading Symbol</span>
                <span className={styles.configValue}>XAUUSD (Gold)</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Max Positions</span>
                <span className={styles.configValue}>3</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Risk Per Trade</span>
                <span className={styles.configValue}>1%</span>
              </div>
              <div className={styles.configItem}>
                <span className={styles.configLabel}>Max Daily Loss</span>
                <span className={styles.configValue}>2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <FiInfo className={styles.sectionIcon} />
            <span>About</span>
          </div>

          <div className={styles.sectionContent}>
            <div className={styles.aboutInfo}>
              <div className={styles.aboutLogo}>SB</div>
              <div className={styles.aboutText}>
                <h3>SmartBlinks AI</h3>
                <p>Institutional Autonomous Trading Operating System</p>
                <span className={styles.version}>Version 1.0.0</span>
              </div>
            </div>

            <div className={styles.techStack}>
              <span className={styles.techLabel}>Built with:</span>
              <div className={styles.techItems}>
                <span className={styles.techItem}>React</span>
                <span className={styles.techItem}>TypeScript</span>
                <span className={styles.techItem}>Node.js</span>
                <span className={styles.techItem}>cTrader API</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}