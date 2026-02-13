# テストタブ: バグ報告マルチセレクト化

## 背景

現状のバグ報告は単一 `<select>` で1ケースしか fail 報告できない。
複数ケースに影響するバグを1回の送信で報告できるようにする。

## 仕様決定事項

| 項目 | 決定 |
|------|------|
| バグ報告ケース選択 | チェックボックス（複数選択可） |
| 内容・重要度 | 選択した全ケースに共通適用 |
| 未テストケース | skip（送信しない、警告なし） |
| 送信ボタン | `N/M件を送信` の動的ラベル |
| 共有ノート | 1ノートを作成し、全 fail ケースにリンク |

---

## データモデル変更

### 問題

現状 `notes.test_case_id` は単一FK。1ノート=1ケースのみ。
マルチセレクトで「1ノート → 複数ケース」にするには中間テーブルが必要。

### スキーマ v6 マイグレーション

```sql
-- 中間テーブル
CREATE TABLE note_test_cases (
    note_id INTEGER NOT NULL REFERENCES notes(id),
    case_id INTEGER NOT NULL REFERENCES test_cases(id),
    PRIMARY KEY (note_id, case_id)
);
CREATE INDEX idx_ntc_case_id ON note_test_cases(case_id);
CREATE INDEX idx_ntc_note_id ON note_test_cases(note_id);

-- 既存データ移行
INSERT INTO note_test_cases (note_id, case_id)
SELECT id, test_case_id FROM notes WHERE test_case_id IS NOT NULL;
```

### `notes.test_case_id` カラムの扱い

- **残す**（SQLite はカラム削除が面倒 + 後方互換）
- 新規作成時も書き込む（先頭の case_id を格納）
- ただし **読み取りは `note_test_cases` から行う**
- 将来的に deprecated 扱い

---

## 後方互換性

### セットアップ

追加のセットアップは不要。

- DB マイグレーション（v6）は API 初回アクセス時に自動実行される
- 既存データ（`notes.test_case_id`）は `note_test_cases` に自動移行される
- フロントエンドは npm パッケージに含まれる

### DB

- `note_test_cases` 中間テーブルを追加（v6 マイグレーション、自動実行）
- `notes.test_case_id` カラムは残す（書き込み継続、読み取りは `note_test_cases` から）
- 既存データは `INSERT OR IGNORE` で自動移行。データ損失なし

### API リクエスト形式

`POST /test-runs` に `failNote` フィールドを追加。旧形式も動作を維持。

```jsonc
// 旧形式（そのまま動作）
{
  "runs": [
    { "caseId": 1, "result": "pass" },
    { "caseId": 2, "result": "fail", "note": { "content": "..." } }
  ]
}

// 新形式（共有ノート）
{
  "runs": [
    { "caseId": 1, "result": "pass" },
    { "caseId": 2, "result": "fail" },
    { "caseId": 3, "result": "fail" }
  ],
  "failNote": {
    "content": "画面が白い",
    "severity": "high",
    "consoleLogs": [...],
    "networkLogs": [...]
  }
}
```

**処理ルール**:
- `failNote` がある場合: fail 結果の全ケースで1ノートを共有
- run 個別に `note` がある場合: 個別ノートを優先（旧形式互換）
- `failNote` と個別 `note` が両方ある場合: 個別 `note` を優先
- `failNote` なし + 個別 `note` なし: 旧バージョンと同じ動作

### API レスポンス形式

`GET /notes` のレスポンスに `test_case_ids` を追加。旧フィールドも維持。

```jsonc
{
  "id": 1,
  "test_case_id": 2,      // 維持（先頭のcase_id、後方互換）
  "test_case_ids": [2, 3], // 追加（全リンク）
  // ...
}
```

旧フロントエンドは `test_case_ids` を無視し `test_case_id` を参照するため、既存動作に影響なし。

### フロントエンド

`Note.test_case_ids` が未定義の場合のフォールバック:

```typescript
const caseIds = note.test_case_ids ?? (note.test_case_id ? [note.test_case_id] : []);
```

旧 API（v5 以前）を使うプロジェクトでも動作する。

### バージョニング

- **MINOR** (1.2.0): 新機能追加、後方互換あり
- API 旧形式はそのまま動作
- DB v6 マイグレーションは自動実行
- ユーザー側の追加セットアップは不要

---

