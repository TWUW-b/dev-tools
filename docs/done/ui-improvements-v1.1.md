# UI改善 4件

## 1. テストケースの fixed 後表示

### 背景

ノートを fixed にしても、紐づくテストケースの PiP 表示は `fail`（赤）のまま。
`retest` フラグはデータにあるが UI に露出していない。
テスターに「修正済み・再テスト必要」を伝える表示がない。

### 仕様

#### 新しいケースステータス表示

| `last` | `openIssues` | 表示 | 色 |
|--------|-------------|------|-----|
| `null` | 0 | `-` | gray |
| `pass` | 0 | `passed` | green |
| `fail` | > 0 | `fail` | red |
| `fail` | 0 | `retest` | orange/amber |
| `pass` | > 0 | `passed` | green（open件数バッジ付き） |

`fail` + `openIssues === 0` = バグが fixed されたが再テスト未実施 → **`retest`** 表示。

#### Capability ステータスにも反映

| 条件 | status |
|------|--------|
| 全ケース pass | `passed` (green) |
| fail + openIssues > 0 あり | `fail` (red) |
| fail あるが全 openIssues === 0 | `retest` (orange) |
| それ以外 | null |

### ファイル変更

#### `src/components/DebugPanel.tsx`

```typescript
// getCaseStatusLabel 変更
const getCaseStatusLabel = (c: CaseSummary) => {
  if (c.last === 'pass') return 'passed';
  if (c.last === 'fail' && c.openIssues === 0) return 'retest';
  if (c.last === 'fail') return 'fail';
  return '-';
};

// getCaseStatusColor 変更
const getCaseStatusColor = (c: CaseSummary) => {
  if (c.last === 'pass') return COLORS.success;
  if (c.last === 'fail' && c.openIssues === 0) return '#F59E0B'; // amber
  if (c.last === 'fail') return COLORS.error;
  return COLORS.gray500;
};
```

#### `api/TestController.php` — tree() の Capability ステータス

```php
// 現状
if ($cap['failed'] > 0) {
    $cap['status'] = 'fail';
}

// 変更: retest 判定追加
$hasFailWithOpenIssues = false;
$hasFailWithoutOpenIssues = false;
foreach ($cap['cases'] as $c) {
    if ($c['last_result'] === 'fail') {
        if ($c['open_issues'] > 0) {
            $hasFailWithOpenIssues = true;
        } else {
            $hasFailWithoutOpenIssues = true;
        }
    }
}

if ($hasFailWithOpenIssues) {
    $cap['status'] = 'fail';
} elseif ($hasFailWithoutOpenIssues) {
    $cap['status'] = 'retest';
} elseif ($cap['passed'] === $cap['total'] && $cap['total'] > 0) {
    $cap['status'] = 'passed';
} else {
    $cap['status'] = null;
}
```

#### 型変更

```typescript
// CapabilitySummary.status に 'retest' 追加
status: 'passed' | 'fail' | 'retest' | null;

// CaseSummary.retest を削除（last + openIssues から導出するため不要）
export interface CaseSummary {
  caseId: number;
  title: string;
  last: 'pass' | 'fail' | 'skip' | null;
  // retest: boolean;  ← 削除
  openIssues: number;
}
```

#### `api/TestController.php` — tree() から retest フィールド削除

```php
// 削除
$retest = ($last === 'fail') || ($openIssues > 0);
// cases 配列から 'retest' => $retest を除去
```

#### DebugAdmin にも retest 表示を反映

getCapStatusLabel / getCapStatusColor に `'retest'` 分岐を追加。

---

## 2. ノート ID 表示 + ID 検索

### 背景

ノートに ID が表示されず、特定のノートを参照・共有しにくい。

### 仕様

#### 表示

管理画面（DebugAdmin）と PiP 管理タブ（DebugPanel）の両方で、
各ノート行に `#1`, `#2` のように ID を表示。

```
#12  severity● content プレビュー   🧪   [open ▼]
```

#### ID 検索（DebugAdmin のみ）

DebugAdmin の検索ボックスで `#12` と入力するとノート ID で絞り込み。
通常テキストはそのまま content/title 検索（現状通り）。

PiP 管理タブには検索ボックスがないため、**ID 表示のみ**（検索なし）。

### ファイル変更

#### `src/components/DebugPanel.tsx` — 管理タブ（ID 表示のみ）

ノート行に ID 表示を追加:

```tsx
<span className="debug-note-id">#{note.id}</span>
<span className="debug-severity-dot" ... />
<span className="debug-note-content">{note.content}</span>
```

#### `src/components/DebugAdmin.tsx` — 管理画面（ID 表示 + 検索）

ノート行に ID 表示を追加（同様）。

検索フィルタに ID 検索を追加:

```typescript
// filteredNotes の useMemo 内
if (searchQuery) {
  const idMatch = searchQuery.match(/^#(\d+)$/);
  if (idMatch) {
    if (note.id !== Number(idMatch[1])) return false;
  } else {
    // 既存の content/title 部分一致検索
  }
}
```

#### スタイル

```css
.debug-note-id {
  font-size: 11px;
  color: #9CA3AF;
  font-family: monospace;
  min-width: 32px;
}
```

---

