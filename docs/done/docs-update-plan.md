# ユーザー向けドキュメント更新計画

## 概要

以下の機能追加に伴う、ユーザー向けドキュメントの修正内容をまとめる。

| 変更元 | 内容 |
|-------|------|
| `docs/done/test-flow-redesign.md` | テストフロー再設計（Domain/Capability/Case階層、チェックボックス式） |
| `docs/draft/log-capture-ui-redesign.md` | ログキャプチャUI再設計（バッファ分離、添付オプション、再現手順削除） |

---

## 1. README.md

### 1.1 特徴セクション（L7-13）

**現状**:
```markdown
## 特徴

- PiP（Picture-in-Picture）ウィンドウで常時入力可能
- dev / test 環境ごとにデータを分離
- 本番環境には一切含めない設計
- PHP + SQLite のシンプルなバックエンド
```

**修正後**:
```markdown
## 特徴

- PiP（Picture-in-Picture）ウィンドウで常時入力可能
- 機能テストのチェックリスト実行（Domain/Capability/Case階層）
- コンソール・ネットワークログの自動キャプチャ
- dev / test 環境ごとにデータを分離
- 本番環境には一切含めない設計
- PHP + SQLite のシンプルなバックエンド
```

### 1.2 クイックスタート（L22-37）

**現状**:
```typescript
import { DebugPanel, useDebugMode, setDebugApiBaseUrl } from '@genlib/debug-notes';

// API URL を設定
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

**修正後**:
```typescript
import {
  DebugPanel,
  useDebugMode,
  setDebugApiBaseUrl,
  createLogCapture,
  parseTestCaseMd,
} from '@genlib/debug-notes';

// API URL を設定
setDebugApiBaseUrl('https://your-domain.com/__debug/api');

// ログキャプチャ初期化（アプリ起動時に1回）
const logCapture = createLogCapture({
  console: true,
  network: ['/api/**'],
});

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <YourApp />
      {isDebugMode && (
        <DebugPanel
          logCapture={logCapture}
          // testCases={parseTestCaseMd(mdString)}  // テストケースMD使用時
        />
      )}
    </>
  );
}
```

---

## 2. docs/setup.md

### 2.1 ログキャプチャ設定（L179-204）

**現状**:
```typescript
// 最小設定
const logCapture = createLogCapture({
  console: true,                    // error + warn を50件バッファ
  network: ['/api/**'],             // パターンマッチでURL指定
});

// 詳細設定
const logCapture = createLogCapture({
  console: {
    levels: ['error', 'warn', 'log'],  // キャプチャ対象レベル
    filter: (msg) => !msg.includes('[HMR]'),  // フィルタ関数
    maxEntries: 100,                   // バッファ上限
  },
  network: {
    include: ['/api/**'],
    exclude: ['/api/health'],
    errorOnly: false,                  // true: 4xx/5xx のみ
    captureRequestBody: true,
    captureResponseBody: true,
    captureHeaders: true,              // Authorization等は自動マスク
    maxEntries: 50,
  },
});
```

**修正後**:
```typescript
// 最小設定
const logCapture = createLogCapture({
  console: true,        // error 30件 + warn/log 30件（合計60件）
  network: ['/api/**'], // パターンマッチでURL指定
});

// 詳細設定
const logCapture = createLogCapture({
  console: {
    // levels は廃止（error, warn, log 固定）
    maxErrorEntries: 30,   // error専用バッファ上限（デフォルト: 30）
    maxLogEntries: 30,     // warn+log バッファ上限（デフォルト: 30）
    filter: (msg) => !msg.includes('[HMR]'),
  },
  network: {
    include: ['/api/**'],
    exclude: ['/api/health'],
    errorOnly: false,
    // captureRequestBody, captureResponseBody は廃止
    // POST/PUT/DELETE/PATCH のボディは常に自動取得
    // GET レスポンスは UI の添付オプションで制御
    captureHeaders: true,  // Authorization等は自動マスク
    maxEntries: 30,
  },
});

