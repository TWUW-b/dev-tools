# コードクリーンアップ

**Status:** done

---

## 概要

デバッグ残骸、命名の不統一、デッドコード、スタイル定数の重複を整理する。機能変更なし。

---

## 1. console.log の除去 [DONE]

`src/components/manual/MarkdownRenderer.tsx` の4箇所のデバッグ出力を全削除。

## 2. 命名の統一: testCaseId / testCaseIds [DONE]

- `NoteInput.testCaseId` → `testCaseIds: number[]` に変更
- `api.ts` の送信データを `testCaseIds` に更新
- `Note.test_case_id` は `@deprecated` マーク付きで残存（バックエンド互換）
- バックエンドは既に `testCaseIds` 配列と `testCaseId` 単一の両方を受け付ける

## 3. COLORS 定数の一元管理 [DONE]

`src/styles/colors.ts` に集約:
- `DEBUG_COLORS`: DebugPanel / DebugAdmin 用（primary: #1E40AF）
- `MANUAL_COLORS`: ManualPiP / ManualTabPage / ManualSidebar 用（primary: #043E80）

各コンポーネントのローカル定義を削除し、import に変更。

## 4. deprecated の整理 [DONE]

- `ConsoleLogConfig.levels` — 型定義から削除、logCapture の fallback ロジック除去
- `ConsoleLogConfig.maxEntries` — 型定義から削除、logCapture の fallback ロジック除去
- 対応するテストケース2件も削除
- v4 マイグレーション (no-op) はマイグレーション番号の連続性のため残存
- `api_key` (config.example.php) は保留中（セキュリティ対応と合わせて判断）

## 5. useManualLoader のコメント [対応済み]

既にコメントが記載されている（L49-50）。追加対応不要。
