#!/usr/bin/env node

/**
 * mabims-sync - Force refresh bundled MABIMS data
 *
 * Usage:
 *   npx mabims-sync
 *   npx mabims-sync --check
 */

const BASE_URL = 'https://api.mabims.dev/api/v1';

async function checkVersion() {
  console.log('Checking for updates...');
  const response = await fetch(`${BASE_URL}/meta`);
  if (!response.ok) {
    throw new Error(`Failed to fetch meta: ${response.statusText}`);
  }
  const meta = await response.json();
  console.log(`Current API version: ${meta.data_version}`);
  console.log(`Coverage: ${meta.coverage.first} to ${meta.coverage.last}`);
  return meta;
}

async function fetchTable() {
  console.log('Fetching table from API...');
  const response = await fetch(`${BASE_URL}/table`);
  if (!response.ok) {
    throw new Error(`Failed to fetch table: ${response.statusText}`);
  }
  const table = await response.json();
  console.log(`Table version: ${table.version}`);
  console.log(`Gregorian entries: ${Object.keys(table.gregorian_to_hijri).length}`);
  console.log(`Hijri entries: ${Object.keys(table.hijri_to_gregorian).length}`);
  return table;
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');

  try {
    const meta = await checkVersion();

    if (checkOnly) {
      process.exit(0);
    }

    await fetchTable();
    console.log('\nSync complete! Table data is now up to date.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
