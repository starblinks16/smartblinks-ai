import { create } from "zustand";
import type { 
  Account, Position, Order, MarketData, AIStatus, Notification, 
  AIState, MarketMode, RiskLevel, AccountHealth, Candle, Ticker 
} from "../types";

// Account Store
interface AccountState {
  account: Account | null;
  positions: Position[];
  orders: Order[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  setOrders: (orders: Order[]) => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  positions: [],
  orders: [],
  isConnected: false,
  isLoading: false,
  error: null,
  setAccount: (account) => set({ account }),
  setPositions: (positions) => set({ positions }),
  setOrders: (orders) => set({ orders }),
  setConnectionStatus: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ account: null, positions: [], orders: [], isConnected: false, error: null }),
}));

// AI Store
interface AIStateType {
  status: AIStatus | null;
  isActive: boolean;
  commentary: string[];
  setStatus: (status: AIStatus) => void;
  setActive: (isActive: boolean) => void;
  addCommentary: (comment: string) => void;
  reset: () => void;
}

export const useAIStore = create<AIStateType>((set) => ({
  status: null,
  isActive: false,
  commentary: [],
  setStatus: (status) => set({ status }),
  setActive: (isActive) => set({ isActive }),
  addCommentary: (comment) => set((state) => ({
    commentary: [comment, ...state.commentary].slice(0, 20),
  })),
  reset: () => set({ status: null, isActive: false, commentary: [] }),
}));

// Market Store
interface MarketState {
  marketData: MarketData | null;
  ticker: Ticker | null;
  candles: Record<string, Candle[]>;
  session: { name: string; status: string; timeRemaining: number };
  timeframeAnalysis: { timeframe: string; trend: string; strength: number; keyLevel: number; momentum: number }[];
  setMarketData: (data: MarketData) => void;
  setTicker: (ticker: Ticker) => void;
  setCandles: (timeframe: string, candles: Candle[]) => void;
  addCandle: (timeframe: string, candle: Candle) => void;
  setSession: (session: { name: string; status: string; timeRemaining: number }) => void;
  setTimeframeAnalysis: (analysis: { timeframe: string; trend: string; strength: number; keyLevel: number; momentum: number }[]) => void;
  reset: () => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  marketData: null,
  ticker: null,
  candles: {},
  session: { name: "UNKNOWN", status: "CLOSED", timeRemaining: 0 },
  timeframeAnalysis: [],
  setMarketData: (marketData) => set({ marketData }),
  setTicker: (ticker) => set({ ticker }),
  setCandles: (timeframe, candles) => set((state) => ({
    candles: { ...state.candles, [timeframe]: candles },
  })),
  addCandle: (timeframe, candle) => set((state) => {
    const current = state.candles[timeframe] || [];
    const updated = [...current, candle].slice(-500);
    return { candles: { ...state.candles, [timeframe]: updated } };
  }),
  setSession: (session) => set({ session }),
  setTimeframeAnalysis: (timeframeAnalysis) => set({ timeframeAnalysis }),
  reset: () => set({ marketData: null, ticker: null, candles: {}, session: { name: "UNKNOWN", status: "CLOSED", timeRemaining: 0 }, timeframeAnalysis: [] }),
}));

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications].slice(0, 100),
    unreadCount: state.unreadCount + 1,
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  theme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeTab: "dashboard",
  theme: "dark",
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setTheme: (theme) => set({ theme }),
}));