import { marketService } from "./market.service.js";
import { cTraderService } from "./ctrader.service.js";
import type { 
  AIState, AIStatus, MarketData, RiskData, AccountHealth, RiskLevel, 
  StrategySignal, TradingSignal, ExecutionMode, MarketMode, Notification 
} from "../types/index.js";

interface AIDecision {
  action: "TRADE" | "WAIT" | "REFUSE";
  signal?: TradingSignal;
  reason: string;
  confidence: number;
}

interface DynamicSLTP {
  stopLoss: number;
  takeProfit: number[];
  trailingStart: number;
  trailingDistance: number;
}

class AIEngine {
  private state: AIState = "IDLE";
  private confidence: number = 0;
  private currentStrategy: string = "";
  private marketMode: MarketMode = "CHOPPY";
  private riskLevel: RiskLevel = "LOW";
  private lastCommentary: string = "";
  private commentaryHistory: string[] = [];
  private isRunning: boolean = false;
  private analysisInterval: NodeJS.Timeout | null = null;
  private notifications: Notification[] = [];
  private maxNotifications: number = 50;

  // Configuration
  private readonly MAX_DAILY_LOSS_PERCENT = 2;
  private readonly MAX_WEEKLY_LOSS_PERCENT = 5;
  private readonly MIN_CONFIDENCE_THRESHOLD = 65;
  private readonly HIGH_CONFIDENCE_THRESHOLD = 80;
  private readonly MAX_POSITIONS = 3;

