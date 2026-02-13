import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import type { Note, NoteInput, Environment, Status, Severity, UseDebugNotesReturn } from '../types';

/**
 * デバッグノート CRUD フック
 */
export function useDebugNotes(env: Environment = 'dev'): UseDebugNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ノート一覧を取得
  useEffect(() => {
    let cancelled = false;

    const fetchNotes = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getNotes({ env });
        if (!cancelled) {
          setNotes(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNotes();

    return () => {
      cancelled = true;
    };
  }, [env, refreshTrigger]);

  // ノートを作成
  const createNote = useCallback(
    async (input: NoteInput): Promise<Note | null> => {
      try {
        const note = await api.createNote(env, input);
        setNotes((prev) => [note, ...prev]);
        return note;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [env]
  );

  // ステータスを更新
  const updateStatus = useCallback(
    async (id: number, status: Status): Promise<boolean> => {
      try {
        await api.updateStatus(env, id, status);
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? { ...note, status } : note))
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [env]
  );

  // 重要度を更新
  const updateSeverity = useCallback(
    async (id: number, severity: Severity | null): Promise<boolean> => {
      try {
        await api.updateSeverity(env, id, severity);
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? { ...note, severity } : note))
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [env]
  );

  // ノートを削除
  const deleteNote = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api.deleteNote(env, id);
        setNotes((prev) => prev.filter((note) => note.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [env]
  );

  // 再読み込み
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    notes,
    loading,
    error,
    createNote,
    updateStatus,
    updateSeverity,
    deleteNote,
    refresh,
  };
}
