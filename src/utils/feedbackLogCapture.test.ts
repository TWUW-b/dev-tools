import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFeedbackLogCapture } from './feedbackLogCapture';
import type { FeedbackLogCapture } from '../types';

describe('createFeedbackLogCapture', () => {
  let originalConsoleLog: typeof console.log;
  let originalConsoleWarn: typeof console.warn;
  let originalConsoleError: typeof console.error;
  let originalFetch: typeof window.fetch;
  let capture: FeedbackLogCapture | null = null;

  beforeEach(() => {
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    originalFetch = window.fetch;
  });

  afterEach(() => {
    // Always destroy to reset singleton state
    if (capture) {
      capture.destroy();
      capture = null;
    }
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    window.fetch = originalFetch;
  });

  describe('console capture', () => {
    it('should capture console.error', () => {
      capture = createFeedbackLogCapture();
      console.error('Test error');
      const logs = capture.getConsoleLogs();
      expect(logs.some(l => l.level === 'error' && l.message === 'Test error')).toBe(true);
    });

    it('should capture console.warn', () => {
      capture = createFeedbackLogCapture();
      console.warn('Test warning');
      const logs = capture.getConsoleLogs();
      expect(logs.some(l => l.level === 'warn' && l.message === 'Test warning')).toBe(true);
    });

    it('should capture console.log', () => {
      capture = createFeedbackLogCapture();
      console.log('Test log');
      const logs = capture.getConsoleLogs();
      expect(logs.some(l => l.level === 'log' && l.message === 'Test log')).toBe(true);
    });

    it('should mask sensitive data', () => {
      capture = createFeedbackLogCapture();
      console.error('Authorization: Bearer secret123');
      const logs = capture.getConsoleLogs();
      const msg = logs.find(l => l.level === 'error')?.message ?? '';
      expect(msg).toContain('[MASKED]');
      expect(msg).not.toContain('secret123');
    });

    it('should respect maxConsoleLogs', () => {
      capture = createFeedbackLogCapture({ maxConsoleLogs: 3 });
      for (let i = 0; i < 10; i++) {
        console.log(`Log ${i}`);
      }
      const logs = capture.getConsoleLogs();
      const generals = logs.filter(l => l.level === 'log');
      expect(generals.length).toBe(3);
    });

    it('should separate error and general logs', () => {
      capture = createFeedbackLogCapture({ maxConsoleLogs: 2 });
      console.error('Error 1');
      console.error('Error 2');
      console.error('Error 3');
      console.log('Log 1');
      console.log('Log 2');
      console.log('Log 3');

      const logs = capture.getConsoleLogs();
      const errors = logs.filter(l => l.level === 'error');
      const generals = logs.filter(l => l.level === 'log');
      expect(errors.length).toBe(2);
      expect(generals.length).toBe(2);
    });
  });

  describe('network capture', () => {
    it('should capture fetch requests', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = async () => mockResponse;
      capture = createFeedbackLogCapture();

      await window.fetch('https://example.com/api/data');

      const logs = capture.getNetworkLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].url).toContain('example.com');
      expect(logs[0].status).toBe(200);
      expect(logs[0].method).toBe('GET');
    });

    it('should capture failed fetch requests', async () => {
      window.fetch = async () => { throw new Error('Network error'); };
      capture = createFeedbackLogCapture();

      try {
        await window.fetch('https://example.com/fail');
      } catch {
        // expected
      }

      const logs = capture.getNetworkLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe(0);
    });

    it('should respect networkExclude', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = async () => mockResponse;
      capture = createFeedbackLogCapture({
        networkExclude: ['https://fonts.googleapis.com'],
      });

      await window.fetch('https://fonts.googleapis.com/css');
      await window.fetch('https://example.com/api');

      const logs = capture.getNetworkLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].url).toContain('example.com');
    });

    it('should respect networkInclude', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = async () => mockResponse;
      capture = createFeedbackLogCapture({
        networkInclude: ['/api/'],
      });

      await window.fetch('https://example.com/api/data');
      await window.fetch('https://example.com/static/file');

      const logs = capture.getNetworkLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].url).toContain('/api/');
    });

    it('should respect maxNetworkLogs', async () => {
      const mockResponse = new Response('OK', { status: 200 });
      window.fetch = async () => mockResponse;
      capture = createFeedbackLogCapture({ maxNetworkLogs: 2 });

      for (let i = 0; i < 5; i++) {
        await window.fetch(`https://example.com/api/${i}`);
      }

      const logs = capture.getNetworkLogs();
      expect(logs.length).toBe(2);
    });
  });

  describe('lifecycle', () => {
    it('should clear logs', () => {
      capture = createFeedbackLogCapture();
      console.error('Error');
      console.log('Log');
      expect(capture.getConsoleLogs().length).toBeGreaterThan(0);

      capture.clear();
      expect(capture.getConsoleLogs().length).toBe(0);
      expect(capture.getNetworkLogs().length).toBe(0);
    });

    it('should restore originals on destroy', () => {
      const beforeLog = console.log;
      const beforeFetch = window.fetch;

      capture = createFeedbackLogCapture();
      // After creation, console methods should be patched
      expect(console.log).not.toBe(beforeLog);

      capture.destroy();
      capture = null; // already destroyed
      expect(console.log).toBe(beforeLog);
      expect(window.fetch).toBe(beforeFetch);
    });

    it('should handle singleton with ref counting', () => {
      capture = createFeedbackLogCapture();
      const c2 = createFeedbackLogCapture();

      console.error('Shared error');
      expect(capture.getConsoleLogs().length).toBeGreaterThan(0);
      expect(c2.getConsoleLogs().length).toBeGreaterThan(0);

      // First destroy (c2) doesn't restore — capture still active
      const patchedLog = console.log;
      c2.destroy();
      expect(console.log).toBe(patchedLog);

      // Second destroy (capture) restores originals
      capture.destroy();
      capture = null;
    });
  });
});