// 環境変数での件数設定
const logCapture = createLogCapture({
  console: {
    maxErrorEntries: Number(import.meta.env.VITE_DEBUG_ERROR_LOG_MAX) || 30,
    maxLogEntries: Number(import.meta.env.VITE_DEBUG_LOG_MAX) || 30,
  },
  network: {
    include: ['/api/**'],
    maxEntries: Number(import.meta.env.VITE_DEBUG_NETWORK_LOG_MAX) || 30,
  },
});
```

### 2.2 テストケースMD（L207-233）

**現状**:
```markdown
**形式**: domain: frontmatter + # Capability + - Case

\`\`\`markdown
---
domain: ログイン
---

# 基本フロー
- メールアドレスでログインできる
- パスワード誤りでエラーメッセージが表示される

# バリデーション
- 空送信でバリデーションエラーが出る
\`\`\`
```

**修正後**:
```markdown
**形式**: `domain:` frontmatter + `#` Capability + `##` グルーピング（任意） + `-` Case

\`\`\`markdown
---
domain: admin
---

# A1 事務所登録

## 正常系
- 必須項目のみで登録できる
- 全項目入力して登録できる

## バリデーション
- 必須項目未入力でエラーが表示される
- 文字数上限超過でエラーが表示される

# A2 事務所編集

## 正常系
- 既存データを編集して保存できる
\`\`\`

### パースルール

| MD要素 | 解釈 |
|--------|------|
| frontmatter `domain:` | Domain 名 |
| `# 見出し` | Capability 名 |
| `## 見出し` | 視覚的グルーピング（**データとして保持しない**） |
| `- テキスト` | Case（テストケース） |

`##` 見出しはMDファイルの可読性のためだけに存在し、パース時にはCaseのみ抽出される。
```

### 2.3 環境変数一覧（L513-518）

**現状**:
```markdown
| 変数名 | 説明 | 例 |
|--------|------|-----|
| `VITE_DEBUG_API_URL` | デバッグ API の URL | `https://example.com/__debug/api` |
```

**修正後**:
```markdown
| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `VITE_DEBUG_API_URL` | デバッグ API の URL | - |
| `VITE_DEBUG_ERROR_LOG_MAX` | error ログの最大件数 | 30 |
| `VITE_DEBUG_LOG_MAX` | warn + log の最大件数 | 30 |
| `VITE_DEBUG_NETWORK_LOG_MAX` | ネットワークログの最大件数 | 30 |
```

---

## 3. docs/usage.md

### 3.1 DebugPanel 入力項目（L162-168）

**現状**:
```markdown
| 項目 | 必須 | 説明 |
|------|------|------|
| 重要度 | | High / Medium / Low |
| 内容 | ✓ | 詳細な説明（4,000文字以内）。title は1行目から自動生成 |
| 補足メモ | | 状況や気づいたこと（20,000文字以内、自動マスク） |
| 再現手順 | | 1行1ステップ |
```

**修正後**:
```markdown
| 項目 | 必須 | 説明 |
|------|------|------|
| 重要度 | | critical / high / medium / low |
| 内容 | ✓ | 詳細な説明（4,000文字以内）。title は1行目から自動生成 |
| 補足メモ | | 状況や気づいたこと（20,000文字以内、自動マスク） |

#### 添付オプション（トグルで展開）

| 項目 | デフォルト | 説明 |
|------|-----------|------|
| GETレスポンスを含める | OFF | GET リクエストのレスポンスボディを添付 |
| 通信時間を含める | OFF | 各リクエストの所要時間を添付 |
| ヘッダーを含める | OFF | リクエスト/レスポンスヘッダーを添付 |

