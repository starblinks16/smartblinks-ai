import { cTraderService } from "./ctrader.service.js";
import type { Candle, MarketData, MarketMode, TimeframeAnalysis, KeyLevel, Ticker } from "../types/index.js";

interface MarketAnalysis {
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  strength: number;
  momentum: number;
  volatility: number;
  support: number;
  resistance: number;
}

class MarketService {
  private currentAnalysis: MarketAnalysis | null = null;
  private lastAnalysisTime: number = 0;
  private analysisCache: Map<string, { data: MarketAnalysis; timestamp: number }> = new Map();
  private cacheTimeout: number = 60000; // 1 minute cache

  readonly SYMBOL = "XAUUSD";
  readonly TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"];

  // Analyze market across all timeframes
  async analyzeMarket(): Promise<MarketData> {
    const now = Date.now();
    
    // Check cache
    const cached = this.analysisCache.get(this.SYMBOL);
    if (cached && now - cached.timestamp < this.cacheTimeout) {
      return this.buildMarketData(cached.data);
    }

    try {
      // Get data from all timeframes
      const timeframeData = await this.getAllTimeframeData();
      
      // Perform analysis
      const analysis = this.performAnalysis(timeframeData);
      
      // Cache results
      this.analysisCache.set(this.SYMBOL, {
        data: analysis,
        timestamp: now,
      });
      
      this.currentAnalysis = analysis;
      this.lastAnalysisTime = now;
      
      return this.buildMarketData(analysis);
    } catch (error) {
      console.error("Market analysis failed:", error);
      throw error;
    }
  }

  // Get candle data for all timeframes
  private async getAllTimeframeData(): Promise<Map<string, Candle[]>> {
    const data = new Map<string, Candle[]>();
    
    const promises = this.TIMEFRAMES.map(async (tf) => {
      try {
        const candles = await cTraderService.getCandles(this.SYMBOL, tf, 100);
        data.set(tf, candles);
      } catch (error) {
        console.error(`Failed to get ${tf} candles:`, error);
        data.set(tf, []);
      }
    });

    await Promise.all(promises);
    return data;
  }

  // Perform comprehensive analysis
  private performAnalysis(timeframeData: Map<string, Candle[]>): MarketAnalysis {
    // Calculate trends for each timeframe
    const trends = this.calculateTrends(timeframeData);
    
    // Calculate momentum
    const momentum = this.calculateMomentum(timeframeData);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(timeframeData);
    
    // Find key levels
    const { support, resistance } = this.findKeyLevels(timeframeData);
    
    // Determine overall trend and strength
    const trend = this.determineTrend(trends, momentum);
    const strength = this.calculateTrendStrength(trends);
    
    return {
      trend,
      strength,
      momentum,
      volatility,
      support,
      resistance,
    };
  }

  // Calculate trend for each timeframe
  private calculateTrends(timeframeData: Map<string, Candle[]>): Map<string, "BULLISH" | "BEARISH" | "NEUTRAL"> {
    const trends = new Map<string, "BULLISH" | "BEARISH" | "NEUTRAL">();
    
    for (const [tf, candles] of timeframeData) {
      if (candles.length < 20) {
        trends.set(tf, "NEUTRAL");
        continue;
      }
      
      // Use EMA crossover for trend detection
      const ema20 = this.calculateEMA(candles, 20);
      const ema50 = this.calculateEMA(candles, 50);
      
      if (!ema20 || !ema50) {
        trends.set(tf, "NEUTRAL");
        continue;
      }
      
      const lastEma20 = ema20[ema20.length - 1];
      const lastEma50 = ema50[ema50.length - 1];
      const prevEma20 = ema20[ema20.length - 2];
      const prevEma50 = ema50[ema50.length - 2];
      
      if (lastEma20 > lastEma50 && prevEma20 <= prevEma50) {
        trends.set(tf, "BULLISH");
      } else if (lastEma20 < lastEma50 && prevEma20 >= prevEma50) {
        trends.set(tf, "BEARISH");
      } else if (lastEma20 > lastEma50) {
        trends.set(tf, "BULLISH");
      } else if (lastEma20 < lastEma50) {
        trends.set(tf, "BEARISH");
      } else {
        trends.set(tf, "NEUTRAL");
      }
    }
    
    return trends;
  }

  // Calculate EMA
  private calculateEMA(candles: Candle[], period: number): number[] {
    if (candles.length < period) return [];
    
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate SMA for first EMA value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += candles[i].close;
    }
    ema.push(sum / period);
    
    // Calculate EMA for remaining candles
    for (let i = period; i < candles.length; i++) {
      const value = (candles[i].close - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(value);
    }
    
    return ema;
  }

  // Calculate momentum
  private calculateMomentum(timeframeData: Map<string, Candle[]>): number {
    let totalMomentum = 0;
    let count = 0;
    
    for (const [, candles] of timeframeData) {
      if (candles.length >= 14) {
        const currentClose = candles[candles.length - 1].close;
        const pastClose = candles[candles.length - 14].close;
        const momentum = ((currentClose - pastClose) / pastClose) * 100;
        totalMomentum += momentum;
        count++;
      }
    }
    
    return count > 0 ? totalMomentum / count : 0;
  }

