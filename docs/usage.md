# 使用方法ガイド

`@twuw-b/dev-tools` の詳細な使用方法です。

## 目次

1. [基本的な使い方](#1-基本的な使い方)
2. [コンポーネント](#2-コンポーネント)
3. [フック](#3-フック)
4. [ユーティリティ](#4-ユーティリティ)
5. [API リファレンス](#5-api-リファレンス)
6. [ブラウザ対応](#6-ブラウザ対応)

---

## 1. 基本的な使い方

### インポートパス

| パス | 内容 |
|------|------|
| `@twuw-b/dev-tools` | 全機能（デバッグ + マニュアル + フィードバック） |
| `@twuw-b/dev-tools/components` | コンポーネントのみ |
| `@twuw-b/dev-tools/hooks` | フックのみ |
| `@twuw-b/dev-tools/manual` | マニュアル系コンポーネントのみ |

### 最小構成

```typescript
import { DebugPanel, useDebugMode, setDebugApiBaseUrl } from '@twuw-b/dev-tools';

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
import { DebugPanel } from '@twuw-b/dev-tools';

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
| **管理** | ノート一覧 + セレクトボックス（open/resolved/rejected/fixed）+ source badge |
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
import { DebugAdmin } from '@twuw-b/dev-tools';

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
デバッグモード時のみリンクを表示する。

```typescript
// components/AppHeader.tsx
import { Link } from 'react-router-dom';
import { useDebugMode } from '@twuw-b/dev-tools';

export function AppHeader() {
  const { isDebugMode } = useDebugMode();

  return (
    <header>
      <nav>
        <Link to="/">Home</Link>
        {/* デバッグモード時のみ表示 */}
        {isDebugMode && (
          <Link to="/debug-admin">Debug Notes</Link>
        )}
      </nav>
    </header>
  );
}
```

#### 管理画面ページの作成

```typescript
// pages/debug-admin.tsx
import { DebugAdmin, useDebugMode } from '@twuw-b/dev-tools';
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

### ManualPiP

PiP フローティングウィンドウで Markdown マニュアルを表示します。

```typescript
import { ManualPiP, useManualPiP } from '@twuw-b/dev-tools/manual';

function App() {
  const { isOpen, currentPath, openPiP, closePiP, setPath } = useManualPiP();

  return (
    <>
      <button onClick={() => openPiP('/docs/guide.md')}>ヘルプ</button>
      <ManualPiP
        isOpen={isOpen}
        docPath={currentPath}
        onClose={closePiP}
        onNavigate={setPath}
      />
    </>
  );
}
```

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `isOpen` | `boolean` | ✓ | 開いているか |
| `docPath` | `string \| null` | ✓ | MD ファイルへのパス |
| `onClose` | `() => void` | ✓ | 閉じるハンドラ |
| `onNavigate` | `(path: string) => void` | | `.md` リンククリック時のハンドラ |
| `onAppNavigate` | `(path: string) => void` | | `app:/` リンククリック時のハンドラ（メイン画面遷移） |
| `initialPosition` | `{ x: number; y: number }` | | 初期位置 |
| `initialSize` | `{ width: number; height: number }` | | 初期サイズ |
| `showDownloadButton` | `boolean` | | ダウンロードボタン表示（デフォルト: false） |
| `feedbackApiBaseUrl` | `string` | | フィードバック API の Base URL（指定でフィードバック有効化） |
| `feedbackUserType` | `string` | | ユーザー種別 |
| `feedbackAppVersion` | `string` | | アプリバージョン |
| `onFeedbackSubmitSuccess` | `(feedback: Feedback) => void` | | フィードバック送信成功コールバック |
| `onFeedbackSubmitError` | `(error: Error) => void` | | フィードバック送信エラーコールバック |
| `feedbackDefaultHeight` | `number` | | フィードバック領域の初期高さ（デフォルト: 200px） |
| `feedbackMinHeight` | `number` | | フィードバック領域の最小高さ（デフォルト: 150px） |
| `feedbackMaxHeight` | `number` | | フィードバック領域の最大高さ（デフォルト: 400px） |

### ManualPage

フルページで Markdown マニュアルを表示します。

```typescript
import { ManualPage } from '@twuw-b/dev-tools/manual';

<ManualPage docPath="/docs/guide.md" className="my-manual" />
```

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `docPath` | `string` | ✓ | MD ファイルへのパス |
| `className` | `string` | | 追加の CSS クラス名 |

### ManualSidebar

マニュアル項目をカテゴリ別にグループ化して表示するナビゲーション。各項目に PiP 表示・新規タブ表示のアクションボタンを提供します。

```typescript
import { ManualSidebar } from '@twuw-b/dev-tools/manual';

const items: ManualItem[] = [
  { id: 'guide', title: '使い方ガイド', path: '/docs/guide.md', category: '基本' },
  { id: 'faq', title: 'よくある質問', path: '/docs/faq.md', category: '基本' },
  { id: 'api', title: 'API リファレンス', path: '/docs/api.md', category: '開発' },
];

<ManualSidebar
  items={items}
  onSelect={(path) => console.log('Selected:', path)}
  activePath="/docs/guide.md"
  onPiP={(path) => openPiP(path)}
  onNewTab={(path) => openTab(path)}
/>
```

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `items` | `ManualItem[]` | ✓ | マニュアル項目リスト |
| `onSelect` | `(path: string) => void` | ✓ | 選択ハンドラ |
| `activePath` | `string` | | 現在選択中のパス |
| `className` | `string` | | 追加の CSS クラス名 |
| `onPiP` | `(path: string) => void` | | PiP で開くハンドラ |
| `onNewTab` | `(path: string) => void` | | 新しいタブで開くハンドラ |

### ManualTabPage

別タブ用マニュアル表示ページ。URL クエリパラメータ `?path=/docs/xxx.md` でマニュアルを表示します。リサイズ可能なサイドバー、フィードバックセクション、管理画面へのショートカットを統合。

```typescript
import { ManualTabPage, setManualTabBaseUrl } from '@twuw-b/dev-tools/manual';

// 別タブ用のベースURLを設定
setManualTabBaseUrl('/manual');

function ManualViewPage() {
  return (
    <ManualTabPage
      sidebarPath="/docs/index.md"
      feedbackApiBaseUrl="https://your-domain.com/__feedback/api"
      feedbackUserType="developer"
      feedbackAppVersion="1.0.0"
      feedbackAdminUrl="/feedback-admin"
      defaultDocPath="/docs/guide.md"
    />
  );
}
```

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `sidebarPath` | `string \| null` | | サイドバーに表示する MD ファイルパス |
| `onSidebarNavigate` | `(path: string) => void` | | サイドバー内 `.md` リンククリック時 |
| `onSidebarAppNavigate` | `(path: string) => void` | | サイドバー内 `app:` リンククリック時 |
| `sidebarDefaultWidth` | `number` | | サイドバー初期幅（デフォルト: 400px） |
| `sidebarMinWidth` | `number` | | サイドバー最小幅（デフォルト: 250px） |
| `sidebarMaxWidth` | `number` | | サイドバー最大幅（デフォルト: 800px） |
| `feedbackApiBaseUrl` | `string` | | フィードバック API Base URL（指定で有効化） |
| `feedbackUserType` | `string` | | ユーザー種別 |
| `feedbackAppVersion` | `string` | | アプリバージョン |
| `feedbackAdminUrl` | `string` | | フィードバック管理画面 URL（隠しコマンド時の遷移先） |
| `feedbackDefaultHeight` | `number` | | フィードバック領域の初期高さ（デフォルト: 350px） |
| `feedbackMinHeight` | `number` | | フィードバック領域の最小高さ（デフォルト: 200px） |
| `feedbackMaxHeight` | `number` | | フィードバック領域の最大高さ（デフォルト: 600px） |
| `onFeedbackSubmitSuccess` | `(feedback: Feedback) => void` | | 送信成功コールバック |
| `onFeedbackSubmitError` | `(error: Error) => void` | | 送信エラーコールバック |
| `defaultDocPath` | `string` | | URL に `?path=` がない場合のデフォルトドキュメント |

### ManualLink

マニュアルへのナビゲーションリンク。

```typescript
import { ManualLink } from '@twuw-b/dev-tools/manual';

<ManualLink path="/docs/guide.md" onClick={(path) => openPiP(path)}>
  使い方ガイド
</ManualLink>
```

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `path` | `string` | ✓ | MD ファイルへのパス |
| `onClick` | `(path: string) => void` | ✓ | クリックハンドラ |
| `children` | `React.ReactNode` | ✓ | 子要素 |
| `className` | `string` | | 追加の CSS クラス名 |

### MarkdownRenderer

Markdown を HTML に変換して表示します。リンク処理をカスタマイズ可能。

```typescript
import { MarkdownRenderer } from '@twuw-b/dev-tools/manual';

<MarkdownRenderer
  content={markdownContent}
  onLinkClick={(path) => console.log('MD link:', path)}
  onAppLinkClick={(path) => navigate(path)}
/>
```

#### リンク処理

| リンク種別 | 動作 |
|------------|------|
| `.md` リンク | `onLinkClick` を呼び出し（PiP 内遷移） |
| `app:/` リンク | `onAppLinkClick` を呼び出し（メイン画面遷移） |
| その他の URL | 新しいタブで開く |

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `content` | `string` | ✓ | Markdown コンテンツ |
| `className` | `string` | | 追加の CSS クラス名 |
| `onLinkClick` | `(path: string) => void` | | `.md` リンククリック時のハンドラ |
| `onAppLinkClick` | `(path: string) => void` | | `app:/` リンククリック時のハンドラ |

### FeedbackForm

ユーザーからのフィードバック送信 UI。ManualPiP / ManualTabPage 内で自動表示されますが、単体でも使用可能。

```typescript
import { FeedbackForm } from '@twuw-b/dev-tools/manual';

<FeedbackForm
  apiBaseUrl="https://your-domain.com/__feedback/api"
  userType="developer"
  appVersion="1.0.0"
  onSubmitSuccess={(feedback) => console.log('Sent:', feedback.id)}
  onSubmitError={(error) => console.error(error)}
/>
```

#### 機能

- フィードバック種別タグ選択（bug / question / request / share / other）
- メッセージ入力（4,000文字制限）
- bug 選択時のみコンソール/ネットワークログを自動添付
- 詳細情報の折りたたみ（再現手順、期待結果）
- Cmd/Ctrl+Enter で送信
- トースト通知

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `apiBaseUrl` | `string` | ✓ | フィードバック API の Base URL |
| `userType` | `string` | | ユーザー種別 |
| `appVersion` | `string` | | アプリバージョン |
| `onSubmitSuccess` | `(feedback: Feedback) => void` | | 送信成功コールバック |
| `onSubmitError` | `(error: Error) => void` | | 送信エラーコールバック |

### FeedbackAdmin

管理者用フィードバック一覧・管理画面。

```typescript
import { FeedbackAdmin } from '@twuw-b/dev-tools/manual';

<FeedbackAdmin
  apiBaseUrl="https://your-domain.com/__feedback/api"
  adminKey="your-admin-key"
/>
```

#### 機能

- テーブル表示（日時、種別、対象、メッセージ、状態）
- フィルタリング（ステータス、種別、対象、カスタムタグ）
- 詳細展開（コンソール/ネットワークログ表示、ステータス変更、削除）
- ページネーション
- 自動リフレッシュ

#### Props

| Prop | 型 | 必須 | 説明 |
|------|------|------|------|
| `apiBaseUrl` | `string` | ✓ | フィードバック API の Base URL |
| `adminKey` | `string` | ✓ | 管理者キー（`X-Admin-Key` ヘッダーで送信） |

---

## 3. フック

### useDebugMode

デバッグモードの検出・トグルを行うフック。z×3連打（400ms）と `#debug` ハッシュによる有効化をサポートします。

```typescript
import { useDebugMode } from '@twuw-b/dev-tools';

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

#### 検出方法

| 方法 | 動作 |
|------|------|
| `z` ×3連打（400ms以内） | トグル（有効化 / 解除） |
| URL `#debug` ハッシュ | 有効化のみ（localStorage に保存） |
| `localStorage` | ブラウザ再起動後も維持 |
| `storage` イベント | 他タブでの変更を同期 |

### useDebugNotes

ノートの CRUD 操作を行うフック。

```typescript
import { useDebugNotes } from '@twuw-b/dev-tools';

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

### useManualPiP

PiP / 別タブの開閉状態を管理するフック。

```typescript
import { useManualPiP } from '@twuw-b/dev-tools/manual';

const { isOpen, currentPath, openPiP, openTab, closePiP, setPath } = useManualPiP();

// PiP で開く
openPiP('/docs/guide.md');

// 別タブで開く（setManualTabBaseUrl で設定したベースURLを使用）
openTab('/docs/guide.md');

// パスを変更（PiP 内遷移）
setPath('/docs/faq.md');
```

#### 戻り値

| プロパティ | 型 | 説明 |
|------------|------|------|
| `isOpen` | `boolean` | PiP が開いているか |
| `currentPath` | `string \| null` | 現在表示中のパス |
| `openPiP` | `(path: string) => void` | PiP を開く |
| `openTab` | `(path: string) => void` | 別タブで開く |
| `closePiP` | `() => void` | PiP を閉じる |
| `setPath` | `(path: string) => void` | パスを変更 |

### useManualLoader

MD ファイルを取得するフック。AbortController 対応、`app:` プロトコル前処理、再読み込み機能を提供。

```typescript
import { useManualLoader } from '@twuw-b/dev-tools/manual';

const { content, loading, error, reload } = useManualLoader('/docs/guide.md');
```

#### 引数

| 引数 | 型 | 説明 |
|------|------|------|
| `path` | `string \| null` | MD ファイルへのパス（null で無効化） |

#### 戻り値

| プロパティ | 型 | 説明 |
|------------|------|------|
| `content` | `string \| null` | Markdown コンテンツ |
| `loading` | `boolean` | 読み込み中 |
| `error` | `Error \| null` | エラー |
| `reload` | `() => void` | 再読み込み |

### useManualDownload

MD ファイルのダウンロード機能。単体ファイル・複数ファイル ZIP に対応。

```typescript
import { useManualDownload } from '@twuw-b/dev-tools/manual';

const { downloadMd, downloadMultipleMd } = useManualDownload();

// 単体ダウンロード
await downloadMd('/docs/guide.md', 'guide.md');

// 複数ファイルを ZIP でダウンロード
await downloadMultipleMd(
  [
    { path: '/docs/guide.md', filename: 'guide.md' },
    { path: '/docs/faq.md', filename: 'faq.md' },
  ],
  'manuals.zip',
);
```

#### 戻り値

| プロパティ | 型 | 説明 |
|------------|------|------|
| `downloadMd` | `(path: string, filename?: string) => Promise<void>` | 単体ダウンロード |
| `downloadMultipleMd` | `(files: DownloadFile[], zipName?: string) => Promise<void>` | ZIP ダウンロード |

### useResizable

パネルのリサイズ機能を提供するフック。マウスドラッグ・矢印キー（Ctrl/Cmd）による操作に対応。

```typescript
import { useResizable } from '@twuw-b/dev-tools/manual';

const { size, isResizing, handleMouseDown, handleKeyDown } = useResizable({
  defaultSize: 400,
  minSize: 250,
  maxSize: 800,
  direction: 'horizontal', // 'horizontal' | 'vertical'
});
```

#### オプション

| プロパティ | 型 | 必須 | 説明 |
|------------|------|------|------|
| `defaultSize` | `number` | ✓ | 初期サイズ（px） |
| `minSize` | `number` | ✓ | 最小サイズ（px） |
| `maxSize` | `number` | ✓ | 最大サイズ（px） |
| `direction` | `'horizontal' \| 'vertical'` | | リサイズ方向（デフォルト: `'horizontal'`） |
| `minAdjacentSize` | `number` | | 隣接ペインの最小サイズ（デフォルト: 300px） |
| `enabled` | `boolean` | | 有効/無効（デフォルト: true） |

#### 戻り値

| プロパティ | 型 | 説明 |
|------------|------|------|
| `size` | `number` | 現在のサイズ |
| `isResizing` | `boolean` | ドラッグ中か |
| `handleMouseDown` | `(e: React.MouseEvent) => void` | リサイズハンドルの mousedown |
| `handleKeyDown` | `(e: React.KeyboardEvent) => void` | 矢印キーによるサイズ変更 |

### useFeedback

フィードバック送信を管理するフック。環境情報（OS, ブラウザ, 画面サイズ, 言語）を自動付与。

```typescript
import { useFeedback } from '@twuw-b/dev-tools/manual';

const { submitting, error, submitFeedback } = useFeedback({
  apiBaseUrl: 'https://your-domain.com/__feedback/api',
  userType: 'developer',
  appVersion: '1.0.0',
});

const { data, error: submitError } = await submitFeedback(
  { kind: 'bug', message: '画面が正しく表示されない' },
  { consoleLogs, networkLogs }, // オプション: ログ添付
);
```

#### オプション

| プロパティ | 型 | 必須 | 説明 |
|------------|------|------|------|
| `apiBaseUrl` | `string` | ✓ | フィードバック API の Base URL |
| `userType` | `string` | | ユーザー種別 |
| `appVersion` | `string` | | アプリバージョン |

#### 戻り値

| プロパティ | 型 | 説明 |
|------------|------|------|
| `submitting` | `boolean` | 送信中 |
| `error` | `Error \| null` | エラー |
| `submitFeedback` | `(input, logs?) => Promise<{ data, error }>` | フィードバック送信 |

### useFeedbackAdmin

フィードバック管理 API と連携するフック。ページネーション、フィルタリング、ステータス更新、削除機能を提供。

```typescript
import { useFeedbackAdmin } from '@twuw-b/dev-tools/manual';

const {
  feedbacks,    // Feedback[] - フィードバック一覧
  total,        // number - 全件数
  page,         // number - 現在ページ
  limit,        // number - 1ページあたりの件数
  loading,      // boolean
  error,        // Error | null
  filters,      // FeedbackFilters - 現在のフィルタ
  customTags,   // string[] - 利用可能なカスタムタグ一覧
  setFilters,   // (filters: Partial<FeedbackFilters>) => void
  setPage,      // (page: number) => void
  updateStatus, // (id: number, status: FeedbackStatus) => Promise<boolean>
  remove,       // (id: number) => Promise<boolean>
  refresh,      // () => void
} = useFeedbackAdmin({
  apiBaseUrl: 'https://your-domain.com/__feedback/api',
  adminKey: 'your-admin-key',
});

// フィルタリング
setFilters({ status: 'open', kind: 'bug' });

// ステータス更新
await updateStatus(feedbackId, 'in_progress');
```

#### オプション

| プロパティ | 型 | 必須 | 説明 |
|------------|------|------|------|
| `apiBaseUrl` | `string` | ✓ | フィードバック API の Base URL |
| `adminKey` | `string` | ✓ | 管理者キー |

### useFeedbackAdminMode

URL パラメータ `?feedback=admin` を検知するフック。pushState / replaceState / popstate を監視。

```typescript
import { useFeedbackAdminMode } from '@twuw-b/dev-tools/manual';

const isFeedbackAdmin = useFeedbackAdminMode();
// URL に ?feedback=admin が含まれている場合 true
```

---

## 4. ユーティリティ

### setDebugApiBaseUrl

API の Base URL を設定します。アプリ起動時に1回呼び出してください。

```typescript
import { setDebugApiBaseUrl } from '@twuw-b/dev-tools';

// 環境変数から設定
setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);

// 直接指定
setDebugApiBaseUrl('https://example.com/__debug/api');
```

### setManualTabBaseUrl

別タブ用のベース URL を設定します。`useManualPiP` の `openTab` で使用されます。

```typescript
import { setManualTabBaseUrl } from '@twuw-b/dev-tools/manual';

// アプリ起動時に設定
setManualTabBaseUrl('/manual');
// openTab('/docs/guide.md') → /manual?path=/docs/guide.md を新しいタブで開く
```

### maskSensitive

機密情報をマスクします。ログ保存時に自動適用されますが、手動でも使用可能。

```typescript
import { maskSensitive } from '@twuw-b/dev-tools';

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
import { createLogCapture } from '@twuw-b/dev-tools';

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

### createFeedbackLogCapture

フィードバック用のログキャプチャを初期化します。console.log/warn/error と fetch を monkey-patch し、直前 N 件をリングバッファで保持します。StrictMode 対応（二重マウント時は同一インスタンス返却）。

```typescript
import { createFeedbackLogCapture } from '@twuw-b/dev-tools/manual';

const logCapture = createFeedbackLogCapture({
  maxConsoleLogs: 30,         // コンソールログ最大件数
  maxNetworkLogs: 15,         // ネットワークログ最大件数
  networkInclude: ['/api/**'], // キャプチャ対象URLパターン
  networkExclude: ['/__feedback/**'], // キャプチャ除外URLパターン
});

// バッファ取得
logCapture.getConsoleLogs();  // ConsoleLogEntry[]
logCapture.getNetworkLogs();  // NetworkLogEntry[]

// バッファクリア
logCapture.clear();

// クリーンアップ
logCapture.destroy();
```

### parseTestCaseMd

Markdown テキストからテストケース配列をパースします。

```typescript
import { parseTestCaseMd } from '@twuw-b/dev-tools';

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

### デバッグ API 型定義

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

### フィードバック型定義

```typescript
// フィードバック種別
type FeedbackKind = 'bug' | 'question' | 'request' | 'share' | 'other';

// フィードバック対象
type FeedbackTarget = 'app' | 'manual';

// フィードバックステータス
type FeedbackStatus = 'open' | 'in_progress' | 'closed';

// フィードバック
interface Feedback {
  id: number;
  kind: FeedbackKind;
  target?: FeedbackTarget | null;
  customTag?: string | null;
  message: string;
  pageUrl?: string | null;
  userType?: string | null;
  environment?: Record<string, string> | null;
  appVersion?: string | null;
  consoleLogs?: ConsoleLogEntry[] | null;
  networkLogs?: NetworkLogEntry[] | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

// フィードバック入力
interface FeedbackInput {
  kind: FeedbackKind;
  target?: FeedbackTarget;
  message: string;
}

// フィードバックフィルタ
interface FeedbackFilters {
  status: FeedbackStatus | '';
  kind: FeedbackKind | '';
  target: FeedbackTarget | '';
  customTag: string;
}

// マニュアル項目
interface ManualItem {
  id: string;
  title: string;
  path: string;
  category?: string;
  order?: number;
}

// ダウンロード用
interface DownloadFile {
  path: string;
  filename?: string;
}
```

### ログ型定義

```typescript
interface ConsoleLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'log' | 'info';
  message: string;
  stack?: string;
}

interface NetworkLogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}
```

### デバッグ REST API

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

#### クエリパラメータ（GET /notes）

| パラメータ | 説明 |
|------------|------|
| `env` | 環境（dev / test）必須 |
| `status` | フィルタ（open / resolved / rejected / fixed） |
| `q` | 検索クエリ |
| `includeDeleted` | 削除済みを含める（1 / 0） |

### フィードバック REST API

認証: 管理系エンドポイントは `X-Admin-Key` ヘッダーが必要。

| メソッド | エンドポイント | 認証 | 説明 |
|----------|---------------|------|------|
| POST | `/feedbacks` | 不要 | フィードバック送信 |
| GET | `/feedbacks` | 必要 | フィードバック一覧取得（ページネーション対応） |
| GET | `/feedbacks/{id}` | 必要 | フィードバック詳細取得（ログ含む） |
| PATCH | `/feedbacks/{id}/status` | 必要 | ステータス更新 |
| DELETE | `/feedbacks/{id}` | 必要 | フィードバック削除 |

#### クエリパラメータ（GET /feedbacks）

| パラメータ | 説明 |
|------------|------|
| `page` | ページ番号（デフォルト: 1） |
| `limit` | 1ページあたりの件数（デフォルト: 20, 最大: 100） |
| `status` | フィルタ（open / in_progress / closed） |
| `kind` | フィルタ（bug / question / request / share / other） |
| `target` | フィルタ（app / manual） |
| `custom_tag` | カスタムタグでフィルタ（完全一致） |

#### レート制限

- 10リクエスト/60秒/IP
- リクエストサイズ上限: 1MB

---

## 6. ブラウザ対応

### PiP（Picture-in-Picture）対応

Document Picture-in-Picture API を使用しています。

| ブラウザ | 対応 |
|----------|------|
| Chrome 116+ | 対応 |
| Edge 116+ | 対応 |
| Firefox | フォールバック |
| Safari | フォールバック |

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
  import('@twuw-b/dev-tools').then(({ setDebugApiBaseUrl }) => {
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
import { setDebugApiBaseUrl } from '@twuw-b/dev-tools';
setDebugApiBaseUrl(import.meta.env.VITE_DEBUG_API_URL);
ReactDOM.createRoot(root).render(<AppWithDebug />);
```
