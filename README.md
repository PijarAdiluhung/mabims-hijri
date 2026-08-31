# mabims-hijri

> JavaScript client for [MABIMS.dev](https://mabims.dev) — the Indonesian Hijri calendar API.

[![npm version](https://img.shields.io/npm/v/mabims-hijri.svg)](https://www.npmjs.com/package/mabims-hijri)
[![license](https://img.shields.io/npm/l/mabims-hijri.svg)](https://github.com/PijarAdiluhung/mabims-hijri/blob/main/LICENSE)

**[mabims.dev](https://mabims.dev)** · **[GitHub](https://github.com/PijarAdiluhung/mabims-hijri)** · **[API Docs](https://mabims.dev/docs)**

---

## What is MABIMS?

[MABIMS.dev](https://mabims.dev) is an unofficial, free, open-source API that provides an ecosystem for the **Indonesian Hijri calendar** based on [MABIMS criteria](https://mabims.dev) from **Kementerian Agama Republik Indonesia**.

This NPM package wraps the MABIMS API with **offline-first** capabilities — bundled calendar data (2024–2026) means instant results with no network requests, while background refresh keeps your data up to date.

**Features:**

- **Offline-first** — bundled MABIMS data, instant results with no network
- **Self-refreshing** — silently checks for newer data in the background
- **TypeScript** — full type definitions, tree-shakeable exports
- **Isomorphic** — works in Node.js, browsers, and edge runtimes
- **Zero runtime deps** — only uses native `fetch`

## Install

```bash
npm install mabims-hijri
```

## Quick Start

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

## How It Works

1. **Instant** — reads from bundled MABIMS table (2024–2026)
2. **Offline** — works without internet, always
3. **Self-healing** — if date is outside bundled range AND online → fetches from API
4. **Background refresh** — silently updates cache when newer data is available

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Bundled    │ ──► │   Cache      │ ──► │   API       │
│  (static)   │     │  (memory)    │     │  (fallback) │
└─────────────┘     └──────────────┘     └─────────────┘
    Always            Instant              Only when
    available         access               needed
```

## API

### `today(options?)`

Returns today's Hijri date based on timezone.

```typescript
import { today } from 'mabims-hijri';

// Default: Asia/Jakarta
const date = await today();

// Custom timezone
constKL = await today({ tz: 'Asia/Kuala_Lumpur' });

// Force refresh from API
const fresh = await today({ forceRefresh: true });
```

**Options:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `tz` | `string` | `'Asia/Jakarta'` | IANA timezone |
| `forceRefresh` | `boolean` | `false` | Bypass cache, fetch from API |

**Returns:** `TodayResponse`

```typescript
interface TodayResponse {
  input: {
    date: string;        // '2026-08-31'
    calendar: string;    // 'gregorian'
    tz: string;          // 'Asia/Jakarta'
  };
  output: HijriDate;
  source: string;        // 'mabims' | 'mabims-computed'
  warnings: string[];
}

interface HijriDate {
  date: string;          // '1448-03-18'
  calendar: 'hijri';
  day: number;           // 18
  month: number;         // 3
  month_name: string;    // 'Rabiul Awal'
  year: number;          // 1448
}
```

### `convert(date, calendar?)`

Convert a date between Gregorian and Hijri. Uses bundled data when available.

```typescript
import { convert } from 'mabims-hijri';

// Gregorian → Hijri (default)
const hijri = await convert('2026-08-31');
console.log(hijri.output);
// { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }

// Hijri → Gregorian
const gregorian = await convert('1448-03-18', 'hijri');
console.log(gregorian.output);
// { date: '2026-08-31', calendar: 'gregorian' }
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | `string` | required | ISO date string (`YYYY-MM-DD`) |
| `calendar` | `'gregorian' \| 'hijri'` | `'gregorian'` | Input calendar type |
| `options.forceRefresh` | `boolean` | `false` | Bypass cache |

### `range(start, end, calendar?)`

Bulk conversion for a date range (max 45 days).

```typescript
import { range } from 'mabims-hijri';

const result = await range('2026-08-31', '2026-09-05');
console.log(result.count);  // 6
console.log(result.items);
// [
//   { input: '2026-08-31', output: '1448-03-18', ... },
//   { input: '2026-09-01', output: '1448-03-19', ... },
//   ...
// ]
```

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `start` | `string` | required | Start date (`YYYY-MM-DD`) |
| `end` | `string` | required | End date (`YYYY-MM-DD`) |
| `calendar` | `'gregorian' \| 'hijri'` | `'gregorian'` | Input calendar type |
| `options.forceRefresh` | `boolean` | `false` | Bypass cache |

**Returns:** `RangeResponse`

```typescript
interface RangeResponse {
  input: { start: string; end: string; calendar: string };
  count: number;
  items: DateItem[];
  warnings: string[];
}

interface DateItem {
  input: string;      // '2026-08-31'
  output: string;     // '1448-03-18'
  calendar: string;   // 'hijri'
  day: number;
  month: number;
  month_name: string;
  year: number;
}
```

### `getBundledDate(gregorianDate)`

Look up a Gregorian date in the bundled MABIMS table. Returns `null` if outside range.

```typescript
import { getBundledDate } from 'mabims-hijri';

const hijri = getBundledDate('2026-08-31');
// { date: '1448-03-18', month_name: 'Rabiul Awal', ... }

const missing = getBundledDate('2030-01-01');
// null
```

### `getBundledRange()`

Returns the date range covered by bundled data.

```typescript
import { getBundledRange } from 'mabims-hijri';

getBundledRange();
// { start: '2024-01-13', end: '2026-12-31' }
```

### `fetchToday(tz?)`

Direct API call (no cache). Use when you need fresh data.

```typescript
import { fetchToday } from 'mabims-hijri';

const data = await fetchToday('Asia/Jakarta');
```

### `fetchConvert(date, calendar)`

Convert a date via the API.

```typescript
import { fetchConvert } from 'mabims-hijri';

// Gregorian → Hijri
const hijri = await fetchConvert('2026-08-31', 'gregorian');

// Hijri → Gregorian
const greg = await fetchConvert('1448-03-18', 'hijri');
```

### `fetchMeta()`

Get API metadata (coverage, version, etc.).

```typescript
import { fetchMeta } from 'mabims-hijri';

const meta = await fetchMeta();
// { method: 'mabims', computed_active: true, coverage: { ... } }
```

### `month(year, month, calendar?)`

Get all days in a month with Hijri conversion.

```typescript
import { month } from 'mabims-hijri';

const august = await month(2026, 8);
console.log(august.count);  // 31
console.log(august.items[0]);
// { gregorian: '2026-08-01', hijri: '1448-02-18', source: 'mabims' }
```

### `year(year, calendar?)`

Get all days in a year (12 months).

```typescript
import { year } from 'mabims-hijri';

const data = await year(2026);
console.log(data.count);  // 365
console.log(Object.keys(data.months));  // ['1', '2', ..., '12']
```

### `events(year, calendar?)`

Get Islamic events for a year (Ramadan, Idul Fitri, etc.).

```typescript
import { events } from 'mabims-hijri';

const evts = await events(1446, 'hijri');
console.log(evts.events);
// [
//   { event: 'awal_ramadan', name: 'Awal Ramadan', hijri: '1446-09-01', gregorian: '2025-03-01' },
//   { event: 'idul_fitri', name: 'Idul Fitri', hijri: '1446-10-01', gregorian: '2025-03-31' },
//   ...
// ]
```

### `compare(date, options?)`

Get MABIMS Hijri date with source info.

```typescript
import { compare } from 'mabims-hijri';

const result = await compare('2026-08-31');
console.log(result.mabims);
// { date: '1448-03-18', calendar: 'hijri', month_name: 'Rabiul Awal', ... }
console.log(result.source);  // 'mabims'
```

## Error Handling

Dates outside bundled range (2024–2026) require network. If API is unavailable:

```typescript
import { today, convert } from 'mabims-hijri';

try {
  const date = await today();
  // Success
} catch (e) {
  // Offline + date not in bundled data
  console.log('Error:', e.message);
  // "Failed to fetch today: NetworkError"
}
```

**Graceful fallback:**

```typescript
import { isBundledDateAvailable, today } from 'mabims-hijri';

const todayStr = new Date().toISOString().split('T')[0];

if (isBundledDateAvailable(todayStr, 'gregorian')) {
  // Instant, offline
  const date = await today();
} else {
  // Needs network — handle offline case
  try {
    const date = await today();
  } catch {
    showOfflineMessage();
  }
}
```

## Edge Runtime

Works in Cloudflare Workers, Vercel Edge, Deno Deploy, etc.

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

## Browser

```typescript
import { today } from 'mabims-hijri';

const date = await today();
document.getElementById('hijri-date')!.textContent = date.output.date;
```

## TypeScript

Full type definitions included. Tree-shakeable — import only what you need.

```typescript
import type { HijriDate, TodayResponse, ConvertResponse } from 'mabims-hijri';
```

## Data Coverage

| Period | Source | Notes |
|--------|--------|-------|
| 2024–2026 | Bundled MABIMS table | Instant, offline |
| 2027+ | API (computed) | Requires network |

The bundled data covers **Hijri 1445–1448** (Gregorian 2024–2026). Dates outside this range fall back to the live API when online.

## CLI

Force-sync bundled data from the API:

```bash
# Sync table data
npx mabims-sync

# Check for updates only
npx mabims-sync --check
```

## Cache TTL

Configure how long cached data stays valid:

```typescript
import { setCacheTTL } from 'mabims-hijri';

// Set cache to 1 hour
setCacheTTL(60 * 60 * 1000);

// Set cache to 7 days
setCacheTTL(7 * 24 * 60 * 60 * 1000);
```

Default: 24 hours.

## Contributing

1. Clone the repo
2. `npm install`
3. `npm run build`
4. `npm test`

## License

MIT © [PIXO Studio](https://pixostudio.id)
