# DebugAdmin テスト状況UI

## 概要

管理画面（DebugAdmin）にテストフロー確認機能を追加。

- **ビジュアル概要**: 一目でテスト進捗・問題箇所を把握
- **ツリー表示**: Domain/Capability/Case の階層＋リンク

---

## 1. 画面構成

```
┌─────────────────────────────────────────────────────────────────┐
│  Debug Notes Admin                              [🌙] [↻ 30s ON] │
├─────────────────────────────────────────────────────────────────┤
│  [ノート一覧]  [テスト状況]                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ ビジュアル概要 ─────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  (色付きブロックで全体状況を表示)                          │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─ 詳細ツリー ─────────────────────────────────────────────┐   │
│  │                                                           │   │
│  │  (Domain/Capability/Case の階層表示)                      │   │
│  │                                                           │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ビジュアル概要

### 2.1 コンセプト

**「どこに問題があるか」を色と構造で即座に把握できるUI**

- 複雑なインタラクションなし（表示のみ）
- 将来的にクリックで詳細遷移を追加可能な構造

### 2.2 レイアウト

```
┌─ テスト概要 ──────────────────────────────────────────────────────┐
│                                                                    │
│   admin                              user                          │
│  ┌────────────────────────┐         ┌────────────────────────┐    │
│  │ A1 事務所登録  ████████ │         │ U1 ログイン   ████████ │    │
│  │ A2 事務所編集  ██░░░░░░ │         │ U2 プロフ編集 ████████ │    │
│  │ A3 事務所削除  ░░░░░░░░ │         │ U3 パス変更   ██████░░ │    │
│  │ A4 ユーザー管理 ██████░░ │         │ U4 退会       ░░░░░░░░ │    │
│  └────────────────────────┘         └────────────────────────┘    │
│                                                                    │
│   凡例: █ passed  ░ 未テスト  ▓ fail/要対応                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 2.3 カラースキーム

| 状態 | 色 | 意味 |
|-----|-----|------|
| **passed** | `#22c55e` (green-500) | 全Case passed |
| **fail** | `#ef4444` (red-500) | 1つ以上 fail または openIssues > 0 |
| **未テスト** | `#e5e7eb` (gray-200) | 未実行 |
| **部分完了** | グラデーション | passed/total の割合で塗り分け |

### 2.4 Capability ブロックの詳細

```
┌─ A2 事務所編集 ──────────────────┐
│                                  │
│  ██████▓▓░░░░░░░░  2/4  [2件]   │
│                                  │
│  passed: 2  fail: 1  untested: 1 │
└──────────────────────────────────┘

バー内訳:
██████  = passed (2件)
▓▓      = fail (1件) ← 赤色
░░░░░░  = 未テスト (1件)
```

### 2.5 問題ハイライト

**fail または openIssues がある Capability は目立たせる**:

```css
/* 問題あり */
.capability-block--has-issues {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

/* 全クリア */
.capability-block--passed {
  border-left: 4px solid #22c55e;
  background: #f0fdf4;
}

/* 未完了（問題なし） */
.capability-block--incomplete {
  border-left: 4px solid #9ca3af;
  background: #f9fafb;
}
```

### 2.6 レスポンシブ

```
Desktop (3列):
┌────────┐ ┌────────┐ ┌────────┐
│ admin  │ │ user   │ │ report │
└────────┘ └────────┘ └────────┘

Tablet (2列):
┌────────┐ ┌────────┐
│ admin  │ │ user   │
└────────┘ └────────┘
┌────────┐
│ report │
└────────┘

Mobile (1列):
┌────────────────┐
│ admin          │
├────────────────┤
│ user           │
├────────────────┤
│ report         │
└────────────────┘
```

---

## 3. 詳細ツリー

### 3.1 レイアウト

