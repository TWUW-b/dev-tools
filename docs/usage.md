# 使用方法ガイド

`@genlib/debug-notes` の詳細な使用方法です。

## 目次

1. [基本的な使い方](#1-基本的な使い方)
2. [コンポーネント](#2-コンポーネント)
3. [フック](#3-フック)
4. [ユーティリティ](#4-ユーティリティ)
5. [API リファレンス](#5-api-リファレンス)
6. [ブラウザ対応](#6-ブラウザ対応)

---

## 1. 基本的な使い方

### 最小構成

```typescript
import { DebugPanel, useDebugMode, setDebugApiBaseUrl } from '@genlib/debug-notes';

// API URL を設定（アプリ起動時に1回）
setDebugApiBaseUrl('https://your-domain.com/__debug/api');

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <YourApp />
      {isDebugMode && <DebugPanel />}
    </>
  );
}
```

### デバッグモードの有効化

#### 方法1: キーボードショートカット（推奨）

`z` キーを 400ms 以内に **3回連打** でデバッグモードをトグルします。

- `input`, `textarea`, `select`, `[contenteditable]` にフォーカス中は無効
- 状態は `localStorage` に保持（ブラウザを閉じても維持）
- 再度3連打で解除
- 他タブでの変更も `storage` イベントで同期

#### 方法2: ハッシュベース（URL共有）

URL に `#debug` を付けてアクセスすると、デバッグモードが有効化されます。
`localStorage` に保存されるため、以降はハッシュなしでも維持されます。

```
https://your-app.com/#debug
https://your-app.com/some-page#debug
```

> **Note**: `#debug` は有効化のみ。解除はz×3連打で行います。

---

## 2. コンポーネント

### DebugPanel

バグ記録用の入力パネル。PiP（Picture-in-Picture）ウィンドウとして表示されます。

```typescript
import { DebugPanel } from '@genlib/debug-notes';

<DebugPanel
  apiBaseUrl="https://example.com/__debug/api"  // 省略可（setDebugApiBaseUrl使用時）
  env="dev"                                      // 'dev' | 'test'（デフォルト: 'dev'）
  onSave={(note) => console.log('Saved:', note)} // 保存時コールバック
  onClose={() => console.log('Closed')}          // 閉じた時コールバック
  initialSize={{ width: 400, height: 500 }}      // 初期サイズ
  testCases={testCases}                          // テストケース配列
  logCapture={logCapture}                        // ログキャプチャインスタンス
/>
```

#### 入力項目

| 項目 | 必須 | 説明 |
|------|------|------|
| 重要度 | | critical / high / medium / low |
| 内容 | ✓ | 詳細な説明（4,000文字以内）。title は1行目から自動生成 |
| 補足メモ | | 状況や気づいたこと（20,000文字以内、自動マスク） |

##### 添付オプション（トグルで展開）

| 項目 | デフォルト | 説明 |
|------|-----------|------|
| GETレスポンスを含める | OFF | GET リクエストのレスポンスボディを添付 |
| 通信時間を含める | OFF | 各リクエストの所要時間を添付 |
| ヘッダーを含める | OFF | リクエスト/レスポンスヘッダーを添付 |

> **自動添付される内容**（UIに表示しない）:
> - コンソールログ（error 30件 + warn/log 30件）
> - ネットワークログ（URL, メソッド, ステータス, POST等のボディ）
> - 環境情報（userAgent, viewport, URL, timestamp）

#### 3タブ構成

| タブ | 機能 |
|------|------|
| **記録** | バグ報告フォーム（内容・補足メモ・重要度・添付オプション） |
| **管理** | ノート一覧 + セレクトボックス（open/resolved/rejected/fixed）+ source badge（🧪） |
| **テスト** | チェックボックス式テスト実行（Domain/Capability/Case階層、Capability単位で送信） |

#### 動作

1. 右下の「バグ記録」ボタンをクリック
2. PiP ウィンドウが開く（非対応ブラウザではオーバーレイ表示）
3. **記録タブ**: フォームに入力して「保存」。コンソール/ネットワークログと環境情報が自動添付される。添付オプションでGETレスポンス・通信時間・ヘッダーを追加可能
4. **管理タブ**: セレクトボックスでステータスを自由に変更（open / resolved / rejected / fixed）
5. **テストタブ**: チェックボックスでPASS、バグ報告フォームでFAIL → Capability単位で送信
6. 現在の URL（route）と画面タイトル（screen_name）が自動取得される

### DebugAdmin

バグ記録の管理画面。一覧表示・ステータス変更・削除が可能。

```typescript
import { DebugAdmin } from '@genlib/debug-notes';

<DebugAdmin
  apiBaseUrl="https://example.com/__debug/api"  // 省略可
  env="dev"                                      // 'dev' | 'test'
/>
```

#### 機能

- **一覧表示**: 記録されたノートをリスト表示
- **フィルタ**: ステータス（Open/Resolved/Rejected/Fixed）、ソース（manual/test）でフィルタリング
- **検索**: タイトル・内容で検索
- **ステータス変更**: 全ステータス間で自由に遷移可能（open / resolved / rejected / fixed）
- **テストフロー連携**: source=test のノートには Capability/Case 名を表示、retest フラグ、openIssues リンク
- **重要度変更**: critical / high / medium / low / 未設定 の変更
- **削除**: 論理削除（復元不可）
- **ダークモード**: システム設定に追従 + 手動切替
- **自動更新**: 30秒間隔で自動更新（ON/OFF可能）
- **ログ表示**: 詳細ビューでコンソールログ・ネットワークログ・環境情報を表示
- **テスト状況タブ**: テストケースの実行状況をDomain/Capability/Case階層で一覧表示。ケースごとの直近結果・open件数を確認し、ノート一覧への遷移が可能

#### アクセス方法

管理画面へのリンクは **利用側アプリのヘッダーに組み込む**。
デバッグモード時（`?mode=debug`）のみリンクを表示する。

```typescript
// components/AppHeader.tsx
import { Link } from 'react-router-dom';
import { useDebugMode } from '@genlib/debug-notes';

export function AppHeader() {
  const { isDebugMode } = useDebugMode();

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        {/* デバッグモード時のみ表示 */}
        {isDebugMode && (
          <Link to="/debug-admin?mode=debug">Debug Notes</Link>
        )}
      </nav>
    </header>
  );
}
```

#### 管理画面ページの作成

```typescript
// pages/debug-admin.tsx
import { DebugAdmin, useDebugMode } from '@genlib/debug-notes';
import { Navigate } from 'react-router-dom';

export default function DebugAdminPage() {
  const { isDebugMode } = useDebugMode();

  // デバッグモードでない場合はリダイレクト
  if (!isDebugMode) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ height: '100vh' }}>
      <DebugAdmin env="dev" />
    </div>
  );
}
```

#### ルーティング設定

```typescript
// routes.tsx
import DebugAdminPage from './pages/debug-admin';

const routes = [
  // ... 他のルート
  {
    path: '/debug-admin',
    element: <DebugAdminPage />,
  },
];
```

---

## 3. フック

### useDebugMode

URL パラメータ `?mode=debug` を検出します。

```typescript
import { useDebugMode } from '@genlib/debug-notes';

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      {isDebugMode && <DebugPanel />}
      {isDebugMode && <div>デバッグモード中</div>}
    </>
  );
}
```

### useDebugNotes

ノートの CRUD 操作を行うフック。

```typescript
import { useDebugNotes } from '@genlib/debug-notes';

function MyComponent() {
  const {
    notes,        // Note[] - ノート一覧
    loading,      // boolean - 読み込み中
    error,        // Error | null - エラー
    createNote,   // (input: NoteInput) => Promise<Note | null>
    updateStatus, // (id: number, status: Status) => Promise<boolean>
    deleteNote,   // (id: number) => Promise<boolean>
    refresh,      // () => void - 再読み込み
  } = useDebugNotes('dev'); // 'dev' | 'test'

  const handleCreate = async () => {
    const note = await createNote({
      title: 'バグ報告',
      content: '詳細な説明',
      severity: 'high',
    });
    if (note) {
      console.log('Created:', note.id);
    }
  };

  return (
    <div>
      {loading && <p>読み込み中...</p>}
      {notes.map(note => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
}
```

---

## 4. ユーティリティ

### setDebugApiBaseUrl

API の Base URL を設定します。アプリ起動時に1回呼び出してください。

```typescript
import { setDebugApiBaseUrl } from '@genlib/debug-notes';

// 環境変数から設定
setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);

// 直接指定
setDebugApiBaseUrl('https://example.com/__debug/api');
```

### maskSensitive

機密情報をマスクします。ログ保存時に自動適用されますが、手動でも使用可能。

```typescript
import { maskSensitive } from '@genlib/debug-notes';

const log = `
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx.yyy
Email: user@example.com
`;

const masked = maskSensitive(log);
// Authorization: Bearer [MASKED]
// Email: [EMAIL_MASKED]
```

#### マスク対象

| 対象 | マスク後 |
|------|----------|
| Authorization ヘッダー | `[MASKED]` |
| Cookie / Set-Cookie | `[MASKED]` |
| JWT トークン | `[JWT_MASKED]` |
| Bearer トークン | `[MASKED]` |
| メールアドレス | `[EMAIL_MASKED]` |
| 電話番号 | `[PHONE_MASKED]` |

### createLogCapture

コンソール・ネットワークログのキャプチャを初期化します。アプリ起動時に1回呼び出してください。

```typescript
import { createLogCapture } from '@genlib/debug-notes';

const logCapture = createLogCapture({
  console: true,          // error 30件 + warn/log 30件（合計60件）
  network: ['/api/**'],   // /api/ 配下のfetchを30件バッファ
});

// DebugPanel に渡す
<DebugPanel logCapture={logCapture} />

// 手動でバッファを取得
logCapture.getConsoleLogs();  // ConsoleLogEntry[]（error優先、時系列ソート）
logCapture.getNetworkLogs();  // NetworkLogEntry[]

// クリーンアップ
logCapture.destroy();         // monkey-patch を復元しバッファをクリア
```

### parseTestCaseMd

Markdown テキストからテストケース配列をパースします。

```typescript
import { parseTestCaseMd } from '@genlib/debug-notes';

const testCases = parseTestCaseMd(`
---
domain: admin
---

# A1 事務所登録

## 正常系
- 必須項目のみで登録できる
- 全項目入力して登録できる

## バリデーション
- 必須項目未入力でエラーが表示される
`);

// ParsedTestCase[] 型
// [
//   { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目のみで登録できる' },
//   { domain: 'admin', capability: 'A1 事務所登録', title: '全項目入力して登録できる' },
//   { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目未入力でエラーが表示される' },
// ]

<DebugPanel testCases={testCases} />
```

### テストフロー型定義

```typescript
// パース結果
interface ParsedTestCase {
  domain: string;
  capability: string;
  title: string;
}

// ツリー構造（UI表示用）
interface CaseSummary {
  caseId: number;
  title: string;
  last: 'pass' | 'fail' | 'skip' | null;
  retest: boolean;
  openIssues: number;
}

interface CapabilitySummary {
  capability: string;
  total: number;
  passed: number;
  failed: number;
  status: 'passed' | 'fail' | 'retest' | null;
  openIssues: number;
  cases: CaseSummary[];
}

interface DomainTree {
  domain: string;
  capabilities: CapabilitySummary[];
}

// テスト実行（Capability単位で送信）
interface TestRunInput {
  caseId: number;
  result: 'pass' | 'fail' | 'skip';
  note?: {
    content: string;
    severity?: Severity;
    consoleLogs?: ConsoleLogEntry[];
    networkLogs?: NetworkLogEntry[];
    environment?: EnvironmentInfo;
  };
}

interface TestRunResponse {
  results: Array<{
    caseId: number;
    runId: number;
    result: string;
    noteId?: number;
  }>;
  capability: CapabilitySummary;
}
```

---

## 5. API リファレンス

### 型定義

```typescript
// 重要度
type Severity = 'critical' | 'high' | 'medium' | 'low';

// ステータス
type Status = 'open' | 'resolved' | 'rejected' | 'fixed';

// 環境
type Environment = 'dev' | 'test';

// ソース
type Source = 'manual' | 'test';

// ノート
interface Note {
  id: number;
  route: string;          // 自動取得されたURL
  screen_name: string;    // 自動取得された画面タイトル
  title: string;          // content の1行目から自動生成
  content: string;
  user_log: string | null;
  steps: string | null;   // JSON文字列
  severity: Severity | null;
  status: Status;
  source: Source;         // manual / test
  test_case_id: number | null;  // テストケースID（後方互換、先頭1件）
  test_case_ids: number[];      // テストケースID配列（複数紐付け対応）
  deleted_at: string | null;
  created_at: string;
  console_log?: ConsoleLogEntry[] | null;  // 詳細APIのみ
  network_log?: NetworkLogEntry[] | null;  // 詳細APIのみ
  environment?: EnvironmentInfo | null;    // 詳細APIのみ
}

// ノート作成入力
interface NoteInput {
  title?: string;         // 省略可（content の1行目から自動生成）
  content: string;        // 必須
  userLog?: string;
  severity?: Severity;
  route?: string;         // 省略時は自動取得
  screenName?: string;    // 省略時は自動取得
  status?: 'open';        // デフォルト: 'open'
  source?: 'manual' | 'test';  // デフォルト: 'manual'
  testCaseId?: number;    // source=test 時のテストケースID
  consoleLogs?: ConsoleLogEntry[];
  networkLogs?: NetworkLogEntry[];
  environment?: EnvironmentInfo;
}
```

### REST API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/notes?env=dev` | ノート一覧取得（ログ系カラム除外） |
| GET | `/notes/{id}?env=dev` | ノート詳細取得（全カラム） |
| POST | `/notes?env=dev` | ノート作成 |
| PATCH | `/notes/{id}/status?env=dev` | ステータス更新（全ステータス間で遷移可能） |
| PATCH | `/notes/{id}/severity?env=dev` | 重要度更新 |
| DELETE | `/notes/{id}?env=dev` | ノート削除（論理削除） |
| POST | `/test-cases/import` | テストケースインポート（MDパース結果） |
| DELETE | `/test-cases` | テストケース一括削除（関連データも削除） |
| GET | `/test-cases/tree?env=dev` | テストツリー取得（集計付き、1リクエスト） |
| POST | `/test-runs?env=dev` | テスト実行結果一括記録（Capability単位） |

#### クエリパラメータ（GET）

| パラメータ | 説明 |
|------------|------|
| `env` | 環境（dev / test）必須 |
| `status` | フィルタ（open / resolved / rejected / fixed） |
| `q` | 検索クエリ |
| `includeDeleted` | 削除済みを含める（1 / 0） |

---

## 6. ブラウザ対応

### PiP（Picture-in-Picture）対応

Document Picture-in-Picture API を使用しています。

| ブラウザ | 対応 |
|----------|------|
| Chrome 116+ | ✅ |
| Edge 116+ | ✅ |
| Firefox | ❌（フォールバック） |
| Safari | ❌（フォールバック） |

非対応ブラウザでは、オーバーレイモーダルとして表示されます。

### 動作確認済み環境

- Chrome 120+
- Edge 120+
- Firefox 120+（フォールバックモード）
- Safari 17+（フォールバックモード）

---

## 本番環境での除外

本番ビルドにデバッグライブラリを含めないようにします。

### 方法1: 動的インポート

```typescript
// main.tsx
if (import.meta.env.MODE !== 'production') {
  import('@genlib/debug-notes').then(({ setDebugApiBaseUrl }) => {
    setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);
  });
}
```

### 方法2: 条件付きレンダリング

```typescript
function App() {
  const isProd = import.meta.env.PROD;

  return (
    <>
      <YourApp />
      {!isProd && <DebugPanel />}
    </>
  );
}
```

### 方法3: 別エントリポイント

```typescript
// main.tsx（本番）
ReactDOM.createRoot(root).render(<App />);

// main.dev.tsx（開発）
import { setDebugApiBaseUrl } from '@genlib/debug-notes';
setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);
ReactDOM.createRoot(root).render(<AppWithDebug />);
```
