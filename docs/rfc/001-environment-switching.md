# RFC 001: 環境切替機能（dev / test / staging / prod）

| 項目 | 値 |
|---|---|
| **Status** | **Proposed**（提案中・仕様未確定） |
| Created | 2026-04-07 |
| Updated | 2026-04-07 |
| Target Version | 未定（`v1.3.0` 候補） |
| Related | `docs/draft/pip-autosetup-and-testcase-link.md`（v1.2.0 で実装済み） |

> ⚠ **この RFC は実装検討中の段階であり、採用・仕様ともに未確定です。**
> 合意形成後に Status を `Accepted` に更新し、実装計画 MD を `docs/draft/` に作成してから着手する想定です。

---

## 背景

現在 `Environment` 型は `'dev' | 'test'` の 2 値固定で、以下の制約がある。

- mount 時に fix され、実行時切替不可
- バックエンド `api/index.php:72` のホワイトリストも `['dev', 'test']` のみ
- 実運用では `dev / staging / prod` や `test / prod` など **プロジェクトごとに必要な env が異なる**
- 利用者からの要望:「これ 1 つで dev / staging または test / prod 環境を切り替えたい」

## 要件（ユーザーヒアリング確定分）

1. 環境切替はプロジェクト依存（`test+prod のみ` / `prod のみ` などもあり得る。4 値固定にしない）
2. 使用モードは 2 系統あり、env 指定方法が異なる
   - **A. アプリ組み込み**（`<DevTools>` を対象アプリに mount）→ **PiP は自動判定すべき**
   - **B. 管理画面スタンドアロン**（`<DebugAdmin>` を別サイトで運用）→ **手動選択のみ**
   - C. PiP スタンドアロン運用もあり得る（手動選択扱い）
3. 環境が増えることによる **テスト結果の誤投入リスク** を仕組みで防止する必要がある

## 現状整理

### 型・API

- `src/types/index.ts:8` `type Environment = 'dev' | 'test'`
- `DebugPanel` / `DevTools` / `DebugAdmin` の `env` prop は mount 時固定
- `useDebugNotes(env)` で env を使って API を叩く

### バックエンド

- `api/index.php:71` で `?env=` を取得
- `api/index.php:72` のホワイトリストで `['dev', 'test']` 以外を弾く
- `$config['db'][$env]` で **env ごとに別 SQLite ファイル**を使う設計（完全データ分離）
- 未存在 DB は自動マイグレーションで作成される（既存挙動）

### 既存資産

- v1.2.0 で `environments.md` パーサ（`parseEnvironmentsMd`）を導入済み
- MD 内に各 env の URL / 認証情報が記載されている → **env 判定の情報源として再利用可能**

---

## 設計方針（提案）

### 1. env 自動判定のキー

| キー | 精度 | 前提 | 採用判断 |
|---|:-:|---|---|
| **A. hostname マッチング（environments.md ベース）** | ★★★ | MD に URL 記載あり | **第一候補**。既存資産を再利用できる最大の強み |
| B. `import.meta.env.MODE` | ★★ | Vite 命名依存 | 参考扱い |
| C. カスタム `currentEnv` prop | ★★ | consumer が明示 | **併用**。確実性が欲しい利用者向け |
| D. URL クエリ `?debugEnv=prod` | ★ | 手動 | デバッグ用オーバーライド |
| E. サブドメインパターン | ★ | 命名規約 | 不採用（MD で十分） |

#### 判定ロジック優先順位（案）

```
1. props `currentEnv` が明示指定  → それを使用
2. URL クエリ `?debugEnv=xxx`      → オーバーライド
3. environments.md の URL と window.location.hostname が一致  → 自動選択
4. localStorage の前回選択値       → 復元
5. props `defaultEnv`              → フォールバック
6. 手動選択モーダル強制表示       → env 未確定状態
```

手順 3 で **複数 env が同じホストに該当する場合は自動選択せず必ずモーダル確認**（誤判定防止）。

### 2. env リストの出所

| 出所 | 扱い |
|---|---|
| `environments.md` をパースして `project.envs[*].env` の union を自動取得 | **推奨デフォルト**。固定長ではないので `test+prod のみ` / `prod のみ` にも自然対応 |
| props `envs={['test', 'prod']}` で明示 | MD を使わない運用の手段 |
| 両方指定時 | **明示 props を優先** |

