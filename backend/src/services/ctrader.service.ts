import axios, { AxiosInstance } from "axios";
import { config } from "../config/env.js";
import type { TokenResponse, Account, Position, Order, Candle, Ticker, UserInfo } from "../types/index.js";

class CTraderService {
  private httpClient: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private isConnected: boolean = false;
  private accountId: string | null = null;
  private brokerName: string | null = null;
  private accountType: string | null = null;
  private websocketEndpoint: string | null = null;

  constructor() {
    this.httpClient = axios.create({
      baseURL: config.CTRADER_API_BASE,
      timeout: 30000,
    });
  }

  // OAuth Authorization URL
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.CTRADER_CLIENT_ID,
      redirect_uri: config.CTRADER_REDIRECT_URI,
      scope: "accounts candles deals orders positions profile trading",
    });
    return `${config.CTRADER_AUTH_URL}?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: config.CTRADER_REDIRECT_URI,
        client_id: config.CTRADER_CLIENT_ID,
        client_secret: config.CTRADER_CLIENT_SECRET,
      });

      const response = await axios.post(config.CTRADER_TOKEN_URL, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const tokenData: TokenResponse = response.data;
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
      this.isConnected = true;

      return tokenData;
    } catch (error) {
      console.error("Token exchange failed:", error);
      throw new Error("Failed to authenticate with cTrader");
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
        client_id: config.CTRADER_CLIENT_ID,
        client_secret: config.CTRADER_CLIENT_SECRET,
      });

      const response = await axios.post(config.CTRADER_TOKEN_URL, params.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const tokenData: TokenResponse = response.data;
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.isConnected = false;
      throw new Error("Failed to refresh token");
    }
  }

  // Get authorization header
  private getAuthHeader(): string {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }
    return `Bearer ${this.accessToken}`;
  }

  // Check if token needs refresh
  private needsTokenRefresh(): boolean {
    return Date.now() >= this.tokenExpiry - 60000; // Refresh 1 minute before expiry
  }

  // Ensure valid token
  private async ensureValidToken(): Promise<void> {
    if (this.needsTokenRefresh()) {
      await this.refreshAccessToken();
    }
  }

  // Get user profile
  async getUserProfile(): Promise<UserInfo> {
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get("/api/v1/profile", {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  // Discover and get account info (auto-discovery)
  async discoverAccount(): Promise<Account> {
    await this.ensureValidToken();
    
    try {
      // Get account list
      const accountsResponse = await this.httpClient.get("/api/v1/accounts", {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      
      const accounts = accountsResponse.data;
      if (!accounts || accounts.length === 0) {
        throw new Error("No trading accounts found");
      }

      // Use the first account (can be extended to support multiple)
      const primaryAccount = accounts[0];
      
      // Get extended account details
      const detailsResponse = await this.httpClient.get(`/api/v1/accounts/${primaryAccount.id}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      const accountDetails = detailsResponse.data;
      
      this.accountId = primaryAccount.id;
      this.brokerName = accountDetails.brokerName || "Unknown Broker";
      this.accountType = accountDetails.accountType || "Unknown Type";
      
      return {
        id: primaryAccount.id,
        balance: accountDetails.balance || 0,
        equity: accountDetails.equity || 0,
        margin: accountDetails.margin || 0,
        freeMargin: accountDetails.freeMargin || 0,
        marginLevel: accountDetails.marginLevel || 0,
        unrealizedPnL: accountDetails.unrealizedPnL || 0,
        currency: accountDetails.currency || "USD",
        brokerName: this.brokerName,
        accountType: this.accountType,
        leverage: accountDetails.leverage || 1,
      };
    } catch (error) {
      console.error("Failed to discover account:", error);
      throw new Error("Failed to discover trading account");
    }
  }

  // Get account info (using discovered account)
  async getAccountInfo(): Promise<Account> {
    if (!this.accountId) {
      return this.discoverAccount();
    }
    
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get(`/api/v1/accounts/${this.accountId}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      
      const data = response.data;
      
      return {
        id: this.accountId,
        balance: data.balance || 0,
        equity: data.equity || 0,
        margin: data.margin || 0,
        freeMargin: data.freeMargin || 0,
        marginLevel: data.marginLevel || 0,
        unrealizedPnL: data.unrealizedPnL || 0,
        currency: data.currency || "USD",
        brokerName: this.brokerName || data.brokerName || "Unknown",
        accountType: this.accountType || data.accountType || "Unknown",
        leverage: data.leverage || 1,
      };
    } catch (error) {
      console.error("Failed to get account info:", error);
      // Try to re-discover account
      return this.discoverAccount();
    }
  }

  // Get open positions
  async getPositions(): Promise<Position[]> {
    if (!this.accountId) {
      return [];
    }
    
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get(`/api/v1/accounts/${this.accountId}/positions`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      
      return (response.data || []).map((pos: Record<string, unknown>) => ({
        id: String(pos.id),
        symbol: String(pos.symbol),
        type: pos.type as "BUY" | "SELL",
        volume: Number(pos.volume),
        openPrice: Number(pos.openPrice),
        currentPrice: Number(pos.currentPrice),
        stopLoss: pos.stopLoss ? Number(pos.stopLoss) : null,
        takeProfit: pos.takeProfit ? Number(pos.takeProfit) : null,
        profit: Number(pos.profit),
        profitPercent: Number(pos.profitPercent || 0),
        swap: Number(pos.swap || 0),
        commission: Number(pos.commission || 0),
        openTime: Number(pos.openTime || 0),
      }));
    } catch (error) {
      console.error("Failed to get positions:", error);
      return [];
    }
  }

  // Get pending orders
  async getOrders(): Promise<Order[]> {
    if (!this.accountId) {
      return [];
    }
    
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get(`/api/v1/accounts/${this.accountId}/orders`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      
      return (response.data || []).map((order: Record<string, unknown>) => ({
        id: String(order.id),
        symbol: String(order.symbol),
        type: order.type as "BUY" | "SELL" | "BUY_STOP" | "SELL_STOP" | "BUY_LIMIT" | "SELL_LIMIT",
        volume: Number(order.volume),
        price: Number(order.price),
        stopLoss: order.stopLoss ? Number(order.stopLoss) : null,
        takeProfit: order.takeProfit ? Number(order.takeProfit) : null,
        status: order.status as "PENDING" | "FILLED" | "CANCELLED" | "REJECTED",
        createdTime: Number(order.createdTime || 0),
      }));
    } catch (error) {
      console.error("Failed to get orders:", error);
      return [];
    }
  }

  // Get historical candles
  async getCandles(symbol: string, timeframe: string, count: number = 500): Promise<Candle[]> {
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get(`/api/v1/candles/${symbol}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
        params: {
          timeframe: timeframe,
          count: count,
        },
      });
      
      return (response.data || []).map((candle: Record<string, unknown>) => ({
        time: Number(candle.time),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume || 0),
      }));
    } catch (error) {
      console.error("Failed to get candles:", error);
      return [];
    }
  }

  // Get current ticker/price
  async getTicker(symbol: string): Promise<Ticker | null> {
    await this.ensureValidToken();
    
    try {
      const response = await this.httpClient.get(`/api/v1/ticker/${symbol}`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });
      
      const data = response.data;
      return {
        symbol: data.symbol || symbol,
        bid: Number(data.bid),
        ask: Number(data.ask),
        spread: Number(data.spread || (data.ask - data.bid)),
        change: Number(data.change || 0),
        changePercent: Number(data.changePercent || 0),
      };
    } catch (error) {
      console.error("Failed to get ticker:", error);
      return null;
    }
  }

  // Set WebSocket endpoint (discovered dynamically)
  setWebSocketEndpoint(endpoint: string): void {
    this.websocketEndpoint = endpoint;
  }

  getWebSocketEndpoint(): string | null {
    return this.websocketEndpoint;
  }

  // Connection status
  getConnectionStatus(): { isConnected: boolean; accountId: string | null; brokerName: string | null; accountType: string | null } {
    return {
      isConnected: this.isConnected,
      accountId: this.accountId,
      brokerName: this.brokerName,
      accountType: this.accountType,
    };
  }

  // Disconnect
  disconnect(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    this.isConnected = false;
    this.accountId = null;
    this.brokerName = null;
    this.accountType = null;
    this.websocketEndpoint = null;
  }
}

export const cTraderService = new CTraderService();
export default CTraderService;