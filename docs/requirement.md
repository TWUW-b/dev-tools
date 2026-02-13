# テスト用デバッグライブラリ 仕様書（Phase1）

## 1. 目的

本ドキュメントは、アプリ開発における開発者テスト／社内テストを効率化するための
**テスト用デバッグライブラリ（Phase1）**の仕様を定義する。

本ライブラリは以下を目的とする：
- テスト中に発見した不具合・違和感を最小入力で即座に記録できること
- 記録内容を環境（dev / test）ごとに永続化できること
- テスト管理ツール化せず、開発者の作業コストを下げること
- 本番環境には一切含めないこと

---

## 2. 全体像（設計方針）

### 2.1 基本方針
- 本ライブラリは React から import して利用する UI ライブラリとする
- データの永続化は サーバ側（Xserver）で SQLite を用いて行う
- フロントエンドは UI と入力に専念し、DB を直接保持しない
- サーバ側は 最小限の CRUD API のみを提供する
- 本番環境にはビルド・import いずれの段階でも含めない

### 2.2 採用構成（確定）
- フロントエンド：React + デバッグUIライブラリ
- バックエンド：PHP 8.4 + SQLite（Xserver 共用サーバ）
- DB：SQLite（環境ごとにファイル分離）
- ローカル開発：Docker（PHP 8.4）

### 2.3 フロントエンドライブラリ構成

#### パッケージ情報

| 項目 | 値 |
|------|-----|
| パッケージ名 | `@genlib/debug-notes` |
| モジュール形式 | ESM |
| ライセンス | MIT |

#### 技術スタック

| 項目 | 選定 |
|------|------|
| ビルドツール | Vite 6 |
| 言語 | TypeScript 5（strict mode） |
| React | 18（peerDependencies） |
| テスト | Vitest |

#### ディレクトリ構成

```
debug-notes/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── docs/
│   └── requirement.md
├── src/                         # フロントエンド（npm配布）
│   ├── index.ts                 # メインエクスポート
│   ├── types/
│   │   └── index.ts             # 型定義（Note, ApiResponse等）
│   ├── components/
│   │   ├── index.ts             # コンポーネントバレル
│   │   ├── DebugPanel.tsx       # PiPパネル（入力UI）
│   │   └── DebugAdmin.tsx       # 管理画面
│   ├── hooks/
│   │   ├── index.ts             # フックバレル
│   │   ├── useDebugMode.ts      # ?mode=debug 検出
│   │   └── useDebugNotes.ts     # API通信・CRUD
│   └── utils/
│       ├── index.ts
│       ├── maskSensitive.ts     # ログマスク処理
│       └── api.ts               # APIクライアント
├── api/                         # バックエンド（手動デプロイ）
│   ├── .htaccess                # URLリライト設定
│   ├── index.php                # ルーター
│   ├── config.example.php       # 設定テンプレート
│   ├── Database.php             # SQLite接続クラス
│   ├── NotesController.php      # CRUD処理
│   ├── schema.sql               # テーブル定義
│   └── data/                    # SQLite格納（git管理外）
│       └── .htaccess            # Deny from all
└── sample/
    ├── vite.config.ts
    ├── index.html
    ├── main.tsx
    └── App.tsx
```

#### エクスポート構成

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts"
  }
}
```

#### 依存関係

**peerDependencies（利用側で提供）**
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

**devDependencies（開発時のみ）**
- TypeScript, Vite, Vitest, @testing-library/react

#### 利用側でのインポート例

```typescript
// メインエクスポートから
import { DebugPanel, useDebugMode } from '@genlib/debug-notes';

// サブパスから個別に
import { DebugPanel } from '@genlib/debug-notes/components';
import { useDebugNotes } from '@genlib/debug-notes/hooks';
```

#### UIスタイリング方針

- **インラインCSS（CSS-in-JS）** を採用
- 外部 CSS ファイルは使用しない
- PiP ウィンドウは独立したドキュメントのため、スタイルは文字列として注入
- アイコンは Material Symbols Outlined を CDN から読み込み

```typescript
// スタイル注入の例（PiPウィンドウ内）
const style = pipWindow.document.createElement('style');
style.textContent = getPipStyles();
pipWindow.document.head.appendChild(style);
```

#### PiP（Picture-in-Picture）実装

- Document Picture-in-Picture API を使用
- Chrome 116+ / Edge 116+ で対応
- 詳細は [pip-implementation.md](./pip-implementation.md) を参照

### 2.4 バックエンドAPI構成

#### ファイル構成

```
api/
├── .htaccess              # URLリライト（/notes → index.php）
├── index.php              # ルーター・エントリポイント
├── config.example.php     # 設定テンプレート（コピーして使用）
├── Database.php           # SQLite接続・クエリ実行
├── NotesController.php    # CRUD処理
├── schema.sql             # テーブル作成SQL
└── data/                  # SQLite 格納（git管理外）
    ├── .htaccess          # Deny from all
    ├── debug-dev.sqlite
    └── debug-test.sqlite