## ファイル変更一覧

### バックエンド

| ファイル | 変更 |
|----------|------|
| `api/Database.php` | v6 マイグレーション（`note_test_cases` テーブル + 既存データ移行） |
| `api/TestController.php` | `submitRuns`: `failNote` 対応、1ノート → `note_test_cases` 複数行 |
| `api/TestController.php` | `tree`: open_issues を `note_test_cases` JOIN に変更 |
| `api/NotesController.php` | `create`: `testCaseIds` 配列対応、`note_test_cases` INSERT |
| `api/NotesController.php` | `index`: `test_case_ids` をレスポンスに追加 |
| `api/NotesController.php` | `show`: 同上 |

### フロントエンド

| ファイル | 変更 |
|----------|------|
| `src/types/index.ts` | `Note.test_case_ids` 追加、`TestRunInput` は変更なし |
| `src/utils/api.ts` | `submitTestRuns` の request body に `failNote` 対応 |
| `src/components/DebugPanel.tsx` | BugForm 型変更、UI マルチチェック化、handleSubmitCapability、送信ボタンラベル |
| `src/components/DebugAdmin.tsx` | `testCaseIdFilter` を `test_case_ids` 配列で照合 |

---

## 詳細設計

### 1. Database.php — v6 マイグレーション

```php
if ((int)$version < 6) {
    $this->pdo->beginTransaction();
    try {
        $this->pdo->exec('
            CREATE TABLE IF NOT EXISTS note_test_cases (
                note_id INTEGER NOT NULL REFERENCES notes(id),
                case_id INTEGER NOT NULL REFERENCES test_cases(id),
                PRIMARY KEY (note_id, case_id)
            )
        ');
        $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_ntc_case_id ON note_test_cases(case_id)');
        $this->pdo->exec('CREATE INDEX IF NOT EXISTS idx_ntc_note_id ON note_test_cases(note_id)');

        // 既存データ移行
        $this->pdo->exec('
            INSERT OR IGNORE INTO note_test_cases (note_id, case_id)
            SELECT id, test_case_id FROM notes WHERE test_case_id IS NOT NULL
        ');

        $this->pdo->exec("UPDATE meta SET value = '6' WHERE key = 'schemaVersion'");
        $this->pdo->commit();
    } catch (\Exception $e) {
        $this->pdo->rollBack();
        throw $e;
    }
}
```

### 2. TestController::submitRuns — failNote 対応

既存の deduplication ロジック（caseId 重複排除、fail 優先）はそのまま維持。
`failNote` の処理は deduplication の後、トランザクション内で行う。

