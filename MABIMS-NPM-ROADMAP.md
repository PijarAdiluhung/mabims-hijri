# MABIMS NPM Package — Roadmap

> **Goal:** Start small (offline "today" lookup), grow into a full MABIMS.dev API client.

---

## V1 — `mabims-today` (offline-first, self-refreshing) ✅

**Scope:** Just today's Hijri date, works offline, quietly updates when online.

- [x] Bundle static MABIMS table (2024–2026) as JSON inside the package
- [x] `today()` reads from bundled/cached data first — instant, no network wait
- [x] Background refresh: check `/meta` endpoint for newer table data (e.g. 2027)
- [x] If newer data exists, fetch it and save to a **LOCAL CACHE** (not `node_modules`):
  - **Node:** in-memory cache
  - **Browser:** `localStorage`
- [x] Fallback: if date is outside bundled+cached range **AND** online → live API call
- [x] Ship TypeScript types
- [x] README with basic usage + how offline/refresh works
- [ ] Publish `v1.0.0` to npm

**Deliverable:** `const date = await today()` — works offline, self-heals online.

---

## V2 — `convert()` + `range()` ✅

**Scope:** Add manual date conversion using same bundled+cache+API pattern.

- [x] `convert(date, direction)` — Gregorian ↔ Hijri, uses bundled data if in range
- [x] `range(start, end)` — bulk conversion (mirror mabims.dev's `/range`, ≤45 days)
- [x] Reuse the same refresh/cache logic from V1 (don't duplicate it)
- [x] Add tests for edge cases (year boundaries, leap-ish months, out-of-range dates)

---

## V3 — Calendars: `month()` / `year()` ✅

**Scope:** Grid-style outputs for building calendar UIs.

- [x] `month(year, month)` — full month grid
- [x] `year(year)` — full year grid (12 months)
- [x] Uses API for calendar data (bundled data used for individual dates)

---

## V4 — `events()` + `compare()` ✅

**Scope:** The "why MABIMS matters" differentiators.

- [x] `events(year)` — Ramadan, Idul Fitri, Idul Adha, etc.
- [x] `compare(date)` — MABIMS date with source info
- [ ] Flag "divergence days" where MABIMS differs from Umm al-Qura (needs API support)

---

## V5 — Hilal visualization

**Scope:** The most unique mabims.dev feature.

- [ ] `hilal.info(month, year)` — visibility data/criteria
- [ ] `hilal.viz(month, year)` — returns PNG URL or Buffer (720×1280 sky chart)

---

## V6 — Polish / DX pass

- [ ] Full TypeScript coverage + JSDoc for autocomplete
- [ ] Tree-shakeable named exports (no default god-object)
- [ ] Isomorphic: works in Node AND browser (fetch-based, no Node-only deps)
- [ ] Optional CLI: `npx mabims-sync` to force-refresh bundled data (good for CI)
- [ ] Configurable cache TTL (default ~24h–7d)
- [ ] Docs site or thorough README with examples for each function