```

#### 設定ファイル（config.php）

`config.example.php` をコピーして `config.php` を作成し、環境に合わせて編集する。

```php
<?php
// config.php（本番用 - gitignore対象）
return [
    // SQLite ファイルのパス（環境ごとに分離）
    // __DIR__ で api/ ディレクトリからの相対パス
    'db' => [
        'dev'  => __DIR__ . '/data/debug-dev.sqlite',
        'test' => __DIR__ . '/data/debug-test.sqlite',
    ],

    // CORS 許可オリジン
    'allowed_origins' => [
        'https://dev.example.com',
        'https://test.example.com',
    ],

    // API キー（簡易認証、Phase1では任意）
    'api_key' => null,
];
```

#### デプロイ手順

詳細は [セットアップガイド](./setup.md) を参照。

概要：
1. `api/` ディレクトリをサーバーにコピー
2. `config.example.php` → `config.php` を作成・編集
3. `data/` ディレクトリを作成、`.htaccess` で保護
4. `schema.sql` でテーブル作成
5. Xserver の場合は `public_html/.htaccess` でルーティング設定が必要

#### .htaccess（URLリライト）

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# セキュリティヘッダー
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
```

#### CORS 設定

`index.php` で許可オリジンをチェックし、適切なヘッダーを返す。

```php
$config = require __DIR__ . '/config.php';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $config['allowed_origins'], true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
```

#### Git 管理

```gitignore
# api/config.php は環境固有のため除外
api/config.php

# SQLite ファイル・data ディレクトリは除外
api/data/*.sqlite
```

- `config.example.php` のみをリポジトリに含め、`config.php` は各環境で作成
- `api/data/.htaccess` はリポジトリに含める（テンプレートとして）
- `.sqlite` ファイルは各環境で生成

#### フロントエンドとの接続

フロントエンド側で API Base URL を設定する。

```typescript
// 利用側アプリの main.tsx 等
import { setDebugApiBaseUrl } from '@genlib/debug-notes';

// 環境変数から取得（.env.development, .env.test で設定）
const apiUrl = import.meta.env.VITE_DEBUG_API_URL;
if (apiUrl) {
  setDebugApiBaseUrl(apiUrl);
}
```

```env
# .env.development
VITE_DEBUG_API_URL=https://dev.example.com/__debug/api

# .env.test
VITE_DEBUG_API_URL=https://test.example.com/__debug/api
```

---

## 3. 利用環境と制御

### 3.1 有効環境
- dev 環境
- test 環境

※ production 環境では import 自体を行わない

### 3.2 Debug モード有効化

#### クエリパラメータ方式（デフォルト）
- URL に `?mode=debug` が付与された場合のみ UI を表示
- ライブラリの `useDebugMode` フックで検出

#### ハッシュ方式（React Router対応）
- URL に `#debug` が付与された場合のみ UI を表示
- React Router 等 SPA でクエリパラメータが遷移時に失われる場合に使用
- 利用側で独自の判定関数を実装（`window.location.hash === '#debug'`）

※ ルーティングや認証の強化は Phase2 で検討

---

## 4. データ永続化設計

### 4.1 DB ファイルの配置

SQLite ファイルは `api/data/` ディレクトリ内に配置する。

```
api/
├── data/                    # SQLite 格納ディレクトリ
│   ├── .htaccess            # アクセス拒否設定
│   ├── debug-dev.sqlite     # dev 環境用
│   └── debug-test.sqlite    # test 環境用
├── index.php
├── config.php
└── ...
```

#### セキュリティ対策

`api/data/.htaccess` で外部からの直接アクセスを拒否する。

```apache
# api/data/.htaccess
Deny from all
```

> **注意**: Xserver 等の共用サーバーでは `/home/xxxxx/` 直下に非公開ディレクトリを作成することも可能。
> より厳密なセキュリティが必要な場合は、公開ディレクトリ外への配置を検討すること。

### 4.2 環境分離
- dev / test ごとに 別 SQLite ファイルを使用
- 環境は API パラメータ `?env=dev` または `?env=test` で指定

---

## 5. データモデル（Phase1）

### 5.1 notes テーブル