管理画面側は MD がない運用も多いため、`availableEnvs` で明示できることを必須ルートにする。

### 3. 誤選択防止（5 層ディフェンス）

1. **視覚的プロミネンス（常時）**
   PiP ヘッダに env バッジを常時表示、色分け:
   - `prod` → 赤背景 + "PROD" 大文字
   - `staging` → オレンジ
   - `test` → 黄
   - `dev` → グレー
   - 色は `envColors` prop で上書き可

2. **hostname 不整合警告**
   保存中の env と `window.location.hostname` が不整合な場合、警告バナー:
   > ⚠ 現在の URL は `prod.example.com` ですが env は `dev` が選択されています [prod に切替]

3. **書込保護（write-protected env）**
   `writeProtected={['prod']}` 指定 env では:
   - ノート保存・ステータス変更・テスト結果送信に確認ダイアログ必須
   - デフォルト値は **オープン課題**（下記）

4. **env 切替時の確認**
   危険な env（writeProtected 指定）への切替時は 2 段階確認（env 名入力 or 明示ボタン）

5. **プロジェクト名併記**
   environments.md 利用時は `trinos / prod` 形式で表示。複数プロジェクト扱い時の誤選択を防ぐ

### 4. 使用モード別の挙動

| モード | 自動判定 | 手動選択 | writeProtected |
|---|:-:|:-:|:-:|
| A. アプリ組み込み `<DevTools>` | ✅ 優先 | ✅ 上書き可能 | ✅ |
| B. 管理画面スタンドアロン `<DebugAdmin>` | ❌ | ✅ 必須 | ✅ |
| C. PiP スタンドアロン | ❌ | ✅ 必須 | ✅ |

---

## API 案

### `<DevTools>` 拡張

```tsx
<DevTools
  apiBaseUrl="..."
  environmentsMd={environmentsMd}

  // ▼ env 自動判定（アプリ組込時）
  envDetection="auto"                         // 'auto' | 'manual' | 'prop'（default 'auto'）
  currentEnv={import.meta.env.VITE_APP_ENV}   // envDetection='prop' 時
  defaultEnv="dev"                            // フォールバック

  // ▼ env リストの明示（MD を使わない場合）
  envs={['test', 'prod']}                     // 未指定なら MD から自動抽出

  // ▼ 誤選択防止
  writeProtected={['prod']}
  envColors={{ prod: '#DC2626', staging: '#F59E0B', dev: '#6B7280' }}

  // ▼ env ごとに API URL が違う場合
  apiBaseUrlByEnv={{ dev: '...', staging: '...', prod: '...' }}
/>
```

### `<DebugAdmin>` 拡張

```tsx
<DebugAdmin
  apiBaseUrl="..."
  availableEnvs={['dev', 'staging', 'prod']}
  defaultEnv="dev"
  writeProtected={['prod']}
  envColors={{ ... }}
/>
```

### 型拡張

```ts
// Before
export type Environment = 'dev' | 'test';

// After（後方互換 union 拡張）
export type Environment = 'dev' | 'test' | 'staging' | 'prod' | (string & {});
```

`(string & {})` で union 値を補完しつつ任意文字列も許容。

### バックエンド

`api/index.php:72` のホワイトリスト撤廃し、英数字＋ハイフンのバリデーションに変更:

```php
if (!preg_match('/^[a-z][a-z0-9-]{0,31}$/', $env)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid env parameter']);
    exit;
}
$dbPath = $config['db'][$env] ?? null;  // config.php に env を追加すれば使える
```

`config.example.php` に env 追加例を追記。

---

## 破壊的変更の有無

| 項目 | 破壊的？ | 備考 |
|---|---|---|
| `Environment` 型拡張 | ❌ | union 拡張のみ |
| `DebugAdmin` の `availableEnvs` 追加 | ❌ | 任意 prop とし、未指定時は `[defaultEnv]` で従来通り |
| `env` prop の自動判定動作追加 | ❌ | 明示指定すれば従来通り |
| バックエンドホワイトリスト撤廃 | ❌ | 既存 `dev` / `test` は引き続き動作 |

