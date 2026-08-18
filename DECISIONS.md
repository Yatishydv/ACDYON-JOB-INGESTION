# ACDYON Technologies: Part 1 - Ingestion System Architecture & Decisions

By Yatish Yadav

## 1. Detection Surface
When building an automated ingestion system, the client can be identified through several vectors:
* **Headless/Browser Fingerprints:** Automated browsers (like Puppeteer/Playwright) expose different JS environments, navigator properties, and canvas fingerprints compared to normal user browsers.
* **Request Timing:** Humans do not make requests every exactly 1000ms. Perfect periodicity is a strong signal of automation.
* **Request Metadata/Headers:** Missing `Accept-Language`, `User-Agent`, or mismatched TLS finger-printing can immediately flag a request as anomalous.
* **Behavioral Patterns:** Hitting an API endpoint sequentially across 100 pages without loading CSS, images, or interacting with the page indicates a bot.

In this project, rather than trying to perfectly spoof a human browser, I focused on respecting the API's boundaries, providing legitimate headers, and avoiding aggressive polling.

## 2. Ingestion Strategy
My strategy focuses on reliability and respect for the source's infrastructure:
* **Rotation & Source Adapter Pattern:** I implemented a decoupled `Adapter` pattern. The system isn't tightly bound to a single source. Adding a new source requires a new adapter file, leaving the core ingestion engine untouched.
* **Pacing & Rate Limiting:** I built a dedicated `RateLimiter` that enforces a minimum delay between requests. If a `429 Too Many Requests` is encountered, it applies an exponential backoff strategy automatically.
* **Session/Identity Management:** For public APIs (like Arbeitnow), session state is unnecessary, reducing the footprint. Where authentication is needed, credentials are provided cleanly via headers rather than simulating browser logins.
* **Fallback Strategy:** If the primary source fails or gets shut down, the system's `FallbackManager` automatically redirects ingestion requests to a secondary configured source (or a local Sandbox for testing), ensuring the pipeline continues to function without manual intervention.

## 3. Resilience
The pipeline is designed to survive anomalies without silently failing or corrupting the database:
* **Source Markup/Structure Changes:** I implemented a strict `Validator` step. If the source changes its JSON structure overnight, the validator catches the missing/malformed fields, rejects the invalid records, and logs the incident without polluting the database.
* **Rate Limiting (Circuit Breaker):** I implemented a `CircuitBreaker` pattern. If consecutive requests fail (e.g., due to rate limits), the breaker trips, stopping all outbound requests for a cooldown period to prevent hammering the source and getting permanently IP-banned.
* **Empty Responses:** An HTTP 200 with 0 records is treated suspiciously. The system logs this anomaly. If it happens repeatedly, the source health is automatically marked as degraded.
* **Two-Tier Deduplication:** To ensure idempotent ingestion across retries, I implemented deduplication via a primary key (`source + sourceJobId`) and a fallback content hash (SHA-256 of the job attributes) to catch cross-source duplicates.

## 4. Technical and Ethical Boundary (Where I Stop)
While I have the technical capability to build aggressive scrapers, I maintain a strict ethical and professional boundary:
* **Permitted Behavior:** I will consume public RSS feeds, intentionally exposed public APIs, sandbox environments, and scrape public HTML only at reasonable, human-like request rates.
* **My Stop Conditions:** I absolutely refuse to build systems that bypass authentication, defeat security mechanisms, solve or bypass CAPTCHAs, or rotate IPs specifically to evade explicit IP bans. Engineering resilience is about graceful degradation and handling failure intelligently, not engaging in a hostile arms race with a platform's security team.