| カラム名 | 型 | 必須 | 説明 |
|----------|------|------|------|
| id | INTEGER | ✓ | 主キー |
| route | TEXT | ✓ | 自動取得された画面ルート |
| screen_name | TEXT | ✓ | 自動取得された画面識別子 |
| title | TEXT | ✓ | content の1行目から自動生成 |
| content | TEXT | ✓ | 自由記述メモ |
| user_log | TEXT | | ユーザーが貼り付けたログ |
| steps | TEXT | | 再現手順（UIから削除済み、後方互換のためカラム残存） |
| severity | TEXT | | critical / high / medium / low |
| status | TEXT | ✓ | open / fixed |
| source | TEXT | ✓ | manual / test（デフォルト: manual） |
| test_case_id | INTEGER | | テストケースID（source=test時） |
| deleted_at | DATETIME | | 論理削除用 |
| created_at | DATETIME | ✓ | 作成日時 |
| console_log | TEXT | | コンソールログ（JSON: ConsoleLogEntry[]） |
| network_log | TEXT | | ネットワークログ（JSON: NetworkLogEntry[]） |
| environment | TEXT | | 環境情報（JSON: EnvironmentInfo） |

### 5.2 meta テーブル

| カラム名 | 型 | 説明 |
|----------|------|------|
| key | TEXT | メタキー |
| value | TEXT | 値 |

- `schemaVersion` を保存

---

## 6. API 仕様（Phase1）

### 6.0 API Base URL 設定

フロントエンドライブラリから API を呼び出す際の Base URL は、以下の方法で設定する。

#### 方法1: コンポーネント props で渡す

```typescript
<DebugPanel apiBaseUrl="https://example.com/__debug/api" />
<DebugAdmin apiBaseUrl="https://example.com/__debug/api" />
```

#### 方法2: 設定関数で初期化

```typescript
import { setDebugApiBaseUrl } from '@genlib/debug-notes';

// アプリ起動時に設定
setDebugApiBaseUrl('https://example.com/__debug/api');
```

#### 環境変数との組み合わせ（利用側での実装例）

```typescript
// 利用側のアプリで
const apiBaseUrl = import.meta.env.VITE_DEBUG_API_URL || '/__debug/api';
setDebugApiBaseUrl(apiBaseUrl);
```

### 6.1 一覧取得

```
GET /__debug/api/notes?env=dev&status=&q=&includeDeleted=0
```

### 6.2 新規作成

```
POST /__debug/api/notes
```

リクエスト例：

```json
{
  "content": "更新後に2件表示される",
  "userLog": "TypeError: ...",
  "severity": "high"
}
```

> `title` は `content` の1行目から自動生成される。`steps` はUIから削除済み。

### 6.3 status 更新

```
PATCH /__debug/api/notes/{id}/status
```

ステータスは `open` または `fixed` のみ許可。
`fixed` から `open` への変更は不可（再開禁止）。

### 6.4 詳細取得

```
GET /__debug/api/notes/{id}?env=dev
```

一覧では除外されるログ系カラム（console_log, network_log, environment）を含む全カラムを返す。

### 6.5 severity 更新

```
PATCH /__debug/api/notes/{id}/severity
```

### 6.6 削除（論理削除）

```
DELETE /__debug/api/notes/{id}
```

---

## 7. UI 仕様（Phase1）

### 7.1 PIP パネル（アプリ内）

#### トリガーボタン
- 右下に固定表示（64x64px 丸ボタン）
- 「バグ記録」テキスト表示
- クリックで PiP ウィンドウを開く

#### 入力フォーム
- 入力項目（上から順に）
  1. severity（任意）- 重要度（critical/high/medium/low）
  2. content（必須）- 詳細な説明（title は content の1行目から自動生成）
  3. userLog（任意）- 補足メモ
- 添付オプション（トグル展開）
  - GETレスポンスを含める（OFF）
  - 通信時間を含める（OFF）
  - ヘッダーを含める（OFF）
- 保存ボタン（手動保存）
- クリアボタン

### 7.2 管理画面（ライブラリ内）

#### アクセス方法
- **利用側アプリのヘッダーに組み込む**
- デバッグモード時（`?mode=debug`）のみヘッダーにリンクを表示
- リンクをクリックすると管理画面ページに遷移
- 管理画面も `?mode=debug` パラメータで保護

```typescript
// 利用側アプリのヘッダー例
function AppHeader() {
  const { isDebugMode } = useDebugMode();

  return (
    <header>
      <nav>
        {/* 通常のナビゲーション */}
        <Link to="/">Home</Link>

        {/* デバッグモード時のみ表示 */}
        {isDebugMode && (
          <Link to="/debug-admin?mode=debug">Debug Notes</Link>
        )}
      </nav>
    </header>
  );
}
```

