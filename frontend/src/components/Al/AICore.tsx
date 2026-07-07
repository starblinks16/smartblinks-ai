import { useEffect, useState } from "react";
import { useAIStore, useMarketStore } from "../../store";
import type { AIState } from "../../types";
import styles from "../../styles/AICore.module.css";

const stateConfig: Record<AIState, { color: string; label: string; speed: number; glow: string }> = {
  IDLE: { color: "#64748b", label: "Idle", speed: 4, glow: "0 0 30px rgba(100, 116, 139, 0.3)" },
  SCANNING: { color: "#00d4ff", label: "Scanning", speed: 2, glow: "0 0 30px rgba(0, 212, 255, 0.4)" },
  ANALYZING: { color: "#00ffff", label: "Analyzing", speed: 1.5, glow: "0 0 40px rgba(0, 255, 255, 0.5)" },
  HIGH_CONFIDENCE: { color: "#ffd700", label: "High Confidence", speed: 0.8, glow: "0 0 50px rgba(255, 215, 0, 0.6)" },
  EXECUTING: { color: "#8b5cf6", label: "Executing", speed: 0.5, glow: "0 0 60px rgba(139, 92, 246, 0.7)" },
  DEFENSIVE: { color: "#10b981", label: "Defensive", speed: 3, glow: "0 0 30px rgba(16, 185, 129, 0.4)" },
  PROTECTING: { color: "#f59e0b", label: "Protecting", speed: 1, glow: "0 0 40px rgba(245, 158, 11, 0.5)" },
  VOLATILITY_WARNING: { color: "#f97316", label: "Volatility Warning", speed: 0.7, glow: "0 0 50px rgba(249, 115, 22, 0.5)" },
  CRITICAL_RISK: { color: "#ef4444", label: "Critical Risk", speed: 0.3, glow: "0 0 60px rgba(239, 68, 68, 0.7)" },
  STOPPED: { color: "#64748b", label: "Stopped", speed: 0, glow: "none" },
};

export default function AICore() {
  const { status } = useAIStore();
  const { marketData } = useMarketStore();
  const [neuralActivity, setNeuralActivity] = useState<number[]>([]);

  const state = status?.state || "IDLE";
  const config = stateConfig[state];

  useEffect(() => {
    if (config.speed > 0) {
      const interval = setInterval(() => {
        setNeuralActivity((prev) => {
          const newActivity = [...prev, Math.random()];
          return newActivity.slice(-20);
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [config.speed]);

  return (
    <div className={styles.container}>
      {/* Robot Head Container */}
      <div 
        className={styles.robotHead}
        style={{ "--glow-color": config.color, "--glow": config.glow } as React.CSSProperties}
      >
        {/* Outer Ring */}
        <svg className={styles.outerRing} viewBox="0 0 200 200">
          <defs>
            <linearGradient id={`ringGradient-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
              <stop offset="50%" stopColor={config.color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${state}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Rotating ring segments */}
          <circle 
            cx="100" 
            cy="100" 
            r="95" 
            fill="none" 
            stroke={`url(#ringGradient-${state})`}
            strokeWidth="2"
            strokeDasharray="20 10"
            className={styles.rotatingRing}
            style={{ animationDuration: `${config.speed * 10}s` }}
            filter={`url(#glow-${state})`}
          />
        </svg>

        {/* Main Head */}
        <div className={styles.head}>
          {/* Neural pathways */}
          <svg className={styles.neuralNet} viewBox="0 0 100 100">
            {neuralActivity.map((_, i) => {
              const x = 20 + Math.random() * 60;
              const y = 20 + Math.random() * 60;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={2 + Math.random() * 2}
                  fill={config.color}
                  opacity={neuralActivity[neuralActivity.length - 1 - i] || 0.5}
                  className={styles.neuralNode}
                />
              );
            })}
          </svg>

          {/* Face Plate */}
          <div className={styles.facePlate}>
            {/* Eyes */}
            <div className={styles.eyes}>
              <div 
                className={styles.eye} 
                style={{ 
                  "--eye-color": config.color,
                  animationDuration: `${config.speed}s`
                } as React.CSSProperties}
              >
                <div className={styles.eyeInner}>
                  <div className={styles.eyePupil} />
                </div>
                <div className={styles.eyeGlow} />
              </div>
              <div 
                className={styles.eye} 
                style={{ 
                  "--eye-color": config.color,
                  animationDuration: `${config.speed}s`
                } as React.CSSProperties}
              >
                <div className={styles.eyeInner}>
                  <div className={styles.eyePupil} />
                </div>
                <div className={styles.eyeGlow} />
              </div>
            </div>

            {/* Mouth/Communication */}
            <div className={styles.mouth}>
              <div 
                className={styles.mouthGlow}
                style={{ backgroundColor: config.color }}
              />
            </div>
          </div>

          {/* Processing indicator */}
          <div className={styles.processingBar}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={styles.processingSegment}
                style={{
                  backgroundColor: config.color,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${config.speed * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Crown/Processing Unit */}
        <div className={styles.crown}>
          <div 
            className={styles.crownGem}
            style={{ 
              backgroundColor: config.color,
              boxShadow: `0 0 20px ${config.color}`
            }}
          />
          <div className={styles.crownSpikes}>
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={styles.spike}
                style={{
                  backgroundColor: config.color,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className={styles.statusContainer}>
        <span 
          className={styles.statusLabel}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        {status?.confidence !== undefined && (
          <span className={styles.confidence}>{status.confidence}%</span>
        )}
      </div>

      {/* State Description */}
      <div className={styles.stateInfo}>
        {status?.currentStrategy && (
          <div className={styles.strategy}>
            <span className={styles.infoLabel}>Strategy</span>
            <span className={styles.infoValue}>{status.currentStrategy}</span>
          </div>
        )}
        {marketData?.personality && (
          <div className={styles.personality}>
            <span className={styles.infoLabel}>Market</span>
            <span className={styles.infoValue}>{marketData.personality}</span>
          </div>
        )}
      </div>
    </div>
  );
}