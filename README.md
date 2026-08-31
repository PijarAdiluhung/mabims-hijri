# mabims

MABIMS Hijri calendar NPM package — offline-first, self-refreshing.

## Install

```bash
npm install mabims
```

## Usage

```typescript
import { today } from 'mabims';

// Get today's Hijri date (works offline!)
const date = await today();
console.log(date.output);
// { date: '1448-03-14', calendar: 'hijri', day: 14, month: 3, month_name: 'Rabiul Akhir', year: 1448 }
```

## Features

- **Offline-first** — reads from bundled data (2024–2026), no network wait
- **Self-refreshing** — checks for newer data in background
- **TypeScript** — full type definitions included
- **Isomorphic** — works in Node.js and browsers

## API

### `today(options?)`

Returns today's Hijri date.

```typescript
const date = await today({ tz: 'Asia/Jakarta' });
```

Options:
- `tz` — IANA timezone (default: `Asia/Jakarta`)
- `forceRefresh` — bypass cache (default: `false`)

### `shouldRefreshData()`

Check if newer data is available from the API.

## License

MIT