**結論**: `minor` bump (`v1.3.0` 候補) で収まる見込み。

---

## オープン課題（要決定）

### Q1. writeProtected のデフォルト値

| 選択肢 | 長所 | 短所 |
|---|---|---|
| **A. `['prod']` デフォルト固定** | 最も危険な env を自動防御 | env 名が `production` / `本番` など別名の場合は保護されない |
| B. デフォルト空配列（明示必須） | 誤検知なし | 利用者が設定忘れで prod 直書き込みリスク |
| C. `environments.md` に `writeProtected: true` を frontmatter で指定 | 最も柔軟 | パーサ拡張が必要 |

### Q2. env 切替と環境情報タブの連動

| 選択肢 | 長所 | 短所 |
|---|---|---|
| A. 切替と連動して環境情報タブも該当 env を前面に出す | 視覚的に一致 | 実装複雑化 |
| B. 完全に独立（現状踏襲） | シンプル | UX 一貫性に欠ける |

### Q3. prod 書込確認の厳格度

| 選択肢 | UX |
|---|---|
| A. 毎回ダイアログ + env 名入力強制 | 最も安全、最も面倒 |
| B. 毎回ワンクリック確認 | バランス |
| C. env 切替時のみ確認、切替後は通常操作 | 最も軽いが事故リスク |

### Q4. env リスト未確定時の fallback

環境情報 MD も `availableEnvs` prop もない場合:
- A. 従来通り `['dev', 'test']` をデフォルトとする
- B. 起動時にエラーを出す
- C. env セレクタを非表示にして従来の `env` prop 固定動作に戻る

### Q5. 管理画面での自動判定禁止の徹底

管理画面は「別サイトで運用」が前提なので hostname 判定が機能しないが、**誤って有効化されないように** 明示的に禁止する必要があるか:
- A. `<DebugAdmin>` は自動判定コードを一切含めない（推奨）
- B. `<DebugAdmin envDetection="auto">` を書いたら警告

---

## トレードオフと代替案

### 代替案: env 概念を廃止し「プロジェクト＋環境」の 2 階層にする

environments.md は元々 `project × env` の 2 階層で構造化されている。現在の `env` 単独パラメータを `project + env` に拡張すれば、複数プロジェクトを同時に扱えて誤選択防止も強化される。

**却下理由（仮）**: バックエンド DB 設計が env 単位の完全分離であり、プロジェクト軸の追加は大きな DB マイグレーションを伴う。v1.3 のスコープには収まらない。v2.0 の検討対象。

### 代替案: env を廃止して URL 単位でデータ分離

データ分離のキーを env ではなく実 URL にする。自動判定が不要になる代わりに、手動で env 名を付ける運用ができなくなる。

**却下理由（仮）**: 既存データとの互換性が失われる。

---

## 影響範囲（実装見積もり）

| ファイル | 変更量 |
|---|---|
| `src/types/index.ts` | 小（型拡張・Props 拡張） |
| `src/hooks/useEnvSelection.ts` | **新規**。自動判定 + 手動選択 + localStorage |
| `src/components/DevTools.tsx` | 中（自動判定と手動モーダル統合） |
| `src/components/DebugPanel.tsx` | 中（ヘッダバッジ・警告バナー・書込保護） |
| `src/components/DebugAdmin.tsx` | 中（env セレクタ追加） |
| `src/components/debug/EnvSelectorModal.tsx` | **新規** |
| `api/index.php` | 小（ホワイトリスト → 正規表現） |
| `api/config.example.php` | 小（env 追加例） |
| `CHANGELOG.md` / `docs/usage.md` / `README.md` | 中（新機能ガイド） |
| `tests/` | 中〜大（自動判定ロジック、書込保護、誤選択防止の単体・E2E） |

目安: **1 minor バージョン** で収まる規模。

---

## 次アクション

1. オープン課題 Q1〜Q5 を利用者にヒアリングして決定
2. Status を `Accepted` に更新
3. `docs/draft/env-switching-implementation.md` に実装計画を起こす
4. `docs/draft/` の運用ルールに従って実装着手
5. `v1.3.0` (minor) としてリリース

---

## 決定ログ

| 日付 | 変更 |
|---|---|
| 2026-04-07 | 初版作成（Status: Proposed） |
