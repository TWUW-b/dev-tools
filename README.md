# @twuw-b/dev-tools

開発・テスト環境向けの統合デベロッパーツール。

デバッグノート記録、テストフロー管理、マニュアル表示、フィードバック収集を1つのライブラリに統合。

## 特徴

- **`<DevTools>` 1 コンポーネントで統合**（v1.2.0+）: ルーティング / logCapture / debug mode を自動配線
- **デバッグノート**: PiP ウィンドウで不具合・違和感を最小入力で記録
- **テストフロー**: Domain/Capability/Case 階層のチェックリスト実行
  - 展開中の capability の case ID を record タブ保存時に **自動紐付け**（v1.2.0+）
- **マニュアル表示**: Markdown ドキュメントの PiP / サイドバー / タブ表示
- **環境情報タブ**（v1.2.0+）: プロジェクト・環境別の URL / 認証情報 / 注意点を MD ベースで管理
- **フィードバック**: ユーザーからのバグ報告・要望・質問を収集
- コンソール・ネットワークログの自動キャプチャ
- dev / test 環境ごとにデータ分離
- PHP + SQLite のシンプルなバックエンド
- **Claude Code skill 同梱**:
  - `devtools-testcase-author` — テストケース MD をロール軸で作成 + case_key ベース UPSERT
  - `devtools-testcase-verifier` — Chrome MCP でテストケースを実行・5 バケット振り分け・レポート生成

## Claude Code Skill のセットアップ

npm パッケージに 2 つの Claude Code skill を同梱しています。インストール後に以下の 1 コマンドで利用側プロジェクトにコピーできます:

```bash
# 2 つの skill を一括コピー
mkdir -p .claude/skills
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-author .claude/skills/
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/
```

### devtools-testcase-author（テストケース作成）

Claude Code の会話で「テストケースを作って」と指示すると起動。以下を自動化:

- ロール軸（guest / user / admin 等）でテストケース MD を自動生成
- `[TC-XX-NNN]` 形式の不変キー（case_key）付与
- Domain → Capability → Case の 3 階層スキーマに準拠
- `/__debug/api/test-cases/import` への UPSERT 同期（`--auto-archive` でMD 削除分も自動反映）
- アンチパターン検出: UI 確認不可のテスト禁止 / 認可境界テストは別 domain に分離

### devtools-testcase-verifier（テストケース検証）

Claude Code の会話で「検証ラウンドを作って」と指示すると起動。以下を自動化:

- `docs/test-verifications/round-N/` に作業ディレクトリ生成
- dev-tools API から対象 TC を取得してチェックリスト展開
- Chrome MCP ガイドライン G1〜G10 に従ってブラウザ操作
- 5 バケット（OK / TC_WRONG / IMPL_BUG / OTHER / SKIP）に振り分け
- evidence（screenshot + network dump）必須
- ロール別レポート + 全体サマリを自動生成
- **PreToolUse hook**: `evaluate_script` 内の `fetch()` / `XHR` を物理ブロック
- **SessionStart hook**: 起動時に CLAUDE.md + 進捗を自動注入（context 圧縮後の記憶劣化防止）
- （オプション）IMPL_BUG を dev-tools の notes API に投入

### skill の更新

```bash
npm update @twuw-b/dev-tools
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-author .claude/skills/
cp -R node_modules/@twuw-b/dev-tools/.claude/skills/devtools-testcase-verifier .claude/skills/
```

詳細は `docs/integration-guide.md` を参照。

## インストール

> **Private パッケージ**: GitHub Packages（private registry）から配布。npmjs.com には公開されていないため、認証設定が必要。

### 1. プロジェクトの `.npmrc` を作成

```
@twuw-b:registry=https://npm.pkg.github.com
```

### 2. 認証トークンを設定

GitHub Personal Access Token（`read:packages` 権限）が必要。

#### 方法 A: `~/.npmrc` に設定（ローカル開発）

```
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

> トークンの作成: GitHub → Settings → Developer settings → Personal access tokens → `read:packages` 権限で生成

#### 方法 B: 環境変数で設定（CI/CD）

プロジェクトの `.npmrc` を以下に変更:

```
@twuw-b:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

GitHub Actions の場合:

```yaml
- name: Install dependencies
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GH_PACKAGES_TOKEN }}
  run: npm ci
```

### 3. インストール

```bash
npm install @twuw-b/dev-tools
```

## インポートパス

