# テストフロー再設計

## 概要

PiP上で機能テストのチェックリストを確認しながら、即座にレポートできる仕組み。
バグがある箇所は自動でopenノートとして記録される。

- Caseはチェックボックス式、Capability単位で一括送信
- Caseは何度でもテスト可能
- FAIL時はフォームから即座にバグ報告 → openノート自動作成

---

## 1. PiP テストタブのUI構造

```
┌─ テスト ──────────────────────────────────┐
│                                            │
│ ▶ admin                                    │  ← 初期: 全トグル閉
│ ▶ user                                     │
│                                            │
└────────────────────────────────────────────┘

↓ admin を展開

┌─ テスト ──────────────────────────────────┐
│                                            │
│ ▼ admin                                    │
│ │                                          │
│ ├─ ▶ A1 事務所登録      2/4  fail  [1件]  │
│ ├─ ▶ A2 事務所編集      0/3               │
│ ├─ ▶ A3 事務所削除     3/3  passed        │
│                                            │
│ ▶ user                                     │
│                                            │
└────────────────────────────────────────────┘

↓ A1 を展開

┌─ テスト ──────────────────────────────────┐
│                                            │
│ ▼ admin                                    │
│ │                                          │
│ ├─ ▼ A1 事務所登録      2/4  fail  [1件]  │
│ │  │                                       │
│ │  │  ☑ バリデーション           passed    │
│ │  │  ☑ 登録処理                 passed    │
│ │  │  ☐ 一覧表示                    -      │
│ │  │  ☐ 権限              fail  [1件]      │
│ │  │                                       │
│ │  │  ── バグ報告 ─────────────────────   │
│ │  │  ケース: [権限 ▼]                     │
│ │  │  内容:   [________________________]   │
│ │  │  重要度: [medium ▼]                   │
│ │  │                                       │
│ │  │            [送信]                      │
│ │  │                                       │
│ ├─ ▶ A2 事務所編集      0/3               │
│ ├─ ▶ A3 事務所削除     3/3  passed        │
│                                            │
│ ▶ user                                     │
│                                            │
└────────────────────────────────────────────┘
```

### Case 行の表示

```
[チェックボックス] [Case タイトル] [直近結果] [open件数]
```

| 要素 | 説明 |
|------|------|
| チェックボックス | `last === 'pass'` なら初期チェック済み。送信時にチェック済み → PASS記録 |
| Case タイトル | test_cases.title |
| 直近結果 | `passed` / `fail` / `-`（未テスト or skip） |
| open件数 | 紐づくopen note数。0件なら非表示。`[1件]` のように表示 |

### ステータス表示ルール

| 対象 | 表示 | 条件 |
|------|------|------|
| Case | `passed` | 直近のrunがpass |
| Case | `fail` | 直近のrunがfail |
| Case | `-` | 未テスト or skip |
| Capability | `passed` | 全Caseの直近がpass |
| Capability | `fail` | 1つでも直近がfailのCaseがある |
| Capability | (空) | 上記以外（未完了等） |

- N/N: 直近passのCase数 / 全Case数
- `[N件]`: 紐づくopen note数（0件なら非表示）

### トグル制御

- **初期状態**: 全 Domain・Capability 閉じた状態
- **タブ切替時**: トグル状態を保持
- **自動更新しない**: 送信後に手動でリフレッシュ不要（送信のレスポンスで該当Capabilityのみ更新）

---

## 2. 操作フロー

### 送信（Capability単位）

各 Capability の展開エリアに**送信ボタンが1つ**。

送信時の処理:
1. **チェック済みCase** → 全て `pass` として test_run を記録
2. **バグ報告フォーム**が入力済みの場合 → 選択されたCaseに `fail` の test_run + open ノートを記録
3. チェックなし + フォーム空 → 何もしない

バグ報告フォームの構成:
- **ケース**（セレクト、必須）: このCapability内のCaseから選択
- **内容**（テキストエリア、必須）: バグの内容
- **重要度**（セレクト）: low / medium / high / critical

