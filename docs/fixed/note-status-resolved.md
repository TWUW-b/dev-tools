# ノートステータス「resolved」追加

## 概要

ノートのステータスフローに中間状態 `resolved`（対応済み）を追加。

```
open → resolved → fixed
         ↓
        open（差し戻し）
```

## 背景

現状の `open` → `fixed` では、`fixed` にした瞬間に `openIssues` が 0 になるが、
その時点で既に確認済みのため retest 表示が意味をなさない。

`resolved` があることで:
1. 開発者がコード修正後 `resolved` にする
2. `openIssues` が 0 になり、テストツリーが **retest** 表示になる
3. テスターが再テスト → pass なら `fixed` に、fail なら `open` に差し戻し

`resolved` は **retest フローの必須前提**。

## ステータス定義

| status | 意味 | 操作者 |
|--------|------|--------|
| `open` | 未対応 | テスター（報告時） |
| `resolved` | 対応済み・再テスト待ち | 開発者 |
| `fixed` | 修正確認済み（最終） | テスター |

## 遷移ルール

| from → to | 許可 | 備考 |
|-----------|------|------|
| `open` → `resolved` | Yes | 開発者が対応完了 |
| `resolved` → `fixed` | Yes | テスターが再テストで確認 |
| `resolved` → `open` | Yes | 再テストで問題継続、差し戻し |
| `open` → `fixed` | No | `resolved` を経由する必要あり |
| `fixed` → `*` | No | 最終状態、変更不可 |

## retest との関係

`open_issues` クエリは `WHERE n.status = 'open'` で集計している。

```
resolved にする → openIssues = 0 → テストツリーが retest 表示
open に差し戻す → openIssues > 0 → テストツリーが fail 表示に戻る
```

`ui-improvements-v1.1.md` の retest ロジック（`last === 'fail' && openIssues === 0`）と自然に連携する。

---

## ファイル変更

### 1. `src/types/index.ts`

```typescript
// L5: Status 型に resolved 追加
export type Status = 'open' | 'resolved' | 'fixed';
```

### 2. `api/NotesController.php` — updateStatus()

現状:
```php
if (!in_array($status, ['open', 'fixed'], true)) {
    return ['success' => false, 'error' => 'Invalid status'];
}
if ($status === 'open') {
    $note = $this->db->fetchOne(...);
    if ($note && $note['status'] === 'fixed') {
        return ['success' => false, 'error' => 'Cannot reopen a fixed note'];
    }
}
```

変更後:
```php
public function updateStatus(int $id, array $input): array
{
    $status = $input['status'] ?? null;
    if (!in_array($status, ['open', 'resolved', 'fixed'], true)) {
        return ['success' => false, 'error' => 'Invalid status'];
    }

    $note = $this->db->fetchOne(
        'SELECT status FROM notes WHERE id = ? AND deleted_at IS NULL',
        [$id]
    );
    if (!$note) {
        return ['success' => false, 'error' => 'Note not found'];
    }

    $currentStatus = $note['status'];
    if ($currentStatus === $status) {
        return ['success' => true]; // 同一ステータス、no-op
    }

    $allowed = [
        'open'     => ['resolved'],
        'resolved' => ['open', 'fixed'],
        'fixed'    => [],
    ];

    if (!in_array($status, $allowed[$currentStatus] ?? [], true)) {
        return [
            'success' => false,
            'error' => "Cannot transition from {$currentStatus} to {$status}",
        ];
    }

    $this->db->execute(
        'UPDATE notes SET status = ? WHERE id = ? AND deleted_at IS NULL',
        [$status, $id]
    );

    return ['success' => true];
}
```

### 3. `src/components/DebugPanel.tsx` — PiP 管理タブ

#### ノート表示対象を open + resolved に拡大

```typescript
// L391-392: openNotes → activeNotes に変更
const activeNotes = useMemo(
  () => notes.filter(n => n.status !== 'fixed'),
  [notes]
);
```

#### 空メッセージ変更

```tsx
// L611-612
{activeNotes.length === 0 ? (
  <div className="debug-empty">対応中のノートはありません</div>
) : (
  activeNotes.map(note => (
```

#### ステータスセレクトを遷移ルールに基づいて表示

