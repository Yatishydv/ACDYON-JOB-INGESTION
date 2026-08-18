# Terms and Boundaries

## What This System Does

JobPulse accesses a single public API (Arbeitnow) that explicitly provides job data for third-party consumption. It does so respectfully:

- Uses the documented public endpoint
- Sends a clear `User-Agent` identifying the system
- Paces requests with minimum delays
- Accepts and respects rate-limit responses
- Provides attribution via a link back to Arbeitnow.com

## What This System Does NOT Do

The following capabilities are **intentionally absent**, not because they are technically impossible, but because they would violate the assignment's guardrails and responsible engineering principles:

| Capability | Status | Reason |
|---|---|---|
| CAPTCHA bypass | ❌ Not implemented | Assignment prohibition |
| Authentication bypass | ❌ Not implemented | Unauthorized access |
| Proxy rotation | ❌ Not implemented | Evasion of access controls |
| Fingerprint spoofing | ❌ Not implemented | Deceptive behavior |
| Headless browser stealth | ❌ Not implemented | Not needed for public API |
| Credential stuffing | ❌ Not implemented | Unauthorized access |
| Cookie manipulation | ❌ Not implemented | Not needed for public API |
| Rate-limit circumvention | ❌ Not implemented | Disrespects source's boundaries |
| Scraping private data | ❌ Not implemented | Terms violation |
| LinkedIn live account | ❌ Not implemented | Explicit assignment prohibition |

## Arbeitnow API Terms

From the [Arbeitnow API documentation](https://www.arbeitnow.com/api/job-board-api):

> "The API is provided as is. Please add a link to Arbeitnow.com."

The system complies by:
1. Displaying attribution in the dashboard header
2. Including attribution in the README
3. Not misrepresenting the data source

## Ethical Boundary

The system demonstrates engineering sophistication through its resilience architecture — not through aggressive or deceptive data acquisition. The adapter pattern proves that adding authorized sources in the future would be trivial, without requiring any anti-detection infrastructure.

This is a deliberate engineering judgment: the value is in the pipeline, not the scraper.
