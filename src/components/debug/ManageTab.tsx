import { useState, useMemo, useCallback } from 'react';
import type { Note, Status } from '../../types';

type ManageView = 'list' | 'checklist';

interface ManageTabProps {
  notes: Note[];
  updateStatus: (id: number, status: Status, options?: { comment?: string; author?: string }) => Promise<boolean>;
}

/**
 * latest_comment からチェックリスト項目を抽出
 * 「- 」で始まる行をリスト項目として扱う
 */
function parseChecklistItems(comment: string): string[] {
  return comment
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- '))
    .map(line => line.slice(2).trim())
    .filter(Boolean);
}

export function ManageTab({ notes, updateStatus }: ManageTabProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(new Set(['fixed']));
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [view, setView] = useState<ManageView>('list');
  // チェック状態: { noteId: Set<itemIndex> }
  const [checkedItems, setCheckedItems] = useState<Record<number, Set<number>>>({});

  const activeNotes = useMemo(() => {
    if (manageStatusFilter.size === 0) return notes;
    return notes.filter(n => manageStatusFilter.has(n.status));
  }, [notes, manageStatusFilter]);

  const fixedNotes = useMemo(() => {
    return notes.filter(n => n.status === 'fixed');
  }, [notes]);

  const handleStatusChange = useCallback(async (id: number, status: Status) => {
    setLoadingAction(`status-${id}`);
    try {
      await updateStatus(id, status);
      // resolved にしたらチェック状態をクリア
      if (status === 'resolved') {
        setCheckedItems(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } finally {
      setLoadingAction(null);
    }
  }, [updateStatus]);

  const toggleCheck = useCallback((noteId: number, itemIndex: number) => {
    setCheckedItems(prev => {
      const current = prev[noteId] ?? new Set<number>();
      const next = new Set(current);
      if (next.has(itemIndex)) {
        next.delete(itemIndex);
      } else {
        next.add(itemIndex);
      }
      return { ...prev, [noteId]: next };
    });
  }, []);

  return (
    <div className="debug-manage">
      {/* ビュー切り替え + ステータスフィルタ */}
      <div className="debug-manage-toolbar">
        <div className="debug-view-toggle">
          <button
            className={`debug-view-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            <span className="debug-icon" style={{ fontSize: '16px' }}>list</span>
            一覧
          </button>
          <button
            className={`debug-view-btn ${view === 'checklist' ? 'active' : ''}`}
            onClick={() => setView('checklist')}
          >
            <span className="debug-icon" style={{ fontSize: '16px' }}>checklist</span>
            確認手順
            {fixedNotes.length > 0 && (
              <span className="debug-view-badge">{fixedNotes.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* 一覧ビュー */}
      {view === 'list' && (
        <>
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
                    {note.latest_comment}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* 確認手順ビュー */}
      {view === 'checklist' && (
        <div className="debug-checklist-view">
          {fixedNotes.length === 0 ? (
            <div className="debug-empty">fixed のノートはありません</div>
          ) : (
            fixedNotes.map(note => {
              const items = parseChecklistItems(note.latest_comment || '');
              const checked = checkedItems[note.id] ?? new Set<number>();
              const allChecked = items.length > 0 && checked.size === items.length;

              return (
                <div key={note.id} className="debug-checklist-card">
                  <div className="debug-checklist-header">
                    <span className="debug-note-id">#{note.id}</span>
                    <span className="debug-checklist-title">
                      {note.content.split('\n')[0].slice(0, 50)}
                    </span>
                  </div>

                  {items.length > 0 ? (
                    <div className="debug-checklist-items">
                      {items.map((item, i) => (
                        <label key={i} className="debug-checklist-item">
                          <input
                            type="checkbox"
                            checked={checked.has(i)}
                            onChange={() => toggleCheck(note.id, i)}
                          />
                          <span className={checked.has(i) ? 'debug-checklist-done' : ''}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="debug-checklist-no-items">
                      確認手順が登録されていません
                    </div>
                  )}

                  <div className="debug-checklist-actions">
                    <span className="debug-checklist-progress">
                      {checked.size}/{items.length}
                    </span>
                    <button
                      className="debug-btn debug-btn-resolve"
                      disabled={!allChecked || loadingAction !== null}
                      onClick={() => handleStatusChange(note.id, 'resolved')}
                    >
                      {loadingAction === `status-${note.id}` ? '更新中...' : 'resolved に変更'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
