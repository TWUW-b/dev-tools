# テストケース削除API

**Version:** 1.0.0
**Status:** draft

---

## 概要

テストケースを削除するAPIエンドポイントを追加する。現在は削除手段がなく、不要になったテストケースがDB上に残り続ける。

## エンドポイント

`DELETE /test-cases`

### Request

```json
{
  "ids": [84, 94, 106, 113, 126]
}
```

### Response

```json
{
  "success": true,
  "deleted": 5
}
```

### バリデーション

- `ids` は必須、配列、1件以上
- 上限: 100件/リクエスト
- 存在しないIDはスキップ（エラーにしない）

### エラー

```json
{ "success": false, "error": "ids is required" }
{ "success": false, "error": "Too many ids (max 100)" }
```

## FK制約対応

現在のスキーマにON DELETE CASCADEが定義されていないため、手動で順序制御する。

### 依存関係

```
test_cases.id ← test_runs.case_id        (FK, NOT NULL)
test_cases.id ← note_test_cases.case_id  (FK, NOT NULL)
test_cases.id ← notes.test_case_id       (FK, NULLable)
```

### 削除順序（トランザクション内）

```sql
-- 1. テスト実行履歴を削除
DELETE FROM test_runs WHERE case_id IN (?...)

-- 2. ノートとの紐付けを削除
DELETE FROM note_test_cases WHERE case_id IN (?...)

-- 3. ノートの参照をNULLに（ノート自体は残す）
UPDATE notes SET test_case_id = NULL WHERE test_case_id IN (?...)

-- 4. テストケースを削除
DELETE FROM test_cases WHERE id IN (?...)
```

## 変更ファイル

### `api/TestController.php` — メソッド追加

```php
public function deleteCases(array $input): array
{
    $ids = $input['ids'] ?? [];
    if (empty($ids) || !is_array($ids)) {
        return ['success' => false, 'error' => 'ids is required'];
    }
    if (count($ids) > 100) {
        return ['success' => false, 'error' => 'Too many ids (max 100)'];
    }

    $ids = array_map('intval', $ids);
    $ids = array_filter($ids, fn($id) => $id > 0);
    if (empty($ids)) {
        return ['success' => false, 'error' => 'No valid ids'];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $this->db->beginTransaction();
    try {
        $this->db->execute("DELETE FROM test_runs WHERE case_id IN ($placeholders)", $ids);
        $this->db->execute("DELETE FROM note_test_cases WHERE case_id IN ($placeholders)", $ids);
        $this->db->execute("UPDATE notes SET test_case_id = NULL WHERE test_case_id IN ($placeholders)", $ids);
        $deleted = $this->db->execute("DELETE FROM test_cases WHERE id IN ($placeholders)", $ids);
        $this->db->commit();
    } catch (\Exception $e) {
        $this->db->rollBack();
        return ['success' => false, 'error' => 'Failed to delete cases'];
    }

    return ['success' => true, 'deleted' => $deleted];
}
```

### `api/index.php` — ルート追加

```php
// DELETE /test-cases
if ($method === 'DELETE' && preg_match('#^/test-cases/?$#', $relativePath)) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?? [];
    $result = $testController->deleteCases($input);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}
```

## 設計判断

| 判断 | 選択 | 理由 |
|------|------|------|
| 個別 vs 一括 | 一括 | 複数削除のユースケースが主 |
| Hard vs Soft delete | Hard delete | テストケースに履歴価値なし。test_runsも不要になる |
| notes の扱い | test_case_id を NULL | バグ報告は独立した価値がある |
| 存在しないID | スキップ | べき等性を確保 |

## フロントエンド

今回のスコープ外。UI側の削除機能が必要な場合は別draftで対応。