フォーム未入力で送信した場合、チェック済みCaseのPASS記録のみ行う。
フォーム入力 + チェック済みCaseの組み合わせ: FAIL対象のCaseがチェック済みでも、FAILが優先（後から記録されるため直近結果がfailになる）。

タイトルは内容の1行目から自動生成（既存仕様と同じ）。
environment, console_log, network_log は logCapture から自動付与。

---

## 3. データ設計

### 方針: notes テーブルを統一的なIssue記録として使う

UI上は「記録タブ（手動バグ報告）」と「テストタブ」は別物だが、
データ的には**両方とも notes テーブルに記録する**。

理由:
- 管理タブの「open一覧」に手動バグもテスト失敗も統一表示できる
- DebugAdmin でも一元管理できる
- Issue用の別テーブルが不要

### 区別方法

notes テーブルに `source` カラムを追加:

| source | 意味 |
|--------|------|
| `manual` | 記録タブからの手動バグ報告（既存） |
| `test` | テストフローからの自動記録 |

テストフローから作られたノートは `test_case_id` で紐付く。

### ステータス型の変更

```ts
type Status = 'open' | 'fixed';
```

- `verified` は廃止（テストフローの passed/fail で代替）
- **再オープン不可**: `fixed` → `open` には戻せない。再発時は新規バグとして報告
- PiP管理タブのセレクトボックス選択肢: `open`, `fixed`

### DB変更（スキーマ v3）

```sql
-- テストケース定義（MDからインポート）
CREATE TABLE test_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    capability TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_cases_domain ON test_cases(domain);
CREATE UNIQUE INDEX idx_test_cases_unique ON test_cases(domain, capability, title);

-- テスト実行記録（1 Caseに複数回の実行が可能）
CREATE TABLE test_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES test_cases(id),
    result TEXT NOT NULL,   -- 'pass' | 'fail' | 'skip'
    note_id INTEGER,        -- fail時に作成されたnoteのID
    env TEXT NOT NULL DEFAULT 'dev',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_test_runs_case_id ON test_runs(case_id);
```

notes テーブルへの追加:
```sql
ALTER TABLE notes ADD COLUMN source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE notes ADD COLUMN test_case_id INTEGER REFERENCES test_cases(id);
```

スキーマバージョン: v2 → v3
（v2 は log-capture-and-api.md の console_log, network_log, environment 追加）

> **注**: test_cases は環境非依存のマスターデータ（`env` カラムなし）。
> 環境区別は test_runs の `env` カラムで行う。

---

## 4. Capability 集計

test_runs から導出。永続キャッシュしない。

```ts
interface CapabilitySummary {
  domain: string;
  capability: string;
  total: number;         // Case総数
  passed: number;        // 直近結果がPASSのCase数
  failed: number;        // 直近結果がFAILのCase数
  status: 'passed' | 'fail' | null;  // 集約ステータス
  openIssues: number;    // 紐づくopen note数（PiP + DebugAdmin で表示）
  cases: CaseSummary[];  // 子Case一覧
}
```

ステータス導出:
- `passed`: `passed === total`（全Caseがpass）
- `fail`: `failed > 0`（1つでもfailあり）
- `null`: 上記以外（未完了）

表示例:
- `A1 事務所登録  2/4` → 未完了
- `A1 事務所登録  2/4 fail [1件]` → FAILあり + open Issue
- `A1 事務所登録  4/4 passed` → 全クリア

---

## 5. Case 集計

```ts
interface CaseSummary {
  caseId: number;
  title: string;
  last: 'pass' | 'fail' | 'skip' | null;  // 直近結果
  retest: boolean;       // 再テスト必要か（PiP + DebugAdmin で表示）
  openIssues: number;    // 紐づくopen note数（PiP + DebugAdmin で表示）
}
```

### retest 判定ルール

- 付与: `last === 'fail'` または `openIssues > 0`
- 解除: `last === 'pass'` かつ `openIssues === 0`