> **自動添付される内容**（UIに表示しない）:
> - コンソールログ（error 30件 + warn/log 30件）
> - ネットワークログ（URL, メソッド, ステータス, POST等のボディ）
> - 環境情報（userAgent, viewport, URL, timestamp）
```

### 3.2 3タブ構成（L170-177）

**現状**:
```markdown
| タブ | 機能 |
|------|------|
| **記録** | バグ報告フォーム（従来機能） |
| **管理** | Openノートの一覧＋status選択（open/fixed）＋source badge（🧪） |
| **テスト** | チェックボックス式テスト実行（Domain/Capability/Case階層） |
```

**修正後**:
```markdown
| タブ | 機能 |
|------|------|
| **記録** | バグ報告フォーム（内容・補足メモ・重要度・添付オプション） |
| **管理** | Openノートの一覧 + セレクトボックス（open/fixed）+ source badge（🧪） |
| **テスト** | チェックボックス式テスト実行（Domain/Capability/Case階層、Capability単位で送信） |
```

### 3.3 DebugPanel 動作説明（L179-186）

**現状**:
```markdown
3. **記録タブ**: フォームに入力して「保存」。コンソール/ネットワークログと環境情報が自動添付される
4. **管理タブ**: Openのノートをその場でFixedに変更可能
5. **テストタブ**: チェックリストを全確認→「問題なし」でverifiedノート作成、未確認項目→「バグ報告」で記録タブに遷移
```

**修正後**:
```markdown
3. **記録タブ**: フォームに入力して「保存」。コンソール/ネットワークログと環境情報が自動添付される。添付オプションでGETレスポンス・通信時間・ヘッダーを追加可能
4. **管理タブ**: セレクトボックスで open → fixed に変更（再オープン不可）
5. **テストタブ**: チェックボックスでPASS、バグ報告フォームでFAIL → Capability単位で送信
```

### 3.4 DebugAdmin 機能（L200-211）

**現状**:
```markdown
- **フィルタ**: ステータス（Open/Fixed）でフィルタリング
- **ステータス変更**: Open / Fixed の切り替え（fixed → open への変更は不可）
```

**修正後**:
```markdown
- **フィルタ**: ステータス（Open/Fixed）、ソース（manual/test）でフィルタリング
- **ステータス変更**: Open → Fixed のみ（再オープン不可）
- **テストフロー連携**: source=test のノートには Capability/Case 名を表示、retest フラグ、openIssues リンク
```

### 3.5 createLogCapture（L386-407）

**現状**:
```typescript
const logCapture = createLogCapture({
  console: true,          // error + warn を50件バッファ
  network: ['/api/**'],   // /api/ 配下のfetchを30件バッファ
});
```

**修正後**:
```typescript
const logCapture = createLogCapture({
  console: true,          // error 30件 + warn/log 30件（合計60件）
  network: ['/api/**'],   // /api/ 配下のfetchを30件バッファ
});

// DebugPanel に渡す
<DebugPanel logCapture={logCapture} />

