import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebugMode } from './useDebugMode';

describe('useDebugMode', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // window.location をモック
    delete (window as { location?: Location }).location;
    window.location = {
      ...originalLocation,
      hash: '',
    } as Location;
    localStorage.removeItem('debug-notes-mode');
  });

  afterEach(() => {
    window.location = originalLocation;
    localStorage.removeItem('debug-notes-mode');
  });

  it('should return false by default', () => {
    const { result } = renderHook(() => useDebugMode());
    expect(result.current.isDebugMode).toBe(false);
  });

  it('should return true when localStorage has debug-notes-mode=1', () => {
    localStorage.setItem('debug-notes-mode', '1');
    const { result } = renderHook(() => useDebugMode());
    expect(result.current.isDebugMode).toBe(true);
  });

  it('should return true when hash is #debug', () => {
    window.location.hash = '#debug';
    const { result } = renderHook(() => useDebugMode());
    expect(result.current.isDebugMode).toBe(true);
    // localStorage にも保存される
    expect(localStorage.getItem('debug-notes-mode')).toBe('1');
  });

  it('should return false when hash is not #debug and no localStorage', () => {
    window.location.hash = '#other';
    const { result } = renderHook(() => useDebugMode());
    expect(result.current.isDebugMode).toBe(false);
  });
});