#### ヘッダー
- タイトル + 環境バッジ（dev/test）
- 自動更新チェックボックス（30秒間隔）
- ダークモード切替ボタン（🌙/☀️）
- 手動更新ボタン

#### 一覧（サイドバー）
- status フィルタ（すべて/Open/Fixed）
- source フィルタ（すべて/manual/test）
- title / content 検索
- ノートカード表示（severity, status, title, route, 日付, source badge）

#### 詳細
- 内容表示のみ
- status 変更のみ可（Open → Fixed、再オープン不可）
- severity 変更可
- 削除操作可（論理削除）
- テストフロー連携: source=test のノートには Capability/Case 名を表示

#### ダークモード対応
- システム設定に自動追従
- 手動切替も可能
- ライト/ダーク両対応のカラーパレット

---

## 8. ログ・マスク仕様

### 8.1 マスク対象
- Authorization / Cookie / Set-Cookie
- JWT 形式トークン
- メールアドレス / 電話番号形式

### 8.2 方針
- マスク後の文字列のみ保存
- 原文は保持しない

---

## 9. サイズ・上限（Phase1）

| 項目 | 上限 |
|------|------|
| content | 4,000 文字 |
| userLog | 20,000 文字 |
| notes 件数 | 500 件 |

※ 超過時の挙動は仕様に従い削除または拒否

---

## 10. ログ自動キャプチャ機能

### 10.1 概要
- `createLogCapture` でアプリ起動時にログキャプチャを初期化
- Console（error/warn）とNetwork（fetch）をリングバッファに保持
- DebugPanel の `logCapture` props で接続
- ノート保存時にバッファ内容と環境情報を自動添付

### 10.2 キャプチャ対象
- **Console**: error（専用バッファ30件）、warn + log（混合バッファ30件）、window.onerror, unhandledrejection
- **Network**: fetch（パターンマッチで対象URL指定）。POST/PUT/DELETE/PATCH のボディは常に自動取得。GETレスポンス・通信時間・ヘッダーはUI添付オプションで制御
- **Environment**: userAgent, viewport, URL, timestamp（保存時に自動生成）

### 10.3 セキュリティ
- ログメッセージは `maskSensitive` で機密情報をマスク
- Authorization, Cookie 等のヘッダーは `***MASKED***` に置換
- 一覧API（GET /notes）ではログ系カラムを除外（詳細APIのみ返却）

## 11. テストフロー機能

### 11.1 概要
テストケースMD（`domain:` frontmatter + `#` Capability + `##` グルーピング（任意）+ `-` Case形式）をパースして表示。
PiPウィンドウ内の「テスト」タブでチェックボックス式のテスト実行が可能。

### 11.2 データモデル

#### test_cases テーブル

| カラム名 | 型 | 説明 |
|----------|------|------|
| id | INTEGER | 主キー |
| domain | TEXT | Domain名 |
| capability | TEXT | Capability名 |
| title | TEXT | Case名 |
| created_at | DATETIME | 作成日時 |

#### test_runs テーブル

| カラム名 | 型 | 説明 |
|----------|------|------|
| id | INTEGER | 主キー |
| case_id | INTEGER | test_cases.id |
| result | TEXT | pass / fail / skip |
| note_id | INTEGER | notes.id（fail時のバグ報告） |
| created_at | DATETIME | 実行日時 |

### 11.3 テストタブの動作
- Domain > Capability > Case の3階層ツリー構造
- 各ケースにチェックボックス（PASS判定）+ 直近結果（passed/fail/-）+ open件数
- バグ報告フォーム: ケースセレクト + 内容 + 重要度
- Capability単位で「送信」ボタン（API: POST /test-runs）
- チェック済み → pass、バグ報告あり → fail + ノート自動作成

### 11.4 API

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | `/test-cases/import` | テストケースインポート（MDパース結果） |
| GET | `/test-cases/tree?env=dev` | テストツリー取得（集計付き） |
| POST | `/test-runs?env=dev` | テスト実行結果一括記録（Capability単位） |

## 12. 非対象（Phase1では実装しない）
- スクリーンショット添付
- 競合解決（複数タブ）
- 権限管理・認証強化
- 本格的なテストケース管理

---

## 13. Phase2 への拡張余地（参考）
- 競合解決（楽観ロック等）
- severity / priority 分離
- 添付ファイル対応

---

## 12. まとめ

本ライブラリは、
**「テストを速く終わらせるための道具」**として設計されている。

管理・統制を目的とせず、
記録・修正・確認の最短経路を提供することを第一とする。
