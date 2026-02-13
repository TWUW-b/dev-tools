import { useState, useMemo, useCallback } from 'react';
import type { Note, Status } from '../../types';

interface ManageTabProps {
  notes: Note[];
  updateStatus: (id: number, status: Status) => Promise<boolean>;
}

export function ManageTab({ notes, updateStatus }: ManageTabProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(new Set(['resolved']));

  const activeNotes = useMemo(() => {
    if (manageStatusFilter.size === 0) return notes;
    return notes.filter(n => manageStatusFilter.has(n.status));
  }, [notes, manageStatusFilter]);

  const handleStatusChange = useCallback(async (id: number, status: Status) => {
    setLoadingAction(`status-${id}`);
    try {
      await updateStatus(id, status);
    } finally {
      setLoadingAction(null);
    }
  }, [updateStatus]);

  return (
    <div className="debug-manage">
      <div className="debug-status-filter">
        {(['open', 'resolved', 'rejected', 'fixed'] as Status[]).map(s => (
          <button
            key={s}
            className={`debug-status-chip ${manageStatusFilter.has(s) ? 'active' : ''}`}
            onClick={() => {
              setManageStatusFilter(prev => {
                const next = new Set(prev);
                if (next.has(s)) {
                  next.delete(s);
                } else {
                  next.add(s);
                }
                return next;
              });
            }}
          >
            {s}
          </button>
        ))}
        <span className="debug-filter-count">{activeNotes.length}件</span>
      </div>
      {activeNotes.length === 0 ? (
        <div className="debug-empty">対応中のノートはありません</div>
      ) : (
        activeNotes.map(note => (
          <div key={note.id} className="debug-note-row" data-status={note.status}>
            <div className="debug-note-info">
              <span className="debug-note-id">#{note.id}</span>
              <span className={`debug-severity-dot ${note.severity || 'none'}`} />
              <span className="debug-note-preview">
                {note.source === 'test' && <span className="debug-source-badge">🧪</span>}
                {note.content.split('\n')[0].slice(0, 40)}
              </span>
            </div>
            <select
              className="debug-status-select"
              value={note.status}
              onChange={(e) => handleStatusChange(note.id, e.target.value as Status)}
              disabled={loadingAction !== null}
            >
              <option value="open">open</option>
              <option value="resolved">resolved</option>
              <option value="rejected">rejected</option>
              <option value="fixed">fixed</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}
