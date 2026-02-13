# PiPタブ構成 & テストフロー実装

## 変更一覧

| # | 変更内容 | 影響範囲 | DB変更 |
|---|---------|---------|--------|
| 4 | Status型に `verified` 追加 | 型, API, DebugAdmin | なし（値追加のみ） |
| 5 | PiP 3タブ構成 | DebugPanel | なし |
| 6 | PiP 管理タブ（openのみ） | DebugPanel | なし |
| 7 | PiP テストフロータブ | DebugPanel, 型, API | なし |
| 8 | テストケースMDパーサー | 新規ユーティリティ | なし |

---

## 4. Status型に `verified` 追加

### 方針
- テストフローの「問題なし」報告用に `verified` ステータスを追加
- `verified` への遷移: テスト結果作成時のみ（createで設定）
- `verified` からの遷移: しない（問題があれば新規バグ報告を作成）
- `updateStatus` は `open` / `fixed` のみ許可のまま（変更なし）

### 変更ファイル

**`src/types/index.ts`**
```ts
// 変更前
export type Status = 'open' | 'fixed';

// 変更後
export type Status = 'open' | 'fixed' | 'verified';
```

**`api/NotesController.php`** — `create` メソッド修正
```php
// 変更前（94行目）
'open',

// 変更後
in_array($input['status'] ?? '', ['open', 'verified'], true)
    ? $input['status']
    : 'open',
```
`fixed` での作成は許可しない。`open`（バグ報告）または `verified`（テスト合格）のみ。

**`src/components/DebugAdmin.tsx`** — ステータスフィルタに追加
```tsx
// 変更前（310-313行目）
<option value="">すべて</option>
<option value="open">Open</option>
<option value="fixed">Fixed</option>

// 変更後
<option value="">すべて</option>
<option value="open">Open</option>
<option value="fixed">Fixed</option>
<option value="verified">Verified</option>
```

詳細ビューのステータスバッジ関数も対応:
```ts
// getStatusBadge に verified 分岐追加
function getStatusBadge(status: Status, colors: typeof LIGHT_COLORS): React.CSSProperties {
  const isOpen = status === 'open';
  const isVerified = status === 'verified';
  return {
    // ...既存
    background: isVerified ? colors.primaryLight : isOpen ? colors.primaryLight : colors.successBg,
    color: isVerified ? colors.primary : isOpen ? colors.primary : colors.success,
  };
}
```

---

## 5. PiP 3タブ構成

### 方針
- 既存の作成フォームをタブ化
- タブ: 記録（既存）/ 管理 / テスト
- タブ状態は `useState` で管理
- PiPの `getPipStyles()` にタブ用CSSを追加

### 変更ファイル

**`src/components/DebugPanel.tsx`**

state追加:
```ts
type PipTab = 'record' | 'manage' | 'test';
const [activeTab, setActiveTab] = useState<PipTab>('record');
```

タブヘッダー（headerの下に配置）:
```tsx
<nav className="debug-tabs">
  <button
    className={`debug-tab ${activeTab === 'record' ? 'active' : ''}`}
    onClick={() => setActiveTab('record')}
  >
    記録
  </button>
  <button
    className={`debug-tab ${activeTab === 'manage' ? 'active' : ''}`}
    onClick={() => setActiveTab('manage')}
  >
    管理
  </button>
  <button
    className={`debug-tab ${activeTab === 'test' ? 'active' : ''}`}
    onClick={() => setActiveTab('test')}
  >
    テスト
  </button>
</nav>
```

`getPipStyles()` にCSS追加:
```css
.debug-tabs {
  display: flex;
  border-bottom: 1px solid ${COLORS.gray200};
  background: ${COLORS.gray100};
}

.debug-tab {
  flex: 1;
  padding: 10px 0;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: ${COLORS.gray500};
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.debug-tab.active {
  color: ${COLORS.primary};
  border-bottom-color: ${COLORS.primary};
}
```

