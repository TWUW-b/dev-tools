# FeedbackAdmin → DebugAdmin タブ統合（実装記録）

## 概要

FeedbackAdmin（フィードバック管理画面）を DebugAdmin の 3 番目のタブとして統合した。
`TestStatusTab` と同じパターンで `FeedbackTab` を `src/components/admin/` に新規作成し、
DebugAdmin の `colors` / `isDarkMode` を受け取ることでダークモード完全対応を実現。

## タブ構成

```
[ ノート一覧 | テスト状況 | フィードバック ]
```

- `feedbackApiBaseUrl` と `feedbackAdminKey` の両方が指定された場合のみ表示
- 既存の 2 タブには影響なし

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/types/index.ts` | 修正 | `DebugAdminProps` に `feedbackApiBaseUrl` / `feedbackAdminKey` 追加 |
| `src/components/admin/FeedbackTab.tsx` | **新規** | フィードバックタブ本体（約 480 行） |
| `src/components/DebugAdmin.tsx` | 修正 | `FeedbackTab` import、タブバー拡張、コンテンツ切替追加 |
| `sample/App.tsx` | 修正 | `feedback-admin` ビュー削除、`DebugAdmin` に feedback props 追加 |
| `tests/feedback-admin.spec.ts` | **新規** | Playwright E2E テスト（14 テスト） |
| `tests/fixtures/feedbacks.ts` | **新規** | フィードバック fixture データ |
| `tests/helpers/routes.ts` | 修正 | フィードバック API モック 4 関数追加 |

### 変更しなかったファイル

| ファイル | 理由 |
|---------|------|
| `src/components/manual/FeedbackAdmin.tsx` | 後方互換のため残す |
| `src/hooks/useFeedbackAdmin.ts` | そのまま使用 |
| `src/utils/feedbackApi.ts` | そのまま使用 |
| `src/index.ts` | export 追加不要（FeedbackTab は内部コンポーネント） |

---

## 実装内容

### 1. DebugAdminProps 拡張

`src/types/index.ts` に 2 つのオプショナル props を追加:

```typescript
export interface DebugAdminProps {
  apiBaseUrl?: string;
  env?: Environment;
  feedbackApiBaseUrl?: string;  // 追加
  feedbackAdminKey?: string;    // 追加
}
```

### 2. FeedbackTab コンポーネント

`src/components/admin/FeedbackTab.tsx` を新規作成。

**レイアウト**: ノート一覧タブと同じ **サイドバー（380px）+ 詳細ペイン** 構造。

```
┌─────────────────────────────────────────────────────┐
│ [ フィルタ: ステータス | 種別 | 対象 | タグ ]       │
├──────────────┬──────────────────────────────────────┤
│ 一覧         │ 詳細                                 │
│ ┌──────────┐ │ #1 フィードバック                    │
│ │ #1 不具合│ │ 種別: 不具合  対象: アプリ            │
│ │ Open     │ │ ステータス: [open ▼]  [削除]         │
│ │ 2/10     │ │                                      │
│ └──────────┘ │ メタ情報: URL / ユーザー / バージョン │
│ ┌──────────┐ │                                      │
│ │ #2 要望  │ │ メッセージ:                          │
│ │ 対応中   │ │ ログイン画面で...                    │
│ │ 2/9      │ │                                      │
│ └──────────┘ │ 環境情報: OS / Browser / Screen       │
│              │ コンソールログ (1件)                  │
│ ── ページ ──│ ネットワークログ (1件)                │
│ ── 統計 ──  │                                      │
│ 3件 1Open   │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Props**:

```typescript
interface FeedbackTabProps {
  apiBaseUrl: string;
  adminKey: string;
  colors: Colors;       // DebugAdmin のテーマカラー
  isDarkMode: boolean;  // ログ表示用
  refreshKey: number;   // ヘッダー更新ボタン連動
}
```

