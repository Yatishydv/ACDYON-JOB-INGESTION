# Demo Guide

## Prerequisites

Before running the demo, ensure:
1. Node.js 18+ is installed
2. MongoDB is running locally (or Atlas URI configured in `.env`)
3. All dependencies are installed (`npm install` in backend/, sandbox/, frontend/)

## Starting the System

Open 3 terminal windows:

### Terminal 1: Backend
```bash
cd backend
npm run dev
# → JobPulse backend running on port 5005
```

### Terminal 2: Sandbox
```bash
cd sandbox
npm run dev
# → Sandbox server running on port 4000
```

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

## Demo Script

### 1. Live Ingestion (30 seconds)

1. Open `http://localhost:5173` in a browser
2. Verify the dashboard loads with source health cards (Arbeitnow: HEALTHY)
3. Click **"▶ Arbeitnow (Live)"**
4. Watch:
   - Events timeline populates in real-time
   - Summary shows fetched, accepted, duplicates, rejected counts
   - Source health remains HEALTHY
5. Navigate to **Jobs** tab — real job listings appear with titles, companies, locations
6. Navigate to **History** tab — the ingestion run is recorded with SUCCESS status

### 2. Deduplication (15 seconds)

1. Go back to Dashboard
2. Click **"▶ Arbeitnow (Live)"** again
3. Watch the summary: **duplicates count increases** — same jobs detected
4. Check History: new run shows mostly duplicates, few or zero new accepted

### 3. Rate Limit Handling (15 seconds)

1. Click **"Sandbox: 429"**
2. Watch:
   - `RATE_LIMIT_DETECTED` event appears
   - `RETRY_SCHEDULED` events show exponential backoff
   - Run completes with FAILED status
   - Source health updates (sandbox may show DEGRADED)

### 4. Server Error Handling (15 seconds)

1. Click **"Sandbox: 503"**
2. Watch:
   - `FETCH_FAILED` event with 503
   - Retry attempts logged
   - Source health tracks consecutive failures

### 5. Empty Response Detection (10 seconds)

1. Click **"Sandbox: Empty"**
2. Watch:
   - `EMPTY_RESPONSE_DETECTED` event
   - Anomaly recorded — legitimate but suspicious

### 6. Schema Change Detection (10 seconds)

1. Click **"Sandbox: Schema Change"**
2. Watch:
   - `SCHEMA_VALIDATION_FAILED` event
   - Schema change is detected because response uses `results` instead of `data`
   - Non-retryable — system doesn't waste attempts

## Key Points to Highlight

1. **Source Adapter Pattern**: Arbeitnow and Sandbox use the same pipeline — only the adapter differs
2. **Circuit Breaker**: After enough sandbox failures, circuit opens — would trigger fallback
3. **Events Timeline**: Every pipeline decision is recorded and visible
4. **Deduplication**: Second live run proves same jobs aren't duplicated
5. **Schema Change Detection**: Not just catching errors — specifically detecting *what changed*
6. **Honest Engineering**: We don't bypass anything — we handle the consequences of hostile environments

## Troubleshooting

| Issue | Solution |
|---|---|
| MongoDB connection refused | Ensure `mongod` is running or update MONGODB_URI in .env |
| Frontend shows "Backend unavailable" | Check that backend is running on port 5005 |
| Sandbox scenarios don't work | Check that sandbox is running on port 4000 |
| Empty Arbeitnow response | API may be temporarily down — this is real resilience |
