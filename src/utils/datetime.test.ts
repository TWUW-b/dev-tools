import { describe, it, expect } from 'vitest';
import { parseDbDate, formatJstDateTime, formatJstShort } from './datetime';

describe('parseDbDate', () => {
  it('treats SQLite "YYYY-MM-DD HH:MM:SS" (no TZ) as UTC', () => {
    const d = parseDbDate('2026-05-29 09:00:00');
    expect(d.toISOString()).toBe('2026-05-29T09:00:00.000Z');
  });

  it('keeps explicit Z timezone as-is', () => {
    const d = parseDbDate('2026-05-29T09:00:00Z');
    expect(d.toISOString()).toBe('2026-05-29T09:00:00.000Z');
  });

  it('keeps explicit +09:00 offset as-is', () => {
    const d = parseDbDate('2026-05-29T18:00:00+09:00');
    expect(d.toISOString()).toBe('2026-05-29T09:00:00.000Z');
  });

  it('returns Invalid Date for empty input', () => {
    expect(isNaN(parseDbDate('').getTime())).toBe(true);
    expect(isNaN(parseDbDate(null).getTime())).toBe(true);
    expect(isNaN(parseDbDate(undefined).getTime())).toBe(true);
  });
});

describe('formatJstDateTime / formatJstShort', () => {
  it('renders UTC stored time in JST (09:00 UTC -> 18:00 JST)', () => {
    expect(formatJstDateTime('2026-05-29 09:00:00')).toContain('18:00');
    expect(formatJstShort('2026-05-29 09:00:00')).toContain('18:00');
  });

  it('crosses date boundary correctly (23:30 UTC -> 08:30 JST next day)', () => {
    // 2026-05-29 23:30 UTC は JST で 2026-05-30 08:30
    expect(formatJstShort('2026-05-29 23:30:00')).toContain('08:30');
  });

  it('returns "-" for empty input', () => {
    expect(formatJstDateTime('')).toBe('-');
    expect(formatJstShort(null)).toBe('-');
  });
});
