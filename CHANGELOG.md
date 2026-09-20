# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `events(year, calendar?, { include })` — `include` option (single token or array): `extra` adds the tier-2 observances (Isra Mi'raj 27 Rajab, Nuzulul Quran 17 Ramadan, Arafah 9 Dhul Hijjah, Tasu'a 9 Muharram, Ashura 10 Muharram, Tasyrik 11–13 Dhul Hijjah), `ayyamul_bidh` adds the white days (13–15 of every Hijri month, one ranged event per month), `all` adds everything, individual slugs cherry-pick. Base 5 events are always included.
- `EventItem.date_range` — optional field for multi-day events (Tasyrik, Ayyamul Bidh) with `hijri_start`, `hijri_end`, `gregorian_start`, `gregorian_end`; `null` for single-day events.
- `EventsInput.include` — echo of the requested include set; `null` when unset.
- `fetchEvents(year, calendar?, include?)` — pass include through to the API.

### Notes
- `include` works offline: extras are computed from the bundled MABIMS table (fixed Hijri dates) within the bundled range, with API fallback outside it.
- Cache keys now distinguish include sets, so `events(1446, 'hijri')` and `events(1446, 'hijri', { include: 'extra' })` do not collide.
- Pairs with MABIMS API v1.9+; bundled extras work without it.

## [1.3.0] - 2026-09-15

### Added
- `today({ next: true })` — also returns `next`, the Hijri date that begins after this evening's maghrib (the next civil day's mapping), each with its own `source`. `TodayResponse.next` is optional.
- `fetchToday(tz?, next?)` — set `next` to request the post-maghrib date from the API.

### Notes
- The SDK does not compute sunset: gate the flip on the client's own maghrib-time clock.
- Works offline from bundled data for in-range dates; falls back to the API (`?next=true`) beyond the table, and omits `next` when offline.
- SDK-side addition; pairs with MABIMS API v1.8+ but bundled dates work without it.

## [1.2.0] - 2026-09-09

### Added
- `HilalEvening.deciding_site` — `{ name, lat, lon, elev_m, tz }` of the site the reported values describe: the decider when visible, the best-margin site otherwise; optional field, present with MABIMS API v1.5+
- `HilalEvening.sites_checked` — number of coastal observation sites evaluated; optional field, present with MABIMS API v1.5+

### Changed
- Docs: hilal criteria wording now reflects the multi-site model (topocentric altitude + geocentric elongation, evaluated at coastal observation points across Indonesia)

### Notes
- The API changed how `evening.moon_alt_deg` / `elongation_deg` / `sunset` / `moonset` are computed (deciding site, previously Sabang) — response shape unchanged. Bundled calendar data is unaffected.
- Release after the API v1.5 deploy so `deciding_site` is live.

## [1.1.0] - 2026-09-02

### Changed
- Expanded bundled data coverage from 2024-01-13 to **2023-01-23** (Hijri 1444-07-01)
- Bundled data now matches MABIMS API's full curated table (Hijri 1444–1448)

### Added
- `npx mabims-sync` now writes fetched data to `src/data.json` (was print-only)
- `CHANGELOG.md`

## [1.0.2] - 2025

### Added
- `hilal.info()` — moon visibility data for Hijri month starts (altitude, elongation, illumination)

### Removed
- `compare()` — redundant with `convert()`

## [1.0.1] - 2025

### Added
- React Native support via `setStorageAdapter()` and `resetStorage()`
- CJS `require` condition in package.json exports

### Changed
- Rewrote README with framework-specific usage (vanilla JS, React, React Native, Node, Edge)

### Fixed
- MABIMS description and disclaimer
- LICENSE branch link (`master` not `main`)
- `convert()` return type documentation

## [1.0.0] - 2025

### Added
- `today()` — get today's Hijri date, timezone-aware
- `convert()` — single date conversion (Gregorian ↔ Hijri)
- `range()` — date range conversion (max 45 days)
- `month()` — full month conversion
- `year()` — full year conversion (12 months)
- `events()` — Islamic event dates (Ramadan, Eid, etc.)
- Bundled MABIMS data (2024-01-13 to 2026-12-31)
- In-memory/browser cache with configurable TTL
- Background refresh for stale data
- CLI tool (`npx mabims-sync`) for manual sync
- Full TypeScript definitions
- Zero dependencies (native `fetch` only)

[Unreleased]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/PijarAdiluhung/mabims-hijri/releases/tag/v1.0.0
