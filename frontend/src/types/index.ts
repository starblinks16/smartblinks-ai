// Account Types
export interface Account {
  id: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  unrealizedPnL: number;
  currency: string;
  brokerName: string;
  accountType: string;
  leverage: number;
}

export interface Position {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  profit: number;
  profitPercent: number;
  swap: number;
  commission: number;
  openTime: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: "BUY" | "SELL" | "BUY_STOP" | "SELL_STOP" | "BUY_LIMIT" | "SELL_LIMIT";
  volume: number;
  price: number;
  stopLoss: number | null;
  takeProfit: number | null;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  createdTime: number;
}

// Market Types
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
}

export interface KeyLevel {
  type: "SUPPORT" | "RESISTANCE" | "LIQUIDITY" | "BREAK";
  price: number;
  strength: number;
  distance: number;
}

export interface MarketData {
  symbol: string;
  mood: string;
  personality: MarketMode;
  volatility: number;
  session: string;
  confidence: number;
  liquidityState: string;
  structure: string;
  momentum: number;
  trend: string;
  keyLevels: KeyLevel[];
}

export type MarketMode = "TRENDING" | "RANGING" | "MANIPULATIVE" | "VOLATILE" | "AGGRESSIVE" | "SLOW" | "EXHAUSTED" | "CHOPPY";

// AI Types
export type AIState = "IDLE" | "SCANNING" | "ANALYZING" | "HIGH_CONFIDENCE" | "EXECUTING" | "DEFENSIVE" | "PROTECTING" | "VOLATILITY_WARNING" | "CRITICAL_RISK" | "STOPPED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export type ExecutionMode = "SCALP" | "CONTINUATION" | "DEFENSIVE" | "SNIPER" | "OBSERVATION";

export interface AIStatus {
  state: AIState;
  confidence: number;
  currentStrategy: string;
  marketMode: MarketMode;
  riskLevel: RiskLevel;
  activeTrades: number;
  lastAnalysis: number;
  commentary: string;
}

export type AccountHealth = "PERFECT" | "STRONG" | "SAFE" | "CAUTION" | "DANGER" | "CRITICAL";

export interface RiskData {
  health: AccountHealth;
  drawdown: number;
  maxDrawdown: number;
  riskPerTrade: number;
  dailyLoss: number;
  weeklyLoss: number;
  exposure: number;
  leverage: number;
  marginLevel: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "TRADE";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// News Types
export interface NewsEvent {
  name: string;
  currency: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  time: number;
  previous: number;
  forecast: number;
  actual: number | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
}

// Trading Signal
export interface TradingSignal {
  symbol: string;
  type: "BUY" | "SELL";
  entry: number;
  stopLoss: number;
  takeProfits: number[];
  confidence: number;
  strategy: string;
  reasoning: string;
  timestamp: number;
  riskReward: number;
}

// Timeframe Analysis
export interface TimeframeAnalysis {
  timeframe: string;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  strength: number;
  keyLevel: number;
  momentum: number;
}

// Session
export interface Session {
  name: string;
  status: "OPEN" | "CLOSED";
  timeRemaining: number;
  nextSession: string;
}