```php
public function submitRuns(string $env, array $input): array
{
    $runs = $input['runs'] ?? [];
    $failNote = $input['failNote'] ?? null;

    if (empty($runs) || !is_array($runs)) {
        return ['success' => false, 'error' => 'runs is required'];
    }

    // 既存: pass を先に処理（fail時のノート作成前にpass記録を確定）
    usort($runs, function ($a, $b) { /* 既存のまま */ });

    // 既存: 同一caseIdの重複を排除（fail優先）
    $deduped = [];
    foreach ($runs as $run) {
        $caseId = (int)($run['caseId'] ?? 0);
        if ($caseId <= 0) continue;
        if (!isset($deduped[$caseId]) || $run['result'] === 'fail') {
            $deduped[$caseId] = $run;
        }
    }
    $runs = array_values($deduped);

    $this->db->beginTransaction();
    try {
        $results = [];
        $sharedNoteId = null;

        // failNote がある場合、先にノートを1つ作成
        if ($failNote && !empty($failNote['content'])) {
            $failCaseIds = [];
            foreach ($runs as $run) {
                if (($run['result'] ?? '') === 'fail' && empty($run['note'])) {
                    $failCaseIds[] = (int)($run['caseId'] ?? 0);
                }
            }

            if (!empty($failCaseIds)) {
                $noteResult = $this->notesController->create([
                    'content' => $failNote['content'],
                    'severity' => $failNote['severity'] ?? null,
                    'source' => 'test',
                    'testCaseIds' => $failCaseIds,
                    'consoleLogs' => $failNote['consoleLogs'] ?? null,
                    'networkLogs' => $failNote['networkLogs'] ?? null,
                    'environment' => $failNote['environment'] ?? null,
                ]);
                if ($noteResult['success'] && isset($noteResult['note']['id'])) {
                    $sharedNoteId = (int)$noteResult['note']['id'];
                }
            }
        }

        // runs を処理
        foreach ($runs as $run) {
            $caseId = (int)($run['caseId'] ?? 0);
            $result = $run['result'] ?? '';

            if ($caseId <= 0 || !in_array($result, ['pass', 'fail', 'skip'], true)) {
                continue;
            }

            // caseId 存在確認（既存のまま）
            $caseExists = $this->db->fetchOne(
                'SELECT id FROM test_cases WHERE id = ?', [$caseId]
            );
            if (!$caseExists) continue;

            $noteId = null;
            if ($result === 'fail') {
                if (!empty($run['note'])) {
                    // 個別 note（旧形式互換）— 既存のノート作成ロジック
                    $noteResult = $this->notesController->create([
                        'content' => $run['note']['content'] ?? '',
                        'severity' => $run['note']['severity'] ?? null,
                        'source' => 'test',
                        'testCaseId' => $caseId,  // 旧形式: 単一
                        'consoleLogs' => $run['note']['consoleLogs'] ?? null,
                        'networkLogs' => $run['note']['networkLogs'] ?? null,
                        'environment' => $run['note']['environment'] ?? null,
                    ]);
                    if ($noteResult['success'] && isset($noteResult['note']['id'])) {
                        $noteId = (int)$noteResult['note']['id'];
                    }
                } else {
                    // 共有 note
                    $noteId = $sharedNoteId;
                }
            }

            $this->db->execute(
                'INSERT INTO test_runs (case_id, result, note_id, env) VALUES (?, ?, ?, ?)',
                [$caseId, $result, $noteId, $env]
            );
            $runId = $this->db->lastInsertId();

            $entry = ['caseId' => $caseId, 'runId' => $runId, 'result' => $result];
            if ($noteId !== null) $entry['noteId'] = $noteId;
            $results[] = $entry;
        }

        $this->db->commit();
    } catch (\Exception $e) {
        $this->db->rollBack();
        error_log('submitRuns error: ' . $e->getMessage());
        return ['success' => false, 'error' => 'Failed to submit test runs'];
    }

    // commit 後にツリー集計（既存のまま）
    // ...

    return ['success' => true, 'results' => $results, 'capability' => $capabilitySummary];
}
```

### 3. NotesController::create — testCaseIds 対応

```php
// 新: testCaseIds 配列対応
$testCaseIds = [];
if (!empty($input['testCaseIds']) && is_array($input['testCaseIds'])) {
    $testCaseIds = array_map('intval', $input['testCaseIds']);
} elseif (isset($input['testCaseId'])) {
    $testCaseIds = [(int)$input['testCaseId']];
}

// caseIds の存在チェック（FK違反を事前に防ぐ）
$validCaseIds = [];
foreach ($testCaseIds as $caseId) {
    if ($caseId > 0) {
        $exists = $this->db->fetchOne('SELECT id FROM test_cases WHERE id = ?', [$caseId]);
        if ($exists) {
            $validCaseIds[] = $caseId;
        }
    }
}

// notes.test_case_id は先頭のIDを格納（後方互換）
$testCaseId = !empty($validCaseIds) ? $validCaseIds[0] : null;

// INSERT INTO notes ... (test_case_id = $testCaseId)

$noteId = $this->db->lastInsertId();

// note_test_cases に全リンクを INSERT
foreach ($validCaseIds as $caseId) {
    $this->db->execute(
        'INSERT OR IGNORE INTO note_test_cases (note_id, case_id) VALUES (?, ?)',
        [$noteId, $caseId]
    );
}
```

### 4. NotesController::index — test_case_ids 追加

```php
// ノート一覧取得後、test_case_ids を一括取得
$noteIds = array_column($notes, 'id');
if (!empty($noteIds)) {
    $placeholders = implode(',', array_fill(0, count($noteIds), '?'));
    $mappings = $this->db->query(
        "SELECT note_id, case_id FROM note_test_cases WHERE note_id IN ($placeholders)",
        $noteIds
    );

    $caseIdMap = [];
    foreach ($mappings as $m) {
        $caseIdMap[$m['note_id']][] = (int)$m['case_id'];
    }

    foreach ($notes as &$note) {
        $note['test_case_ids'] = $caseIdMap[$note['id']] ?? [];
    }
}
```

