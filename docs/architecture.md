# System Architecture

## Overview

JobPulse is designed as a modular pipeline where each stage has a single responsibility. Components communicate through defined interfaces, making the system testable and extensible.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        INGESTION PIPELINE                            │
│                                                                      │
│  ┌─────────────┐   ┌──────────┐   ┌───────────┐   ┌──────────────┐ │
│  │   Source     │──>│ Fetcher  │──>│ Validator  │──>│  Normalizer  │ │
│  │   Adapter    │   │ + Rate   │   │            │   │              │ │
│  │              │   │ Limiter  │   │            │   │              │ │
│  └──────┬───────┘   └──────────┘   └───────────┘   └──────┬───────┘ │
│         │                                                   │        │
│         │           ┌──────────────────┐                    ▼        │
│         │           │   RESILIENCE     │           ┌──────────────┐  │
│         │           │                  │           │ Deduplicator │  │
│         │           │ • Circuit Breaker│           │              │  │
│         ◄───────────│ • Source Health  │           └──────┬───────┘  │
│                     │ • Retry Manager  │                  │          │
│                     │ • Fallback Mgr   │                  ▼          │
│                     └──────────────────┘            ┌──────────┐    │
│                                                     │ MongoDB  │    │
│                                                     └──────┬───┘    │
└──────────────────────────────────────────────────────────────┼───────┘
                                                               │
                                                        ┌──────▼───┐
                                                        │ REST API │
                                                        └──────┬───┘
                                                               │
                                                        ┌──────▼───────┐
                                                        │   Dashboard  │
                                                        │  (React/Vite)│
                                                        └──────────────┘
```

## Component Responsibilities

### Source Adapters
- Each adapter implements a common interface: `fetchJobs()`, `normalizeJob()`, `getSourceName()`, `getHealth()`
- Currently: ArbeitnowAdapter (live) + SandboxAdapter (testing)
- Adding a new source requires only a new adapter file

### Fetcher + Rate Limiter
- The fetcher wraps adapter.fetchJobs() with timing and error capture
- Rate limiter enforces minimum delay between requests (token bucket)
- Delay adapts after 429 detection (doubles)

### Validator
- Schema validation at two levels:
  1. Response-level (is `data` an array?)
  2. Record-level (has required fields like `title`, `url`?)
- Invalid records are rejected with diagnostic events

### Normalizer
- Converts source-specific fields to internal model via adapter.normalizeJob()
- Strips HTML from descriptions
- Normalizes URLs for consistent comparison
- Generates content hash for dedup

### Deduplicator
- **Primary**: `source + sourceJobId` (compound unique index)
- **Fallback**: `contentHash` (SHA-256 of title + company + location + url)
- Duplicate records only update `lastSeenAt`
- Handles race conditions via unique index

### Resilience Layer
- **Source Health**: State machine (HEALTHY → DEGRADED → UNAVAILABLE)
- **Circuit Breaker**: CLOSED → OPEN → HALF_OPEN cycle
- **Retry Manager**: Exponential backoff with jitter
- **Fallback Manager**: Routes to permitted alternative source

### Ingestion Service (Orchestrator)
- Coordinates the entire pipeline
- Emits events for observability
- Records run metadata (counts, duration, status)
- Prevents concurrent execution (mutex)

## Data Models

### Job
Core entity. Fields: source, sourceJobId, title, company, location, remote, description, url, tags, publishedAt, firstSeenAt, lastSeenAt, contentHash

### IngestionRun
One per execution. Fields: runId, source, status (RUNNING/SUCCESS/PARTIAL/FAILED), fetched, accepted, rejected, duplicates, durationMs

### IngestionEvent
Pipeline events. Fields: runId, source, type (17 event types), message, timestamp

### SourceHealth
Per-source state. Fields: source, status, consecutiveFailures, lastError, averageLatencyMs
