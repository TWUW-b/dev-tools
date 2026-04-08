# PiP 自動セットアップ & 実行中テストケース自動紐付け

## 背景 / 要望

ユーザーからの3点要望:

1. **統合ガイドが手動配置を要求するのが不満**
   利用側で `DebugPanel` / `DebugAdmin` / `logCapture` / `testCases` をそれぞれ import して
   配線するのが負担。1コンポーネントで済ませたい。
2. **DebugAdmin 画面内に PiP を常時表示**
   `/__admin` を開いたとき DebugPanel (PiP) も自動で開き、record タブをアクティブにしたい。
3. **record タブで "現在実行中のテストケース" を自動紐付け**
   TestTab で進行中のケースがある状態で record に切り替えて保存すると、
   `test_case_ids` に自動で付与する。UI 追加は不要。

## 現状整理

- `src/components/DebugPanel.tsx`: PiP 本体。タブは `record` / `manage` / `test` / `manual`。
  記録保存は `createNote()` 経由（`utils/api.ts:109` で `testCaseIds` 対応済み）。
- `src/components/DebugAdmin.tsx`: 管理ダッシュボード。現状 PiP との連動は無し。
- `src/components/debug/TestTab.tsx`: 複数ケース選択・一括報告用。
  **"現在実行中" という概念は未実装**。`useImperativeHandle` は `refresh` のみ公開。
- `docs/integration-guide.md` Step 8: 利用側で `DebugPanel` を手動配置させている。
- DB スキーマ: `notes.test_case_id` (legacy) + `note_test_cases` 中間テーブルで `test_case_ids`
  対応済み（`api/Database.php`）。スキーマ変更不要。

## 設計

### 1. ワンストップ統合コンポーネント `<DevTools>`

新規: `src/components/DevTools.tsx`

```tsx
<DevTools
  apiBaseUrl={import.meta.env.VITE_DEBUG_API_URL}
  env="dev"
  adminKey={import.meta.env.VITE_DEBUG_ADMIN_KEY}
  testCases={allTestCases}
  manualItems={manualItems}
  adminRoutePath="/__admin"   // 省略可
/>
```

責務:
- `apiBaseUrl` があれば `setDebugApiBaseUrl()` を内部で実行
- `createLogCapture({ console: true, network: ['/api/**'] })` を内部で生成（useMemo）
- `useDebugMode()` を購読し、`isDebugMode` の時のみ `<DebugPanel>` をレンダ
- `adminRoutePath` が現在の URL と一致するときは `<DebugAdmin>` もレンダ
  （利用側の Router 内に置く想定。`window.location.pathname` を購読するのではなく
  `Routes` 内で使う設計: `<Route path="/__admin" element={<DevTools.Admin .../>} />` 方式も検討。
  → シンプルさ優先で **`DevTools` は Routes の外に置き、DebugPanel のみレンダ**。
  Admin は従来通り別 Route に置く案 A と、DevTools がすべてラップする案 B。
  **案 A を採用**し、Step 8/9 を DevTools 1 コンポーネントに集約しつつ Admin は別 Route のまま。)

### 2. DebugAdmin 画面で PiP を自動表示

- `DebugAdmin.tsx` 自体は触らない（循環依存回避のため DebugPanel を内包しない）
- 代わりに `<DevTools>` が常に DebugPanel をレンダしているので、
  `/__admin` を開いている間も PiP が表示される仕組みを利用
- ただし現状 `isDebugMode` が false だと表示されない。
  → **`autoOpenOnAdminRoute` prop を追加**し、`adminRoutePath` にいる間は
  `isDebugMode` を強制 true として扱う（`useDebugMode()` の上書きではなく
  `shouldShowPiP = isDebugMode || isOnAdminRoute` の内部判定）。
- デフォルト `record` タブは既に `useState<PipTab>('record')` で保証済み（変更不要）。

### 3. 実行中テストケースの自動紐付け

#### 3-1. "実行中" の定義を導入

