import { io, Socket } from "socket.io-client";

type EventCallback = (data: unknown) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  // Get WebSocket URL
  private getUrl(): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    // Connect to same origin, backend handles Socket.IO
    return `${protocol}//${host}`;
  }

  // Connect
  connect(): void {
    if (this.socket?.connected) return;

    const url = this.getUrl();
    console.log("Connecting to Socket.IO:", url);

    this.socket = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on("connect", () => {
      console.log("Socket.IO connected");
      this.reconnectAttempts = 0;
      this.emitToListeners("connected", null);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected:", reason);
      this.emitToListeners("disconnected", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      this.reconnectAttempts++;
      this.emitToListeners("error", error);
    });

    // Forward all events to listeners
    const events = [
      "ai-status",
      "connection-status",
      "account-update",
      "positions-update",
      "price-update",
      "position-update",
      "notification",
      "candle-update",
    ];

    events.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.emitToListeners(event, data);
      });
    });
  }

  // Emit to all registered listeners
  private emitToListeners(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Socket listener error for ${event}:`, error);
        }
      });
    }
  }

  // Subscribe to event
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  // Unsubscribe from event
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // Request update
  requestUpdate(type: string): void {
    this.socket?.emit("request-update", type);
  }

  // AI Control
  aiStart(): void {
    this.socket?.emit("ai-start");
  }

  aiStop(): void {
    this.socket?.emit("ai-stop");
  }

  aiPause(): void {
    this.socket?.emit("ai-pause");
  }

  aiResume(): void {
    this.socket?.emit("ai-resume");
  }

  aiEmergency(): void {
    this.socket?.emit("ai-emergency");
  }

  // Check connection
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export const socketService = new SocketService();
export default socketService;