  // Start the AI
  async start(): Promise<void> {
    if (this.isRunning) {
      this.addNotification("WARNING", "AI Already Running", "The AI is already active");
      return;
    }

    this.isRunning = true;
    this.setState("SCANNING");
    this.addNotification("INFO", "AI Started", "SmartBlinks AI has been activated");

    // Initial analysis
    await this.analyzeAndDecide();

    // Set up continuous analysis
    this.analysisInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.analyzeAndDecide();
      }
    }, 60000); // Analyze every minute
  }

  // Stop the AI
  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    this.setState("STOPPED");
    this.addNotification("INFO", "AI Stopped", "SmartBlinks AI has been stopped");
  }

  // Pause the AI
  pause(): void {
    this.isRunning = false;
    this.setState("IDLE");
    this.addNotification("INFO", "AI Paused", "SmartBlinks AI has been paused");
  }

  // Resume the AI
  async resume(): Promise<void> {
    this.isRunning = true;
    this.addNotification("INFO", "AI Resumed", "SmartBlinks AI has been resumed");
    await this.analyzeAndDecide();
  }

  // Emergency stop
  emergencyStop(): void {
    this.stop();
    this.setState("CRITICAL_RISK");
    this.addNotification("ERROR", "EMERGENCY STOP", "Emergency stop activated - all trading halted");
  }

  // Analyze and make decision
  private async analyzeAndDecide(): Promise<void> {
    try {
      this.setState("ANALYZING");
      
      // Get market data
      const marketData = await marketService.analyzeMarket();
      
      // Get account/risk data
      const riskData = await this.evaluateRisk();
      
      // Check for critical conditions
      if (this.checkCriticalConditions(riskData)) {
        this.setState("CRITICAL_RISK");
        await this.handleCriticalRisk(riskData);
        return;
      }

      // Check for high volatility
      if (this.checkVolatilityWarning(marketData)) {
        this.setState("VOLATILITY_WARNING");
        this.addNotification("WARNING", "High Volatility Detected", 
          `Volatility is at ${marketData.volatility.toFixed(2)}%`);
      }

      // Analyze and decide
      const decision = await this.makeDecision(marketData, riskData);
      
      // Update commentary
      this.updateCommentary(decision);
      
      // Execute if needed
      if (decision.action === "TRADE" && decision.signal) {
        this.setState("HIGH_CONFIDENCE");
        await this.prepareTrade(decision.signal, marketData, riskData);
      } else if (decision.action === "WAIT") {
        this.setState("SCANNING");
      } else {
        this.setState("DEFENSIVE");
      }

    } catch (error) {
      console.error("Analysis error:", error);
      this.setState("IDLE");
      this.addNotification("ERROR", "Analysis Error", "Failed to complete market analysis");
    }
  }

  // Evaluate risk
  private async evaluateRisk(): Promise<RiskData> {
    const account = await cTraderService.getAccountInfo();
    const positions = await cTraderService.getPositions();

    const balance = account.balance;
    const equity = account.equity;
    const drawdown = balance > 0 ? ((balance - equity) / balance) * 100 : 0;
    const dailyLoss = this.calculateDailyLoss();
    const weeklyLoss = this.calculateWeeklyLoss();

    // Determine account health
    let health: AccountHealth = "PERFECT";
    if (drawdown > 15 || dailyLoss > 3) health = "CRITICAL";
    else if (drawdown > 10 || dailyLoss > 2) health = "DANGER";
    else if (drawdown > 5 || dailyLoss > 1) health = "CAUTION";
    else if (drawdown > 2) health = "SAFE";
    else if (drawdown > 0) health = "STRONG";
    else health = "PERFECT";

    // Determine risk level
    let risk: RiskLevel = "LOW";
    if (health === "CRITICAL" || health === "DANGER") risk = "EXTREME";
    else if (health === "CAUTION") risk = "HIGH";
    else if (positions.length >= 2) risk = "MEDIUM";

    return {
      health,
      drawdown,
      maxDrawdown: drawdown,
      riskPerTrade: this.calculateRiskPerTrade(account),
      dailyLoss,
      weeklyLoss,
      monthlyLoss: weeklyLoss * 4,
      exposure: positions.length / this.MAX_POSITIONS,
      leverage: account.leverage,
      marginLevel: account.marginLevel,
    };
  }

  // Calculate risk per trade
  private calculateRiskPerTrade(account: { balance: number }): number {
    const maxRiskPercent = 1; // 1% of account per trade
    return (account.balance * maxRiskPercent) / 100;
  }

  // Calculate daily loss
  private calculateDailyLoss(): number {
    // In production, this would track actual daily P&L
    return 0;
  }

  // Calculate weekly loss
  private calculateWeeklyLoss(): number {
    // In production, this would track actual weekly P&L
    return 0;
  }

  // Check critical conditions
  private checkCriticalConditions(riskData: RiskData): boolean {
    return (
      riskData.health === "CRITICAL" ||
      riskData.drawdown > 15 ||
      riskData.dailyLoss > this.MAX_DAILY_LOSS_PERCENT
    );
  }

  // Check volatility warning
  private checkVolatilityWarning(marketData: MarketData): boolean {
    return marketData.volatility > 1.5;
  }

  // Handle critical risk
  private async handleCriticalRisk(riskData: RiskData): Promise<void> {
    this.addNotification("ERROR", "CRITICAL RISK MODE", 
      `Drawdown: ${riskData.drawdown.toFixed(2)}%, Daily Loss: ${riskData.dailyLoss.toFixed(2)}%`);
    
    // In production, this would close positions and disable new entries
  }

  // Make trading decision
  private async makeDecision(marketData: MarketData, riskData: RiskData): Promise<AIDecision> {
    // Don't trade in high risk situations
    if (riskData.health === "CRITICAL" || riskData.health === "DANGER") {
      return {
        action: "REFUSE",
        reason: `Account health is ${riskData.health} - trading disabled`,
        confidence: 0,
      };
    }

    // Don't trade if max positions reached
    const positions = await cTraderService.getPositions();
    if (positions.length >= this.MAX_POSITIONS) {
      return {
        action: "WAIT",
        reason: "Maximum positions reached",
        confidence: 50,
      };
    }

    // Analyze for signals
    const signal = await this.generateSignal(marketData);
    
    if (!signal) {
      return {
        action: "REFUSE",
        reason: "No valid trading signals detected",
        confidence: 0,
      };
    }

    // Check confidence threshold
    if (signal.confidence < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        action: "REFUSE",
        reason: `Signal confidence ${signal.confidence}% below threshold`,
        confidence: signal.confidence,
      };
    }

    return {
      action: signal.confidence >= this.HIGH_CONFIDENCE_THRESHOLD ? "TRADE" : "WAIT",
      signal,
      reason: signal.reasoning,
      confidence: signal.confidence,
    };
  }

  // Generate trading signal
  private async generateSignal(marketData: MarketData): Promise<TradingSignal | null> {
    const analysis = marketService.getCurrentAnalysis();
    if (!analysis) return null;

    const mtAnalysis = await marketService.getMultiTimeframeAnalysis();
    
    // Check for HTF alignment
    const htfAligned = this.checkHTFAlignment(mtAnalysis);
    if (!htfAligned) {
      return null;
    }

    // Determine strategy
    const strategy = this.selectStrategy(marketData, analysis);
    this.currentStrategy = strategy.name;

    // Generate entry
    const ticker = await cTraderService.getTicker(marketService.SYMBOL);
    if (!ticker) return null;

    const entryPrice = ticker.bid;
    const { stopLoss, takeProfit } = this.calculateDynamicSLTP(
      entryPrice,
      marketData,
      strategy.type
    );

    // Determine direction
    const type = analysis.trend === "BULLISH" ? "BUY" : "BUY"; // Default to BUY in bullish
    const actualType = analysis.trend === "BEARISH" ? "SELL" : type;

    // Calculate risk-reward
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit[0] - entryPrice);
    const riskReward = reward / risk;

    return {
      symbol: marketService.SYMBOL,
      type: actualType,
      entry: entryPrice,
      stopLoss,
      takeProfits: takeProfit,
      confidence: this.calculateSignalConfidence(marketData, mtAnalysis),
      strategy: strategy.name,
      reasoning: strategy.reason,
      timestamp: Date.now(),
      riskReward,
    };
  }

  // Check HTF alignment
  private checkHTFAlignment(mtAnalysis: { timeframe: string; trend: string }[]): boolean {
    const htfTrends = mtAnalysis
      .filter((a) => ["1 Day", "4 Hours", "1 Hour"].includes(a.timeframe))
      .map((a) => a.trend);

    if (htfTrends.length < 2) return false;

    const bullishCount = htfTrends.filter((t) => t === "BULLISH").length;
    const bearishCount = htfTrends.filter((t) => t === "BEARISH").length;

    return bullishCount >= 2 || bearishCount >= 2;
  }

  // Select strategy based on market conditions
  private selectStrategy(marketData: MarketData, analysis: { strength: number; momentum: number }): StrategySignal {
    const volatility = marketData.volatility;
    const strength = analysis.strength;
    const momentum = analysis.momentum;

    // Sniper mode - high confidence, strong trend
    if (strength > 70 && Math.abs(momentum) > 1) {
      return {
        name: "Sniper Entry",
        type: "SNIPER",
        confidence: 90,
        reason: "Strong trend with high momentum - Sniper entry opportunity",
        entryPrice: null,
        stopLoss: null,
        takeProfits: [],
        riskReward: null,
      };
    }

    // Trend continuation
    if (strength > 50 && marketData.structure === "BULLISH_TREND") {
      return {
        name: "Trend Continuation",
        type: "CONTINUATION",
        confidence: 75,
        reason: "Confirmed trend continuation setup",
        entryPrice: null,
        stopLoss: null,
        takeProfits: [],
        riskReward: null,
      };
    }

    // Scalp mode - high volatility, quick moves
    if (volatility > 1.5) {
      return {
        name: "Scalp",
        type: "SCALP",
        confidence: 60,
        reason: "High volatility environment - Scalp opportunities",
        entryPrice: null,
        stopLoss: null,
        takeProfits: [],
        riskReward: null,
      };
    }

    // Defensive mode - uncertain conditions
    if (strength < 30 || marketData.personality === "CHOPPY") {
      return {
        name: "Defensive",
        type: "DEFENSIVE",
        confidence: 50,
        reason: "Uncertain market - Defensive positioning recommended",
        entryPrice: null,
        stopLoss: null,
        takeProfits: [],
        riskReward: null,
      };
    }

    // Observation mode
    return {
      name: "Observation",
      type: "OBSERVATION",
      confidence: 30,
      reason: "Market conditions not favorable - Observing",
      entryPrice: null,
      stopLoss: null,
      takeProfits: [],
      riskReward: null,
    };
  }

  // Calculate dynamic SL/TP
  private calculateDynamicSLTP(
    entryPrice: number,
    marketData: MarketData,
    mode: ExecutionMode
  ): DynamicSLTP {
    // Use ATR-based stops
    const atrMultiplier = mode === "SNIPER" ? 1.5 : mode === "SCALP" ? 1 : 2;
    const atr = (marketData.volatility / 100) * entryPrice;
    
    const stopLoss = marketData.trend === "BULLISH" 
      ? entryPrice - (atr * atrMultiplier)
      : entryPrice + (atr * atrMultiplier);

    // Multiple take profit levels
    const tp1Distance = atr * 2;
    const tp2Distance = atr * 3;
    const tp3Distance = atr * 5;

    return {
      stopLoss,
      takeProfit: [
        entryPrice + tp1Distance,
        entryPrice + tp2Distance,
        entryPrice + tp3Distance,
      ],
      trailingStart: entryPrice + (atr * 1),
      trailingDistance: atr * 0.75,
    };
  }

  // Calculate signal confidence
  private calculateSignalConfidence(
    marketData: MarketData,
    mtAnalysis: { timeframe: string; trend: string; strength: number }[]
  ): number {
    let confidence = 50; // Base confidence

    // Factor in market confidence
    confidence += marketData.confidence * 20;

    // Factor in HTF alignment
    const alignedCount = mtAnalysis.filter((a) => 
      ["1 Day", "4 Hours", "1 Hour"].includes(a.timeframe) && 
      a.trend === marketData.trend
    ).length;
    confidence += alignedCount * 10;

    // Factor in momentum
    if (Math.abs(marketData.momentum) > 1) confidence += 10;
    else if (Math.abs(marketData.momentum) > 0.5) confidence += 5;

    // Cap at 95%
    return Math.min(confidence, 95);
  }

  // Prepare trade execution
  private async prepareTrade(
    signal: TradingSignal,
    marketData: MarketData,
    riskData: RiskData
  ): Promise<void> {
    this.setState("EXECUTING");
    this.addNotification(
      "TRADE",
      `${signal.type} Signal Generated`,
      `${signal.strategy} on ${signal.symbol} @ ${signal.entry.toFixed(2)} | SL: ${signal.stopLoss.toFixed(2)} | TP: ${signal.takeProfits[0].toFixed(2)} | Confidence: ${signal.confidence}%`
    );

    // In production, this would execute the trade via cTrader API
    // await cTraderService.openPosition(signal);
  }

  // Update commentary
  private updateCommentary(decision: AIDecision): void {
    let commentary = "";

    switch (decision.action) {
      case "TRADE":
        commentary = `High confidence ${decision.signal?.type} signal detected. ${decision.signal?.reasoning}`;
        break;
      case "WAIT":
        commentary = `Market conditions under evaluation. ${decision.reason}`;
        break;
      case "REFUSE":
        commentary = `Trading paused - ${decision.reason}`;
        break;
    }

    this.lastCommentary = commentary;
    this.commentaryHistory.push(commentary);
    if (this.commentaryHistory.length > 10) {
      this.commentaryHistory.shift();
    }
  }

  // Set AI state
  private setState(newState: AIState): void {
    this.state = newState;
    
    // Update confidence based on state
    switch (newState) {
      case "HIGH_CONFIDENCE":
        this.confidence = 80;
        break;
      case "EXECUTING":
        this.confidence = 90;
        break;
      case "SCANNING":
        this.confidence = 50;
        break;
      case "DEFENSIVE":
        this.confidence = 40;
        break;
      case "CRITICAL_RISK":
        this.confidence = 10;
        break;
      default:
        this.confidence = 30;
    }
  }

  // Add notification
  private addNotification(type: Notification["type"], title: string, message: string): void {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.unshift(notification);
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }
  }

  // Get AI status
  getStatus(): AIStatus {
    return {
      state: this.state,
      confidence: this.confidence,
      currentStrategy: this.currentStrategy,
      marketMode: this.marketMode,
      riskLevel: this.riskLevel,
      activeTrades: 0, // Would come from positions
      lastAnalysis: this.lastCommentary ? Date.now() : 0,
      commentary: this.lastCommentary,
    };
  }

  // Get notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Mark notification as read
  markNotificationRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  // Get commentary history
  getCommentaryHistory(): string[] {
    return this.commentaryHistory;
  }

  // Check if running
  isActive(): boolean {
    return this.isRunning;
  }

  // Get current state
  getState(): AIState {
    return this.state;
  }
}

export const aiEngine = new AIEngine();
export default AIEngine;