`TestTab` に「実行中セット」の概念を追加:
- ユーザーがケースの「開始」ボタンを押すと `runningCaseIds: Set<number>` に追加
- 「完了/失敗」で削除
- 現状の TestTab はステータス更新 UI 中心。**最小変更案**:
  新規 state `runningCaseIds` を TestTab 内に持たせる代わりに、
  **DebugPanel レベル**で `runningTestCaseIds: number[]` を state として持ち、
  TestTab には setter を props で渡す。

#### 3-2. record タブからの保存時に自動付与

`DebugPanel.tsx` の保存ハンドラ（`handleSubmit` 相当）で、
`testCaseIds` が未指定かつ `runningTestCaseIds.length > 0` の場合に
`createNote({ ..., testCaseIds: runningTestCaseIds })` として保存。

#### 3-3. UI フィードバック

record タブ上部に小さなバッジで「実行中: #12, #15」を表示（クリックで解除可能）。
→ 要望は「UI 追加なし」だが、誤紐付け防止のため最低限の表示は必要。
**要確認**: バッジ表示を入れてよいか。

### 4. integration-guide.md の更新

Step 7〜10 を統合し、以下に置き換え:

```tsx
import { DevTools } from '@twuw-b/dev-tools';
import { allTestCases } from './debug/testCases';

<DevTools
  apiBaseUrl={import.meta.env.VITE_DEBUG_API_URL}
  env="dev"
  adminKey={import.meta.env.VITE_DEBUG_ADMIN_KEY}
  testCases={allTestCases}
/>
```

+ 管理ダッシュボードは従来通り `<Route path="/__admin" element={<DebugAdmin ... />} />`
  を残す（案 A）。将来 `<DevTools.Admin>` へ移行する余地を残す。

## 影響範囲

| ファイル | 変更 |
|----------|------|
| `src/components/DevTools.tsx` | **新規** |
| `src/components/index.ts` | `DevTools` 追加 export |
| `src/index.ts` | 再 export |
| `src/components/DebugPanel.tsx` | `runningTestCaseIds` prop 追加、保存時の自動付与、バッジ表示 |
| `src/components/debug/TestTab.tsx` | "開始/完了" UI & `onRunningChange` コールバック（最小変更） |
| `sample/App.tsx` | `DevTools` 使用例に差し替え |
| `docs/integration-guide.md` | Step 7-10 を集約して書き換え |
| `tests/` | `DevTools` のユニット、record 保存時の自動紐付け、DebugAdmin ルート時の自動表示 |

API / DB 変更なし。

## オープン課題（要ユーザー確認）

1. **案 A/B**: `DevTools` を Routes の外に置き Admin は別 Route のままにするか、
   `<DevTools.Admin>` のようにフルラップするか。→ 案 A を推奨（破壊的変更が最小）。
2. **実行中バッジ表示**: record タブに「実行中ケース」バッジを出してよいか。
   出さないと何が紐付くか見えないので誤操作の懸念。
3. **"実行中" のライフサイクル**: ページリロードで消えるメモリ管理でよいか、
   localStorage 永続化が必要か。→ メモリのみ推奨。
4. **`isDebugMode` の扱い**: `/__admin` ルートでは debug mode を強制 ON にするか、
   それとも従来通り `z×3` 等でトグルしたときのみ PiP を出すか。
   要望「DebugAdmin 画面内にPiPを常時表示」→ 強制 ON 解釈で進める想定。

## 実装順序

1. `DevTools` コンポーネント新規作成（既存配線の集約のみ、挙動は同じ）
2. `isDebugMode` 強制 ON ロジック追加（`/__admin` ルート時）
3. TestTab に "開始/完了" と `onRunningChange`
4. DebugPanel に `runningTestCaseIds` state と保存時自動付与 + バッジ
5. sample/App.tsx を新 API に移行
6. integration-guide.md 書き換え
7. テスト追加・既存テスト通過確認
8. `dist/` 再ビルド
