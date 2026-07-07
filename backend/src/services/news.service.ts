import type { NewsEvent } from "../types/index.js";

interface NewsConfig {
  name: string;
  currency: string;
  impact: "LOW" | "MEDIUM" | "HIGH";
  typicalVolatility: number;
}

class NewsService {
  private monitoredEvents: Map<string, NewsEvent> = new Map();
  private isActive: boolean = false;
  private lastUpdate: number = 0;
  private newsCheckInterval: NodeJS.Timeout | null = null;

  // Major USD events to monitor
  private readonly KEY_EVENTS: NewsConfig[] = [
    { name: "NFP", currency: "USD", impact: "HIGH", typicalVolatility: 15 },
    { name: "CPI", currency: "USD", impact: "HIGH", typicalVolatility: 12 },
    { name: "FOMC Rate Decision", currency: "USD", impact: "HIGH", typicalVolatility: 20 },
    { name: "Powell Speech", currency: "USD", impact: "HIGH", typicalVolatility: 15 },
    { name: "GDP", currency: "USD", impact: "MEDIUM", typicalVolatility: 10 },
    { name: "Retail Sales", currency: "USD", impact: "MEDIUM", typicalVolatility: 8 },
    { name: "PMI", currency: "USD", impact: "MEDIUM", typicalVolatility: 7 },
    { name: "ISM", currency: "USD", impact: "MEDIUM", typicalVolatility: 10 },
    { name: "Claims", currency: "USD", impact: "LOW", typicalVolatility: 5 },
    { name: "Core PCE", currency: "USD", impact: "HIGH", typicalVolatility: 12 },
  ];

  // Start monitoring
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.updateNewsEvents();
    
