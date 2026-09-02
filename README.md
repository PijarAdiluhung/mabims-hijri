# mabims-hijri

> JavaScript/TypeScript client for the [MABIMS.dev](https://mabims.dev) API, an ecosystem for the **Indonesian Hijri calendar**, with built-in offline support.

[![npm version](https://img.shields.io/npm/v/mabims-hijri.svg)](https://www.npmjs.com/package/mabims-hijri)
[![license](https://img.shields.io/npm/l/mabims-hijri.svg)](https://github.com/PijarAdiluhung/mabims-hijri/blob/master/LICENSE)

**[mabims.dev](https://mabims.dev)** · **[GitHub](https://github.com/PijarAdiluhung/mabims-hijri)** · **[API Docs](https://mabims.dev/docs)**

---

## What Is This?

This package gives you Hijri (Islamic) calendar tools for free — no API key, no sign-up, no rate limits.

It wraps the [MABIMS.dev](https://mabims.dev) REST API and bundles a **snapshot of the official MABIMS calendar table** right inside the package. That means for dates between **January 2023 and December 2026**, you get instant results with zero network requests. If you need dates outside that range, it automatically fetches from the live API as a fallback.

### What Is MABIMS.dev?

[MABIMS.dev](https://mabims.dev) is an unofficial, free, open-source API that provides an ecosystem for the **Indonesian Hijri calendar**. It delivers date conversion, monthly and yearly calendars, hilal visibility data, and Islamic event dates — all based on **MABIMS criteria** from **Kementerian Agama Republik Indonesia** (the Indonesian Ministry of Religious Affairs).

Dates within the curated table (2023–2026) come from official publicly available MABIMS data. Dates beyond that use **Neo MABIMS** — an algorithmic computation based on astronomical criteria (moon altitude ≥ 3°, elongation ≥ 6.4° at sunset in Sabang, Indonesia's westernmost point).

This NPM package wraps that API with offline-first capabilities — bundled calendar data means instant results with no network requests, while background refresh keeps your data up to date.

> **Disclaimer:** This package is not affiliated with, sponsored by, or endorsed by Kementerian Agama Republik Indonesia or MABIMS. Data is sourced from publicly available MABIMS tables.

---

## Why Use This Package?

| Benefit | What It Means |
|---------|---------------|
| **Offline-first** | Bundled data covers 2023–2026. No network needed for most use cases. |
| **Self-refreshing** | Silently checks for newer data once a day and updates the cache in the background. |
| **Works everywhere** | Node.js (v18+), browsers, React Native, edge runtimes — anywhere `fetch` exists. |
| **Zero dependencies** | Only uses native `fetch`. Nothing else gets pulled into your bundle. |
| **TypeScript-first** | Full type definitions. Tree-shakeable named exports. |

---

## Getting Started

### 1. Install

```bash
npm install mabims-hijri
```

### 2. Get Today's Hijri Date

```typescript
import { today } from 'mabims-hijri';

const date = await today();
console.log(date.output);
// {
//   date: '1448-03-18',
//   calendar: 'hijri',
//   day: 18,
//   month: 3,
//   month_name: 'Rabiul Awal',
//   year: 1448
// }
```

That's it. The first call returns instantly from bundled data. No API call needed.

### 3. Convert a Date

```typescript
import { convert } from 'mabims-hijri';

// Gregorian → Hijri
const hijri = await convert('2026-08-31');
console.log(hijri.output);
// { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }

// Hijri → Gregorian
const gregorian = await convert('1448-03-18', 'hijri');
console.log(gregorian.output);
// { date: '2026-08-31', calendar: 'gregorian', day: 31, month: 8, year: 2026 }
```

---

## How the Offline-First System Works

The package uses a three-tier data strategy to balance speed and freshness:

```
┌───────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│  Bundled MABIMS   │ ──► │  In-Memory Cache │ ──► │  Live API         │
│  (data.json)      │     │  (per-session)   │     │  (mabims.dev)     │
└───────────────────┘     └──────────────────┘     └───────────────────┘
      Built-in                 Always fast            Fallback only
      2023–2026                (TTL: 24h)             (outside range)
```

1. **Bundled data** (`data.json`) ships with the package. It contains a complete bidirectional mapping of every day from 2023-01-23 to 2026-12-31. Lookups are instant and require no network.

2. **In-memory cache** stores results from the API (or bundled lookups) for 24 hours by default. On subsequent calls, the cache is checked first.

3. **Live API** (`api.mabims.dev`) is only contacted when a date falls outside the bundled range (after 2026) and the cache has expired.

When the app first runs, it silently checks the API for a newer version of the calendar table (once per day max). If a newer version exists, it downloads and persists it — so your bundled data stays fresh over time.

---

## Full API Reference

### `today(options?)`

Returns today's Hijri date, timezone-aware.

```typescript
import { today } from 'mabims-hijri';

// Default: Asia/Jakarta timezone
const date = await today();

// Use a different timezone
const kl = await today({ tz: 'Asia/Kuala_Lumpur' });

// Force a fresh API call, bypassing cache
const fresh = await today({ forceRefresh: true });
```

**Options:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `tz` | `string` | `'Asia/Jakarta'` | IANA timezone name (e.g. `'Asia/Jakarta'`, `'Asia/Makassar'`, `'UTC'`) |
| `forceRefresh` | `boolean` | `false` | Skip the cache and fetch fresh data from the API |

**Returns:** `TodayResponse`

```typescript
interface TodayResponse {
  input: {
    date: string;        // Today's Gregorian date, e.g. '2026-08-31'
    calendar: string;    // 'gregorian'
    tz: string;          // The timezone used, e.g. 'Asia/Jakarta'
  };
  output: HijriDate;    // The converted Hijri date
  source: string;       // Where the data came from: 'mabims' or 'mabims-computed'
  warnings: string[];   // Any issues encountered during conversion
}

interface HijriDate {
  date: string;          // Full Hijri date, e.g. '1448-03-18'
  calendar: 'hijri';
  day: number;           // 18
  month: number;         // 3
  month_name: string;    // 'Rabiul Awal' (Indonesian name)
  year: number;          // 1448
}
```

---

### `convert(date, calendar?, options?)`

Convert a single date between Gregorian and Hijri. The function auto-detects which direction to convert based on the `calendar` parameter.

```typescript
import { convert } from 'mabims-hijri';

// Gregorian → Hijri (default)
const hijri = await convert('2026-08-31');

// Hijri → Gregorian
const gregorian = await convert('1448-03-18', 'hijri');
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | `string` | required | ISO date in `YYYY-MM-DD` format |
| `calendar` | `'gregorian' \| 'hijri'` | `'gregorian'` | Which calendar the input date is in |
| `options.forceRefresh` | `boolean` | `false` | Skip the cache |

**Returns:** `ConvertResponse`

```typescript
interface ConvertResponse {
  input: {
    date: string;        // The input date, e.g. '2026-08-31'
    calendar: string;    // 'gregorian' or 'hijri'
    tz: string | null;   // null (convert doesn't use timezone)
  };
  output: HijriDate | GregorianDate;  // Depends on conversion direction
  source: string;       // 'mabims' or 'mabims-computed'
  warnings: string[];
}
```

---

### `range(start, end, calendar?, options?)`

Convert a range of dates at once. Useful for building calendar views or scheduling. Maximum 45 days per request.

```typescript
import { range } from 'mabims-hijri';

const week = await range('2026-08-31', '2026-09-06');
console.log(week.count);  // 7
console.log(week.items);
// [
//   { input: '2026-08-31', output: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... },
//   { input: '2026-09-01', output: '1448-03-19', calendar: 'hijri', month_name: 'Rabiul Awal', ... },
//   ...
// ]
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `start` | `string` | required | Start date (`YYYY-MM-DD`) |
| `end` | `string` | required | End date (`YYYY-MM-DD`) |
| `calendar` | `'gregorian' \| 'hijri'` | `'gregorian'` | Input calendar type |
| `options.forceRefresh` | `boolean` | `false` | Skip the cache |

**Returns:**

```typescript
interface RangeResponse {
  input: { start: string; end: string; calendar: string };
  count: number;           // Number of days in the range
  items: DateItem[];       // One entry per day
  warnings: string[];
}

interface DateItem {
  input: string;      // The input date, e.g. '2026-08-31'
  output: string;     // The converted date, e.g. '1448-03-18'
  calendar: string;   // 'hijri' or 'gregorian'
  day: number;
  month: number;
  month_name: string; // e.g. 'Rabiul Awal'
  year: number;
}
```

---

### `month(year, month, calendar?)`

Get every day in a calendar month with Hijri conversion. Great for rendering a monthly calendar grid.

```typescript
import { month } from 'mabims-hijri';

const august = await month(2026, 8);
console.log(august.count);  // 31 (days in August)
console.log(august.items[0]);
// {
//   gregorian: '2026-08-01',
//   hijri: '1448-02-18',
//   source: 'mabims',
//   ...
// }
```

---

### `year(year, calendar?)`

Get every day in a full year (12 months). Calls `month()` 12 times under the hood.

```typescript
import { year } from 'mabims-hijri';

const data = await year(2026);
console.log(data.count);               // 365
console.log(Object.keys(data.months)); // ['1', '2', ..., '12']
```

---

### `events(year, calendar?)`

Get dates for the 5 major Islamic observances. Returns both Hijri and Gregorian dates for each event.

```typescript
import { events } from 'mabims-hijri';

const evts = await events(1446, 'hijri');
console.log(evts.events);
// [
//   { event: '1_muharram',     name: 'Tahun Baru Islam',         hijri: '1446-01-01', gregorian: '2024-07-07' },
//   { event: 'maulid_nabi',    name: 'Maulid Nabi Muhammad SAW',  hijri: '1446-03-12', gregorian: '2024-09-16' },
//   { event: 'awal_ramadan',   name: 'Awal Ramadan',              hijri: '1446-09-01', gregorian: '2025-03-01' },
//   { event: 'idul_fitri',     name: 'Idul Fitri',                hijri: '1446-10-01', gregorian: '2025-03-31' },
//   { event: 'idul_adha',      name: 'Idul Adha',                 hijri: '1446-12-10', gregorian: '2025-06-08' },
// ]
```

**Events included:**

| Slug | Event | Hijri Date |
|------|-------|------------|
| `1_muharram` | Islamic New Year | 1 Muharram |
| `maulid_nabi` | Prophet Muhammad's Birthday | 12 Rabi' al-Awwal |
| `awal_ramadan` | Start of Ramadan | 1 Ramadan |
| `idul_fitri` | Eid al-Fitr (End of Ramadan) | 1 Shawwal |
| `idul_adha` | Eid al-Adha (Feast of Sacrifice) | 10 Dhul Hijjah |

---

### `hilal.info(month, year)`

Get hilal (moon) visibility data for determining the start of a Hijri month. Uses MABIMS criteria based on observations from Sabang, Indonesia.

```typescript
import { hilal } from 'mabims-hijri';

const info = await hilal.info(9, 1447); // Ramadhan 1447
console.log(info.month.name);            // 'Ramadhan'
console.log(info.month.start);           // '2026-02-19'
console.log(info.evening.visible);       // true or false
console.log(info.evening.moon_alt_deg);  // moon altitude in degrees
console.log(info.evening.elongation_deg); // elongation in degrees
console.log(info.evening.illumination_pct); // illumination percentage
```

**Returns:**

| Field | Description |
|-------|-------------|
| `month.name` | Hijri month name |
| `month.start` | Gregorian date of month start |
| `previous_month.name` | Previous Hijri month name |
| `previous_month.length` | Length of previous month |
| `evening.hijri_date` | Hijri date of the evening (e.g. "29 Sya'ban 1447 H") |
| `evening.gregorian_date` | Gregorian date of the evening |
| `evening.sunset` | Local sunset time |
| `evening.moonset` | Local moonset time |
| `evening.moon_alt_deg` | Moon altitude at sunset (degrees) |
| `evening.elongation_deg` | Moon-sun elongation (degrees) |
| `evening.illumination_pct` | Moon illumination percentage |
| `evening.age_hours` | Moon age in hours |
| `evening.visible` | Whether MABIMS criteria are met (`alt_ok` AND `elong_ok`) |
| `source` | `'mabims'` (curated table) or `'mabims-computed'` (algorithmic estimate) |
| `warnings` | Borderline months or computed fallback info |

---

### Low-Level API Functions

These bypass the cache and call the MABIMS API directly. Use them when you need fresh data or want to manage caching yourself.

| Function | Description |
|----------|-------------|
| `fetchToday(tz?)` | Fetch today's Hijri date from the API |
| `fetchConvert(date, calendar)` | Convert a date via the API |
| `fetchRange(start, end, calendar)` | Bulk range conversion via the API |
| `fetchMonth(year, month, calendar)` | Full month via the API |
| `fetchYear(year, calendar)` | Full year via the API |
| `fetchEvents(year, calendar)` | Islamic events via the API |
| `fetchHilalInfo(month, year)` | Hilal visibility data via the API |
| `fetchMeta()` | API metadata (coverage, version, etc.) |
| `fetchTable()` | Download the full calendar table (JSON) |

### Bundled Data Helpers

Access the bundled snapshot directly, without touching the API or cache.

```typescript
import { getBundledDate, getBundledRange } from 'mabims-hijri';

// Look up a single date (returns null if outside 2023–2026)
const hijri = getBundledDate('2026-08-31');
// { date: '1448-03-18', month_name: 'Rabiul Awal', ... }

const missing = getBundledDate('2030-01-01');
// null

// Check the date range covered by bundled data
getBundledRange();
// { start: '2023-01-23', end: '2026-12-31' }
```

---

### `setStorageAdapter(adapter)`

Provide a custom storage adapter for persistent caching. Useful for React Native or custom environments. Must be called **before** any other mabims-hijri functions.

```typescript
import { setStorageAdapter, type StorageAdapter } from 'mabims-hijri';

class MyStorage implements StorageAdapter {
  private prefix = 'mabims_';

  async get(key: string): Promise<string | null> {
    // Your custom storage logic
  }

  async set(key: string, value: string): Promise<void> {
    // Your custom storage logic
  }

  async has(key: string): Promise<boolean> {
    // Your custom storage logic
  }
}

setStorageAdapter(new MyStorage());
```

### `resetStorage()`

Reset back to the default storage (auto-detects environment).

```typescript
import { resetStorage } from 'mabims-hijri';

resetStorage();
```

---

## Error Handling

### What can go wrong?

- **Date outside bundled range** (after 2026) — requires a network call to the API. If you're offline, this will throw.
- **Network errors** — if the API is unreachable and the date isn't bundled.
- **Invalid input** — malformed date strings or invalid calendar values.

### Basic error handling

```typescript
import { today, convert } from 'mabims-hijri';

try {
  const date = await today();
  console.log(date.output.date);
} catch (e) {
  console.error('Could not get today\'s Hijri date:', e.message);
}
```

### Graceful fallback for offline-first apps

```typescript
import { isBundledDateAvailable, today } from 'mabims-hijri';

const todayStr = new Date().toISOString().split('T')[0];

if (isBundledDateAvailable(todayStr, 'gregorian')) {
  // Guaranteed to work offline
  const date = await today();
  renderDate(date.output);
} else {
  // Needs network — handle the offline case
  try {
    const date = await today();
    renderDate(date.output);
  } catch {
    renderOfflineMessage();
  }
}
```

---

## Usage by Framework

The package works in any JavaScript environment with `fetch`. Here's how to use it in common frameworks.

### JavaScript (vanilla)

```javascript
import { today, convert } from 'mabims-hijri';

// Get today's Hijri date
const date = await today();
console.log(date.output.date); // '1448-03-18'

// Convert a specific date
const hijri = await convert('2026-08-31');
console.log(hijri.output.month_name); // 'Rabiul Awal'
```

### React

```tsx
import { useState, useEffect } from 'react';
import { today, type HijriDate } from 'mabims-hijri';

function HijriDate() {
  const [date, setDate] = useState<HijriDate | null>(null);

  useEffect(() => {
    today().then((res) => setDate(res.output));
  }, []);

  if (!date) return <span>Loading...</span>;

  return (
    <span>
      {date.day} {date.month_name} {date.year} H
    </span>
  );
}
```

### React Native

Works out of the box — the package falls back to in-memory storage since React Native has no `localStorage`. If you want **persistent caching** across app restarts, use `setStorageAdapter` with `AsyncStorage`:

```typescript
// App.tsx or index.js — call this before any other mabims-hijri usage
import { setStorageAdapter, type StorageAdapter } from 'mabims-hijri';
import AsyncStorage from '@react-native-async-storage/async-storage';

class RNStorage implements StorageAdapter {
  private prefix = 'mabims_';

  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(this.prefix + key);
  }

  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(this.prefix + key, value);
  }

  async has(key: string): Promise<boolean> {
    const val = await AsyncStorage.getItem(this.prefix + key);
    return val !== null;
  }
}

setStorageAdapter(new RNStorage());
```

```bash
npm install @react-native-async-storage/async-storage
```

Then use the API normally in your components:

```tsx
import { useState, useEffect } from 'react';
import { today } from 'mabims-hijri';

function App() {
  const [hijriDate, setHijriDate] = useState('');

  useEffect(() => {
    today().then((res) => setHijriDate(res.output.date));
  }, []);

  return <Text>{hijriDate}</Text>;
}
```

### Node.js (server-side)

```typescript
import { today } from 'mabims-hijri';

const date = await today({ tz: 'Asia/Jakarta' });
console.log(date.output);
```

Works with Node.js 18+ (native `fetch`). No polyfill needed.

### Edge Runtimes (Cloudflare Workers, Vercel Edge, Deno)

```typescript
import { today } from 'mabims-hijri';

export default {
  async fetch(request: Request): Promise<Response> {
    const date = await today();
    return new Response(JSON.stringify(date), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
```

### TypeScript Imports

Full type definitions are included. Import types separately for tree-shaking:

```typescript
import type { HijriDate, TodayResponse, ConvertResponse, StorageAdapter } from 'mabims-hijri';
```

---

## Data Coverage

| Date Range | Source | Network Required? |
|------------|--------|-------------------|
| 2023-01-23 to 2026-12-31 | Bundled MABIMS table (Hijri 1444–1448) | No |
| After 2026 | Live API (computed Neo MABIMS) | Yes |

The bundled data is a snapshot of the official MABIMS calendar table. The live API extends this with algorithmic computation (Neo MABIMS) for dates beyond 2026, using astronomical data from the Skyfield library.

---

## CLI: Force-Sync Table Data

The package includes a CLI tool to manually sync the calendar table from the API:

```bash
# Download the latest table and print stats
npx mabims-sync

# Check if an update is available (no download)
npx mabims-sync --check
```

---

## Cache Configuration

The default cache TTL is **24 hours**. You can change it:

```typescript
import { setCacheTTL } from 'mabims-hijri';

// Cache for 1 hour
setCacheTTL(60 * 60 * 1000);

// Cache for 7 days
setCacheTTL(7 * 24 * 60 * 60 * 1000);
```

---

## Contributing

```bash
# Clone the repo
git clone https://github.com/PijarAdiluhung/mabims-hijri.git
cd mabims-hijri

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type-check without emitting
npm run lint
```

---

## License

MIT © [PIXO Studio](https://pixostudio.id)
