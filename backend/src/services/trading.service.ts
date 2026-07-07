import { cTraderService } from "./ctrader.service.js";
import type { Position, Order, Trade, TradingSignal } from "../types/index.js";

interface TradeExecution {
  success: boolean;
  position?: Position;
  error?: string;
}

interface DynamicProtection {
  stopLoss: number | null;
  takeProfit: number | null;
  trailingStop: number | null;
  breakevenLevel: number | null;
}

class TradingService {
  private activePositions: Map<string, Position> = new Map();
  private pendingOrders: Map<string, Order> = new Map();
  private tradeHistory: Trade[] = [];
  private maxPositions: number = 3;

  readonly SYMBOL = "XAUUSD";

  // Open a new position
  async openPosition(signal: TradingSignal): Promise<TradeExecution> {
    try {
      const account = await cTraderService.getAccountInfo();
      
      // Check if we can open more positions
      if (this.activePositions.size >= this.maxPositions) {
        return {
          success: false,
          error: "Maximum positions reached",
        };
      }

      // Calculate position size based on risk
      const stopLossDistance = Math.abs(signal.entry - signal.stopLoss);
      const riskAmount = account.balance * 0.01; // 1% risk
      const volume = this.calculatePositionSize(stopLossDistance, riskAmount);

      // In production, this would call cTrader API to open position
      // For now, create local tracking
      const position: Position = {
        id: `pos_${Date.now()}`,
        symbol: signal.symbol,
        type: signal.type,
        volume,
        openPrice: signal.entry,
        currentPrice: signal.entry,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfits[0],
        profit: 0,
        profitPercent: 0,
        swap: 0,
        commission: 0,
        openTime: Date.now(),
      };

      this.activePositions.set(position.id, position);

      return {
        success: true,
        position,
      };
    } catch (error) {
      console.error("Failed to open position:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Calculate position size
  private calculatePositionSize(stopLossDistance: number, riskAmount: number): number {
    // XAUUSD typically trades in lots where 1 lot = 100 oz
    // Each pip movement = $10 for 1 lot
    const pipsRisk = stopLossDistance * 100; // Convert to pips (price * 100)
    const lotSize = riskAmount / (pipsRisk * 10); // $10 per pip per lot
    
    // Minimum lot size is 0.01
    return Math.max(0.01, Math.round(lotSize * 100) / 100);
  }

  // Close a position
  async closePosition(positionId: string): Promise<TradeExecution> {
    const position = this.activePositions.get(positionId);
    
    if (!position) {
      return {
        success: false,
        error: "Position not found",
      };
    }

    try {
      // In production, this would call cTrader API to close position
      const closedPosition = { ...position };
      
      this.activePositions.delete(positionId);
      this.tradeHistory.push({
        ...closedPosition,
        id: `closed_${positionId}`,
        currentPrice: closedPosition.currentPrice,
        timestamp: Date.now(),
        comment: "Manual close",
      });

      return {
        success: true,
        position: closedPosition,
      };
    } catch (error) {
      console.error("Failed to close position:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Modify position (update SL/TP)
  async modifyPosition(positionId: string, stopLoss: number | null, takeProfit: number | null): Promise<TradeExecution> {
    const position = this.activePositions.get(positionId);
    
    if (!position) {
      return {
        success: false,
        error: "Position not found",
      };
    }

    try {
      // In production, this would call cTrader API to modify position
      position.stopLoss = stopLoss;
      position.takeProfit = takeProfit;
      
      return {
        success: true,
        position,
      };
    } catch (error) {
      console.error("Failed to modify position:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Dynamic stop loss management (Stage 1-4 protection)
  async managePositionProtection(positionId: string): Promise<DynamicProtection> {
    const position = this.activePositions.get(positionId);
    
    if (!position) {
      return { stopLoss: null, takeProfit: null, trailingStop: null, breakevenLevel: null };
    }

    const profit = position.profit;
    const profitPercent = position.profitPercent;
    const entryPrice = position.openPrice;

    // Stage 1: Move SL toward breakeven when profit > 1%
    let newStopLoss = position.stopLoss;
    if (profitPercent > 1) {
      const breakevenDistance = (position.currentPrice - entryPrice) * 0.5;
      newStopLoss = entryPrice + breakevenDistance;
    }

    // Stage 2: Lock micro profit when profit > 2%
    let breakevenLevel: number | null = null;
    if (profitPercent > 2) {
      breakevenLevel = entryPrice + (position.currentPrice - entryPrice) * 0.3;
    }

    // Stage 3: ATR-based trailing when profit > 3%
    let trailingStop: number | null = null;
    const atrMultiplier = 0.75;
    const atrDistance = position.currentPrice * 0.002; // Approximate ATR
    if (profitPercent > 3) {
      trailingStop = position.currentPrice - (atrDistance * atrMultiplier);
    }

    // Stage 4: Aggressive protection near key levels
    // This would check for liquidity, resistance, etc.
    
    return {
      stopLoss: newStopLoss,
      takeProfit: position.takeProfit,
      trailingStop,
      breakevenLevel,
    };
  }

  // Get all active positions
  async getActivePositions(): Promise<Position[]> {
    try {
      const cTraderPositions = await cTraderService.getPositions();
      
      // Sync with local tracking
      for (const pos of cTraderPositions) {
        this.activePositions.set(pos.id, pos);
      }
      
      return Array.from(this.activePositions.values());
    } catch (error) {
      console.error("Failed to get positions:", error);
      return Array.from(this.activePositions.values());
    }
  }

  // Get pending orders
  async getPendingOrders(): Promise<Order[]> {
    try {
      const cTraderOrders = await cTraderService.getOrders();
      const pending = cTraderOrders.filter((o) => o.status === "PENDING");
      
      this.pendingOrders.clear();
      for (const order of pending) {
        this.pendingOrders.set(order.id, order);
      }
      
      return pending;
    } catch (error) {
      console.error("Failed to get orders:", error);
      return Array.from(this.pendingOrders.values());
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.pendingOrders.get(orderId);
    
    if (!order) {
      return false;
    }

    try {
      // In production, this would call cTrader API to cancel order
      this.pendingOrders.delete(orderId);
      return true;
    } catch (error) {
      console.error("Failed to cancel order:", error);
      return false;
    }
  }

  // Update position with current price
  updatePositionPrice(positionId: string, currentPrice: number): void {
    const position = this.activePositions.get(positionId);
    
    if (position) {
      position.currentPrice = currentPrice;
      
      // Calculate profit
      const direction = position.type === "BUY" ? 1 : -1;
      const priceDiff = (currentPrice - position.openPrice) * direction;
      position.profit = priceDiff * position.volume * 100; // 100 oz per lot
      position.profitPercent = (priceDiff / position.openPrice) * 100;
    }
  }

  // Calculate total exposure
  getTotalExposure(): number {
    let totalVolume = 0;
    this.activePositions.forEach((pos) => {
      totalVolume += pos.volume;
    });
    return totalVolume;
  }

  // Calculate total unrealized P&L
  getTotalUnrealizedPnL(): number {
    let total = 0;
    this.activePositions.forEach((pos) => {
      total += pos.profit;
    });
    return total;
  }

  // Check if can open new position
  canOpenPosition(): boolean {
    return this.activePositions.size < this.maxPositions;
  }

  // Get position by ID
  getPosition(positionId: string): Position | undefined {
    return this.activePositions.get(positionId);
  }

  // Get trade history
  getTradeHistory(): Trade[] {
    return this.tradeHistory;
  }

  // Clear all positions (emergency)
  clearAllPositions(): void {
    this.activePositions.clear();
  }

  // Sync with cTrader
  async syncWithBroker(): Promise<void> {
    try {
      const cTraderPositions = await cTraderService.getPositions();
      const cTraderOrders = await cTraderService.getOrders();
      
      // Update local tracking
      this.activePositions.clear();
      for (const pos of cTraderPositions) {
        this.activePositions.set(pos.id, pos);
      }
      
      this.pendingOrders.clear();
      for (const order of cTraderOrders) {
        if (order.status === "PENDING") {
          this.pendingOrders.set(order.id, order);
        }
      }
    } catch (error) {
      console.error("Failed to sync with broker:", error);
    }
  }
}

export const tradingService = new TradingService();
export default TradingService;