本体の `<main>` 内をタブごとに出し分け:
```tsx
<main className="debug-content">
  {activeTab === 'record' && ( /* 既存の作成フォーム */ )}
  {activeTab === 'manage' && ( /* 管理タブ（#6） */ )}
  {activeTab === 'test' && ( /* テストフロータブ（#7） */ )}
</main>
```

footer も activeTab に応じて変更:
- `record`: 既存の「クリア」「保存」
- `manage`: なし（各行にアクション付き）
- `test`: 「問題なし」「バグ報告」

### testCases が未提供の場合
- `testCases` props が空 or undefined の場合、テストタブは非表示にする
- タブは「記録」「管理」の2タブ構成にフォールバック

---

## 6. PiP 管理タブ（openのみ）

### 方針
- `useDebugNotes` から取得した notes を `open` でフィルタして表示
- コンパクトな行ベースリスト
- 各行で `open` → `fixed` にステータス変更可能
- PiPのサイズ制約（400px幅）に最適化

### 変更ファイル

**`src/components/DebugPanel.tsx`** — 管理タブのUI

```tsx
{activeTab === 'manage' && (
  <div className="debug-manage">
    {notes.filter(n => n.status === 'open').length === 0 ? (
      <div className="debug-empty">Openのノートはありません</div>
    ) : (
      notes.filter(n => n.status === 'open').map(note => (
        <div key={note.id} className="debug-note-row">
          <div className="debug-note-info">
            <span className={`debug-severity-dot ${note.severity || 'none'}`} />
            <span className="debug-note-preview">
              {note.content.split('\n')[0].slice(0, 40)}
            </span>
          </div>
          <button
            className="debug-btn-fix"
            onClick={() => handleFixNote(note.id)}
            disabled={loadingAction !== null}
          >
            {loadingAction === `fix-${note.id}` ? '...' : 'Fixed'}
          </button>
        </div>
      ))
    )}
  </div>
)}
```

`useDebugNotes` のフック利用を拡張:
- 現在 DebugPanel は `createNote` のみ使用
- `notes`, `updateStatus`, `refresh` も取得する

ハンドラー追加:
```ts
const handleFixNote = useCallback(async (id: number) => {
  setLoadingAction(`fix-${id}`);
  await updateStatus(id, 'fixed');
  setLoadingAction(null);
}, [updateStatus]);
```

`getPipStyles()` にCSS追加:
```css
.debug-manage {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.debug-note-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: ${COLORS.gray100};
  border-radius: 8px;
}

.debug-note-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.debug-note-preview {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.debug-severity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.debug-severity-dot.high { background: ${COLORS.error}; }
.debug-severity-dot.medium { background: ${COLORS.secondary}; }
.debug-severity-dot.low { background: ${COLORS.primary}; }
.debug-severity-dot.none { background: ${COLORS.gray300}; }

.debug-btn-fix {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  background: ${COLORS.success};
  color: ${COLORS.white};
  cursor: pointer;
  flex-shrink: 0;
}

.debug-btn-fix:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.debug-empty {
  text-align: center;
  padding: 40px 16px;
  color: ${COLORS.gray500};
  font-size: 13px;
}
```

---

## 7. PiP テストフロータブ

### 方針
- `testCases` props（`TestCase[]`）からチェックリストUIを生成
- 全項目チェック → 「問題なし」ボタン有効 → `status: 'verified'` でノート作成
- 未チェック項目あり → 「バグ報告」ボタン → 未チェック項目をcontentに記入し記録タブに遷移

### 型定義

**`src/types/index.ts`** — 追加
```ts
/** テストケースセクション */
export interface TestCaseSection {
  title: string;
  items: string[];
}

/** テストケース */
export interface TestCase {
  name?: string;
  target?: string;
  sections: TestCaseSection[];
}
```

**`src/types/index.ts`** — `DebugPanelProps` 修正
```ts
export interface DebugPanelProps {
  apiBaseUrl?: string;
  env?: Environment;
  onSave?: (note: Note) => void;
  onClose?: () => void;
  initialSize?: { width: number; height: number };
  testCases?: TestCase[];  // 追加
}
```