### PiP テストタブでの表示

- `openIssues > 0` → `[N件]` を Case 行末に表示
- `retest` → `openIssues` 表示と `fail` ステータスで暗黙的に伝達（ラベル表示はしない）

### DebugAdmin での表示

- `retest` → 明示的にフラグ表示
- `openIssues` → 件数 + リンク

---

## 6. MDフォーマット

```markdown
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

## 権限
- 管理者権限で登録できる
- 一般ユーザーは登録ボタンが非表示

# A2 事務所編集

## 正常系
- 既存データを編集して保存できる

## バリデーション
- 必須項目を空にして保存するとエラー
```

### パースルール

| MD要素 | 解釈 |
|--------|------|
| frontmatter `domain:` | Domain 名 |
| `# 見出し` | Capability 名 |
| `## 見出し` | 視覚的グルーピング（**データとして保持しない**） |
| `- テキスト` | Case（テストケース） |

`##` 見出しはMDファイルの可読性のためだけに存在する。
パーサーはCaseのみを抽出し、`##` のカテゴリ情報は破棄する。

### パース結果の型

```ts
interface ParsedTestCase {
  domain: string;
  capability: string;
  title: string;
}
```

上記MDのパース結果:
```ts
[
  { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目のみで登録できる' },
  { domain: 'admin', capability: 'A1 事務所登録', title: '全項目入力して登録できる' },
  { domain: 'admin', capability: 'A1 事務所登録', title: '必須項目未入力でエラーが表示される' },
  { domain: 'admin', capability: 'A1 事務所登録', title: '管理者権限で登録できる' },
  // ...
]
```

### 複数ドメインの場合

1ファイル1ドメイン。複数ドメインは複数ファイルで渡す:

```ts
const adminMd = await fetch('/tests/admin.md').then(r => r.text());
const userMd = await fetch('/tests/user.md').then(r => r.text());

const testCases = [
  ...parseTestCaseMd(adminMd),
  ...parseTestCaseMd(userMd),
];

<DebugPanel testCases={testCases} />
```

---

## 7. FAIL → ノート自動作成の流れ

```
ユーザーがCapabilityの送信ボタンをクリック
    ↓
1. チェック済みCaseごとに test_runs に result='pass' を INSERT
2. バグ報告フォームが入力済みの場合:
   a. 選択されたCaseに対し test_runs に result='fail' を INSERT
   b. notes に以下を INSERT:
      - title: content の1行目から自動生成
      - content: ユーザー入力のテキスト
      - severity: ユーザー選択
      - source: 'test'
      - test_case_id: 選択されたCaseのID
      - status: 'open'
      - console_log, network_log, environment: logCapture から自動付与
   c. test_runs.note_id を更新
3. レスポンスで該当Capabilityの集計を返却 → UIを部分更新
```

管理タブには即座に反映される（open ノート一覧に出る）。

---

## 8. API

```
POST   /test-cases/import              -- MDパース結果をDBにインポート
GET    /test-cases                      -- 一覧（DebugAdmin用）
GET    /test-cases/tree?env=dev         -- ツリー構造+集計（PiPテストタブ用、1リクエスト）
POST   /test-runs?env=dev              -- 実行結果一括記録（Capability単位）
```

> **注**: test_cases は環境非依存。`/test-cases/import` と `/test-cases` に `env` パラメータは不要。
> `env` が必要なのは test_runs の記録・集計を行うエンドポイントのみ。

### `POST /test-cases/import`

リクエスト:
```json
{
  "cases": [
    { "domain": "admin", "capability": "A1 事務所登録", "title": "必須項目のみで登録できる" },
    { "domain": "admin", "capability": "A1 事務所登録", "title": "全項目入力して登録できる" }
  ]
}
```

処理:
- `INSERT OR IGNORE`（domain + capability + title が一致する既存caseはスキップ）
- 新規のみ INSERT
- MDに存在しなくなったcaseは削除しない（実行履歴があるため）
- べき等: 同じデータで何度呼んでも結果は同じ

