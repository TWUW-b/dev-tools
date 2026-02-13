import { useState, useMemo, useCallback } from 'react';
import type { Note, Status } from '../../types';

interface ManageTabProps {
  notes: Note[];
  updateStatus: (id: number, status: Status, options?: { comment?: string; author?: string }) => Promise<boolean>;
}

export function ManageTab({ notes, updateStatus }: ManageTabProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(new Set(['fixed']));
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

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
        {(['open', 'fixed', 'resolved', 'rejected'] as Status[]).map(s => (
          <button
            key={s}
            data-testid={`status-chip-${s}`}
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
          <div key={note.id}>
            <div className="debug-note-row" data-status={note.status}>
              <div
                className="debug-note-info"
                style={{ cursor: note.latest_comment ? 'pointer' : undefined }}
                onClick={() => {
                  if (!note.latest_comment) return;
                  setExpandedIds(prev => {
                    const next = new Set(prev);
                    if (next.has(note.id)) next.delete(note.id);
                    else next.add(note.id);
                    return next;
                  });
                }}
              >
                <span className="debug-note-id">#{note.id}</span>
                {note.latest_comment && (
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>
                    {expandedIds.has(note.id) ? '▲' : '▼'}
                  </span>
                )}
                <span className={`debug-severity-dot ${note.severity || 'none'}`} />
                <span className="debug-note-preview">
                  {note.source === 'test' && <span className="debug-source-badge">🧪</span>}
                  {note.content.split('\n')[0].slice(0, 40)}
                </span>
              </div>
              <select
                data-testid={`note-status-select-${note.id}`}
                className="debug-status-select"
                value={note.status}
                onChange={(e) => handleStatusChange(note.id, e.target.value as Status)}
                disabled={loadingAction !== null}
              >
                <option value="open">open</option>
                <option value="fixed">fixed</option>
                <option value="resolved">resolved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            {expandedIds.has(note.id) && note.latest_comment && (
              <div style={{
                padding: '4px 12px 6px 28px',
                fontSize: '11px',
                color: '#6B7280',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                💬 {note.latest_comment}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