    // Check for updates every 5 minutes
    this.newsCheckInterval = setInterval(() => {
      this.updateNewsEvents();
    }, 300000);
  }

  // Stop monitoring
  stop(): void {
    this.isActive = false;
    
    if (this.newsCheckInterval) {
      clearInterval(this.newsCheckInterval);
      this.newsCheckInterval = null;
    }
  }

  // Update news events (simulated - in production would connect to news API)
  private updateNewsEvents(): void {
    // In production, this would fetch from a news/economic calendar API
    // For now, we'll generate upcoming events based on typical schedule
    
    const now = Date.now();
    this.monitoredEvents.clear();
    
    // NFP - First Friday of every month
    const nextFriday = this.getNextFriday();
    this.addEvent("NFP", nextFriday, 0.5);
    
    // FOMC - Approximately every 6 weeks (8 times per year)
    this.addEvent("FOMC Rate Decision", this.getNextFOMCDate(), 1.0);
    
    // CPI - Usually mid-month
    this.addEvent("CPI", this.getNextCPIDate(), 0.8);
    
    // Powell speeches - Regular schedule
    this.addEvent("Powell Speech", this.getNextPowellDate(), 0.7);
    
    this.lastUpdate = now;
  }

  // Add event helper
  private addEvent(name: string, time: number, probability: number): void {
    if (probability > 0.3) {
      const config = this.KEY_EVENTS.find((e) => e.name === name);
      
      const event: NewsEvent = {
        name,
        currency: config?.currency || "USD",
        impact: config?.impact || "MEDIUM",
        time,
        previous: this.getPreviousValue(name),
        forecast: this.getForecastValue(name),
        actual: null,
        status: time > Date.now() ? "UPCOMING" : "FINISHED",
      };
      
      this.monitoredEvents.set(name, event);
    }
  }

  // Get next Friday (for NFP)
  private getNextFriday(): number {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    
    const nextFriday = new Date(now);
    nextFriday.setDate(now.getDate() + daysUntilFriday);
    nextFriday.setHours(13, 30, 0, 0); // NFP releases at 8:30 AM EST
    
    return nextFriday.getTime();
  }

  // Get next FOMC date (approximate)
  private getNextFOMCDate(): number {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    nextMonth.setDate(15);
    nextMonth.setHours(19, 0, 0, 0); // FOMC typically at 2 PM EST
    
    return nextMonth.getTime();
  }

  // Get next CPI date (approximate)
  private getNextCPIDate(): number {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    nextMonth.setDate(12);
    nextMonth.setHours(13, 30, 0, 0); // CPI typically at 8:30 AM EST
    
    return nextMonth.getTime();
  }

  // Get next Powell speech date
  private getNextPowellDate(): number {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    nextWeek.setHours(15, 0, 0, 0);
    
    return nextWeek.getTime();
  }

  // Get previous value (simulated)
  private getPreviousValue(name: string): number {
    // In production, would fetch from historical data
    const values: Record<string, number> = {
      "NFP": 199,
      "CPI": 3.2,
      "FOMC Rate Decision": 5.5,
      "GDP": 4.9,
      "Retail Sales": 0.2,
    };
    return values[name] || 0;
  }

  // Get forecast value (simulated)
  private getForecastValue(name: string): number {
    // In production, would fetch from market forecasts
    const values: Record<string, number> = {
      "NFP": 180,
      "CPI": 3.1,
      "FOMC Rate Decision": 5.5,
      "GDP": 2.1,
      "Retail Sales": 0.3,
    };
    return values[name] || 0;
  }

  // Check if high impact event is soon
  isHighImpactEventSoon(hoursAhead: number = 24): boolean {
    const now = Date.now();
    const cutoff = now + hoursAhead * 60 * 60 * 1000;
    
    for (const event of this.monitoredEvents.values()) {
      if (event.impact === "HIGH" && event.time <= cutoff && event.time > now) {
        return true;
      }
    }
    
    return false;
  }

  // Get upcoming events
  getUpcomingEvents(): NewsEvent[] {
    const now = Date.now();
    return Array.from(this.monitoredEvents.values())
      .filter((event) => event.time > now)
      .sort((a, b) => a.time - b.time);
  }

  // Get all events
  getAllEvents(): NewsEvent[] {
    return Array.from(this.monitoredEvents.values());
  }

  // Get events by impact
  getEventsByImpact(impact: "LOW" | "MEDIUM" | "HIGH"): NewsEvent[] {
    return Array.from(this.monitoredEvents.values())
      .filter((event) => event.impact === impact);
  }

  // Check if trading should be paused
  shouldPauseTrading(): { shouldPause: boolean; reason: string } {
    const now = Date.now();
    
    for (const event of this.monitoredEvents.values()) {
      // Pause 30 minutes before and after high impact events
      const bufferTime = 30 * 60 * 1000;
      
      if (event.impact === "HIGH" && Math.abs(event.time - now) < bufferTime) {
        return {
          shouldPause: true,
          reason: `High impact ${event.name} event approaching in ${this.getTimeUntilEvent(event)}`,
        };
      }
    }
    
    return { shouldPause: false, reason: "" };
  }

  // Get time until event
  private getTimeUntilEvent(event: NewsEvent): string {
    const diff = event.time - Date.now();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Get market impact assessment
  getMarketImpactAssessment(): string {
    if (this.isHighImpactEventSoon(1)) {
      return "HIGH_VOLATILITY_EXPECTED";
    }
    if (this.isHighImpactEventSoon(4)) {
      return "ELEVATED_VOLATILITY_POSSIBLE";
    }
    if (this.isHighImpactEventSoon(24)) {
      return "EVENTS_TODAY";
    }
    return "CALM_MARKET";
  }

  // Get next major event
  getNextMajorEvent(): NewsEvent | null {
    const upcoming = this.getUpcomingEvents();
    return upcoming.find((e) => e.impact === "HIGH") || upcoming[0] || null;
  }

  // Is active
  isMonitoring(): boolean {
    return this.isActive;
  }

  // Get last update time
  getLastUpdate(): number {
    return this.lastUpdate;
  }
}

export const newsService = new NewsService();
export default NewsService;