# API リファレンス

## Debug API

### POST /notes

ノートを作成します。

```json
{
  "content": "ボタンが反応しない",
  "severity": "high",
  "route": "/dashboard",
  "screen_name": "ダッシュボード"
}
```

### GET /notes

ノート一覧を取得します。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `env` | string | `dev` または `test` |
| `status` | string | `open`, `resolved`, `rejected`, `fixed` |
| `search` | string | 検索キーワード |

### PUT /notes/:id/status

ステータスを更新します。

```json
{
  "status": "resolved"
}
```

## Feedback API

### POST /feedback

フィードバックを送信します。

```json
{
  "kind": "bug",
  "target": "app",
  "message": "ログイン画面でエラーが発生"
}
```

### GET /feedback

フィードバック一覧を取得します（管理者キーが必要）。