### `GET /test-cases/tree?env=dev`

レスポンス:
```json
[
  {
    "domain": "admin",
    "capabilities": [
      {
        "capability": "A1 事務所登録",
        "total": 4,
        "passed": 2,
        "failed": 1,
        "status": "fail",
        "openIssues": 1,
        "cases": [
          { "caseId": 1, "title": "バリデーション", "last": "pass", "retest": false, "openIssues": 0 },
          { "caseId": 2, "title": "登録処理", "last": "pass", "retest": false, "openIssues": 0 },
          { "caseId": 3, "title": "一覧表示", "last": null, "retest": false, "openIssues": 0 },
          { "caseId": 4, "title": "権限", "last": "fail", "retest": true, "openIssues": 1 }
        ]
      }
    ]
  }
]
```

PiPテストタブの描画に必要な全データを**1リクエスト**で返す。
Case の `last` は直近の test_run.result、`openIssues` は紐づく open note の件数。

### `POST /test-runs?env=dev`

リクエスト（Capability単位の一括送信）:
```json
{
  "runs": [
    { "caseId": 1, "result": "pass" },
    { "caseId": 2, "result": "pass" },
    {
      "caseId": 4,
      "result": "fail",
      "note": {
        "content": "バリデーションエラーが表示されない",
        "severity": "high"
      }
    }
  ]
}
```

レスポンス:
```json
{
  "results": [
    { "caseId": 1, "runId": 10, "result": "pass" },
    { "caseId": 2, "runId": 11, "result": "pass" },
    { "caseId": 4, "runId": 12, "result": "fail", "noteId": 5 }
  ],
  "capability": {
    "capability": "A1 事務所登録",
    "total": 4,
    "passed": 2,
    "failed": 1,
    "status": "fail",
    "openIssues": 1,
    "cases": [ ... ]
  }
}
```

- `result === 'fail'` の場合のみ `note` フィールドを受け付ける
- サーバー側で test_run + note 作成を1トランザクションで処理
- **レスポンスに更新後のCapability集計を含める** → 追加のGETリクエスト不要

---

## 9. DebugPanel props

```ts
export interface DebugPanelProps {
  apiBaseUrl?: string;
  env?: Environment;
  onSave?: (note: Note) => void;
  onClose?: () => void;
  initialSize?: { width: number; height: number };
  testCases?: ParsedTestCase[];
  logCapture?: LogCaptureInstance;
}
```

DebugPanel マウント時に `testCases` が渡されていたら:
1. `POST /test-cases/import` でDBにインポート（べき等、毎回実行して問題なし）
2. `GET /test-cases/tree?env=dev` でツリー取得
3. テストタブに表示

- testCases が未提供ならテストタブは非表示（2タブ構成）
- import 失敗時: 既存DBデータでテストタブを表示、エラー通知を出すがブロックしない

---

## 10. PiP管理タブの変更

管理タブは全 open ノートを表示（source 問わず）。

```
│                                                  │
│  OPEN (3件)                                      │
│                                                  │
│  🔴 権限チェックが...  🧪 A1/権限     [open ▼]  │
│  🟡 ソート順が昇順...  🧪 A1/一覧     [open ▼]  │
│  🔵 ヘッダーのロゴが切れる          [open ▼]  │
│                                                  │
│  🧪 = テストフローから自動記録                    │
│                                                  │
```

- `source: test` のノートにはテストアイコン（🧪）+ 紐づくCapability/Case名を表示
- **セレクトボックス**で `open` → `fixed` に変更
- 選択肢: `open`, `fixed` のみ（`verified` は廃止）
- **再オープン不可**: `fixed` に変更したノートは管理タブから消える（openのみ表示のため）
- `fixed` に変更すると、紐づく test_case の openIssues が減少 → retest 判定に影響

---

## 11. 他ドキュメントへの修正内容

