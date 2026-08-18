# Resilience

## Failure Scenarios and System Behavior

### 1. Rate Limiting (HTTP 429)

**Trigger**: Source returns 429 Too Many Requests

**System Response**:
1. Fetch fails → RetryManager classifies as retryable
2. Exponential backoff: 1s → 2s → 4s (with jitter)
3. RateLimiter.backoff() doubles the inter-request delay
4. Event logged: `RATE_LIMIT_DETECTED`
5. SourceHealth updated: status → `RATE_LIMITED`
6. After max retries: circuit breaker counts failure
7. After 5 consecutive: circuit breaker opens → fallback activated

**Recovery**: First successful request resets delay and source status.

### 2. Server Error (HTTP 5xx)

**Trigger**: Source returns 500, 502, 503

**System Response**:
1. Classified as retryable error
2. Retry with exponential backoff (3 attempts max)
3. SourceHealth tracks consecutive failures:
   - 2 failures → `DEGRADED`
   - 5 failures → `UNAVAILABLE`
4. Circuit breaker opens after threshold
5. Fallback source activated

**Recovery**: Successful request → `HEALTHY`, circuit → `CLOSED`

### 3. Empty Response

**Trigger**: Source returns HTTP 200 but `data: []` on first page

**System Response**:
1. NOT treated as an error — it's a valid response
2. Event logged: `EMPTY_RESPONSE_DETECTED`
3. SourceHealth flagged with `emptyResponse: true`
4. Dashboard shows anomaly indicator
5. No records processed (nothing to validate/store)

**Why this matters**: Empty responses can indicate shadow bans, geo-blocks, or search term changes.

### 4. Schema Change

**Trigger**: Source changes field names or response structure

**System Response**:
1. Response-level: `validateResponseSchema()` catches missing `data` array
2. Record-level: `validateJobSchema()` catches missing required fields (slug, title, url)
3. Error classified as non-retryable (retrying won't fix a schema change)
4. Events logged: `SCHEMA_VALIDATION_FAILED` and/or `JOB_REJECTED`
5. SourceHealth updated with error details

**Design**: Schema change errors are loud. They signal a structural problem requiring human intervention.

### 5. Malformed Response

**Trigger**: Source returns invalid JSON or HTML instead of JSON

**System Response**:
1. `response.json()` throws → caught by fetcher
2. Error classified as retryable (might be a transient CDN issue)
3. After max retries: permanent failure recorded

### 6. Network Timeout

**Trigger**: Source doesn't respond within 15 seconds

**System Response**:
1. `AbortSignal.timeout()` fires → AbortError thrown
2. Classified as retryable (transient network issue)
3. Same retry/backoff/circuit-breaker flow

### 7. Duplicate Data

**Trigger**: Same job appears in multiple ingestion runs

**System Response**:
1. **Primary dedup**: MongoDB compound unique index on `{source, sourceJobId}` — DB-level guarantee
2. **Cross-source dedup**: contentHash (SHA-256 of title + company + location + url)
3. Duplicate records update `lastSeenAt` timestamp only
4. Events logged: `DUPLICATE_DETECTED` with count
5. Race condition safety: `E11000` duplicate key error handled gracefully

### 8. Primary Source Unavailable

**Trigger**: Circuit breaker opens after 5 consecutive failures

**State Machine**:
```
CLOSED ─── failure ──> increment counter
  │                      │
  │                 >= threshold
  │                      │
  │                      ▼
  │                    OPEN ─── wait cooldown (60s) ──> HALF_OPEN
  │                      │                                 │
  │                      │                            test request
  │                      │                              │      │
  │                      │                           success  failure
  │                      │                              │      │
  └─── success ◄─────────┘◄────────────────────────────┘      │
       (reset)                                                  │
                                                                ▼
                                                              OPEN
```

**Fallback**: When circuit opens → FallbackManager provides SandboxAdapter → sandbox data is ingested instead.

## Observability

Every resilience event is recorded as an `IngestionEvent`:
- 17 distinct event types
- Timestamped
- Linked to ingestion run via `runId`
- Visible on dashboard in real-time
- Queryable via `/api/ingestion/events`
