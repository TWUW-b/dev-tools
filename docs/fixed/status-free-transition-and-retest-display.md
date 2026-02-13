# ステータス自由遷移 + TestTree retest 表示

## 概要

1. ノートステータスの遷移制限を撤廃し、どの状態からも `open` / `resolved` / `fixed` を設定可能にする
2. DebugAdmin テスト状況タブの Capability 行に retest 表示を追加する

---

## 1. ステータス自由遷移

### 背景

現状は `open → resolved → fixed` の一方通行（`resolved → open` のみ例外許可）。
運用上、`open → fixed` や `fixed → open` など柔軟な変更が必要。

### 変更後の遷移ルール

| from | to（許可） |
|------|-----------|
| `open` | `resolved`, `fixed` |
| `resolved` | `open`, `fixed` |
| `fixed` | `open`, `resolved` |

### ファイル変更

#### `api/NotesController.php:176-180`

```php
// 現状
$allowed = [
    'open'     => ['resolved'],
    'resolved' => ['open', 'fixed'],
    'fixed'    => [],
];

// 変更
$allowed = [
    'open'     => ['resolved', 'fixed'],
    'resolved' => ['open', 'fixed'],
    'fixed'    => ['open', 'resolved'],
];
```

#### `src/components/DebugPanel.tsx:630-643` — PiP 管理タブ

現状: `note.status` による条件分岐で表示オプションを制限。

変更: 条件分岐を廃止し、全ステータスを常時表示。

```tsx
// 現状
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

// 変更
<option value="open">open</option>
<option value="resolved">resolved</option>
<option value="fixed">fixed</option>
```

#### `src/components/DebugAdmin.tsx:761-776` — 管理画面詳細ビュー

同様に条件分岐を廃止。

```tsx
// 現状
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

// 変更
<option value="open">Open</option>
<option value="resolved">Resolved</option>
<option value="fixed">Fixed</option>
```

L757-758 の `fixed` 時の disabled / cursor 制御も削除:

```typescript
// 現状
cursor: (loadingAction !== null || selectedNote.status === 'fixed') ? 'not-allowed' : 'pointer',
opacity: (loadingAction !== null || selectedNote.status === 'fixed') ? 0.6 : 1,

// 変更
cursor: loadingAction !== null ? 'not-allowed' : 'pointer',
opacity: loadingAction !== null ? 0.6 : 1,
```

#### `src/components/DebugPanel.tsx:392` — PiP 管理タブ表示対象

`fixed` に戻せるようになったため、`fixed` ノートも一覧に表示する必要がある。

```typescript
// 現状
const activeNotes = useMemo(
  () => notes.filter(n => n.status !== 'fixed'),
  [notes]
);

// 変更: 全ノート表示
const activeNotes = useMemo(() => notes, [notes]);
```

※ `fixed` ノートが多い場合はフィルタを検討。現時点では全表示で問題ない。

---

## 2. TestTree Capability 行 retest 表示

### 背景

DebugAdmin テスト状況タブの TestTree で:
- **CaseRow（ケース行）**: retest 表示済み（◆ amber、`TestTree.tsx:312-320`）
- **Capability 行**: retest 未対応。`cap.failed > 0` なら常に赤の `fail` 表示

全ノートが `resolved` で `openIssues === 0` になっても、Capability 行は `fail` のまま。

### ファイル変更

#### `src/components/admin/TestTree.tsx:206-210` — Capability 行のアイコン/色

```typescript
// 現状
const allPassed = cap.passed === cap.total && cap.total > 0;
const hasFail = cap.failed > 0 || cap.openIssues > 0;

const icon = allPassed ? '\u25CF' : hasFail ? '\u25B2' : '\u25CB';
const iconColor = allPassed ? tc.passed : hasFail ? tc.fail : tc.untested;

// 変更
const allPassed = cap.passed === cap.total && cap.total > 0;
const hasFailWithOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues > 0);
const hasFailWithoutOpenIssues = cap.cases.some(c => c.last === 'fail' && c.openIssues === 0);
const isRetest = !hasFailWithOpenIssues && hasFailWithoutOpenIssues;
const hasFail = hasFailWithOpenIssues;

const icon = allPassed ? '\u25CF' : hasFail ? '\u25B2' : isRetest ? '\u25C6' : '\u25CB';
const iconColor = allPassed ? tc.passed : hasFail ? tc.fail : isRetest ? tc.retest : tc.untested;
```

#### `src/components/admin/TestTree.tsx:246-259` — Capability 行のラベル

```tsx
// 現状
{allPassed && (
  <span style={{ fontSize: '11px', color: tc.passed, fontWeight: 600 }}>passed</span>
)}
{hasFail && (
  <span style={{ fontSize: '11px', color: tc.fail, fontWeight: 600 }}>fail</span>
)}

// 変更: retest 分岐追加
{allPassed && (
  <span style={{ fontSize: '11px', color: tc.passed, fontWeight: 600 }}>passed</span>
)}
{hasFail && (
  <span style={{ fontSize: '11px', color: tc.fail, fontWeight: 600 }}>fail</span>
)}
{isRetest && (
  <span style={{ fontSize: '11px', color: tc.retest, fontWeight: 600 }}>retest</span>
)}
```

---

## ビルド検証

```bash
npm run build
npm run test
```