本ドキュメントの確定後、以下の修正を行う。

---

### 11.1 `README.md`

**現状**: テストフロー・ログキャプチャの記載なし。クイックスタートが最小構成のまま。

**修正箇所**:

1. **特徴セクション** に追加:
   - 機能テストのチェックリスト実行（PiP テストタブ）
   - コンソール・ネットワークログの自動キャプチャ

2. **クイックスタート** の `<DebugPanel />` を更新:
   ```typescript
   <DebugPanel logCapture={logCapture} testCases={testCases} />
   ```

---

### 11.2 `docs/requirement.md`

**修正箇所**:

1. **Section 5.1 notes テーブル**（L332-348）
   - `status` の説明: `open / fixed / verified` → `open / fixed`
   - `title` の説明: `不具合の要約` → `content の1行目から自動生成`
   - `user_log` の説明: UIラベルは「補足」だがカラム名は変更なし
   - 追加カラム: `source TEXT DEFAULT 'manual'`, `test_case_id INTEGER`

2. **Section 6.3 status 更新**（L415-419）
   - 許可する値: `open`, `fixed` のみ（`verified` を削除）
   - 再オープン不可の制約を明記

3. **Section 7.1 PIP パネル**（L443-460）
   - 入力項目から `title` を削除（自動生成に変更）
   - 3タブ構成の説明を更新（テストタブ = チェックボックス式）

4. **Section 7.2 管理画面**（L461-511）
   - フィルタ: `Open/Fixed/Verified` → `Open/Fixed`
   - ステータス変更: `Open / Fixed / Verified` → `Open / Fixed`（再オープン不可）
   - DebugAdmin にテストフロー関連表示を追加: `source` フィルタ、`retest` フラグ、`openIssues`

5. **Section 11 テストフロー機能**（L557-568）— **全面書き換え**
   - 旧: チェックリスト → verified ノート作成
   - 新: 本ドキュメント（test-flow-redesign.md）の内容に置換
   - Domain/Capability/Case 階層、TestRun、チェックボックス式送信、バグ報告フォーム

6. **Section 11.2 Status 拡張**（L565-567）— **削除**
   - `verified` は廃止。Status は `open | fixed` の2値

---

### 11.3 `docs/usage.md`

**修正箇所**:

1. **DebugPanel 入力項目テーブル**（L162-168）
   - `title`（必須）行を削除。代わりに「content の1行目からタイトル自動生成」を明記

2. **3タブ構成テーブル**（L170-177）
   - **管理タブ**: `Openノートの一覧＋Fixedボタン` → `Openノートの一覧＋セレクトボックス（open/fixed）`
   - **テストタブ**: `テストケースのチェックリスト` → `チェックボックス式テスト実行（Capability単位で送信）`

3. **DebugPanel 動作説明**（L179-186）
   - L184: `管理タブ: Openのノートをその場でFixedに変更可能` → `管理タブ: セレクトボックスでopen→fixedに変更`
   - L185: `テストタブ: チェックリストを全確認→「問題なし」でverifiedノート作成〜` → `テストタブ: チェックボックスでPASS、バグ報告フォームでFAIL → Capability単位で送信`

4. **DebugAdmin 機能**（L200-211）
   - L203: フィルタ `Open/Fixed/Verified` → `Open/Fixed`
   - L205: ステータス変更 `Open / Fixed / Verified` → `Open / Fixed`
   - 追加: `source` フィルタ（manual/test）、`retest` フラグ表示、`openIssues` リンク

5. **型定義**（L436-478）
   - L441: `type Status = 'open' | 'fixed' | 'verified'` → `type Status = 'open' | 'fixed'`
   - L466: `NoteInput.title` を必須から任意に（`title?: string`、省略時はcontent1行目から自動生成）
   - L473: `status?: 'open' | 'verified'` → `status?: 'open'`（verified 削除）
   - 追加: `source?: 'manual' | 'test'`、`testCaseId?: number`

