import { describe, it, expect } from 'vitest';
import { parseAdminDeepLink } from './adminDeepLink';

describe('parseAdminDeepLink', () => {
  it('?note= と ?feedback= を読む', () => {
    expect(parseAdminDeepLink('?note=12')).toEqual({ type: 'note', id: 12 });
    expect(parseAdminDeepLink('?env=dev&feedback=24')).toEqual({ type: 'feedback', id: 24 });
  });

  it('数字でない・0・無い場合は null', () => {
    expect(parseAdminDeepLink('?note=abc')).toBeNull();
    expect(parseAdminDeepLink('?note=0')).toBeNull();
    expect(parseAdminDeepLink('?feedback=-1')).toBeNull();
    expect(parseAdminDeepLink('')).toBeNull();
  });
});
