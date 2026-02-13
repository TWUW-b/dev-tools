# ステータス `rejected` 追加 + 自由遷移 + 履歴機能 revert + TestTree retest 表示

## 概要

1. `rejected`（差し戻し）ステータスを追加
2. ステータスの自由遷移を許可
3. 履歴機能（`note_status_history`）を revert — `rejected` ステータスで代替
4. TestTree Capability 行に retest 表示を追加

---

## 1. `rejected` ステータス追加

### ステータス定義

| status | 意味 | openIssues カウント |
|--------|------|-------------------|
| `open` | 新規・未対応 | Yes |
| `resolved` | 対応済み | No → retest 表示トリガー |
| `rejected` | 差し戻し（修正不十分） | Yes → fail 表示に戻る |
| `fixed` | 確認済み | No |

### フロー

```
open → resolved → fixed（正常系）
                → rejected → resolved → fixed（差し戻し）
```

遷移: 全ステータス間で自由（制限なし）

### `rejected` が履歴テーブルを不要にする理由

`rejected` ステータス自体が「一度 resolved されたが差し戻された」事実を示す。
ステータスを見るだけで差し戻しの有無が分かるため、履歴テーブルは不要。

---

## 2. ファイル変更

### 2.1 `src/types/index.ts`

#### Status 型に `rejected` 追加（L5）

```typescript
// 現状
export type Status = 'open' | 'resolved' | 'fixed';

// 変更
export type Status = 'open' | 'resolved' | 'rejected' | 'fixed';
```

#### `StatusHistoryEntry` 削除（L10-15）

```typescript
// 削除
export interface StatusHistoryEntry {
  from: Status;
  to: Status;
  at: string;
}
```

#### `Note.status_history` 削除（L35）

```typescript
// 削除
status_history?: StatusHistoryEntry[];
```

---

### 2.2 `api/NotesController.php`

#### updateStatus() — `rejected` 許可 + 自由遷移 + 履歴 INSERT 削除

現状（L188-229）:

```php
if (!in_array($status, ['open', 'resolved', 'fixed'], true)) { ... }
// ...
$allowed = [
    'open'     => ['resolved', 'fixed'],
    'resolved' => ['open', 'fixed'],
    'fixed'    => ['open', 'resolved'],
];
// ...
// 履歴記録
$this->db->execute(
    'INSERT INTO note_status_history (note_id, from_status, to_status) VALUES (?, ?, ?)',
    [$id, $currentStatus, $status]
);
```

変更:

```php
// rejected 追加
if (!in_array($status, ['open', 'resolved', 'rejected', 'fixed'], true)) {
    return ['success' => false, 'error' => 'Invalid status'];
}

$note = $this->db->fetchOne(
    'SELECT status FROM notes WHERE id = ? AND deleted_at IS NULL',
    [$id]
);
if (!$note) {
    return ['success' => false, 'error' => 'Note not found'];
}

if ($note['status'] === $status) {
    return ['success' => true];
}

// 遷移制限なし（自由遷移） — $allowed 判定を削除

$this->db->execute(
    'UPDATE notes SET status = ? WHERE id = ? AND deleted_at IS NULL',
    [$status, $id]
);

// 履歴 INSERT を削除（L225-229）

return ['success' => true];
```

#### index() — `status_history` 取得を削除（L56-79）

現状:

```php
// ステータス履歴を一括取得
$noteIds = array_column($notes, 'id');
$historyMap = [];
if (!empty($noteIds)) {
    // ... note_status_history クエリ ...
}
foreach ($notes as &$note) {
    $note['status_history'] = $historyMap[$note['id']] ?? [];
}
```

変更: 上記ブロックを全て削除。

#### show() — `status_history` 取得を削除（L102-105）

現状:

```php
$note['status_history'] = $this->db->query(
    'SELECT from_status, to_status, created_at FROM note_status_history WHERE note_id = ? ORDER BY created_at ASC',
    [$id]
);
```

変更: 上記3行を削除。

---

### 2.3 `api/Database.php` — v4 マイグレーション変更

現状（L149-170）: `note_status_history` テーブルを作成。

変更: テーブル作成を `DROP TABLE` に変更。

```php
// v4: note_status_history テーブル削除（不要になったため）
if ((int)$version < 4) {
    $this->pdo->beginTransaction();
    try {
        $this->pdo->exec('DROP TABLE IF EXISTS note_status_history');

        $this->pdo->exec("UPDATE meta SET value = '4' WHERE key = 'schemaVersion'");
        $this->pdo->commit();
    } catch (\Exception $e) {
        $this->pdo->rollBack();
        throw $e;
    }
}
```

※ v4 が既に適用済みの環境（テーブルが存在する）では v5 で DROP する:

```php
// v5: note_status_history テーブル削除
if ((int)$version < 5) {
    $this->pdo->exec('DROP TABLE IF EXISTS note_status_history');
    $this->pdo->exec("UPDATE meta SET value = '5' WHERE key = 'schemaVersion'");
}
```

