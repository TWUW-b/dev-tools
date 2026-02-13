import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postFeedback, getFeedbacks, getFeedbackDetail, updateFeedbackStatus, deleteFeedback } from './feedbackApi';

describe('feedbackApi', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetch(response: unknown, status = 200) {
    global.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    });
  }

  describe('postFeedback', () => {
    it('should post feedback and return data', async () => {
      const feedbackData = { id: 1, kind: 'bug', message: 'test', status: 'open', createdAt: '', updatedAt: '' };
      mockFetch({ success: true, data: feedbackData });

      const result = await postFeedback({
        apiBaseUrl: 'https://example.com/api',
        body: { kind: 'bug', message: 'test' },
      });

      expect(result).toEqual(feedbackData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/feedbacks',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw on failure', async () => {
      mockFetch({ success: false, error: 'Invalid kind' });

      await expect(
        postFeedback({
          apiBaseUrl: 'https://example.com/api',
          body: { kind: 'invalid', message: 'test' },
        }),
      ).rejects.toThrow('Invalid kind');
    });

    it('should reject invalid protocol', async () => {
      await expect(
        postFeedback({
          apiBaseUrl: 'ftp://example.com/api',
          body: { kind: 'bug', message: 'test' },
        }),
      ).rejects.toThrow('Invalid API base URL protocol');
    });
  });

  describe('getFeedbacks', () => {
    it('should fetch feedbacks with admin key', async () => {
      const responseData = { success: true, data: [], total: 0, page: 1, limit: 20, customTags: [] };
      mockFetch(responseData);

      const result = await getFeedbacks({
        apiBaseUrl: 'https://example.com/api',
        adminKey: 'test-key',
      });

      expect(result.data).toEqual([]);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/feedbacks',
        expect.objectContaining({
          headers: { 'X-Admin-Key': 'test-key' },
        }),
      );
    });

    it('should pass query params', async () => {
      mockFetch({ success: true, data: [], total: 0, page: 1, limit: 20, customTags: [] });

      await getFeedbacks({
        apiBaseUrl: 'https://example.com/api',
        adminKey: 'key',
        query: { status: 'open', kind: 'bug' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=open'),
        expect.any(Object),
      );
    });

    it('should throw on failure', async () => {
      mockFetch({ success: false, error: 'Unauthorized' });

      await expect(
        getFeedbacks({
          apiBaseUrl: 'https://example.com/api',
          adminKey: 'bad-key',
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('getFeedbackDetail', () => {
    it('should fetch single feedback', async () => {
      const feedback = { id: 1, kind: 'bug', message: 'test', status: 'open', createdAt: '', updatedAt: '' };
      mockFetch({ success: true, data: feedback });

      const result = await getFeedbackDetail({
        apiBaseUrl: 'https://example.com/api',
        adminKey: 'key',
        id: 1,
      });

      expect(result).toEqual(feedback);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/feedbacks/1',
        expect.objectContaining({
          headers: { 'X-Admin-Key': 'key' },
        }),
      );
    });
  });

  describe('updateFeedbackStatus', () => {
    it('should update status', async () => {
      const updated = { id: 1, status: 'closed', updatedAt: '2025-01-01' };
      mockFetch({ success: true, data: updated });

      const result = await updateFeedbackStatus({
        apiBaseUrl: 'https://example.com/api',
        adminKey: 'key',
        id: 1,
        status: 'closed',
      });

      expect(result.status).toBe('closed');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/feedbacks/1/status',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Key': 'key' },
        }),
      );
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback', async () => {
      mockFetch({ success: true });

      await deleteFeedback({
        apiBaseUrl: 'https://example.com/api',
        adminKey: 'key',
        id: 1,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/feedbacks/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'X-Admin-Key': 'key' },
        }),
      );
    });

    it('should throw on failure', async () => {
      mockFetch({ success: false, error: 'Not found' });

      await expect(
        deleteFeedback({
          apiBaseUrl: 'https://example.com/api',
          adminKey: 'key',
          id: 999,
        }),
      ).rejects.toThrow('Not found');
    });
  });
});
