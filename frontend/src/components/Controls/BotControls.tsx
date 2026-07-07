import { useState } from "react";
import { 
  FiPlay, 
  FiSquare, 
  FiPause, 
  FiRefreshCw, 
  FiAlertTriangle,
  FiZap
} from "react-icons/fi";
import { socketService } from "../../services/socket";
import { useAIStore } from "../../store";
import styles from "../../styles/BotControls.module.css";

export default function BotControls() {
  const { status, isActive } = useAIStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      socketService.aiStart();
    } catch (error) {
      console.error("Failed to start AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      socketService.aiStop();
    } catch (error) {
      console.error("Failed to stop AI:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    socketService.aiPause();
  };

  const handleResume = () => {
    socketService.aiResume();
  };

  const handleEmergency = () => {
    if (window.confirm("Are you sure you want to trigger emergency stop? This will halt all trading activity.")) {
      socketService.aiEmergency();
    }
  };

  const isStopped = status?.state === "STOPPED" || !status;
  const isPaused = status?.state === "IDLE";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FiZap className={styles.headerIcon} />
        <span className={styles.headerTitle}>Bot Controls</span>
      </div>

      <div className={styles.controls}>
        {/* Start Button */}
        <button
          className={`${styles.button} ${styles.start}`}
          onClick={handleStart}
          disabled={isLoading || isActive && !isStopped}
        >
          <FiPlay className={styles.buttonIcon} />
          <span className={styles.buttonLabel}>Start Bot</span>
        </button>

        {/* Pause Button */}
        <button
          className={`${styles.button} ${styles.pause}`}
          onClick={isPaused ? handleResume : handlePause}
          disabled={isLoading || isStopped}
        >
          {isPaused ? <FiRefreshCw className={styles.buttonIcon} /> : <FiPause className={styles.buttonIcon} />}
          <span className={styles.buttonLabel}>{isPaused ? "Resume" : "Pause"}</span>
        </button>

        {/* Stop Button */}
        <button
          className={`${styles.button} ${styles.stop}`}
          onClick={handleStop}
          disabled={isLoading || isStopped}
        >
          <FiSquare className={styles.buttonIcon} />
          <span className={styles.buttonLabel}>Stop Bot</span>
        </button>

        {/* Emergency Button */}
        <button
          className={`${styles.button} ${styles.emergency}`}
          onClick={handleEmergency}
          disabled={isLoading}
        >
          <FiAlertTriangle className={styles.buttonIcon} />
          <span className={styles.buttonLabel}>Emergency</span>
        </button>
      </div>

      {/* Status Display */}
      <div className={styles.statusDisplay}>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>State</span>
          <span className={styles.statusValue}>{status?.state?.replace("_", " ") || "UNKNOWN"}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Strategy</span>
          <span className={styles.statusValue}>{status?.currentStrategy || "None"}</span>
        </div>
        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>Risk</span>
          <span className={styles.statusValue} style={{ 
            color: status?.riskLevel === "EXTREME" ? "var(--danger)" : 
                   status?.riskLevel === "HIGH" ? "var(--warning)" : "var(--success)" 
          }}>
            {status?.riskLevel || "LOW"}
          </span>
        </div>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}