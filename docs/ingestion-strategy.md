# Ingestion Strategy

## Source Selection

### Primary Source: Arbeitnow

**Why Arbeitnow?**
- Free public API at `https://www.arbeitnow.com/api/job-board-api`
- No authentication required
- Returns real job listings (European market + remote roles)
- JSON response with predictable pagination (`?page=N`)
- Explicit API documentation
- Terms permit usage with attribution

**Risk Assessment: Low**
- No CAPTCHA, login, or anti-bot protection
- No rate-limit headers observed in testing
- Stable schema (slug, company_name, title, description, remote, url, tags, job_types, location, created_at)

### Fallback Source: Sandbox

A controlled Express server that simulates failure scenarios (429, 503, empty, malformed, schema change). This ensures the resilience patterns can be demonstrated without relying on real source failures.

## Adapter Pattern

```
                     ┌───────────────────┐
                     │  SourceAdapter     │ (base interface)
                     │                   │
                     │  fetchJobs()      │
                     │  normalizeJob()   │
                     │  getSourceName()  │
                     │  getHealth()      │
                     └────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────┴──────┐  ┌────┴───────┐  ┌────┴─────────┐
    │ ArbeitnowAdapter│  │SandboxAdptr│  │ FutureSource │
    │                 │  │            │  │  (LinkedIn,  │
    │ • Maps slug     │  │ • Flexible │  │   Indeed)    │
    │ • Maps company_ │  │   scenario │  │              │
    │   name          │  │   param    │  │ Would need   │
    │ • Epoch → Date  │  │            │  │ authorized   │
    │ • Paginates     │  │            │  │ API access   │
    └─────────────────┘  └────────────┘  └──────────────┘
```

**Adding a new source** requires:
1. Create a new adapter file implementing the SourceAdapter interface
2. Register it in the fallback manager (if it should serve as fallback)
3. Zero changes to the pipeline, validation, dedup, or dashboard

## Request Pacing

- **Minimum delay**: 1,500ms between requests (configurable)
- **Adaptive backoff**: After 429 detection, delay doubles
- **Reset**: Returns to default after successful request
- **Jitter**: Retries include random jitter to avoid thundering herd

## Session Management

Current approach: stateless requests.

For sources that require session management:
- Cookie jar per adapter (not needed for Arbeitnow)
- Session rotation after N requests
- Referrer chain to simulate natural navigation

These patterns are documented but not implemented because the permitted source doesn't require them.

## Pagination

Arbeitnow uses simple page-based pagination:
- `?page=1`, `?page=2`, etc.
- Configured maximum pages per run (default: 3)
- Stops when source returns empty data array

## Data Quality

Each record passes through three gates:
1. **Source Schema Validation** — Does the raw record have expected fields?
2. **Normalization** — Can the record be mapped to internal model?
3. **Pipeline Validation** — Does the normalized record have required fields with valid types?

Records failing any gate are logged as events and counted as rejections.