### 変更ファイル

**`src/components/DebugPanel.tsx`** — テストタブのUI

state追加:
```ts
// チェック状態: { sectionIndex: { itemIndex: boolean } }
const [checkState, setCheckState] = useState<Record<number, Record<number, boolean>>>({});
const [selectedTestCase, setSelectedTestCase] = useState(0);
```

ヘルパー:
```ts
// 現在のテストケースの全項目数
const totalItems = testCase.sections.reduce((sum, s) => sum + s.items.length, 0);

// チェック済み項目数
const checkedItems = Object.values(checkState)
  .reduce((sum, section) => sum + Object.values(section).filter(Boolean).length, 0);

// 全チェック済みか
const allChecked = checkedItems === totalItems && totalItems > 0;

// 未チェック項目のリスト
const uncheckedItems = testCase.sections.flatMap((section, si) =>
  section.items.filter((_, ii) => !checkState[si]?.[ii])
    .map(item => `[${section.title}] ${item}`)
);
```

UI:
```tsx
{activeTab === 'test' && testCases && testCases.length > 0 && (
  <div className="debug-test">
    {/* テストケース選択（複数ある場合） */}
    {testCases.length > 1 && (
      <select
        className="debug-test-select"
        value={selectedTestCase}
        onChange={(e) => {
          setSelectedTestCase(Number(e.target.value));
          setCheckState({});
        }}
      >
        {testCases.map((tc, i) => (
          <option key={i} value={i}>{tc.name || `テスト ${i + 1}`}</option>
        ))}
      </select>
    )}

    {/* 進捗 */}
    <div className="debug-test-progress">
      {checkedItems}/{totalItems} 項目確認済み
    </div>

    {/* チェックリスト */}
    {testCase.sections.map((section, si) => (
      <div key={si} className="debug-test-section">
        <div className="debug-test-section-title">{section.title}</div>
        {section.items.map((item, ii) => (
          <label key={ii} className="debug-test-item">
            <input
              type="checkbox"
              checked={!!checkState[si]?.[ii]}
              onChange={(e) => {
                setCheckState(prev => ({
                  ...prev,
                  [si]: { ...prev[si], [ii]: e.target.checked }
                }));
              }}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
    ))}
  </div>
)}
```

footer（テストタブ時）:
```tsx
{activeTab === 'test' && (
  <footer className="debug-footer">
    <button
      className="debug-btn debug-btn-secondary"
      onClick={handleReportBug}
      disabled={saving || uncheckedItems.length === 0}
    >
      バグ報告
    </button>
    <button
      className="debug-btn debug-btn-primary"
      onClick={handleVerified}
      disabled={saving || !allChecked}
    >
      {saving ? <Spinner /> : '問題なし'}
    </button>
  </footer>
)}
```

ハンドラー:
```ts
// 問題なし → verified ノート作成
const handleVerified = useCallback(async () => {
  if (!testCases?.[selectedTestCase]) return;
  const tc = testCases[selectedTestCase];
  setSaving(true);

  const input: NoteInput = {
    title: `[テスト合格] ${tc.name || 'テスト'}`,
    content: `テスト「${tc.name || ''}」の全${totalItems}項目を確認、問題なし。`,
    severity: undefined,
    status: 'verified',  // NoteInput に status を追加（後述）
  };

  const note = await createNote(input);
  if (note) {
    setMessage({ type: 'success', text: 'テスト結果を送信しました' });
    setCheckState({});
  } else {
    setMessage({ type: 'error', text: '送信に失敗しました' });
  }
  setSaving(false);
}, [testCases, selectedTestCase, totalItems, createNote]);

// バグ報告 → 未チェック項目をcontentに設定し記録タブに遷移
const handleReportBug = useCallback(() => {
  const bugContent = uncheckedItems.join('\n');
  setContent(bugContent);
  setActiveTab('record');
}, [uncheckedItems]);
```