| パス | 内容 |
|------|------|
| `@twuw-b/dev-tools` | 全機能（デバッグ + マニュアル + フィードバック） |
| `@twuw-b/dev-tools/components` | コンポーネントのみ |
| `@twuw-b/dev-tools/hooks` | フックのみ |
| `@twuw-b/dev-tools/manual` | マニュアル系コンポーネントのみ |

## クイックスタート

### デバッグパネル（デバッグノート + テストフロー + マニュアル + 環境情報）

**推奨: `<DevTools>` ワンストップ統合コンポーネント（v1.2.0+）**

```typescript
import { DevTools } from '@twuw-b/dev-tools';
import { allTestCases } from './debug/testCases';
// 環境情報 MD（任意）
import environmentsMd from '../docs/environments.md?raw';

function App() {
  return (
    <>
      <YourApp />
      <DevTools
        apiBaseUrl="https://your-domain.com/__debug/api"
        env="dev"
        testCases={allTestCases}
        environmentsMd={environmentsMd}
      />
    </>
  );
}
```

`<DevTools>` が以下を内部で処理します:

- `setDebugApiBaseUrl()` / `createLogCapture({ console: true, network: ['/api/**'] })` の自動配線
- `useDebugMode()` の購読と PiP の条件レンダ
- `/__admin` ルート滞在中は debug mode を強制 ON 扱い（管理ダッシュボード表示中に PiP も同時表示）
- test タブで capability を展開中なら、その case IDs を record タブ保存時に **自動紐付け**

デバッグモードの起動:
- URL: `#debug`
- キーボード: `z` キーを素早く3回押す（トグル）
- `/__admin` を開いている間は自動 ON

<details>
<summary>レガシー API: <code>&lt;DebugPanel&gt;</code> 直接配線</summary>

```typescript
import {
  DebugPanel,
  useDebugMode,
  setDebugApiBaseUrl,
  createLogCapture,
} from '@twuw-b/dev-tools';

setDebugApiBaseUrl('https://your-domain.com/__debug/api');
const logCapture = createLogCapture({ console: true, network: ['/api/**'] });

function App() {
  const { isDebugMode } = useDebugMode();
  return (
    <>
      <YourApp />
      {isDebugMode && <DebugPanel logCapture={logCapture} />}
    </>
  );
}
```

</details>

### マニュアル PiP（単体使用）

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

### フィードバック

```typescript
import { FeedbackForm } from '@twuw-b/dev-tools/manual';

// FeedbackForm は ManualPiP / ManualTabPage 内で自動表示される
// feedbackApiBaseUrl を指定すると有効化
<ManualPiP
  feedbackApiBaseUrl="https://your-domain.com/__feedback/api"
  feedbackUserType="developer"
  feedbackAppVersion="1.0.0"
/>
```

## API バックエンド

PHP + SQLite のバックエンド。ノート記録・テストフロー・フィードバック収集を `api/` に統合。

### セットアップ

```bash
cp api/config.example.php api/config.php

# Docker で起動（PHP 8.4）
npm run docker:up
```

## ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [使用方法ガイド](./docs/usage.md) | コンポーネント・フック・API リファレンス |
| [セットアップガイド](./docs/setup.md) | 導入・デプロイ手順 |
| [仕様書](./docs/requirement.md) | 詳細仕様 |
| [PiP実装ガイド](./docs/pip-implementation.md) | Document PiP API の実装詳細 |

## 構成

```
dev-tools/
├── src/
│   ├── components/        # UI コンポーネント
│   │   ├── manual/        # マニュアル・フィードバック系
│   │   └── admin/         # 管理画面系
│   ├── hooks/             # React フック
│   ├── utils/             # ユーティリティ
│   ├── styles/            # スタイル定義
│   └── types/             # 型定義
├── api/                   # API（PHP + SQLite）
├── sample/                # 開発用サンプルアプリ
└── docs/                  # ドキュメント
```

## 開発

```bash
# API 設定
cp api/config.example.php api/config.php

# Docker で API 起動（PHP 8.4）
npm run docker:up

# サンプルアプリ起動
npm run sample

# ブラウザでアクセス
# http://localhost:3000#debug

# テスト実行
npm run test

# 型チェック
npm run typecheck

# ビルド
npm run build

# Docker 停止
npm run docker:down
```

## パッケージ公開

```bash
# GitHub に認証（初回のみ）
npm login --registry=https://npm.pkg.github.com

# テスト + ビルド + publish（prepublishOnly で自動実行）
npm publish
```

バージョン更新:

```bash
npm version patch  # 1.0.0 → 1.0.1
npm publish
```

## ライセンス

MIT
