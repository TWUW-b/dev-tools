import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, setDebugApiBaseUrl, getDebugApiBaseUrl } from './api';

/** text() を含むモックレスポンスを生成 */
function mockResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

describe('api', () => {
  beforeEach(() => {
    setDebugApiBaseUrl('/__debug/api');
    vi.resetAllMocks();
  });

  describe('setDebugApiBaseUrl / getDebugApiBaseUrl', () => {
    it('should set and get base URL', () => {
      setDebugApiBaseUrl('https://example.com/api');
      expect(getDebugApiBaseUrl()).toBe('https://example.com/api');
    });

    it('should remove trailing slash', () => {
      setDebugApiBaseUrl('https://example.com/api/');
      expect(getDebugApiBaseUrl()).toBe('https://example.com/api');
    });
  });

  describe('getNotes', () => {
    it('should fetch notes with correct URL', async () => {
      const mockNotes = [{ id: 1, title: 'Test', content: 'Content' }];
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, data: mockNotes })
      );

      const result = await api.getNotes({ env: 'dev' });

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes?env=dev&status=&q=&includeDeleted=0'
      );
      expect(result).toEqual(mockNotes);
    });

    it('should include status filter', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, data: [] })
      );

      await api.getNotes({ env: 'dev', status: 'open' });

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes?env=dev&status=open&q=&includeDeleted=0'
      );
    });

    it('should throw error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: false, error: 'Server error' })
      );

      await expect(api.getNotes({ env: 'dev' })).rejects.toThrow('Server error');
    });

    it('should throw on non-JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        text: () => Promise.resolve('<html>Bad Gateway</html>'),
      });

      await expect(api.getNotes({ env: 'dev' })).rejects.toThrow('HTTP 502');
    });
  });

  describe('createNote', () => {
    it('should create note with correct data', async () => {
      const mockNote = { id: 1, title: 'Test', content: 'Content' };
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, note: mockNote })
      );

      const result = await api.createNote('dev', {
        title: 'Test',
        content: 'Content',
      });

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes?env=dev',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result).toEqual(mockNote);
    });
  });

  describe('updateStatus', () => {
    it('should update status with correct data', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true })
      );

      await api.updateStatus('dev', 1, 'fixed');

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes/1/status?env=dev',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'fixed' }),
        })
      );
    });
  });

  describe('deleteNote', () => {
    it('should delete note', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true })
      );

      await api.deleteNote('dev', 1);

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes/1?env=dev',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('updateSeverity', () => {
    it('should update severity with correct data', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true })
      );

      await api.updateSeverity('dev', 1, 'high');

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes/1/severity?env=dev',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ severity: 'high' }),
        })
      );
    });

    it('should allow null severity', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true })
      );

      await api.updateSeverity('dev', 1, null);

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/notes/1/severity?env=dev',
        expect.objectContaining({
          body: JSON.stringify({ severity: null }),
        })
      );
    });
  });

  describe('importTestCases', () => {
    it('should import test cases', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, total: 5 })
      );

      const cases = [
        { domain: 'auth', capability: 'ログイン', title: 'ボタン表示' },
      ];
      const result = await api.importTestCases(cases);

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/test-cases/import',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ cases }),
        })
      );
      expect(result).toEqual({ total: 5 });
    });
  });

  describe('getTestTree', () => {
    it('should fetch test tree', async () => {
      const mockTree = [
        {
          domain: 'sample',
          capabilities: [
            { capability: '表示', total: 2, passed: 1, failed: 0, status: null, openIssues: 0, cases: [] },
          ],
        },
      ];
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, data: mockTree })
      );

      const result = await api.getTestTree('dev');

      expect(fetch).toHaveBeenCalledWith('/__debug/api/test-cases/tree?env=dev');
      expect(result).toEqual(mockTree);
    });
  });

  describe('submitTestRuns', () => {
    it('should submit test runs', async () => {
      const mockResp = {
        results: [
          { caseId: 1, runId: 1, result: 'pass' },
          { caseId: 2, runId: 2, result: 'fail', noteId: 5 },
        ],
        capability: { capability: '表示', total: 2, passed: 1, failed: 1, status: 'fail', openIssues: 1, cases: [] },
      };
      global.fetch = vi.fn().mockResolvedValue(
        mockResponse({ success: true, ...mockResp })
      );

      const runs = [
        { caseId: 1, result: 'pass' as const },
        { caseId: 2, result: 'fail' as const, note: { content: 'Bug found', severity: 'high' as const } },
      ];
      const result = await api.submitTestRuns('dev', runs);

      expect(fetch).toHaveBeenCalledWith(
        '/__debug/api/test-runs?env=dev',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ runs }),
        })
      );
      expect(result).toEqual(mockResp);
    });
  });
});
