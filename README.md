# @genlib/debug-notes

開発・テスト環境向けのデバッグノート記録ライブラリ。

テスト中に発見した不具合・違和感を最小入力で記録し、環境ごとに永続化する。

## 特徴

- PiP（Picture-in-Picture）ウィンドウで常時入力可能
- 機能テストのチェックリスト実行（Domain/Capability/Case階層）
- コンソール・ネットワークログの自動キャプチャ
- dev / test 環境ごとにデータを分離
- 本番環境には一切含めない設計
- PHP + SQLite のシンプルなバックエンド

## インストール

```bash
npm install @genlib/debug-notes
```

## クイックスタート

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

デバッグモードの起動:
- URL: `?mode=debug`
- キーボード: `z` キーを素早く3回押す（トグル）

## ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [使用方法ガイド](./docs/usage.md) | コンポーネント・フック・API リファレンス |
| [セットアップガイド](./docs/setup.md) | 導入・デプロイ手順 |
| [仕様書](./docs/requirement.md) | 詳細仕様 |
| [PiP実装ガイド](./docs/pip-implementation.md) | Document PiP API の実装詳細 |

## 構成

```
debug-notes/
├── src/           # フロントエンド（npm 配布）
├── api/           # バックエンド（手動デプロイ）
├── sample/        # 開発用サンプルアプリ
└── docs/          # ドキュメント
```

## 開発

```bash
# API設定
cp api/config.example.php api/config.php

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

# Docker 停止
npm run docker:down
```

### Docker コマンド

| コマンド | 説明 |
|----------|------|
| `npm run docker:up` | API コンテナ起動 |
| `npm run docker:down` | API コンテナ停止 |
| `npm run docker:logs` | API ログ表示 |
| `npm run docker:build` | イメージ再ビルド |

## バージョニング

SemVer（`MAJOR.MINOR.PATCH`）に従う。

```
v1.0.0
│ │ └─ PATCH: バグ修正（後方互換）
│ └── MINOR: 機能追加（後方互換）
└─── MAJOR: 破壊的変更（型変更、API削除など）
```

## ライセンス

MIT