```
┌─ 詳細 ───────────────────────────────────────────────────────────┐
│                                                                    │
│  フィルタ: [全て ▼]  [要対応のみ ☐]                               │
│                                                                    │
│  ▼ admin                                              12/20  60%  │
│  │                                                                 │
│  │  ● A1 事務所登録           4/4   passed                        │
│  │  ▲ A2 事務所編集           2/4   fail    [2件]                 │
│  │  ○ A3 事務所削除           0/3                                 │
│  │  ● A4 ユーザー管理         3/4   passed                        │
│  │                                                                 │
│  ▶ user                                                8/15  53%  │
│  ▶ report                                              0/10   0%  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 アイコン凡例

| アイコン | 状態 | 色 |
|---------|------|-----|
| ● | passed（全Case完了） | green |
| ▲ | fail（問題あり） | red |
| ○ | 未完了（問題なし） | gray |

### 3.3 Capability 展開時

```
│  ▲ A2 事務所編集           2/4   fail    [2件]                    │
│  │                                                                 │
│  │  ├─ ● 既存データを編集して保存     passed                      │
│  │  ├─ ▲ 必須項目を空にするとエラー   fail    [1件]               │
│  │  ├─ ▲ 権限なしユーザーは編集不可   fail    [1件]               │
│  │  └─ ○ 削除されたデータは編集不可   -                           │
```

### 3.4 `[N件]` リンク

クリックで「ノート一覧」タブに遷移し、該当ノートでフィルタ:

```typescript
// クリック時の処理
const handleIssueClick = (caseId: number) => {
  setActiveTab('notes');
  setNoteFilter({ testCaseId: caseId, status: 'open' });
};
```

---

## 4. フィルタ

### 4.1 ステータスフィルタ

```typescript
type StatusFilter = 'all' | 'passed' | 'fail' | 'incomplete';
```

| 値 | 表示対象 |
|----|---------|
| `all` | 全 Capability |
| `passed` | 全 Case が passed |
| `fail` | 1つ以上 fail または openIssues > 0 |
| `incomplete` | 未テスト Case あり |

### 4.2 要対応のみ

```typescript
// チェックON時、以下を非表示:
// - passed かつ openIssues === 0 の Capability
// - 全 Capability が上記条件の Domain
```

---

## 5. データ構造

### 5.1 API レスポンス（既存）

`GET /test-cases/tree?env=dev` をそのまま使用:

```typescript
interface DomainTree {
  domain: string;
  capabilities: CapabilitySummary[];
}

interface CapabilitySummary {
  capability: string;
  total: number;
  passed: number;
  failed: number;
  status: 'passed' | 'fail' | null;
  openIssues: number;
  cases: CaseSummary[];
}

interface CaseSummary {
  caseId: number;
  title: string;
  last: 'pass' | 'fail' | 'skip' | null;
  retest: boolean;
  openIssues: number;
}
```

### 5.2 ビジュアル用の集計

```typescript
interface DomainVisual {
  domain: string;
  total: number;      // 全 Case 数
  passed: number;     // passed Case 数
  failed: number;     // failed Case 数（openIssues含む）
  untested: number;   // 未テスト Case 数
  hasIssues: boolean; // failed > 0 || openIssues > 0
  capabilities: CapabilityVisual[];
}

interface CapabilityVisual {
  capability: string;
  total: number;
  passed: number;
  failed: number;
  untested: number;
  openIssues: number;
  status: 'passed' | 'fail' | 'incomplete';
}
```

---

## 6. コンポーネント構成

```
src/components/admin/
├── TestStatusTab.tsx        # タブ全体
├── TestOverview.tsx         # ビジュアル概要
├── TestOverviewDomain.tsx   # Domain カード
├── TestOverviewBar.tsx      # 進捗バー
├── TestTree.tsx             # 詳細ツリー
├── TestTreeDomain.tsx       # Domain 行
├── TestTreeCapability.tsx   # Capability 行
└── TestTreeCase.tsx         # Case 行
```

---

## 7. スタイル定義

### 7.1 カラーパレット

```typescript
const TEST_COLORS = {
  passed: '#22c55e',      // green-500
  passedBg: '#f0fdf4',    // green-50
  fail: '#ef4444',        // red-500
  failBg: '#fef2f2',      // red-50
  untested: '#e5e7eb',    // gray-200
  untestedBg: '#f9fafb',  // gray-50
  border: '#d1d5db',      // gray-300
};
```

### 7.2 進捗バー

```css
.progress-bar {
  display: flex;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-untested);
}

