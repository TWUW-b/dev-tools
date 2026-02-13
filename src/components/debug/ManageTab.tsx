import { useState, useMemo, useCallback } from 'react';
import type { Note, Status } from '../../types';

interface ManageTabProps {
  notes: Note[];
  updateStatus: (id: number, status: Status, options?: { comment?: string; author?: string }) => Promise<boolean>;
}

export function ManageTab({ notes, updateStatus }: ManageTabProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(new Set(['fixed']));
  const [pendingFixed, setPendingFixed] = useState<{ id: number; status: Status } | null>(null);
  const [fixedComment, setFixedComment] = useState('');
  const [fixedError, setFixedError] = useState(false);

  const activeNotes = useMemo(() => {
    if (manageStatusFilter.size === 0) return notes;
    return notes.filter(n => manageStatusFilter.has(n.status));
  }, [notes, manageStatusFilter]);

  const handleStatusChange = useCallback(async (id: number, status: Status) => {
    if (status === 'fixed') {
      setPendingFixed({ id, status });
      setFixedComment('');
      setFixedError(false);
      return;
    }
    setLoadingAction(`status-${id}`);
    try {
      await updateStatus(id, status);
    } finally {
      setLoadingAction(null);
    }
  }, [updateStatus]);

  const handleFixedConfirm = useCallback(async () => {
    if (!pendingFixed) return;
    if (fixedComment.trim() === '') {
      setFixedError(true);
      return;
    }
    setLoadingAction(`status-${pendingFixed.id}`);
    try {
      await updateStatus(pendingFixed.id, pendingFixed.status, { comment: fixedComment.trim() });
      setPendingFixed(null);
      setFixedComment('');
      setFixedError(false);
    } finally {
      setLoadingAction(null);
    }
  }, [pendingFixed, fixedComment, updateStatus]);

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
              <div className="debug-note-info">
                <span className="debug-note-id">#{note.id}</span>
                <span className={`debug-severity-dot ${note.severity || 'none'}`} />
                <span className="debug-note-preview">
                  {note.source === 'test' && <span className="debug-source-badge">🧪</span>}
                  {note.content.split('\n')[0].slice(0, 40)}
                </span>
              </div>
              <select
                data-testid={`note-status-select-${note.id}`}
                className="debug-status-select"
                value={pendingFixed?.id === note.id ? 'fixed' : note.status}
                onChange={(e) => handleStatusChange(note.id, e.target.value as Status)}
                disabled={loadingAction !== null}
              >
                <option value="open">open</option>
                <option value="fixed">fixed</option>
                <option value="resolved">resolved</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
            {pendingFixed?.id === note.id && (
              <div className="debug-fixed-comment" style={{
                padding: '8px 12px 8px 28px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}>
                <textarea
                  value={fixedComment}
                  onChange={(e) => { setFixedComment(e.target.value); setFixedError(false); }}
                  placeholder="何を修正したか記入してください（必須）"
                  className="debug-fixed-textarea"
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    border: `1px solid ${fixedError ? '#EF4444' : '#ccc'}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    resize: 'vertical',
                    minHeight: '32px',
                    fontFamily: 'inherit',
                  }}
                  rows={2}
                  autoFocus
                />
                <button
                  onClick={handleFixedConfirm}
                  disabled={loadingAction !== null}
                  className="debug-fixed-confirm"
                  style={{
                    padding: '6px 12px',
                    background: '#6366F1',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  確定
                </button>
                <button
                  onClick={() => { setPendingFixed(null); setFixedComment(''); setFixedError(false); }}
                  className="debug-fixed-cancel"
                  style={{
                    padding: '6px 12px',
                    background: '#E5E7EB',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#374151',
                    fontSize: '12px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  取消
                </button>
              </div>
            )}
            {fixedError && pendingFixed?.id === note.id && (
              <div style={{ padding: '0 12px 8px 28px', fontSize: '11px', color: '#EF4444' }}>
                コメントは必須です
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
