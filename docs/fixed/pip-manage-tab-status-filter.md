# PiP 管理タブ: ステータスフィルタ追加

**Version:** 1.0.0
**Status:** draft

---

## 概要

PiP管理タブにマルチセレクトのステータスフィルタを追加する。
現在は全ノートが表示されるが、デフォルトで `resolved` のみ表示し、
ユーザーが必要に応じて `open`, `rejected`, `fixed` を追加選択できるようにする。

## 現状

- 管理タブは全ノートを表示（フィルタなし）
- `activeNotes` (L395) は `notes` そのまま
- データは `useDebugNotes` で全件取得済み（クライアント側フィルタで対応可能）

## 仕様

### デフォルト表示

`resolved` のみ選択状態（resolved ノートだけ表示）

### フィルタUI

タブ直下にチップ型のマルチセレクトを配置:

```
[open] [resolved ✓] [rejected] [fixed]
```

- 各チップをクリックでトグル（選択/非選択）
- 複数同時選択可（例: open + resolved）
- 選択中のチップはプライマリカラー背景
- 未選択はグレーアウト
- 最低1つは選択必須（全解除時は全件表示にフォールバック）

### 表示件数

フィルタ横に件数を表示: `3件`

## 変更箇所

### `src/components/DebugPanel.tsx`

#### 1. state 追加 (L78付近)

```typescript
const [manageStatusFilter, setManageStatusFilter] = useState<Set<Status>>(
  new Set(['resolved'])
);
```

#### 2. activeNotes のフィルタ (L395)

```typescript
// 変更前
const activeNotes = useMemo(() => notes, [notes]);

// 変更後
const activeNotes = useMemo(() => {
  if (manageStatusFilter.size === 0) return notes;
  return notes.filter(n => manageStatusFilter.has(n.status));
}, [notes, manageStatusFilter]);
```

#### 3. フィルタUI (L613、管理タブの先頭)

```tsx
{activeTab === 'manage' && (
  <div className="debug-manage">
    {/* ステータスフィルタ */}
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
    {/* 既存のノート一覧 */}
    ...
  </div>
)}
```

#### 4. スタイル追加 (getPipStyles)

```css
.debug-status-filter {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid ${COLORS.gray200};
}

.debug-status-chip {
  padding: 4px 10px;
  border: 1px solid ${COLORS.gray300};
  border-radius: 12px;
  background: ${COLORS.white};
  color: ${COLORS.gray500};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.debug-status-chip:hover {
  border-color: ${COLORS.primary};
  color: ${COLORS.primary};
}

.debug-status-chip.active {
  background: ${COLORS.primary};
  border-color: ${COLORS.primary};
  color: ${COLORS.white};
}

.debug-filter-count {
  font-size: 11px;
  color: ${COLORS.gray500};
  margin-left: auto;
}
```

## ステータス変更時の挙動

ノートのステータスを変更した場合（例: open → resolved）、
変更後のステータスがフィルタに含まれていなければ一覧から消える。
これは意図的な挙動（フィルタの目的通り）。

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/components/DebugPanel.tsx` | state追加、activeNotesフィルタ、UI追加、スタイル追加 |

型定義やAPI変更は不要。