.progress-bar__passed {
  background: var(--color-passed);
}

.progress-bar__failed {
  background: var(--color-fail);
}

.progress-bar__untested {
  background: var(--color-untested);
}
```

---

## 8. 将来拡張

### Phase 1（現在）
- ビジュアル概要（表示のみ）
- ツリー表示 + リンク

### Phase 2
- Capability ブロッククリック → ツリーの該当箇所にスクロール
- Case クリック → 詳細パネル表示

### Phase 3
- テスト履歴グラフ（日別の passed/fail 推移）
- エクスポート機能（CSV/PDF）

---

## 9. 実装順序

```
1. TestStatusTab.tsx（タブ追加、データ取得）
2. TestTree.tsx（ツリー表示、フィルタ、リンク）
3. TestOverview.tsx（ビジュアル概要）
4. DebugAdmin.tsx 修正（タブ追加）
5. スタイル調整
```

---

## 10. ワイヤーフレーム（ASCII）

### 10.1 全体

```
┌─────────────────────────────────────────────────────────────────────┐
│  Debug Notes Admin                                  [🌙] [↻ ON]    │
├─────────────────────────────────────────────────────────────────────┤
│  [ ノート一覧 ]  [ テスト状況 ]                                      │
╞═════════════════════════════════════════════════════════════════════╡
│                                                                     │
│  ╔═ テスト概要 ═══════════════════════════════════════════════════╗ │
│  ║                                                                 ║ │
│  ║   admin                    user                    report       ║ │
│  ║  ┌──────────────┐        ┌──────────────┐        ┌──────────┐  ║ │
│  ║  │▓ A1  ████████│        │● U1  ████████│        │○ R1 ░░░░│  ║ │
│  ║  │▓ A2  ██▓░░░░░│        │● U2  ████████│        │○ R2 ░░░░│  ║ │
│  ║  │○ A3  ░░░░░░░░│        │○ U3  ██████░░│        │○ R3 ░░░░│  ║ │
│  ║  │● A4  ██████░░│        │○ U4  ░░░░░░░░│        │         │  ║ │
│  ║  └──────────────┘        └──────────────┘        └──────────┘  ║ │
│  ║                                                                 ║ │
│  ║   █ passed   ▓ fail/要対応   ░ 未テスト                         ║ │
│  ║                                                                 ║ │
│  ╚═════════════════════════════════════════════════════════════════╝ │
│                                                                     │
│  ╔═ 詳細 ══════════════════════════════════════════════════════════╗ │
│  ║                                                                 ║ │
│  ║  フィルタ: [全て ▼]  [☐ 要対応のみ]                             ║ │
│  ║                                                                 ║ │
│  ║  ▼ admin                                           12/20  60%  ║ │
│  ║  │  ● A1 事務所登録          4/4   passed                      ║ │
│  ║  │  ▲ A2 事務所編集          2/4   fail   [2件]                ║ │
│  ║  │  ○ A3 事務所削除          0/3                               ║ │
│  ║  │  ● A4 ユーザー管理        3/4   passed                      ║ │
│  ║  ▶ user                                             8/15  53%  ║ │
│  ║  ▶ report                                           0/10   0%  ║ │
│  ║                                                                 ║ │
│  ╚═════════════════════════════════════════════════════════════════╝ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Capability 展開時

```
│  ║  ▼ admin                                           12/20  60%  ║ │
│  ║  │                                                             ║ │
│  ║  ├─ ● A1 事務所登録          4/4   passed                      ║ │
│  ║  │                                                             ║ │
│  ║  ├─ ▲ A2 事務所編集          2/4   fail   [2件]                ║ │
│  ║  │  │                                                          ║ │
│  ║  │  ├─ ● 既存データを編集して保存できる      passed             ║ │
│  ║  │  ├─ ▲ 必須項目を空にするとエラー          fail    [1件]     ║ │
│  ║  │  ├─ ▲ 権限なしユーザーは編集不可          fail    [1件]     ║ │
│  ║  │  └─ ○ 削除されたデータは編集不可          -                 ║ │
│  ║  │                                                             ║ │
│  ║  ├─ ○ A3 事務所削除          0/3                               ║ │
```
