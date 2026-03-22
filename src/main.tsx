import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";

// ── Sentry error monitoring ──────────────────────────────────────
// Get your DSN free at: https://sentry.io → New Project → React
// Then add VITE_SENTRY_DSN to your .env and Vercel env vars
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "",
  environment: import.meta.env.MODE,          // "development" or "production"
  enabled: import.meta.env.PROD,              // only runs in production build
  tracesSampleRate: 0.1,                      // capture 10% of transactions
  replaysOnErrorSampleRate: 1.0,              // always replay on errors
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,                      // hides user text for privacy
      blockAllMedia: true,
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
