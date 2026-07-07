import axios, { AxiosInstance } from "axios";

// Get API URL from environment or use current origin
const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async getAuthUrl(): Promise<string> {
    const response = await this.client.get("/api/auth/auth-url");
    return response.data.data.url;
  }

  async getConnectionStatus(): Promise<{ isConnected: boolean; accountId: string | null; brokerName: string | null; accountType: string | null }> {
    const response = await this.client.get("/api/auth/status");
    return response.data.data;
  }

  async disconnect(): Promise<void> {
    await this.client.post("/api/auth/disconnect");
  }

  // Account endpoints
  async getAccountInfo(): Promise<unknown> {
    const response = await this.client.get("/api/account/info");
    return response.data.data;
  }

  async getPositions(): Promise<unknown[]> {
    const response = await this.client.get("/api/account/positions");
    return response.data.data;
  }

  async getOrders(): Promise<unknown[]> {
    const response = await this.client.get("/api/account/orders");
    return response.data.data;
  }

  async getAccountSummary(): Promise<unknown> {
    const response = await this.client.get("/api/account/summary");
    return response.data.data;
  }

  // Market endpoints
  async getMarketAnalysis(): Promise<unknown> {
    const response = await this.client.get("/api/market/analysis");
    return response.data.data;
  }

  async getTimeframeAnalysis(): Promise<unknown[]> {
    const response = await this.client.get("/api/market/timeframes");
    return response.data.data;
  }

  async getTicker(): Promise<unknown> {
    const response = await this.client.get("/api/market/ticker");
    return response.data.data;
  }

  async getCandles(timeframe: string, count?: number): Promise<unknown[]> {
    const response = await this.client.get(`/api/market/candles/${timeframe}`, {
      params: { count: count || 500 },
    });
    return response.data.data;
  }

  async getSession(): Promise<unknown> {
    const response = await this.client.get("/api/market/session");
    return response.data.data;
  }

  // Trading endpoints
  async openPosition(signal: unknown): Promise<unknown> {
    const response = await this.client.post("/api/trading/open", signal);
    return response.data;
  }

  async closePosition(positionId: string): Promise<unknown> {
    const response = await this.client.post(`/api/trading/close/${positionId}`);
    return response.data;
  }

  async modifyPosition(positionId: string, stopLoss: number | null, takeProfit: number | null): Promise<unknown> {
    const response = await this.client.patch(`/api/trading/modify/${positionId}`, { stopLoss, takeProfit });
    return response.data;
  }

  async getTradingSummary(): Promise<unknown> {
    const response = await this.client.get("/api/trading/summary");
    return response.data.data;
  }

  async emergencyClose(): Promise<void> {
    await this.client.post("/api/trading/emergency-close");
  }

  // AI endpoints
  async getAIStatus(): Promise<unknown> {
    const response = await this.client.get("/api/ai/status");
    return response.data.data;
  }

  async startAI(): Promise<void> {
    await this.client.post("/api/ai/start");
  }

  async stopAI(): Promise<void> {
    await this.client.post("/api/ai/stop");
  }

  async pauseAI(): Promise<void> {
    await this.client.post("/api/ai/pause");
  }

  async resumeAI(): Promise<void> {
    await this.client.post("/api/ai/resume");
  }

  async emergencyStopAI(): Promise<void> {
    await this.client.post("/api/ai/emergency-stop");
  }

  async getCommentary(): Promise<string[]> {
    const response = await this.client.get("/api/ai/commentary");
    return response.data.data;
  }

  // News endpoints
  async getUpcomingNews(): Promise<unknown[]> {
    const response = await this.client.get("/api/ai/news/upcoming");
    return response.data.data;
  }

  async getNextMajorNews(): Promise<unknown> {
    const response = await this.client.get("/api/ai/news/next-major");
    return response.data.data;
  }

  async getNewsImpact(): Promise<unknown> {
    const response = await this.client.get("/api/ai/news/impact");
    return response.data.data;
  }

  // Notification endpoints
  async getNotifications(): Promise<unknown[]> {
    const response = await this.client.get("/api/notifications");
    return response.data.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.client.patch(`/api/notifications/${id}/read`);
  }
}

export const api = new ApiService();
export default api;