# @genlib/dev-tools

開発・テスト環境向けの統合デベロッパーツール。

デバッグノート記録、テストフロー管理、マニュアル表示、フィードバック収集を1つのライブラリに統合。

## 特徴

- **デバッグノート**: PiP ウィンドウで不具合・違和感を最小入力で記録
- **テストフロー**: Domain/Capability/Case 階層のチェックリスト実行
- **マニュアル表示**: Markdown ドキュメントの PiP / サイドバー / タブ表示
- **フィードバック**: ユーザーからのバグ報告・要望・質問を収集
- コンソール・ネットワークログの自動キャプチャ
- dev / test 環境ごとにデータ分離
- PHP + SQLite のシンプルなバックエンド

## インストール

```bash
npm install @genlib/dev-tools
```

## インポートパス

| パス | 内容 |
|------|------|
| `@genlib/dev-tools` | 全機能（デバッグ + マニュアル + フィードバック） |
| `@genlib/dev-tools/components` | コンポーネントのみ |
| `@genlib/dev-tools/hooks` | フックのみ |
| `@genlib/dev-tools/manual` | マニュアル系コンポーネントのみ |

## クイックスタート

### デバッグパネル（デバッグノート + テストフロー + マニュアル）

```typescript
import {
  DebugPanel,
  useDebugMode,
  setDebugApiBaseUrl,
  createLogCapture,
} from '@genlib/dev-tools';

// API URL を設定
setDebugApiBaseUrl('https://your-domain.com/__debug/api');

// ログキャプチャ初期化（アプリ起動時に1回）
const logCapture = createLogCapture({
  console: true,
  network: ['/api/**'],
});

// マニュアル項目
const manualItems = [
  { id: 'guide', title: '使い方ガイド', path: '/docs/guide.md' },
  { id: 'faq', title: 'よくある質問', path: '/docs/faq.md' },
];

function App() {
  const { isDebugMode } = useDebugMode();

  return (
    <>
      <YourApp />
      {isDebugMode && (
        <DebugPanel
          logCapture={logCapture}
          manualItems={manualItems}
        />
      )}
    </>
  );
}
```

デバッグモードの起動:
- URL: `?mode=debug`
- キーボード: `z` キーを素早く3回押す（トグル）

### マニュアル PiP（単体使用）

```typescript
import { ManualPiP, useManualPiP } from '@genlib/dev-tools/manual';

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
import { FeedbackForm } from '@genlib/dev-tools/manual';

// FeedbackForm は ManualPiP / ManualTabPage 内で自動表示される
// feedbackApiBaseUrl を指定すると有効化
<ManualPiP
  feedbackApiBaseUrl="https://your-domain.com/__feedback/api"
  feedbackUserType="developer"
  feedbackAppVersion="1.0.0"
/>
```

## API バックエンド

2つの PHP バックエンドを提供:

| API | ディレクトリ | 用途 |
|-----|-------------|------|
| デバッグ API | `api/` | ノート記録・テストフロー |
| フィードバック API | `api/feedback/` | フィードバック収集・管理 |

### セットアップ

```bash
# デバッグ API
cp api/config.example.php api/config.php

# フィードバック API
cp api/feedback/config.example.php api/feedback/config.php

# Docker で両方起動
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
├── api/                   # デバッグ API（PHP + SQLite）
├── api/feedback/          # フィードバック API（PHP + SQLite）
├── sample/                # 開発用サンプルアプリ
└── docs/                  # ドキュメント
```

## 開発

```bash
# API 設定
cp api/config.example.php api/config.php
cp api/feedback/config.example.php api/feedback/config.php

# Docker で API 起動（PHP 8.4）
npm run docker:up

# サンプルアプリ起動
npm run sample

# ブラウザでアクセス
# http://localhost:3000?mode=debug

# テスト実行
npm run test

# 型チェック
npm run typecheck

# ビルド
npm run build

# Docker 停止
npm run docker:down
```

## ライセンス

MIT