```tsx
// L624-632 変更
<select
  className="debug-status-select"
  value={note.status}
  onChange={(e) => handleStatusChange(note.id, e.target.value as Status)}
  disabled={loadingAction !== null}
>
  {note.status === 'open' && (
    <>
      <option value="open">open</option>
      <option value="resolved">resolved</option>
    </>
  )}
  {note.status === 'resolved' && (
    <>
      <option value="open">open</option>
      <option value="resolved">resolved</option>
      <option value="fixed">fixed</option>
    </>
  )}
</select>
```

#### resolved ノートの視覚区別（CSS）

```css
/* getPipStyles() に追加 */
.debug-note-row[data-status="resolved"] {
  opacity: 0.7;
  border-left: 2px solid #F59E0B;
}
```

```tsx
{/* data-status 属性を追加 */}
<div key={note.id} className="debug-note-row" data-status={note.status}>
```

### 4. `src/components/DebugAdmin.tsx`

#### カラー定数に warning 追加

```typescript
// LIGHT_COLORS に追加
warning: '#F59E0B',
warningBg: '#FFFBEB',

// DARK_COLORS に追加
warning: '#FBBF24',
warningBg: '#78350F',
```

#### ステータスフィルター

```tsx
// L420-422 変更
<option value="">すべて</option>
<option value="open">Open</option>
<option value="resolved">Resolved</option>
<option value="fixed">Fixed</option>
```

#### ステータスバッジ

```typescript
// L1096-1109 変更
function getStatusBadge(status: Status, colors: typeof LIGHT_COLORS): React.CSSProperties {
  let bg: string;
  let fg: string;

  switch (status) {
    case 'open':
      bg = colors.primaryLight;
      fg = colors.primary;
      break;
    case 'resolved':
      bg = colors.warningBg;
      fg = colors.warning;
      break;
    case 'fixed':
      bg = colors.successBg;
      fg = colors.success;
      break;
  }

  return {
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: bg,
    color: fg,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    display: 'inline-flex',
    alignItems: 'center',
  };
}
```

#### ステータスアイコン

```tsx
// L578: アイコンを3状態対応に
<Icon
  name={note.status === 'open' ? 'error' : note.status === 'resolved' ? 'autorenew' : 'check_circle'}
  size={14}
/>

// L679: 詳細ビューも同様
<Icon
  name={selectedNote.status === 'open' ? 'error' : selectedNote.status === 'resolved' ? 'autorenew' : 'check_circle'}
  size={14}
/>
```

#### 詳細ビューのステータスセレクト

```tsx
// L752-753 変更（遷移ルールに基づく）
{selectedNote.status === 'open' && (
  <>
    <option value="open">Open</option>
    <option value="resolved">Resolved</option>
  </>
)}
{selectedNote.status === 'resolved' && (
  <>
    <option value="open">Open</option>
    <option value="resolved">Resolved</option>
    <option value="fixed">Fixed</option>
  </>
)}
{selectedNote.status === 'fixed' && (
  <option value="fixed">Fixed</option>
)}
```

#### フッター統計

```tsx
// L642-654 変更
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <Icon name="description" size={16} />
  {notes.length} 件
</span>
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <Icon name="error" size={16} color={colors.error} />
  {notes.filter(n => n.status === 'open').length} Open
</span>
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <Icon name="autorenew" size={16} color={colors.warning} />
  {notes.filter(n => n.status === 'resolved').length} Resolved
</span>
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <Icon name="check_circle" size={16} color={colors.success} />
  {notes.filter(n => n.status === 'fixed').length} Fixed
</span>
```

---

## DB 変更

なし。`status` は `TEXT` 型のため、新しい値をそのまま格納可能。

## 後方互換性

- 既存データは全て `open` か `fixed` → そのまま有効
- API の `PATCH /notes/:id/status` は新しい遷移ルールで制約が強まる（`open` → `fixed` 直接は不可）
- フロントエンドが古い場合、`resolved` オプションがないだけで既存操作は壊れない

## 実装順序

`ui-improvements-v1.1.md` の retest 表示と同時、または先に実装する。
`resolved` が retest 表示のトリガーになるため。

1. `test-tab-multi-select-bug-report.md`（DB v4 マイグレーション）
2. **本ドラフト**（ステータス追加）
3. `ui-improvements-v1.1.md`（retest 表示、ノートID、ショートカット、更新ボタン）

## ビルド検証

```bash
npm run build
npm run test
```