**主要機能**:
- `useFeedbackAdmin` hook + `getFeedbackDetail` をそのまま使用
- `colors` prop によるダークモード完全対応（ハードコードカラーなし）
- KIND バッジ: 固定色 + `${color}15` 透過背景（severity バッジと同手法）
- STATUS バッジ: `colors.warning`/`colors.primary`/`colors.success` 連動
- コンソール/ネットワークログ: DebugAdmin と同一スタイル
- ページネーション: サイドバー下部
- 統計バー: 合計/Open/対応中/完了
- `refreshKey` 変更時に `useRef` + `useEffect` で `refresh()` をトリガー

### 3. DebugAdmin.tsx 修正

- `activeTab` の型を `'notes' | 'test-status' | 'feedback'` に拡張
- `hasFeedbackTab = !!(feedbackApiBaseUrl && feedbackAdminKey)` で表示条件判定
- タブバーに「フィードバック」ボタンを条件付き追加
- コンテンツ領域に `FeedbackTab` を三項演算子で追加

### 4. sample/App.tsx 更新

- `feedback-admin` ビューを削除（`View` 型、`NAV_ITEMS`、レンダリング部分）
- `DebugAdmin` に `feedbackApiBaseUrl` / `feedbackAdminKey` を追加
- `FeedbackAdmin` の import を削除
- AppView テーブルの Admin 行の説明に「フィードバック管理」を追加

---

## E2E テスト

### テストファイル

- `tests/feedback-admin.spec.ts` — 14 テスト
- `tests/fixtures/feedbacks.ts` — fixture (ok: 3件 / detail: ログ付き / empty / error)
- `tests/helpers/routes.ts` — 4 ヘルパー追加

### route ヘルパー

| 関数 | 対象 API |
|------|---------|
| `mockGetFeedbacks(page, 'ok'/'empty'/'error')` | `GET /feedbacks` |
| `mockGetFeedbackDetail(page, feedback?)` | `GET /feedbacks/:id` |
| `mockUpdateFeedbackStatus(page)` | `PATCH /feedbacks/:id/status` |
| `mockDeleteFeedback(page)` | `DELETE /feedbacks/:id` |

### テストケース

| # | テスト | 検証内容 |
|---|--------|---------|
| 1 | タブ表示 | props 指定時にフィードバックタブが表示される |
| 2 | 一覧表示 | 3件のメッセージと統計バー（3件）が表示される |
| 3 | 詳細表示 | クリック → 右ペインに URL/ユーザー/バージョン |
| 4 | 環境情報 | OS/Browser が詳細ペインに表示される |
| 5 | コンソールログ | エラーレベルとメッセージが表示される |
| 6 | ネットワークログ | メソッド/ステータス/URL が表示される |
| 7 | ステータス変更 | ドロップダウンで closed に変更できる |
| 8 | 削除 | confirm → 削除ボタンが動作する |
| 9 | 空状態 | 「フィードバックがありません」メッセージ |
| 10 | API エラー | 500 でもクラッシュしない |
| 11 | 未選択 | 「フィードバックを選択してください」プレースホルダー |
| 12 | 種別バッジ | 不具合/要望/質問ラベルが表示される |
| 13 | ステータスバッジ | Open/対応中/完了ラベルが表示される |
| 14 | タブ切替 | ノート ↔ フィードバック相互遷移が正しく動作する |

### テスト結果

```
全 36 テスト合格（既存 22 + 新規 14）
リグレッションなし
```

---

## 後方互換

既存の `FeedbackAdmin` コンポーネントは削除していない。
利用者は 2 つの方法から選択できる:

1. **統合版**（推奨）: `DebugAdmin` に `feedbackApiBaseUrl` + `feedbackAdminKey` を渡す
2. **単体版**: 従来通り `FeedbackAdmin` を別ページで使う

---

## ビルド結果

```
tsc --noEmit: OK
npm run build: OK

dist/chunks/DebugAdmin-B5gCRGFk.js  139.16 kB (FeedbackTab 含む)
dist/chunks/FeedbackAdmin-ZLTEA0Jf.js  65.09 kB (単体版、そのまま)
```
