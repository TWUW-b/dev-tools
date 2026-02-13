import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDebugNotes } from './useDebugNotes';
import { api } from '../utils/api';

// api モジュールをモック
vi.mock('../utils/api', () => ({
  api: {
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateStatus: vi.fn(),
    deleteNote: vi.fn(),
  },
}));

const mockApi = api as {
  getNotes: ReturnType<typeof vi.fn>;
  createNote: ReturnType<typeof vi.fn>;
  updateStatus: ReturnType<typeof vi.fn>;
  deleteNote: ReturnType<typeof vi.fn>;
};

describe('useDebugNotes', () => {
  const mockNotes = [
    { id: 1, title: 'Note 1', content: 'Content 1', status: 'open' },
    { id: 2, title: 'Note 2', content: 'Content 2', status: 'fixed' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getNotes.mockResolvedValue(mockNotes);
  });

  it('should fetch notes on mount', async () => {
    const { result } = renderHook(() => useDebugNotes('dev'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi.getNotes).toHaveBeenCalledWith(expect.objectContaining({ env: 'dev' }));
    expect(result.current.notes).toEqual(mockNotes);
  });

  it('should create note and update list', async () => {
    const newNote = { id: 3, title: 'New', content: 'New content', status: 'open' };
    mockApi.createNote.mockResolvedValue(newNote);

    const { result } = renderHook(() => useDebugNotes('dev'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let createdNote;
    await act(async () => {
      createdNote = await result.current.createNote({
        title: 'New',
        content: 'New content',
      });
    });

    expect(createdNote).toEqual(newNote);
    expect(result.current.notes[0]).toEqual(newNote);
  });

  it('should update status', async () => {
    mockApi.updateStatus.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDebugNotes('dev'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success;
    await act(async () => {
      success = await result.current.updateStatus(1, 'fixed');
    });

    expect(success).toBe(true);
    expect(mockApi.updateStatus).toHaveBeenCalledWith('dev', 1, 'fixed');
    expect(result.current.notes.find(n => n.id === 1)?.status).toBe('fixed');
  });

  it('should delete note', async () => {
    mockApi.deleteNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDebugNotes('dev'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success;
    await act(async () => {
      success = await result.current.deleteNote(1);
    });

    expect(success).toBe(true);
    expect(mockApi.deleteNote).toHaveBeenCalledWith('dev', 1);
    expect(result.current.notes.find(n => n.id === 1)).toBeUndefined();
  });

  it('should handle fetch error', async () => {
    mockApi.getNotes.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDebugNotes('dev'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should refresh notes', async () => {
    const { result } = renderHook(() => useDebugNotes('dev'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi.getNotes).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockApi.getNotes).toHaveBeenCalledTimes(2);
    });
  });
});
