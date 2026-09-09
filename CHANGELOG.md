# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/PijarAdiluhung/mabims-hijri/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/PijarAdiluhung/mabims-hijri/releases/tag/v1.0.0
