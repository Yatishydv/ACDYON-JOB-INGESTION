# Detection Surface

## What Platforms Detect

When an automated client accesses a platform that doesn't want automated access, the platform may detect the client through several vectors:

### 1. Headless Browser Fingerprints
- `navigator.webdriver` property is `true` in automated browsers
- Missing or inconsistent plugin lists
- Absence of native events (mouse movement, scrolling patterns)
- Canvas/WebGL rendering differences
- Timing anomalies in JavaScript execution

### 2. Request Characteristics
- **User-Agent strings**: Default automation tool headers (e.g., "HeadlessChrome") are trivially detected
- **Header ordering**: Browsers send headers in a specific order; many HTTP libraries don't replicate this
- **Accept/Accept-Language**: Missing or generic accept headers signal non-browser clients
- **TLS fingerprint (JA3/JA4)**: The TLS handshake itself reveals the client implementation

### 3. Behavioral Patterns
- **Timing regularity**: Requests at exact intervals (e.g., every 2000ms) look automated
- **Navigation pattern**: Jumping directly to data pages without visiting the homepage first
- **Session characteristics**: No cookies, no referrer, no JavaScript execution artifacts
- **Volume**: Many requests in a short period from a single IP

### 4. Network Characteristics
- **IP reputation**: Data center IPs vs. residential IPs
- **Rate of requests**: Exceeding normal human browsing speed
- **Geographic anomalies**: IP location inconsistent with stated locale

## Our Approach

JobPulse acknowledges these detection vectors. It does **not** attempt to defeat them.

### What We Do
- Send a clear, honest `User-Agent` header: `JobPulse/1.0 (Resilient Job Ingestion System)`
- Pace requests with randomizable delays (minimum 1.5s between requests)
- Accept rate-limit responses gracefully and back off
- Stop when asked to stop (circuit breaker)
- Use a permitted public API that explicitly allows programmatic access

### What We Don't Do
- No headless browser to fake human presence
- No fingerprint spoofing (canvas, WebGL, plugins)
- No proxy rotation to evade IP-based rate limiting
- No CAPTCHA solving
- No credential stuffing or authentication bypass
- No header manipulation to disguise automated access
- No stealth plugins (e.g., puppeteer-extra-plugin-stealth)

### Why This Matters
The assignment evaluates engineering judgment, not hacking ability. A system that attempts to defeat detection would:
1. Violate the assignment's explicit guardrails
2. Break the target platform's Terms of Service
3. Be fragile (detection systems continuously evolve)
4. Not demonstrate the resilience patterns that are actually being assessed

The correct engineering decision is to use a source that permits access and demonstrate that the pipeline can handle the *consequences* of hostile environments (rate limiting, schema changes, outages) through proper resilience patterns.