// 手動でバッファを取得
logCapture.getConsoleLogs();  // ConsoleLogEntry[]（error優先、時系列ソート）
logCapture.getNetworkLogs();  // NetworkLogEntry[]
```

### 3.6 型定義 Status（L488付近）

**現状**:
```typescript
// ステータス
type Status = 'open' | 'fixed';
```

**修正後**: 変更なし（既に正しい）

### 3.7 型定義 NoteInput（L515-530）

**現状**:
```typescript
interface NoteInput {
  title?: string;
  content: string;
  userLog?: string;
  steps?: string[];
  severity?: Severity;
  // ...
}
```

**修正後**:
```typescript
interface NoteInput {
  title?: string;         // 省略可（content の1行目から自動生成）
  content: string;        // 必須
  userLog?: string;
  // steps を削除（UIから削除）
  severity?: Severity;
  route?: string;
  screenName?: string;
  status?: 'open';
  source?: 'manual' | 'test';
  testCaseId?: number;
  consoleLogs?: ConsoleLogEntry[];
  networkLogs?: NetworkLogEntry[];
  environment?: EnvironmentInfo;
}
```

### 3.8 REST API テーブル（L535-546）

**追加**:
```markdown
| POST | `/test-cases/import` | テストケースインポート（MDパース結果） |
| GET | `/test-cases/tree?env=dev` | テストツリー取得（集計付き、1リクエスト） |
| POST | `/test-runs?env=dev` | テスト実行結果一括記録（Capability単位） |
```

### 3.9 parseTestCaseMd（L409-431）

**修正後**:
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

---

## 4. docs/requirement.md

### 4.1 Section 5.1 notes テーブル

**修正内容**:
- `status`: 説明を `open / fixed` に（`verified` 削除済み）
- `title`: 説明を `content の1行目から自動生成` に
- `steps`: 「UIからは削除されたが、カラムは後方互換性のため残存」と注記
- 追加カラム: `source TEXT DEFAULT 'manual'`、`test_case_id INTEGER`

### 4.2 Section 6.3 status 更新

**修正内容**:
- 許可する値: `open`, `fixed` のみ
- 再オープン不可の制約を明記（`fixed` → `open` はエラー）

### 4.3 Section 7.1 PIP パネル

**修正内容**:
- 入力項目から `title`（手動入力）を削除
- 入力項目から `再現手順` を削除
- `添付オプション`（トグル）を追加: GETレスポンス、通信時間、ヘッダー

### 4.4 Section 7.2 管理画面

**修正内容**:
- フィルタ: `Open/Fixed` + `source`（manual/test）
- ステータス変更: `Open → Fixed` のみ
- テストフロー連携: Capability/Case名表示、retest フラグ、openIssues

### 4.5 Section 11 テストフロー機能

**全面書き換え**: `docs/done/test-flow-redesign.md` の内容を反映
- Domain/Capability/Case 階層
- チェックボックス式 PASS、バグ報告フォーム FAIL
- Capability 単位送信
- test_cases / test_runs テーブル

---

## 5. docs/pip-implementation.md

### 5.1 3タブ構成セクション（L300-326）

**記録タブ**: 変更
- 入力項目: 重要度、内容、補足メモ（再現手順を削除）
- 添付オプション（トグル）: GETレスポンス、通信時間、ヘッダー

**管理タブ**: 変更
- `各行に severity ドット + content プレビュー + 「Fixed」ボタン`
- → `各行に severity ドット + content プレビュー + source区別（🧪）+ セレクトボックス（open/fixed）`

**テストタブ**: 全面書き換え
- Domain/Capability/Case トグルツリー
- Case: チェックボックス + 直近結果（passed/fail/-）+ open件数
- バグ報告フォーム: ケースセレクト + 内容 + 重要度
- Capability 単位の送信ボタン

---

## 6. src/types/index.ts

### 6.1 ConsoleLogConfig（L133-138）

**現状**:
```typescript
export interface ConsoleLogConfig {
  levels?: Array<'error' | 'warn' | 'log' | 'info'>;
  filter?: (message: string) => boolean;
  maxEntries?: number;
}
```

**修正後**:
```typescript
export interface ConsoleLogConfig {
  // levels は廃止（error, warn, log 固定）
  maxErrorEntries?: number;  // error専用バッファの上限（デフォルト: 30）
  maxLogEntries?: number;    // warn+log バッファの上限（デフォルト: 30）
  filter?: (message: string) => boolean;
}
```

### 6.2 NetworkLogEntry（L113-123）

**現状**:
```typescript
export interface NetworkLogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration: number;  // 必須
  // ...
}
```

**修正後**:
```typescript
export interface NetworkLogEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  duration?: number;  // オプション（UIで「通信時間を含める」選択時のみ）
  requestBody?: unknown;
  responseBody?: unknown;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}
```

### 6.3 NoteInput（L31-45）

**現状**:
```typescript
export interface NoteInput {
  title?: string;
  content: string;
  userLog?: string;
  steps?: string[];  // ← 削除
  severity?: Severity;
  // ...
}
```

**修正後**:
```typescript
export interface NoteInput {
  title?: string;
  content: string;
  userLog?: string;
  // steps を削除
  severity?: Severity;
  route?: string;
  screenName?: string;
  status?: 'open';
  consoleLogs?: ConsoleLogEntry[];
  networkLogs?: NetworkLogEntry[];
  environment?: EnvironmentInfo;
  source?: 'manual' | 'test';
  testCaseId?: number;
}
```

---

## 実装順序

```
1. src/types/index.ts
   - ConsoleLogConfig: levels削除、maxErrorEntries/maxLogEntries追加
   - NetworkLogEntry: duration をオプショナルに
   - NoteInput: steps を削除

2. docs/setup.md
   - ログキャプチャ設定（バッファ分離、環境変数）
   - テストケースMD形式（新フォーマット）
   - 環境変数一覧

3. docs/usage.md
   - 入力項目テーブル（再現手順削除、添付オプション追加）
   - 3タブ構成・動作説明
   - DebugAdmin機能
   - createLogCapture
   - 型定義
   - REST API
   - parseTestCaseMd

4. docs/requirement.md
   - notes テーブル（source, test_case_id, steps注記）
   - status 更新（再オープン不可）
   - PIPパネル（入力項目変更）
   - 管理画面（source フィルタ）
   - テストフロー機能（全面書き換え）

5. docs/pip-implementation.md
   - 3タブ構成セクション

6. README.md
   - 特徴セクション
   - クイックスタート
```
