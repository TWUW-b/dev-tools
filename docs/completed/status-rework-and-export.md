# ステータス体系の見直し + データエクスポート機能

## 1. 現状の問題

### ステータス順序の矛盾

現在の UI 表示順: `open → resolved → rejected → fixed`

実際の運用フローでは `fixed`（修正済み）の後に `resolved`（確認完了）があるべきだが、
現状は `resolved` が `fixed` より先に並んでおり、意味的な順序と一致していない。

### 意図するフロー

```
open → fixed → resolved
         ↘      ↗
        rejected（据え置き）
```

- **open**: 未対応
- **fixed**: 修正した（開発者が修正コードを書いた）
- **resolved**: 確認完了・クローズ（修正が正しいことを確認した）
- **rejected**: 対応不要・却下

> 厳格な遷移ルールは設けない。任意のステータス間で自由に変更可能（現行と同じ）。

### 後方互換性

既存データに `fixed` を終了ステータスとして使っているノートがある。
`resolved` が最終ステータスに昇格すると、これらの意味が変わる。

---

## 2. 変更内容

### 2.1 ステータス表示順の変更

**Before:**

```
open → resolved → rejected → fixed
```

**After:**

```
open → fixed → resolved → rejected
```

#### 変更対象ファイル

| ファイル | 変更内容 |
|----------|----------|
| `src/components/DebugAdmin.tsx` | フィルタ dropdown / ステータス select / 統計表示の順序変更 |
| `src/components/debug/ManageTab.tsx` | ステータスチップ / select の順序変更 |

#### アイコン・色の入れ替え

| ステータス | Before | After |
|------------|--------|-------|
| `open` | error (primary) | error (primary) — 変更なし |
| `fixed` | check_circle (success) | build (warning) |
| `resolved` | autorenew (warning) | check_circle (success) |
| `rejected` | undo (error) | undo (error) — 変更なし |

- `fixed` は「修正した、まだ確認待ち」なので warning 系に降格
- `resolved` は「確認完了」なので success 系に昇格

### 2.2 ManageTab デフォルトフィルタの変更

**Before:** `new Set(['resolved'])` — resolved のみ表示
**After:** `new Set(['fixed'])` — fixed を表示（確認待ちのものを優先表示）

### 2.3 後方互換性の対応

データマイグレーションは **行わない**。

理由:
- `fixed` / `resolved` どちらも有効なステータスとして残る
- 値の変更・統合はしない
- 既存の `fixed` ノートは「修正済み・未確認」として扱われるだけで、データとして壊れない
- 必要なら手動で `resolved` に変更できる（自由遷移は維持）

実質的に「表示順と色が変わるだけ」なので破壊的変更はない。

### 2.4 型定義の変更

`src/types/index.ts` の Status 型は変更不要（値自体は同じ）。
コメントのみ更新:

```typescript
/** ステータス（open → fixed → resolved の順。遷移制約なし） */
export type Status = 'open' | 'resolved' | 'rejected' | 'fixed';
```

### 2.5 ドキュメント更新

`docs/usage.md` のステータス関連の記述を更新:
- フロー図の追加
- 各ステータスの意味の明確化

---

## 3. データエクスポート機能

### 3.1 概要

DebugAdmin にデータエクスポート機能を追加する。

### 3.2 エクスポート形式

| 形式 | 内容 | 用途 |
|------|------|------|
| **JSON** | 全ノート（ログ含む）を JSON でダウンロード | データバックアップ・移行 |
| **SQLite** | DB ファイルそのものをダウンロード | 完全バックアップ |

### 3.3 API エンドポイント

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/export/json?env=dev` | 全ノートを JSON でエクスポート |
| GET | `/export/sqlite?env=dev` | SQLite ファイルをダウンロード |

レスポンス:
- JSON: `Content-Type: application/json`, `Content-Disposition: attachment; filename="debug-notes-{env}-{date}.json"`
- SQLite: `Content-Type: application/octet-stream`, `Content-Disposition: attachment; filename="debug-notes-{env}-{date}.sqlite"`

### 3.4 JSON エクスポート形式

```typescript
interface ExportData {
  exportedAt: string;        // ISO 8601
  env: 'dev' | 'test';
  version: string;           // パッケージバージョン
  notes: Note[];             // 全カラム（ログ含む）
  testCases?: ParsedTestCase[];  // テストケース
  testRuns?: TestRunRecord[];    // テスト実行履歴
}
```

### 3.5 UI

DebugAdmin のヘッダーにエクスポートボタンを追加:

```
[JSON] [SQLite]
```

- クリックで即ダウンロード開始
- ダウンロード中はボタンを disabled + スピナー表示

### 3.6 バックエンド実装

#### `api/NotesController.php` に追加

```php
public function exportJson(string $env): void
{
    $notes = $this->db->getAllNotesWithLogs($env);
    $testCases = $this->db->getAllTestCases();
    $testRuns = $this->db->getAllTestRuns($env);

    $data = [
        'exportedAt' => date('c'),
        'env' => $env,
        'version' => '1.0.0',
        'notes' => $notes,
        'testCases' => $testCases,
        'testRuns' => $testRuns,
    ];

    header('Content-Type: application/json');
    header('Content-Disposition: attachment; filename="debug-notes-' . $env . '-' . date('Ymd') . '.json"');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

public function exportSqlite(string $env): void
{
    $dbPath = $this->db->getDbPath($env);
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="debug-notes-' . $env . '-' . date('Ymd') . '.sqlite"');
    readfile($dbPath);
}
```

#### ルーティング追加（`api/index.php`）

```php
case 'GET' && preg_match('#^/export/(json|sqlite)$#', $path, $m):
    $controller->{'export' . ucfirst($m[1])}($env);
    break;
```

---

## 4. 変更対象ファイル一覧

| ファイル | 変更 |
|----------|------|
| `src/types/index.ts` | コメント更新のみ |
| `src/components/DebugAdmin.tsx` | ステータス順序・アイコン・色の変更、エクスポートボタン追加 |
| `src/components/debug/ManageTab.tsx` | ステータス順序変更、デフォルトフィルタ変更 |
| `api/NotesController.php` | exportJson / exportSqlite メソッド追加 |
| `api/index.php` | エクスポート用ルーティング追加 |
| `docs/usage.md` | ステータスフロー説明更新、エクスポート API 追加 |

## 5. やらないこと

- ステータス値のリネーム（後方互換性を壊す）
- データマイグレーション（不要）
- 厳格な遷移ルールの実装
- インポート機能（スコープ外）