**`src/types/index.ts`** — `NoteInput` に status 追加
```ts
export interface NoteInput {
  title: string;
  content: string;
  userLog?: string;
  steps?: string[];
  severity?: Severity;
  route?: string;
  screenName?: string;
  status?: 'open' | 'verified';  // 追加
}
```

**`src/utils/api.ts`** — `createNote` に status 送信追加
```ts
body: JSON.stringify({
  // ...既存フィールド
  status: input.status || 'open',  // 追加
}),
```

---

## 8. テストケースMDパーサー

### フォーマット定義

```markdown
---
name: ログイン機能
target: /login
---

## 基本フロー
- メールアドレスでログインできる
- パスワード誤りでエラーメッセージが表示される
- ログアウトボタンで正常にログアウトできる

## バリデーション
- 空送信でバリデーションエラーが出る
- 不正なメール形式で適切なエラーが出る
```

### パースルール

| MD要素 | 解釈 |
|--------|------|
| `---` frontmatter | テスト名(`name`)・対象ページ(`target`) |
| `## 見出し` | セクションタイトル |
| `- テキスト` | チェック項目 |
| それ以外の行 | 無視 |

### 実装

**`src/utils/parseTestCaseMd.ts`** — 新規ファイル

```ts
import type { TestCase, TestCaseSection } from '../types';

/**
 * テストケースMDをパースする
 * 複数テストケース（`---` 区切り）に対応
 */
export function parseTestCaseMd(md: string): TestCase[] {
  const blocks = splitByFrontmatter(md);
  return blocks.map(parseBlock);
}

function splitByFrontmatter(md: string): string[] {
  // frontmatter（---）で区切られたブロックに分割
  const parts = md.split(/^---\s*$/m);

  // frontmatter なしの場合
  if (parts.length === 1) {
    return [md];
  }

  // parts: ['', frontmatter, body, frontmatter, body, ...]
  const blocks: string[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const frontmatter = parts[i] || '';
    const body = parts[i + 1] || '';
    blocks.push(`---\n${frontmatter}\n---\n${body}`);
  }
  return blocks;
}

function parseBlock(block: string): TestCase {
  const lines = block.split('\n');
  let name: string | undefined;
  let target: string | undefined;
  const sections: TestCaseSection[] = [];
  let currentSection: TestCaseSection | null = null;
  let inFrontmatter = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // frontmatter
    if (trimmed === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }

    if (inFrontmatter) {
      const match = trimmed.match(/^(\w+):\s*(.+)$/);
      if (match) {
        if (match[1] === 'name') name = match[2];
        if (match[1] === 'target') target = match[2];
      }
      continue;
    }

    // セクション見出し
    if (trimmed.startsWith('## ')) {
      currentSection = { title: trimmed.slice(3).trim(), items: [] };
      sections.push(currentSection);
      continue;
    }

    // チェック項目
    if (trimmed.startsWith('- ') && currentSection) {
      currentSection.items.push(trimmed.slice(2).trim());
    }
  }

  return { name, target, sections };
}
```

**`src/index.ts`** — エクスポート追加
```ts
export { parseTestCaseMd } from './utils/parseTestCaseMd';
```

**`src/types/index.ts`** — エクスポート追加（#7で定義済み）
```ts
export type { TestCase, TestCaseSection };
```

### 利用例

```tsx
import { DebugPanel, parseTestCaseMd } from 'debug-notes';

const md = `
---
name: ログイン機能
target: /login
---

## 基本フロー
- メールアドレスでログインできる
- パスワード誤りでエラーメッセージが表示される
`;

const testCases = parseTestCaseMd(md);

<DebugPanel
  apiBaseUrl="/api"
  env="dev"
  testCases={testCases}
/>
```

---

## 実装順序

依存関係を考慮した推奨順:

1. **#4** Status型に `verified` 追加（他の変更の前提）
2. **#8** MDパーサー（テストタブの前提、独立ユーティリティ）
3. **#5** PiP 3タブ構成（PiP系の土台）
4. **#6** PiP 管理タブ
5. **#7** PiP テストフロータブ