6. **parseTestCaseMd**（L409-428）— **全面書き換え**
   - 旧フォーマット（`name:`, `target:` frontmatter）を削除
   - 新フォーマット（`domain:` frontmatter + `#` Capability + `- ` Case）に置換
   - `##` は視覚グルーピング用、データ保持しない旨を明記
   ```typescript
   const testCases = parseTestCaseMd(`
   ---
   domain: admin
   ---
   # A1 事務所登録
   ## 正常系
   - 必須項目のみで登録できる
   - 全項目入力して登録できる
   `);
   ```

7. **REST API テーブル**（L482-489）
   - テストフロー用 API を追加:
     - `POST /test-cases/import` — テストケースインポート
     - `GET /test-cases/tree?env=dev` — ツリー構造+集計
     - `POST /test-runs?env=dev` — テスト結果一括記録

---

### 11.4 `docs/setup.md`

**修正箇所**:

1. **テストケースMDセクション**（L207-231）— **全面書き換え**
   - 旧フォーマット:
     ```markdown
     ---
     name: ログイン機能
     target: /login
     ---
     ## 基本フロー
     - メールアドレスでログインできる
     ```
   - 新フォーマット:
     ```markdown
     ---
     domain: admin
     ---
     # A1 事務所登録
     ## 正常系
     - 必須項目のみで登録できる
     ```
   - パースルール説明: `#` = Capability、`##` = グルーピング（データ保持しない）、`-` = Case
   - `ParsedTestCase` 型: `{ domain, capability, title }`（tags なし）

2. **parseTestCaseMd 使用例**（L226-231）
   ```typescript
   const testCases = parseTestCaseMd(mdString);
   <DebugPanel testCases={testCases} logCapture={logCapture} />
   ```

---

### 11.5 `docs/pip-implementation.md`

**修正箇所**:

1. **3タブ構成セクション**（L300-326）
   - **記録タブ**（L304-308）: 変更なし（内容・重要度・補足メモ・再現手順）
   - **管理タブ**（L310-313）:
     - `各行に severity ドット + content プレビュー + 「Fixed」ボタン` → `各行にseverityドット + contentプレビュー + source区別（🧪） + セレクトボックス（open/fixed）`
   - **テストタブ**（L315-320）— **全面書き換え**:
     - 旧: チェックリスト → 「バグ報告」「問題なし」ボタン → verified ノート
     - 新: Domain/Capability/Case トグルツリー、チェックボックス式PASS、バグ報告フォーム（ケースセレクト + 内容 + 重要度）、Capability単位の送信ボタン
   - **タブ制御**（L322-325）: `verified` ノート作成の記述を削除

---

### 11.6 `src/types/index.ts`

**修正箇所**:

1. `Status` 型: `'open' | 'fixed' | 'verified'` → `'open' | 'fixed'`
2. `NoteInput.title`: 必須 → 任意（`title?: string`）
3. `NoteInput.status`: `'open' | 'verified'` → `'open'`
4. 追加: `source: 'manual' | 'test'`、`test_case_id: number | null` を `Note` 型に
5. 追加: `ParsedTestCase`、`CaseSummary`、`CapabilitySummary` 型定義

---

## 実装順序

```
1. DBスキーマ v3（test_cases, test_runs, notes拡張、Status型からverified削除）
2. MDパーサー書き直し（旧 name/target 形式 → domain frontmatter + # Capability + - Case）
3. API追加（import, tree, test-runs batch）
   - 単体テスト: import のべき等性、tree の集計ロジック、batch のトランザクション
4. PiPテストタブUI（トグル + チェックボックス + バグ報告フォーム + 送信 + passed/fail表示）
5. PiP管理タブ変更（source区別、Capability/Case名表示、セレクトボックス化）
6. DebugAdmin対応（source フィルタ、retest フラグ表示、openIssues リンク）
   - 結合テスト: テストタブ → FAIL → 管理タブ反映 → fixed → retest解除の一連フロー
```
