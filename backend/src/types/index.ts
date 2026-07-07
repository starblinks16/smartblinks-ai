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

// Market Data Types
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

// Trade Types
export interface Trade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  price: number;
  currentPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  profit: number;
  timestamp: number;
  comment: string;
}

// Position Types
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

// Order Types
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

// AI State Types
export type AIState = 
  | "IDLE"
  | "SCANNING"
  | "ANALYZING"
  | "HIGH_CONFIDENCE"
  | "EXECUTING"
  | "DEFENSIVE"
  | "PROTECTING"
  | "VOLATILITY_WARNING"
  | "CRITICAL_RISK"
  | "STOPPED";

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

// Market Types
export type MarketMode = 
  | "TRENDING"
  | "RANGING"
  | "MANIPULATIVE"
  | "VOLATILE"
  | "AGGRESSIVE"
  | "SLOW"
  | "EXHAUSTED"
  | "CHOPPY";

export type ExecutionMode =
  | "SCALP"
  | "CONTINUATION"
  | "DEFENSIVE"
  | "SNIPER"
  | "OBSERVATION";

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

export interface KeyLevel {
  type: "SUPPORT" | "RESISTANCE" | "LIQUIDITY" | "BREAK";
  price: number;
  strength: number;
  distance: number;
}

// Risk Types
export type AccountHealth = 
  | "PERFECT"
  | "STRONG"
  | "SAFE"
  | "CAUTION"
  | "DANGER"
  | "CRITICAL";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export interface RiskData {
  health: AccountHealth;
  drawdown: number;
  maxDrawdown: number;
  riskPerTrade: number;
  dailyLoss: number;
  weeklyLoss: number;
  monthlyLoss: number;
  exposure: number;
  leverage: number;
  marginLevel: number;
}

// News Event Types
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

// cTrader OAuth Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: string;
  payload: unknown;
  timestamp: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Session Types
export interface TradingSession {
  name: string;
  status: "OPEN" | "CLOSED";
  timeRemaining: number;
}

// Multi-timeframe Analysis
export interface TimeframeAnalysis {
  timeframe: string;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  strength: number;
  keyLevel: number;
  momentum: number;
}

// Strategy Types
export interface StrategySignal {
  name: string;
  type: ExecutionMode;
  confidence: number;
  reason: string;
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number[];
  riskReward: number | null;
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

// Notification Types
export interface Notification {
  id: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "TRADE";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// cTrader protobuf message types
export interface ProtoMessage {
  type: number;
  payload: Uint8Array;
}