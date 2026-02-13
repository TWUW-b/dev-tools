import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createLogCapture } from './logCapture';

describe('createLogCapture', () => {
  describe('console capture', () => {
    let originalConsoleError: typeof console.error;
    let originalConsoleWarn: typeof console.warn;

    beforeEach(() => {
      originalConsoleError = console.error;
      originalConsoleWarn = console.warn;
    });

    afterEach(() => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    });

    it('should capture console.error', () => {
      const capture = createLogCapture({ console: true });

      console.error('Test error message');

      const logs = capture.getConsoleLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('error');
      expect(logs[0].message).toBe('Test error message');
      expect(logs[0].timestamp).toBeDefined();

      capture.destroy();
    });

    it('should capture console.warn', () => {
      const capture = createLogCapture({ console: true });

      console.warn('Test warning');

      const logs = capture.getConsoleLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      expect(logs[0].message).toBe('Test warning');

      capture.destroy();
    });

    it('should mask sensitive data in console logs', () => {
      const capture = createLogCapture({ console: true });

      console.error('Authorization: Bearer secret123');

      const logs = capture.getConsoleLogs();
      expect(logs[0].message).toContain('[MASKED]');
      expect(logs[0].message).not.toContain('secret123');

      capture.destroy();
    });

    it('should ignore deprecated levels config and capture all levels', () => {
      // levels は非推奨で無視される。error, warn, log は常にキャプチャされる
      const capture = createLogCapture({
        console: { levels: ['error'] },
      });

      console.error('Error message');
      console.warn('Warning message');

      const logs = capture.getConsoleLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('Error message');
      expect(logs[1].message).toBe('Warning message');

      capture.destroy();
    });

    it('should respect filter function', () => {
      const capture = createLogCapture({
        console: {
          filter: (msg) => msg.includes('important'),
        },
      });

      console.error('This is important');
      console.error('This is not');

      const logs = capture.getConsoleLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('This is important');

      capture.destroy();
    });

    it('should fallback to deprecated maxEntries for backward compatibility', () => {
      // maxEntries は非推奨。maxErrorEntries/maxLogEntries にフォールバック
      const capture = createLogCapture({
        console: { maxEntries: 3 },
      });

      console.error('Error 1');
      console.error('Error 2');
      console.error('Error 3');
      console.error('Error 4');

      const logs = capture.getConsoleLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Error 2');
      expect(logs[2].message).toBe('Error 4');

      capture.destroy();
    });

    it('should clear logs', () => {
      const capture = createLogCapture({ console: true });

      console.error('Error');
      expect(capture.getConsoleLogs()).toHaveLength(1);

      capture.clear();
      expect(capture.getConsoleLogs()).toHaveLength(0);

      capture.destroy();
    });

    it('should restore original console methods on destroy', () => {
      const capture = createLogCapture({ console: true });
      capture.destroy();

      // After destroy, console.error should be the original
      expect(console.error).toBe(originalConsoleError);
      expect(console.warn).toBe(originalConsoleWarn);
    });

    it('should stringify objects in console logs', () => {
      const capture = createLogCapture({ console: true });

      console.error('Data:', { foo: 'bar' });

      const logs = capture.getConsoleLogs();
      expect(logs[0].message).toContain('{"foo":"bar"}');

      capture.destroy();
    });
  });

  describe('network capture', () => {
    let originalFetch: typeof fetch;
    const baseUrl = 'http://localhost:3000';

    beforeEach(() => {
      originalFetch = window.fetch;
    });

    afterEach(() => {
      window.fetch = originalFetch;
    });

    // ネットワークテストはfetchをラップする仕組み上、
    // モックとの相互作用が複雑になるため、基本的な動作確認に絞る
    it('should restore original fetch on destroy', () => {
      const capture = createLogCapture({ network: ['/api/**'] });
      // capture時にfetchがラップされている
      expect(window.fetch).not.toBe(originalFetch);

      capture.destroy();
      // destroy後は元に戻る
      expect(window.fetch).toBe(originalFetch);
    });

    it('should not capture non-matching requests', async () => {
      // まずモックを設定
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
      });

      // 次にcaptureを作成（モックをラップ）
      const capture = createLogCapture({
        network: ['/api/**'],
      });

      await window.fetch(`${baseUrl}/other/endpoint`);

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(0);

      capture.destroy();
    });

    it('should exclude patterns when configured', async () => {
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
      });

      const capture = createLogCapture({
        network: {
          include: ['/api/**'],
          exclude: ['/api/health'],
        },
      });

      await window.fetch(`${baseUrl}/api/health`);

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(0);

      capture.destroy();
    });

    it('should capture matching network requests', async () => {
      // モックを先に設定
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        headers: new Headers(),
      });

      // その後captureを作成
      const capture = createLogCapture({
        network: ['/api/**'],
      });

      await window.fetch(`${baseUrl}/api/notes`);

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].url).toBe(`${baseUrl}/api/notes`);
      expect(logs[0].method).toBe('GET');
      expect(logs[0].status).toBe(200);

      capture.destroy();
    });

    it('should capture POST method', async () => {
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        headers: new Headers(),
      });

      const capture = createLogCapture({
        network: ['/api/**'],
      });

      await window.fetch(`${baseUrl}/api/notes`, { method: 'POST', body: '{}' });

      const logs = capture.getNetworkLogs();
      expect(logs[0].method).toBe('POST');
      expect(logs[0].status).toBe(201);

      capture.destroy();
    });

    it('should capture full URLs when pattern starts with http', async () => {
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        headers: new Headers(),
      });

      const capture = createLogCapture({
        network: ['http://localhost:8081/**'],
      });

      await window.fetch('http://localhost:8081/notes');

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(1);

      capture.destroy();
    });

    it('should only capture errors when errorOnly is true', async () => {
      window.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, status: 200, headers: new Headers() })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          clone: () => ({ json: () => Promise.resolve({}) }),
          headers: new Headers(),
        });

      const capture = createLogCapture({
        network: {
          include: ['/api/**'],
          errorOnly: true,
        },
      });

      await window.fetch(`${baseUrl}/api/success`);
      await window.fetch(`${baseUrl}/api/error`);

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe(500);

      capture.destroy();
    });

    it('should capture request body when configured', async () => {
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        headers: new Headers(),
      });

      const capture = createLogCapture({
        network: {
          include: ['/api/**'],
          captureRequestBody: true,
        },
      });

      await window.fetch(`${baseUrl}/api/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: 'test' }),
      });

      const logs = capture.getNetworkLogs();
      expect(logs[0].requestBody).toEqual({ content: 'test' });

      capture.destroy();
    });

    it('should mask sensitive headers when configured', async () => {
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const capture = createLogCapture({
        network: {
          include: ['/api/**'],
          captureHeaders: true,
        },
      });

      await window.fetch(`${baseUrl}/api/notes`, {
        headers: {
          'Authorization': 'Bearer secret',
          'Content-Type': 'application/json',
        },
      });

      const logs = capture.getNetworkLogs();
      expect(logs[0].requestHeaders?.['authorization']).toBe('***MASKED***');
      expect(logs[0].requestHeaders?.['content-type']).toBe('application/json');

      capture.destroy();
    });

    it('should handle fetch errors', async () => {
      window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const capture = createLogCapture({
        network: ['/api/**'],
      });

      await expect(window.fetch(`${baseUrl}/api/notes`)).rejects.toThrow('Network error');

      const logs = capture.getNetworkLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].status).toBe(0);

      capture.destroy();
    });
  });

  describe('combined capture', () => {
    it('should capture both console and network logs', async () => {
      const originalFetch = window.fetch;

      // モックを先に設定
      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ json: () => Promise.resolve({}) }),
        headers: new Headers(),
      });

      // その後captureを作成
      const capture = createLogCapture({
        console: true,
        network: ['/api/**'],
      });

      console.error('Error happened');
      await window.fetch('http://localhost:3000/api/notes');

      expect(capture.getConsoleLogs()).toHaveLength(1);
      expect(capture.getNetworkLogs()).toHaveLength(1);

      capture.destroy();
      window.fetch = originalFetch;
    });

    it('should clear both logs', async () => {
      const originalFetch = window.fetch;

      window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ json: () => Promise.resolve({}) }),
        headers: new Headers(),
      });

      const capture = createLogCapture({
        console: true,
        network: ['/api/**'],
      });

      console.error('Error');
      await window.fetch('http://localhost:3000/api/notes');

      capture.clear();

      expect(capture.getConsoleLogs()).toHaveLength(0);
      expect(capture.getNetworkLogs()).toHaveLength(0);

      capture.destroy();
      window.fetch = originalFetch;
    });
  });
});
