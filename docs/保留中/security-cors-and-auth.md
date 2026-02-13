# セキュリティ: CORS・認証・入力バリデーション

**Status:** 保留中

---

## 概要

コードレビューで発見されたセキュリティ上の問題点。現時点では対応不要と判断し保留。将来的に外部公開やマルチユーザー環境で使用する場合に対応が必要。

---

## 問題1: CORS のデフォルト許可

### 箇所

`api/index.php:24`

### 現状

```php
if ($origin !== '' && in_array($origin, $config['allowed_origins'] ?? [], true))
```

`$config['allowed_origins']` が未設定の場合、`?? []` により空配列になり `in_array` は false を返す。結果として CORS ヘッダーが付与されないため、ブラウザがリクエストをブロックする。

ただし、same-origin でアクセスする場合はこのチェック自体がスキップされるため、内部ツールとしての運用では問題にならない。

### 将来の修正案

明示的なホワイトリスト必須化:

```php
$allowedOrigins = $config['allowed_origins'] ?? [];
if (empty($allowedOrigins)) {
    http_response_code(403);
    echo json_encode(['error' => 'No allowed origins configured']);
    exit;
}
```

---

## 問題2: API 認証の未実装

### 箇所

`api/config.example.php:25`, `api/index.php` 全体

### 現状

`config.example.php` に `api_key` が定義されているが、`index.php` のどこにも認証チェックが存在しない。全エンドポイントが認証なしでアクセス可能。

### 将来の修正案

```php
// index.php 先頭
$apiKey = $config['api_key'] ?? '';
if ($apiKey !== '') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if ($authHeader !== "Bearer $apiKey") {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}
```

---

## 問題3: json_decode の null チェック

### 箇所

`api/index.php:106`

### 現状

```php
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
$controller->create($input);  // $input が null の可能性
```

### 将来の修正案

```php
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}
```

---

## 問題4: LIKE エスケープの実装

### 箇所

`api/NotesController.php:44-50`

### 現状

```php
$q = str_replace(['%', '_'], ['\\%', '\\_'], $q);
```

自前の `str_replace` で LIKE のワイルドカードをエスケープしている。SQLite ではバックスラッシュエスケープがデフォルトで有効ではないため、`ESCAPE '\'` 句が必要。

### 将来の修正案

```sql
WHERE content LIKE ? ESCAPE '\'
```

---

## 問題5: リクエストボディの常時キャプチャ

### 箇所

`src/utils/logCapture.ts:165-171`

### 現状

`captureHeaders` オプションに関わらず、fetch のリクエスト/レスポンスボディを常にキャプチャしている。認証トークンがボディに含まれる場合に漏洩する。

### 将来の修正案

`maskSensitive` をボディにも適用するか、キャプチャ対象を設定可能にする。

---

## 問題6: .htaccess のパストラバーサル

### 箇所

`api/.htaccess:4`

### 現状

全リクエストを `index.php` にリライトしている。PHP 側でベースパスの検証をしていないため、理論上はパストラバーサルのリスクがある。

ただし、PHP の `file_get_contents` 等でユーザー入力をファイルパスに使用している箇所はないため、現時点での実害はない。

---

## 保留理由

- 内部開発ツールとして same-origin で運用している限り、上記の問題は実害がない
- セキュリティ対応はコスト対効果を見て判断する
- 外部公開・マルチユーザー化の際に再評価する
