# JobPulse — Resilient Job Data Ingestion

A production-quality job ingestion system that demonstrates engineering judgment when dealing with data sources that may detect automated access, rate-limit requests, return unexpected responses, change structure, or become unavailable.

**Built for the ACDYON Technologies Frontend Challenge — Part 1**

## Overview

JobPulse is not merely a scraper. It is a resilient ingestion pipeline that:

1. Retrieves real job listings from a permitted public source (Arbeitnow API)
2. Validates incoming data against expected schemas
3. Normalizes source-specific fields into a common internal model
4. Deduplicates records using a two-tier strategy (source ID + content hash)
5. Stores results in MongoDB
6. Provides full pipeline observability through a dashboard
7. Handles failures gracefully — rate limits, server errors, empty responses, schema changes
8. Demonstrates source-adapter architecture for multi-source support

## Architecture

```
                    REAL PUBLIC SOURCE
                    (Arbeitnow API)
                          │
                          ▼
                   ┌─────────────┐
                   │Source Adapter│ ← Adapter pattern: decoupled from pipeline
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │   Fetcher   │ ← HTTP + timing
                   │ Rate Limiter│ ← Min delay between requests
                   └──────┬──────┘
                          │
                  ┌───────┴───────┐
                  │               │
               SUCCESS          ERROR
                  │               │
                  ▼               ▼
             Validator      Retry Manager
                  │          (exp backoff)
                  ▼               │
             Normalizer     Circuit Breaker
                  │               │
                  ▼               ▼
             Deduplicator   Source Health
                  │          (state machine)
                  ▼               │
               MongoDB      Fallback Manager
                  │               │
                  ▼               ▼
              REST API     Permitted Fallback
                  │
                  ▼
              Dashboard
```

## Data Flow

```
Source → Fetch → Validate → Normalize → Deduplicate → Store → API → Dashboard
```

On failure:
```
Error → Classify → Retry (if retryable) → Update Source Health → Fallback (if available) → Stop (if exhausted)
```

## Resilience

| Scenario | System Behavior |
|---|---|
| **429 Rate Limit** | Detect, record event, backoff, retry after delay, mark source RATE_LIMITED |
| **5xx Server Error** | Retry with exponential backoff, mark DEGRADED after 2 failures, UNAVAILABLE after 5 |
| **Empty Response** | Detect anomaly, log event, distinguish from legitimate empty result |
| **Schema Change** | Validation catches unexpected structure, rejects records, marks source DEGRADED |
| **Duplicate Data** | Two-tier dedup (source+sourceJobId, then contentHash), updates lastSeenAt |
| **Primary Source Down** | Circuit breaker opens, fallback to permitted sandbox source |

## Detection Surface

The system demonstrates awareness of automated client detection vectors:

- **Headless fingerprints** — Automated environments expose identifiable characteristics
- **Request timing** — Repetitive intervals look automated; we use randomized delays
- **Headers** — Request metadata differs from browser traffic; we send appropriate User-Agent
- **Behavioral patterns** — We avoid aggressive patterns, respect rate limits

The system does **not** attempt to defeat detection systems. It demonstrates understanding.

## Source

- **Primary**: [Arbeitnow](https://www.arbeitnow.com) — Free public job board API for Europe/remote roles
- **Fallback**: Controlled sandbox server for failure simulation

## Terms / Boundaries

This system intentionally does **not**:
- Bypass authentication, CAPTCHA, or access controls
- Use a live LinkedIn account
- Exploit vulnerabilities or evade security restrictions
- Continue aggressive requests after being blocked
- Use unauthorized proxy rotation or credential manipulation

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Frontend | React, Vite, Tailwind CSS |
| Sandbox | Express.js (separate server) |

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### Backend
```bash
cd backend
cp ../.env.example .env    # Edit MONGODB_URI if needed
npm install
npm run dev                # Starts on port 5005
```

### Sandbox (for failure simulation)
```bash
cd sandbox
npm install
npm run dev                # Starts on port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                # Starts on port 5173, proxies API to 5005
```

## Environment Variables

See [.env.example](.env.example) for all configurable options.

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | 5005 |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/jobpulse` |
| `FRONTEND_URL` | CORS origin | `http://localhost:5173` |
| `SANDBOX_URL` | Sandbox server URL | `http://localhost:4000` |
| `INGESTION_MAX_PAGES` | Max pages to fetch per run | 3 |
| `REQUEST_DELAY_MS` | Minimum delay between requests | 1500 |
| `MAX_RETRIES` | Max retry attempts | 3 |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | App + DB health check |
| GET | `/api/jobs` | Paginated job listing |
| GET | `/api/jobs/:id` | Single job detail |
| GET | `/api/ingestion/runs` | Ingestion run history |
| GET | `/api/ingestion/events` | Recent ingestion events |
| POST | `/api/ingestion/run` | Trigger ingestion run |
| GET | `/api/sources` | Configured sources |
| GET | `/api/sources/:source/health` | Source health detail |

## Testing

```bash
cd backend
npm test
```

Tests cover: validation, normalization, deduplication, retry logic, rate limiting, fallback, and source health transitions.

## AI Usage

AI tools were used during development for:
- Code scaffolding and boilerplate generation
- Architecture brainstorming and validation
- Documentation assistance
- Debugging and error handling patterns

All generated code was reviewed, understood, tested, and modified. The architectural decisions (source-adapter pattern, circuit breaker, two-tier dedup, rate limiter design) were personally made and can be explained.

## License

This project was built for the ACDYON Technologies assessment.

Job data source: [Arbeitnow](https://www.arbeitnow.com) — used per their public API terms.
