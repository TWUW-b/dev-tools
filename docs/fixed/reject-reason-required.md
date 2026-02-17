# rejected 時のコメント必須化

**ステータス**: Draft
**作成日**: 2026-02-16
**優先度**: Medium

---

## 概要

ノートのステータスを `rejected` に変更する際、理由（コメント）を必須にする。
現在は `fixed` のみコメント必須で、`rejected` は任意。

---

## 変更内容

### 1. バックエンド — NotesController.php

`updateStatus()` メソッドのバリデーションを変更。

```diff
  // api/NotesController.php:228-271
  public function updateStatus(int $id, array $input): array
  {
      // ... 既存のバリデーション ...

+     // fixed / rejected はコメント必須
+     if (in_array($status, ['fixed', 'rejected'], true) && $comment === '') {
+         return [
+             'success' => false,
+             'error' => $status === 'fixed'
+                 ? 'Comment is required when setting status to fixed'
+                 : 'Reason is required when rejecting',
+         ];
+     }

-     // 現在のコード（削除）
-     // fixed のコメント必須チェックは handleConfirmStatusChange 側のみ
```

> 現状バックエンドに `fixed` のコメント必須バリデーションがない（フロントエンドのみで制御）。
> この修正でバックエンド側にも `fixed` と `rejected` 両方のバリデーションを追加する。

### 2. フロントエンド — DebugAdmin.tsx

`fixed` のみをチェックしている箇所を `fixed || rejected` に拡張。

#### 2.1 handleConfirmStatusChange（L200-223）

```diff
  const handleConfirmStatusChange = useCallback(async () => {
    if (!pendingStatusChange) return;
    const { id, status } = pendingStatusChange;
-   if (status === 'fixed' && commentText.trim() === '') return;
+   if ((status === 'fixed' || status === 'rejected') && commentText.trim() === '') return;
```

#### 2.2 コメント入力モーダル — placeholder（L1386）

```diff
- placeholder={pendingStatusChange.status === 'fixed'
-   ? 'コメント（必須）: 何を修正したか記入してください'
-   : 'コメント（任意）'}
+ placeholder={
+   pendingStatusChange.status === 'fixed'
+     ? 'コメント（必須）: 何を修正したか記入してください'
+     : pendingStatusChange.status === 'rejected'
+       ? 'コメント（必須）: 却下理由を記入してください'
+       : 'コメント（任意）'
+ }
```

#### 2.3 コメント入力欄のエラー表示（L1390, L1405-1408）

`commentRequired` ヘルパーで条件を共通化:

```diff
+ // コメント必須判定（モーダル内で使用）
+ const commentRequired = pendingStatusChange
+   && (pendingStatusChange.status === 'fixed' || pendingStatusChange.status === 'rejected')
+   && commentText.trim() === '';

  // ボーダー色
- border: `1px solid ${commentText.trim() === '' && pendingStatusChange.status === 'fixed' ? colors.error : colors.border}`,
+ border: `1px solid ${commentRequired ? colors.error : colors.border}`,

  // エラーメッセージ
- {pendingStatusChange.status === 'fixed' && commentText.trim() === '' && (
+ {commentRequired && (
    <div style={{ fontSize: '12px', color: colors.error, marginTop: '6px' }}>
-     fixed に変更するにはコメントが必須です
+     {pendingStatusChange.status === 'fixed'
+       ? 'fixed に変更するにはコメントが必須です'
+       : '却下理由の入力が必須です'}
    </div>
  )}
```

#### 2.4 確定ボタンの disabled / スタイル（L1433-1440）

```diff
- disabled={loadingAction !== null || (pendingStatusChange.status === 'fixed' && commentText.trim() === '')}
+ disabled={loadingAction !== null || commentRequired}

- background: (pendingStatusChange.status === 'fixed' && commentText.trim() === '') ? colors.bgTertiary : colors.primary,
+ background: commentRequired ? colors.bgTertiary : colors.primary,

- color: (pendingStatusChange.status === 'fixed' && commentText.trim() === '') ? colors.textMuted : '#FFF',
+ color: commentRequired ? colors.textMuted : '#FFF',

- cursor: (pendingStatusChange.status === 'fixed' && commentText.trim() === '') ? 'not-allowed' : 'pointer',
+ cursor: commentRequired ? 'not-allowed' : 'pointer',
```

### 3. ドキュメント更新

#### docs/api.md — PATCH /notes/{id}/status

```diff
  | `status` | string | Yes | `open` \| `resolved` \| `rejected` \| `fixed` |
- | `comment` | string | No | 最大 2,000 文字 |
+ | `comment` | string | `fixed` / `rejected` 時は必須 | 最大 2,000 文字 |

- **エラー 400:** `Comment is required when setting status to fixed`
+ **エラー 400:** `Comment is required when setting status to fixed` / `Reason is required when rejecting`
```

#### api/openapi.yaml（新規作成時に反映）

---

## 対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `api/NotesController.php` | `rejected` 時もコメント必須バリデーション追加 |
| `src/components/DebugAdmin.tsx` | コメントモーダルの `fixed` 条件を `fixed \| rejected` に拡張 |
| `docs/api.md` | comment フィールドの必須条件を更新 |

---

## 確認項目

- [ ] rejected 時にコメントなしで送信するとエラーになる（API）
- [ ] rejected 選択時にコメント入力欄が必須表示になる（UI）
- [ ] コメント未入力で確定ボタンが disabled になる
- [ ] コメント入力後に正常に rejected に変更できる
- [ ] fixed の既存動作が変わらない
- [ ] resolved / open はコメント任意のまま
- [ ] アクティビティログに却下理由が記録される