新規環境では v4 で CREATE → v5 で DROP となるが、`IF EXISTS` / `IF NOT EXISTS` で安全。

---

### 2.4 `src/components/DebugPanel.tsx` — PiP 管理タブ

#### ステータスセレクト: 全4値を常時表示（L630-643）

現状: `note.status` による条件分岐。

```tsx
// 変更: 条件分岐を廃止
<option value="open">open</option>
<option value="resolved">resolved</option>
<option value="rejected">rejected</option>
<option value="fixed">fixed</option>
```

#### 表示対象: rejected も表示（L392）

現状: `notes.filter(n => n.status !== 'fixed')`

```typescript
// 変更: fixed 以外すべて表示（open, resolved, rejected）
// 現状のまま動作する（rejected !== 'fixed'）
// → 変更不要
```

---

### 2.5 `src/components/DebugAdmin.tsx`

#### ステータスフィルター（L420-422 付近）

```tsx
<option value="">すべて</option>
<option value="open">Open</option>
<option value="resolved">Resolved</option>
<option value="rejected">Rejected</option>
<option value="fixed">Fixed</option>
```

#### 詳細ビュー ステータスセレクト（L761-776）

現状: `selectedNote.status` による条件分岐。

```tsx
// 変更: 条件分岐を廃止、全4値を常時表示
<option value="open">Open</option>
<option value="resolved">Resolved</option>
<option value="rejected">Rejected</option>
<option value="fixed">Fixed</option>
```

L757-758 の `fixed` 時 disabled 制御も削除:

```typescript
// 現状
cursor: (loadingAction !== null || selectedNote.status === 'fixed') ? 'not-allowed' : 'pointer',
opacity: (loadingAction !== null || selectedNote.status === 'fixed') ? 0.6 : 1,

// 変更
cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
opacity: loadingAction !== null ? 0.6 : 1,
```

#### ステータス履歴セクション削除（L821-857）

```tsx
// 削除: ステータス履歴ブロック全体
{/* ステータス履歴 */}
{selectedNote.status_history && selectedNote.status_history.length > 0 && (
  <Section icon="history" title="ステータス履歴" colors={colors}>
    ...
  </Section>
)}
```

#### ステータスバッジ — `rejected` 追加

`getStatusBadge()` に `rejected` 分岐を追加:

```typescript
case 'rejected':
  bg = colors.errorBg;
  fg = colors.error;
  break;
```

#### ステータスアイコン — `rejected` 追加

`getStatusIcon()` 等に `rejected` 分岐を追加:

```typescript
// rejected のアイコン: 'undo' または 'replay'
note.status === 'rejected' ? 'undo' : ...
```

#### フッター統計 — `rejected` 追加（L642-654 付近）

```tsx
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
  <Icon name="undo" size={16} color={colors.error} />
  {notes.filter(n => n.status === 'rejected').length} Rejected
</span>
```

---

### 2.6 `api/TestController.php` — open_issues クエリ変更

現状（L106）:

```sql
AND n.status = 'open'
```

変更: `rejected` も open 扱い:

```sql
AND n.status IN ('open', 'rejected')
```

`rejected` → `openIssues` にカウント → テストツリーが fail 表示に戻る。

---

### 2.7 `src/components/admin/TestTree.tsx` — Capability 行 retest 表示

現状（L206-210）:

```typescript
const allPassed = cap.passed === cap.total && cap.total > 0;
const hasFail = cap.failed > 0 || cap.openIssues > 0;

const icon = allPassed ? '●' : hasFail ? '▲' : '○';
const iconColor = allPassed ? tc.passed : hasFail ? tc.fail : tc.untested;
```

変更:

```typescript
const allPassed = cap.passed === cap.total && cap.total > 0;
const hasFailWithOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues > 0);
const hasFailWithoutOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues === 0);
const isRetest = !hasFailWithOpenIssues && hasFailWithoutOpenIssues;
const hasFail = hasFailWithOpenIssues;

const icon = allPassed ? '●' : hasFail ? '▲' : isRetest ? '◆' : '○';
const iconColor = allPassed ? tc.passed : hasFail ? tc.fail : isRetest ? tc.retest : tc.untested;
```

Capability 行ラベル（L246-259）に retest 分岐追加:

```tsx
{isRetest && (
  <span style={{ fontSize: '11px', color: tc.retest, fontWeight: 600 }}>retest</span>
)}
```

---

### 2.8 `docs/done/note-status-history.md` — 削除

履歴機能は廃止のため、done ドキュメントを削除。

---

## DB 変更まとめ

| 変更 | 内容 |
|------|------|
| v5 マイグレーション | `DROP TABLE IF EXISTS note_status_history` |
| `notes.status` | TEXT 型のため `rejected` をそのまま格納可能。スキーマ変更なし |

## ビルド検証

```bash
npm run build
npm run test
```
