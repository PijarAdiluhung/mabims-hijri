import { TodayResponse, ConvertResponse, MetaResponse } from './types';

const BASE_URL = 'https://api.mabims.dev/api/v1';

export async function fetchToday(tz: string = 'Asia/Jakarta'): Promise<TodayResponse> {
  const url = new URL(`${BASE_URL}/today`);
  url.searchParams.set('tz', tz);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch today: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchConvert(
  date: string,
  calendar: 'hijri' | 'gregorian'
): Promise<ConvertResponse> {
  const url = new URL(`${BASE_URL}/convert`);
  url.searchParams.set('date', date);
  url.searchParams.set('calendar', calendar);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to convert date: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchMeta(): Promise<MetaResponse> {
  const response = await fetch(`${BASE_URL}/meta`);
  if (!response.ok) {
    throw new Error(`Failed to fetch meta: ${response.statusText}`);
  }
  
  return response.json();
}