  // Calculate volatility (ATR-based)
  private calculateVolatility(timeframeData: Map<string, Candle[]>): number {
    const hourlyCandles = timeframeData.get("1h") || [];
    if (hourlyCandles.length < 14) return 0;
    
    const trs: number[] = [];
    for (let i = 1; i < hourlyCandles.length; i++) {
      const high = hourlyCandles[i].high;
      const low = hourlyCandles[i].low;
      const prevClose = hourlyCandles[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trs.push(tr);
    }
    
    const atr = trs.reduce((sum, tr) => sum + tr, 0) / trs.length;
    const avgPrice = hourlyCandles.reduce((sum, c) => sum + c.close, 0) / hourlyCandles.length;
    
    return (atr / avgPrice) * 100; // Percentage volatility
  }

  // Find support and resistance levels
  private findKeyLevels(timeframeData: Map<string, Candle[]>): { support: number; resistance: number } {
    const fourHourCandles = timeframeData.get("4h") || [];
    
    if (fourHourCandles.length < 50) {
      const lastCandle = fourHourCandles[fourHourCandles.length - 1];
      return {
        support: lastCandle.low - 10,
        resistance: lastCandle.high + 10,
      };
    }
    
    // Find swing highs and lows
    const highs: number[] = [];
    const lows: number[] = [];
    
    for (let i = 10; i < fourHourCandles.length - 10; i++) {
      const isSwingHigh = fourHourCandles.slice(i - 10, i + 10).every(
        (c) => c.high <= fourHourCandles[i].high
      );
      const isSwingLow = fourHourCandles.slice(i - 10, i + 10).every(
        (c) => c.low >= fourHourCandles[i].low
      );
      
      if (isSwingHigh) highs.push(fourHourCandles[i].high);
      if (isSwingLow) lows.push(fourHourCandles[i].low);
    }
    
    // Get recent highs/lows
    const recentHighs = highs.slice(-5);
    const recentLows = lows.slice(-5);
    
    const resistance = recentHighs.length > 0 
      ? recentHighs.reduce((a, b) => a + b, 0) / recentHighs.length 
      : fourHourCandles[fourHourCandles.length - 1].high;
    
    const support = recentLows.length > 0 
      ? recentLows.reduce((a, b) => a + b, 0) / recentLows.length 
      : fourHourCandles[fourHourCandles.length - 1].low;
    
    return { support, resistance };
  }

  // Determine overall trend
  private determineTrend(trends: Map<string, "BULLISH" | "BEARISH" | "NEUTRAL">, momentum: number): "BULLISH" | "BEARISH" | "NEUTRAL" {
    let bullishCount = 0;
    let bearishCount = 0;
    
    // Weight higher timeframes more
    const weights: Record<string, number> = {
      "1d": 5,
      "4h": 4,
      "1h": 3,
      "30m": 2,
      "15m": 1.5,
      "5m": 1,
      "1m": 0.5,
    };
    
    let totalWeight = 0;
    let bullishWeight = 0;
    let bearishWeight = 0;
    
    trends.forEach((trend, tf) => {
      const weight = weights[tf] || 1;
      totalWeight += weight;
      
      if (trend === "BULLISH") bullishWeight += weight;
      else if (trend === "BEARISH") bearishWeight += weight;
    });
    
    if (totalWeight === 0) return "NEUTRAL";
    
    const bullishRatio = bullishWeight / totalWeight;
    const bearishRatio = bearishWeight / totalWeight;
    
    // Factor in momentum
    if (momentum > 0.5 && bullishRatio > 0.5) return "BULLISH";
    if (momentum < -0.5 && bearishRatio > 0.5) return "BEARISH";
    
    if (bullishRatio > 0.6) return "BULLISH";
    if (bearishRatio > 0.6) return "BEARISH";
    
    return "NEUTRAL";
  }

  // Calculate trend strength
  private calculateTrendStrength(trends: Map<string, "BULLISH" | "BEARISH" | "NEUTRAL">): number {
    let bullishCount = 0;
    let total = 0;
    
    trends.forEach((trend) => {
      total++;
      if (trend !== "NEUTRAL") {
        if (trend === "BULLISH") bullishCount++;
        else bullishCount--;
      }
    });
    
    if (total === 0) return 0;
    return (bullishCount / total) * 100; // -100 to 100
  }

  // Build market data response
  private buildMarketData(analysis: MarketAnalysis): MarketData {
    const ticker = this.getCurrentTicker();
    const currentPrice = ticker?.bid || 0;
    
    // Determine market personality
    const personality = this.determineMarketPersonality(analysis);
    
    // Calculate key levels
    const keyLevels = this.calculateKeyLevels(analysis, currentPrice);
    
    // Determine liquidity state
    const liquidityState = this.evaluateLiquidity(analysis);
    
    // Evaluate market structure
    const structure = this.evaluateStructure(analysis);
    
    return {
      symbol: this.SYMBOL,
      mood: analysis.trend,
      personality,
      volatility: analysis.volatility,
      session: this.getCurrentSession(),
      confidence: Math.abs(analysis.strength) / 100,
      liquidityState,
      structure,
      momentum: analysis.momentum,
      trend: analysis.trend,
      keyLevels,
    };
  }

  // Get current ticker
  private getCurrentTicker(): Ticker | null {
    // This would be updated by WebSocket
    return null;
  }

  // Determine market personality
  private determineMarketPersonality(analysis: MarketAnalysis): MarketMode {
    if (analysis.volatility > 2) return "VOLATILE";
    if (Math.abs(analysis.momentum) > 2) return "AGGRESSIVE";
    if (Math.abs(analysis.momentum) < 0.2) return "SLOW";
    if (analysis.strength < 20 && analysis.strength > -20) return "RANGING";
    if (analysis.strength > 60) return "TRENDING";
    return "CHOPPY";
  }

  // Calculate key levels
  private calculateKeyLevels(analysis: MarketAnalysis, currentPrice: number): KeyLevel[] {
    const levels: KeyLevel[] = [];
    
    // Add support and resistance
    const supportDistance = ((currentPrice - analysis.support) / currentPrice) * 100;
    const resistanceDistance = ((analysis.resistance - currentPrice) / currentPrice) * 100;
    
    levels.push({
      type: "SUPPORT",
      price: analysis.support,
      strength: supportDistance < 1 ? 3 : supportDistance < 2 ? 2 : 1,
      distance: supportDistance,
    });
    
    levels.push({
      type: "RESISTANCE",
      price: analysis.resistance,
      strength: resistanceDistance < 1 ? 3 : resistanceDistance < 2 ? 2 : 1,
      distance: resistanceDistance,
    });
    
    return levels;
  }

  // Evaluate liquidity
  private evaluateLiquidity(analysis: MarketAnalysis): string {
    if (analysis.volatility > 1.5) return "HIGH_LIQUIDITY";
    if (analysis.volatility < 0.5) return "LOW_LIQUIDITY";
    return "NORMAL_LIQUIDITY";
  }

  // Evaluate structure
  private evaluateStructure(analysis: MarketAnalysis): string {
    if (analysis.trend === "BULLISH" && analysis.strength > 50) return "BULLISH_TREND";
    if (analysis.trend === "BEARISH" && analysis.strength > 50) return "BEARISH_TREND";
    if (Math.abs(analysis.strength) < 20) return "RANGE_BOUND";
    return "TRANSITIONAL";
  }

  // Get current trading session
  private getCurrentSession(): string {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    if (utcHour >= 0 && utcHour < 8) return "ASIAN";
    if (utcHour >= 8 && utcHour < 13) return "LONDON";
    if (utcHour >= 13 && utcHour < 17) return "NEW_YORK_OVERLAP";
    if (utcHour >= 17 && utcHour < 21) return "NEW_YORK";
    return "AFTER_HOURS";
  }

  // Get multi-timeframe analysis
  async getMultiTimeframeAnalysis(): Promise<TimeframeAnalysis[]> {
    const timeframeData = await this.getAllTimeframeData();
    const analysis: TimeframeAnalysis[] = [];
    
    const tfMap: Record<string, string> = {
      "1m": "1 Minute",
      "5m": "5 Minutes",
      "15m": "15 Minutes",
      "30m": "30 Minutes",
      "1h": "1 Hour",
      "4h": "4 Hours",
      "1d": "1 Day",
    };
    
    for (const [tf, candles] of timeframeData) {
      if (candles.length < 50) continue;
      
      const ema20 = this.calculateEMA(candles, 20);
      const ema50 = this.calculateEMA(candles, 50);
      
      let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
      if (ema20.length > 0 && ema50.length > 0) {
        const current = ema20[ema20.length - 1];
        const current50 = ema50[ema50.length - 1];
        trend = current > current50 ? "BULLISH" : current < current50 ? "BEARISH" : "NEUTRAL";
      }
      
      // Calculate strength
      const recentCandles = candles.slice(-20);
      const priceChange = ((recentCandles[recentCandles.length - 1].close - recentCandles[0].close) / recentCandles[0].close) * 100;
      
      // Calculate momentum
      const momentum = candles.length >= 14 
        ? ((candles[candles.length - 1].close - candles[candles.length - 14].close) / candles[candles.length - 14].close) * 100 
        : 0;
      
      analysis.push({
        timeframe: tfMap[tf] || tf,
        trend,
        strength: Math.abs(priceChange) * 10,
        keyLevel: candles[candles.length - 1].close,
        momentum,
      });
    }
    
    return analysis;
  }

  // Get current analysis
  getCurrentAnalysis(): MarketAnalysis | null {
    return this.currentAnalysis;
  }

  // Clear cache
  clearCache(): void {
    this.analysisCache.clear();
  }
}

export const marketService = new MarketService();
export default MarketService;