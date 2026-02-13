# DebugAdmin 改善実装

3つの変更を実装する。

## 1. タイトルフィールド削除 → contentの先頭を自動設定

### 方針
- DBの `title` カラムはそのまま残す
- フロントエンド（DebugPanel）からtitleフィールドを削除
- 保存時にcontentの1行目をtitleに自動設定
- 管理画面（DebugAdmin）の一覧表示はcontentの1行目を表示

### 変更ファイル

**`src/components/DebugPanel.tsx`**
- `title` state を削除
- title の `<input>` フィールドを削除
- `handleSave` のバリデーションから title チェックを除去
- `handleSave` で `title` を content の1行目から自動生成:
  ```ts
  const firstLine = content.trim().split('\n')[0];
  const autoTitle = firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;
  ```
- `resetForm` から `setTitle('')` を削除
- バリデーションメッセージを「内容は必須です」に変更

**`src/components/DebugAdmin.tsx`**
- 一覧カード（419-423行目）: `note.title` → contentの1行目表示
  ```ts
  const firstLine = note.content.split('\n')[0];
  const preview = firstLine.length > 60 ? firstLine.slice(0, 60) + '...' : firstLine;
  ```
- 詳細ヘッダー（508-515行目）: `selectedNote.title` → 同様にcontent 1行目

**API側は変更不要** — titleは自動生成されて送信されるため。

---

## 2. 編集処理で優先順位（severity）も変更可能に

### 方針
- 既存の `PATCH /notes/{id}/status` を拡張して severity も受け付ける
- 汎用的な `updateNote` に名前変更せず、エンドポイントを1つ追加

### 変更ファイル

**`api/NotesController.php`** — メソッド追加
```php
public function updateSeverity(int $id, array $input): array
{
    $severity = $input['severity'] ?? null;
    if ($severity !== null && !in_array($severity, ['high', 'medium', 'low'], true)) {
        return ['success' => false, 'error' => 'Invalid severity'];
    }

    $affected = $this->db->execute(
        'UPDATE notes SET severity = ? WHERE id = ? AND deleted_at IS NULL',
        [$severity, $id]
    );

    if ($affected === 0) {
        return ['success' => false, 'error' => 'Note not found'];
    }

    return ['success' => true];
}
```

**`api/index.php`** — ルート追加
```php
// PATCH /notes/{id}/severity
if ($method === 'PATCH' && preg_match('#^/notes/(\d+)/severity/?$#', $relativePath, $matches)) {
    $id = (int) $matches[1];
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $result = $controller->updateSeverity($id, $input);
    echo json_encode($result);
    exit;
}
```

**`src/utils/api.ts`** — メソッド追加
```ts
async updateSeverity(env: Environment, id: number, severity: Severity | null): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/notes/${id}/severity?env=${env}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ severity }),
  });
  const data: NotesResponse = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to update severity');
  }
}
```

**`src/types/index.ts`** — `UseDebugNotesReturn` に追加
```ts
updateSeverity: (id: number, severity: Severity | null) => Promise<boolean>;
```

**`src/hooks/useDebugNotes.ts`** — メソッド追加
```ts
const updateSeverity = useCallback(
  async (id: number, severity: Severity | null): Promise<boolean> => {
    try {
      await api.updateSeverity(env, id, severity);
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, severity } : note))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  },
  [env]
);
```

**`src/components/DebugAdmin.tsx`** — 詳細ビューにseverityドロップダウン追加
- `useDebugNotes` から `updateSeverity` を取得
- 517行目付近の操作エリアに severity `<select>` を追加（status selectの隣）
- `handleSeverityChange` コールバック追加

---

## 3. 各ボタンにローディングスピナー

### 方針
- 各操作ごとに個別のローディング状態を管理
- CSSアニメーションのスピナーを使用
- 操作中はボタンを `disabled` にして二重実行防止

### 変更ファイル

**`src/components/DebugAdmin.tsx`**

state 追加:
```ts
const [loadingAction, setLoadingAction] = useState<string | null>(null);
// 値: 'refresh' | 'status-{id}' | 'severity-{id}' | 'delete-{id}' | null
```

スピナーコンポーネント:
```tsx
function Spinner({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: `${size}px`,
      height: `${size}px`,
      border: `2px solid ${color || 'currentColor'}30`,
      borderTopColor: color || 'currentColor',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }} />
  );
}
```

CSS追加（既存の `<style>` タグ内）:
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

各ハンドラーをラップ:
- `handleStatusChange`: `setLoadingAction(`status-${id}`)` で囲む
- `handleSeverityChange`: `setLoadingAction(`severity-${id}`)` で囲む
- `handleDelete`: `setLoadingAction(`delete-${id}`)` で囲む
- `refresh`: `setLoadingAction('refresh')` で囲む

各ボタンの表示:
- `loadingAction` に一致する場合、テキストの代わりに `<Spinner />` 表示
- `disabled={loadingAction !== null}` で全ボタン無効化

**`src/components/DebugPanel.tsx`**
- 保存ボタン: 既存の `saving` state に合わせてスピナー表示追加（現在はテキストのみ）
- クリアボタン: 非同期操作でないため変更不要
