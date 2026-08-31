# MABIMS NPM Package — Roadmap

> **Goal:** Start small (offline "today" lookup), grow into a full MABIMS.dev API client.

---

## V1 — `mabims-today` (offline-first, self-refreshing)

**Scope:** Just today's Hijri date, works offline, quietly updates when online.

- [ ] Bundle static MABIMS table (2024–2026) as JSON inside the package
- [ ] `today()` reads from bundled/cached data first — instant, no network wait
- [ ] Background refresh: check `/meta` endpoint for newer table data (e.g. 2027)
- [ ] If newer data exists, fetch it and save to a **LOCAL CACHE** (not `node_modules`):
  - **Node:** `os.tmpdir()` or a cache dir (e.g. via `env-paths`)
  - **Browser:** `localStorage` / `IndexedDB`
- [ ] Fallback: if date is outside bundled+cached range **AND** offline → clear error
- [ ] Fallback: if date is outside bundled+cached range **AND** online → live API call
- [ ] Ship TypeScript types
- [ ] README with basic usage + how offline/refresh works
- [ ] Publish `v1.0.0` to npm

**Deliverable:** `const date = await today()` — works offline, self-heals online.

---

## V2 — `convert()` + `range()`

**Scope:** Add manual date conversion using same bundled+cache+API pattern.

- [ ] `convert(date, direction)` — Gregorian ↔ Hijri, uses bundled data if in range
- [ ] `range(start, end)` — bulk conversion (mirror mabims.dev's `/range`, ≤45 days)
- [ ] Reuse the same refresh/cache logic from V1 (don't duplicate it)
- [ ] Add tests for edge cases (year boundaries, leap-ish months, out-of-range dates)

---

## V3 — Calendars: `month()` / `year()`

**Scope:** Grid-style outputs for building calendar UIs.

- [ ] `month(year, month)` — full month grid
- [ ] `year(year)` — full year grid (12 months)
- [ ] Decide: bundle these too, or always fetch (they're bigger payloads)

---

## V4 — `events()` + `compare()`

**Scope:** The "why MABIMS matters" differentiators.

- [ ] `events(year)` — Ramadan, Idul Fitri, Idul Adha, etc.
- [ ] `compare(date)` — MABIMS vs Umm al-Qura vs Turki Global side-by-side
- [ ] Flag "divergence days" where MABIMS differs from Umm al-Qura

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

---

## Naming Note

> Consider whether "mabims-today" should later become the base package (e.g. "mabims-dev" or "mabims-js") once it grows past just `today()` — or keep "mabims-today" lightweight/standalone and split convert/calendar features into a separate "mabims-dev" package that depends on it.
>
> **Decide before V2 to avoid a confusing rename later.**
