# Decisions

## 1. Strategy Rationale

**Source Selection**: Arbeitnow was chosen as the primary source because it is a free, public API specifically designed for third-party consumption. This satisfies the assignment's requirement for a "low-risk source" while providing real, live job data. No authentication or scraping is required.

**Source-Adapter Architecture**: The pipeline is decoupled from source-specific logic through the adapter pattern. Adding a new source (e.g., a future authorized API for LinkedIn Jobs) requires only a new adapter file — zero changes to validation, normalization, deduplication, or the dashboard.

**Two-Tier Deduplication**: Primary key (`source + sourceJobId`) catches same-source duplicates. Content hash (SHA-256 of title + company + location + url) provides cross-source dedup capability. This handles re-runs, overlapping sources, and variant slugs.

## 2. Key Trade-Off

**Honest Resilience vs. Aggressive Scraping**: The system demonstrates resilience through graceful degradation (circuit breaker, fallback, health state machine) — not through CAPTCHA bypass, fingerprint evasion, or proxy rotation. We prioritized engineering integrity over scraping sophistication. The sandbox server proves the resilience patterns work, without requiring a hostile source that fights back.

**Rate Limiting by Default**: Every request is paced with a minimum delay (1.5s default). This is slower than possible but intentionally respectful. The delay increases adaptively after 429 detection.

## 3. AI Usage

AI was used for code generation, debugging assistance, and documentation drafting. All architecture decisions (adapter pattern, circuit breaker, dedup strategy, state machine design) were human-directed. All code was reviewed and understood.
