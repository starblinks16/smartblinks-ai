import WebSocket from "ws";
import { config } from "../config/env.js";
import { cTraderService } from "./ctrader.service.js";
import type { Candle, Ticker, Position, Account } from "../types/index.js";

type WSEventCallback = (data: unknown) => void;

interface Subscription {
  symbol: string;
  callbacks: Map<string, WSEventCallback>;
}

class CTraderWebSocketService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 5000;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private eventHandlers: Map<string, Set<WSEventCallback>> = new Map();

  // Connect to cTrader WebSocket
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log("WebSocket already connected or connecting");
      return;
    }

    this.isConnecting = true;

    // Use the live or demo endpoint based on configuration
    const wsEndpoint = config.CTRADER_LIVE_WSS;

    console.log(`Connecting to cTrader WebSocket: ${wsEndpoint}`);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsEndpoint);

        this.ws.on("open", () => {
          console.log("cTrader WebSocket connected");
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startPingInterval();
          this.authenticate();
          resolve();
        });

        this.ws.on("message", (data: WebSocket.Data) => {
          this.handleMessage(data);
        });

        this.ws.on("error", (error) => {
          console.error("WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        });

        this.ws.on("close", () => {
          console.log("WebSocket disconnected");
          this.isConnecting = false;
          this.stopPingInterval();
          this.scheduleReconnect();
        });
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Authenticate on WebSocket
  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const { isConnected, accountId } = cTraderService.getConnectionStatus();
    if (!isConnected) {
      console.log("Not authenticated, cannot authenticate WebSocket");
      return;
    }

    // Send authentication message
    const authMessage = {
      type: 1, // Auth type
      payload: {
        token: this.getAccessTokenFromEnv(),
        // Include account ID for multi-account scenarios
        accountId: accountId,
      },
    };

    this.send(authMessage);
  }

  // Get access token for WebSocket auth
  private getAccessTokenFromEnv(): string {
    // For WebSocket, we need to use the access token
    // The cTrader Open API uses different auth for WebSocket
    // This should be stored during OAuth flow
    return process.env.CTRADER_ACCESS_TOKEN || "";
  }

  // Send message
  private send(message: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, cannot send message");
      return;
    }

    try {
      const data = JSON.stringify(message);
      this.ws.send(data);
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }
  }

  // Handle incoming messages
  private handleMessage(data: WebSocket.Data): void {
    try {
      let message: Record<string, unknown>;
      
      if (data instanceof Buffer) {
        // Handle protobuf or binary data
        message = this.parseBinaryMessage(data);
      } else {
        message = JSON.parse(data.toString());
      }

      const type = message.type as string;
      const payload = message.payload;

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(type);
      if (handlers) {
        handlers.forEach((handler) => handler(payload));
      }

      // Emit to all handlers
      const allHandlers = this.eventHandlers.get("*");
      if (allHandlers) {
        allHandlers.forEach((handler) => handler(message));
      }

      // Handle specific message types
      this.handleSpecificMessage(type, payload);
    } catch (error) {
      console.error("Failed to handle message:", error);
    }
  }

  // Parse binary/protobuf messages
  private parseBinaryMessage(data: Buffer): Record<string, unknown> {
    // cTrader uses Protobuf for some messages
    // Basic parsing - in production, use protobufjs
    try {
      // Simplified binary parsing
      const view = new DataView(data.buffer);
      const type = view.getUint16(0, true);
      return {
        type: type,
        raw: data.toString("base64"),
      };
    } catch {
      return {
        type: "unknown",
        raw: data.toString("base64"),
      };
    }
  }

  // Handle specific message types
  private handleSpecificMessage(type: string, payload: unknown): void {
    switch (type) {
      case "PRICE":
        this.emit("priceUpdate", payload as Ticker);
        break;
      case "CANDLE":
        this.emit("candleUpdate", payload as Candle);
        break;
      case "POSITION":
        this.emit("positionUpdate", payload as Position);
        break;
      case "ORDER":
        this.emit("orderUpdate", payload);
        break;
      case "ACCOUNT":
        this.emit("accountUpdate", payload as Account);
        break;
      case "AUTH_SUCCESS":
        console.log("WebSocket authentication successful");
        this.resubscribeAll();
        break;
      case "AUTH_FAILED":
        console.error("WebSocket authentication failed");
        break;
      case "ERROR":
        console.error("WebSocket error:", payload);
        break;
    }
  }

  // Subscribe to price updates
  subscribeToPrice(symbol: string, callback: (ticker: Ticker) => void): void {
    const subscription = this.subscriptions.get(symbol) || { symbol, callbacks: new Map() };
    
    const callbackId = `price_${Date.now()}`;
    subscription.callbacks.set(callbackId, callback as WSEventCallback);
    this.subscriptions.set(symbol, subscription);

    // Send subscription request
    this.send({
      type: 3, // Subscribe type
      payload: {
        symbol: symbol,
        type: "PRICE",
      },
    });
  }

  // Subscribe to candles
  subscribeToCandles(symbol: string, timeframe: string, callback: (candle: Candle) => void): void {
    const key = `${symbol}_${timeframe}`;
    const subscription = this.subscriptions.get(key) || { symbol: key, callbacks: new Map() };
    
    const callbackId = `candle_${Date.now()}`;
    subscription.callbacks.set(callbackId, callback as WSEventCallback);
    this.subscriptions.set(key, subscription);

    // Send subscription request
    this.send({
      type: 3, // Subscribe type
      payload: {
        symbol: symbol,
        timeframe: timeframe,
        type: "CANDLE",
      },
    });
  }

  // Resubscribe all (after reconnect)
  private resubscribeAll(): void {
    this.subscriptions.forEach((subscription, key) => {
      const [symbol, timeframe] = key.split("_");
      
      if (timeframe) {
        this.send({
          type: 3,
          payload: { symbol, timeframe, type: "CANDLE" },
        });
      } else {
        this.send({
          type: 3,
          payload: { symbol, type: "PRICE" },
        });
      }
    });
  }

  // Unsubscribe
  unsubscribe(symbol: string, timeframe?: string): void {
    const key = timeframe ? `${symbol}_${timeframe}` : symbol;
    this.subscriptions.delete(key);

    this.send({
      type: 4, // Unsubscribe type
      payload: {
        symbol: symbol,
        timeframe: timeframe,
      },
    });
  }

  // Event handling
  on(event: string, callback: WSEventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  off(event: string, callback: WSEventCallback): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Ping interval
  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 0 }); // Ping
      }
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Reconnection logic
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  // Disconnect
  disconnect(): void {
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.eventHandlers.clear();
    this.reconnectAttempts = 0;
  }

  // Check connection status
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getState(): string {
    if (!this.ws) return "DISCONNECTED";
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "CONNECTED";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }
}

export const cTraderWSService = new CTraderWebSocketService();
export default CTraderWebSocketService;