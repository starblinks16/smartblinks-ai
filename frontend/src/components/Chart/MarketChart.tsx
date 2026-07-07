import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";
import { api } from "../../services/api";
import { useMarketStore, useAccountStore } from "../../store";
import styles from "../../styles/MarketChart.module.css";

const timeframes = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];

export default function MarketChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const slLineRef = useRef<ISeriesApi<"Line"> | null>(null);
  const tpLineRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const { candles, setCandles, addCandle } = useMarketStore();
  const { positions } = useAccountStore();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#94a3b8",
        fontFamily: "Inter, sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "rgba(255, 215, 0, 0.5)", labelBackgroundColor: "#ffd700" },
        horzLine: { color: "rgba(255, 215, 0, 0.5)", labelBackgroundColor: "#ffd700" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candleSeriesRef.current = candleSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeriesRef.current = volumeSeries;
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Load initial data
    loadCandles(selectedTimeframe);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    loadCandles(selectedTimeframe);
  }, [selectedTimeframe]);

  useEffect(() => {
    // Update chart with candle data
    if (candleSeriesRef.current && candles[selectedTimeframe]) {
      const chartCandles: CandlestickData[] = candles[selectedTimeframe].map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      candleSeriesRef.current.setData(chartCandles);
    }

    if (volumeSeriesRef.current && candles[selectedTimeframe]) {
      const volumeData = candles[selectedTimeframe].map((c) => ({
        time: c.time as any,
        value: c.volume,
        color: c.close >= c.open ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)",
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // Draw SL/TP lines for open positions
    updatePositionLines();
  }, [candles, positions, selectedTimeframe]);

  const loadCandles = async (timeframe: string) => {
    try {
      const data = await api.getCandles(timeframe, 500);
      const candleData = data.map((c: any) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume || 0,
      }));
      setCandles(timeframe, candleData);
    } catch (error) {
      console.error("Failed to load candles:", error);
    }
  };

  const updatePositionLines = () => {
    if (!candleSeriesRef.current || positions.length === 0) return;

    // This would draw lines for SL/TP - simplified for demo
    // In production, you'd track the actual SL/TP levels
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.symbolInfo}>
          <span className={styles.symbol}>XAUUSD</span>
          <span className={styles.timeframeLabel}>Gold - Spot</span>
        </div>
        
        <div className={styles.timeframes}>
          {timeframes.map((tf) => (
            <button
              key={tf}
              className={`${styles.tfButton} ${selectedTimeframe === tf ? styles.active : ""}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper} ref={chartContainerRef} />
    </div>
  );
}