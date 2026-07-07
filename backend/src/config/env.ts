import dotenv from "dotenv";
import path from "path";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string): string | undefined {
  return process.env[key];
}

export const config = {
  // Server
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // cTrader OAuth Credentials (user provides these)
  CTRADER_CLIENT_ID: requireEnv("CTRADER_CLIENT_ID"),
  CTRADER_CLIENT_SECRET: requireEnv("CTRADER_CLIENT_SECRET"),
  CTRADER_REDIRECT_URI: requireEnv("CTRADER_REDIRECT_URI"),
  
  // cTrader Auth URLs (official, not hardcoded per broker)
  CTRADER_AUTH_URL: "https://connect.spotware.com/apps/auth",
  CTRADER_TOKEN_URL: "https://connect.spotware.com/apps/token",
  CTRADER_API_BASE: "https://api.ctrader.com",
  
  // WebSocket Endpoints (discovered dynamically)
  CTRADER_DEMO_WSS: optionalEnv("CTRADER_DEMO_WSS") || "wss://demo.ctraderapi.com:5035",
  CTRADER_LIVE_WSS: optionalEnv("CTRADER_LIVE_WSS") || "wss://live.ctraderapi.com:5035",
  
  // Frontend URL (for CORS and callbacks)
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
} as const;

export type Config = typeof config;