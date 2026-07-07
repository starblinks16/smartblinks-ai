import { NavLink } from "react-router-dom";
import { 
  FiHome, 
  FiTrendingUp, 
  FiSettings, 
  FiLink,
  FiActivity
} from "react-icons/fi";
import { useAccountStore, useAIStore } from "../../store";
import styles from "../../styles/Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  const { isConnected } = useAccountStore();
  const { status } = useAIStore();

  const navItems = [
    { path: "/", icon: FiHome, label: "Dashboard" },
    { path: "/trading", icon: FiTrendingUp, label: "Trading" },
    { path: "/connection", icon: FiLink, label: "Connection" },
    { path: "/settings", icon: FiSettings, label: "Settings" },
  ];

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      SCANNING: "var(--accent-blue)",
      ANALYZING: "var(--accent-cyan)",
      HIGH_CONFIDENCE: "var(--accent-gold)",
      EXECUTING: "var(--accent-purple)",
      DEFENSIVE: "var(--success)",
      PROTECTING: "var(--warning)",
      VOLATILITY_WARNING: "var(--warning)",
      CRITICAL_RISK: "var(--danger)",
      IDLE: "var(--text-muted)",
      STOPPED: "var(--text-muted)",
    };
    return colors[state] || "var(--text-muted)";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.overlay} onClick={toggle} />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 100 100" className={styles.logoSvg}>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent-gold)" />
                  <stop offset="50%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--accent-gold)" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="2" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" strokeWidth="1" opacity="0.5" />
              <path d="M50 15 L55 45 L85 50 L55 55 L50 85 L45 55 L15 50 L45 45 Z" fill="url(#logoGradient)" />
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SmartBlinks</span>
            <span className={styles.logoSubtitle}>AI Trading System</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`${styles.statusBadge} ${isConnected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>{isConnected ? "Live" : "Offline"}</span>
        </div>

        {/* AI Status Indicator */}
        {status && (
          <div className={styles.aiStatus} style={{ "--state-color": getStateColor(status.state) } as React.CSSProperties}>
            <FiActivity className={styles.aiIcon} />
            <span>{status.state.replace("_", " ")}</span>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              onClick={() => {
                if (window.innerWidth < 1024) toggle();
              }}
            >
              <item.icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <div className={styles.version}>
            <span>v1.0.0</span>
            <span className={styles.versionLabel}>Production</span>
          </div>
        </div>
      </aside>
    </>
  );
}