## 3. デバッグモード起動ショートカット

### 背景

現状は `?mode=debug` の URL パラメータのみ。毎回 URL を編集するのが面倒。

### 仕様

`z` キーを 500ms 以内に 3回連打 でデバッグモードをトグル。

**条件**:
- `input`, `textarea`, `select`, `[contenteditable]` にフォーカス中は無効
- URL パラメータ `?mode=debug` も引き続き有効（後方互換）
- 状態は `sessionStorage` に保持（ページ遷移で消えない、タブ閉じで消える）
- URL パラメータは sessionStorage より優先

### ファイル変更

#### `src/hooks/useDebugMode.ts`

```typescript
export function useDebugMode(): UseDebugModeReturn {
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // URL パラメータチェック（優先）
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'debug') {
      setIsDebugMode(true);
      sessionStorage.setItem('debug-notes-mode', '1');
    } else if (sessionStorage.getItem('debug-notes-mode') === '1') {
      // sessionStorage チェック
      setIsDebugMode(true);
    }

    // z キー 3連打検知（URL パラメータ有無に関わらず常に登録）
    const KEY = 'z';
    const REQUIRED = 3;
    const WINDOW = 500; // ms
    let presses: number[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      // input 系要素にフォーカス中は無視
      const tag = (e.target as HTMLElement)?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (e.key !== KEY) {
        presses = [];
        return;
      }

      const now = Date.now();
      presses.push(now);

      // WINDOW 外の古い押下を除去
      presses = presses.filter(t => now - t < WINDOW);

      if (presses.length >= REQUIRED) {
        presses = [];
        setIsDebugMode(prev => {
          const next = !prev;
          if (next) {
            sessionStorage.setItem('debug-notes-mode', '1');
          } else {
            sessionStorage.removeItem('debug-notes-mode');
          }
          return next;
        });
      }
    };

    const handlePopstate = () => {
      const p = new URLSearchParams(window.location.search);
      if (p.get('mode') === 'debug') setIsDebugMode(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  return { isDebugMode };
}
```

### ドキュメント更新

`docs/usage.md` と `README.md` に起動方法を追記:

```
デバッグモードの起動:
- URL: ?mode=debug
- キーボード: z キーを素早く3回押す（トグル）
```

---

## 4. PiP データ更新ボタン

### 背景

PiP のテストツリーは初回ロード時のみ取得される。
管理画面でノートを fixed にしても、PiP 側に反映されない（retest 表示にならない）。
手動でデータを再取得する手段がない。

### 仕様

PiP ヘッダーに更新ボタンを配置。押すとアクティブタブのデータを再取得。

| タブ | 更新対象 |
|------|----------|
| 記録 | なし（更新不要、ボタン非表示） |
| 管理 | ノート一覧（`refresh()`） |
| テスト | テストツリー（`GET /test-cases/tree` を再取得） |

#### UI

ヘッダー右側に Material Symbols の `sync` アイコンボタン。
取得中はスピンアニメーション。

```
[記録] [管理] [テスト]                    [🔄]
```

### ファイル変更

#### `src/components/DebugPanel.tsx`

**state 追加**:

```typescript
const [refreshing, setRefreshing] = useState(false);
```

**テストツリー再取得関数**:

```typescript
const refreshTestTree = useCallback(async () => {
  setRefreshing(true);
  try {
    const tree = await api.getTestTree(env);
    setTestTree(tree);
    // チェック状態を更新: pass → checked
    const newChecks: Record<number, boolean> = {};
    for (const d of tree) {
      for (const cap of d.capabilities) {
        for (const c of cap.cases) {
          newChecks[c.caseId] = c.last === 'pass';
        }
      }
    }
    setCaseChecks(newChecks);
  } catch (err) {
    setMessage({ type: 'error', text: 'データの更新に失敗しました' });
  } finally {
    setRefreshing(false);
  }
}, [env]);
```

**更新ボタンハンドラ**:

```typescript
const handleRefresh = useCallback(async () => {
  if (activeTab === 'manage') {
    refresh(); // useDebugNotes の refresh
  } else if (activeTab === 'test') {
    await refreshTestTree();
  }
}, [activeTab, refresh, refreshTestTree]);
```

**ヘッダー UI**:

```tsx
<header className="debug-header">
  <div className="debug-header-left">
    {/* タブ */}
  </div>
  {activeTab !== 'record' && (
    <button
      className="debug-refresh-btn"
      onClick={handleRefresh}
      disabled={refreshing}
      title="データを更新"
    >
      <span
        className="debug-icon"
        style={{
          fontSize: '18px',
          animation: refreshing ? 'spin 0.6s linear infinite' : 'none',
        }}
      >
        sync
      </span>
    </button>
  )}
</header>
```

**スタイル**:

```css
.debug-refresh-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.debug-refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.debug-refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## 実装順序

マルチセレクト（`test-tab-multi-select-bug-report.md`）を先に実装し、
本ドラフトはその後に実装する。

理由: 両方が `TestController::tree()` を変更するため。
マルチセレクトで `open_issues` クエリを `note_test_cases` JOIN に変更した後、
本ドラフトで Capability ステータスの `retest` 判定を追加する。

## ビルド検証

```bash
npm run build
npm run test
```