### 5. TestController::tree — open_issues クエリ変更

```sql
-- 旧
(SELECT COUNT(*) FROM notes n
 WHERE n.test_case_id = tc.id AND n.status = 'open' AND n.deleted_at IS NULL)

-- 新
(SELECT COUNT(*) FROM note_test_cases ntc
 JOIN notes n ON n.id = ntc.note_id
 WHERE ntc.case_id = tc.id AND n.status IN ('open', 'rejected') AND n.deleted_at IS NULL)
```

### 6. src/types/index.ts

```typescript
// Note に追加
export interface Note {
  // ... 既存フィールド ...
  test_case_id?: number | null;     // 維持（後方互換）
  test_case_ids?: number[];         // 追加
}
```

`TestRunInput` は変更なし。`failNote` は `api.ts` の `submitTestRuns` 内で構築する。

### 7. src/utils/api.ts — submitTestRuns

```typescript
async submitTestRuns(
  env: Environment,
  runs: TestRunInput[],
  failNote?: { content: string; severity?: Severity; ... }
): Promise<TestRunResponse> {
  const response = await fetch(`${apiBaseUrl}/test-runs?env=${env}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runs, failNote }),  // failNote 追加
  });
  // ...
}
```

### 8. src/components/DebugPanel.tsx

#### BugForm 型変更

```typescript
// 現状
type BugForm = { caseId: number; content: string; severity: Severity | '' };
// 変更後
type BugForm = { caseIds: number[]; content: string; severity: Severity | '' };
```

#### handleSubmitCapability

```typescript
const failCaseIds = (bugForm?.content.trim() && bugForm.caseIds.length > 0)
  ? bugForm.caseIds : [];
const failSet = new Set(failCaseIds);

// pass
for (const c of cases) {
  if (caseChecks[c.caseId] && !failSet.has(c.caseId)) {
    runs.push({ caseId: c.caseId, result: 'pass' });
  }
}
// fail（note なしで送信、failNote として別送）
for (const id of failCaseIds) {
  runs.push({ caseId: id, result: 'fail' });
}

// failNote を構築
const failNote = failCaseIds.length > 0 ? {
  content: bugForm.content.trim(),
  severity: bugForm.severity || undefined,
  consoleLogs: logCapture?.getConsoleLogs(),
  networkLogs: logCapture?.getNetworkLogs(),
  environment: envInfo,
} : undefined;

await api.submitTestRuns(env, runs, failNote);
```

#### バグ報告フォーム UI

単一 `<select>` → チェックボックスリストに変更。
バグ報告チェックボックスは赤系 `#DC2626` で pass 用と視覚的に区別。

#### 送信ボタンラベル

```tsx
const submitCount = passCount + failCaseIds.length;
<button disabled={submitCount === 0}>
  {submittingCap === capKey ? '送信中' : `${submitCount}/${cap.total}件を送信`}
</button>
```

### 9. src/components/DebugAdmin.tsx

```typescript
// フィルタ変更
// 旧: note.test_case_id !== testCaseIdFilter
// 新:
const caseIds = note.test_case_ids ?? (note.test_case_id ? [note.test_case_id] : []);
if (testCaseIdFilter != null && !caseIds.includes(testCaseIdFilter)) return false;
```

---

## 注意事項

### 共有ノートの fixed/resolved 操作

共有ノートを fixed/resolved にすると、リンク先の **全ケースで open_issues が減る**。
これは正しい動作（同じバグが修正された）。

ケースごとに個別管理が必要な場合は別のノートとして報告する（2回送信）。

### 既存データ

v6 マイグレーションで `notes.test_case_id` → `note_test_cases` に自動移行。
既存 API 利用者は旧形式のまま動作する。

### open_issues クエリの status 条件

現在の実装は `n.status IN ('open', 'rejected')` で集計している。
`note_test_cases` JOIN 後もこの条件を維持する。

### パフォーマンス

`tree()` の open_issues サブクエリに JOIN が増えるが、
`note_test_cases` にインデックスがあり、このアプリの規模（最大500ノート）では問題にならない。

---

## ビルド検証

```bash
npm run build
npm run test
```

## スキーマ検証（Docker）

```bash
npm run docker:up
# API にアクセスして v6 マイグレーション実行を確認
curl http://localhost:8081/notes?env=dev
```
