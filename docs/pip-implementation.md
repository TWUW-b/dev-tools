# Document Picture-in-Picture API 実装ガイド

manual-viewer の ManualPiP.tsx から抽出した実装パターン。

## 概要

Document Picture-in-Picture API を使用して、ブラウザの別ウィンドウ（常に最前面）に React コンポーネントをレンダリングする。

## ブラウザサポート

- Chrome 116+ / Edge 116+
- Firefox / Safari は未対応（2024年時点）

## 型定義

```typescript
interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
}

interface DocumentPictureInPicture extends EventTarget {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
  window: Window | null;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}
```

## 実装パターン

### 1. PiPウィンドウを開く

```typescript
import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

function usePiPWindow(options: { width: number; height: number }) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const isOpeningRef = useRef(false);

  const openPipWindow = useCallback(async () => {
    // API サポートチェック
    if (!window.documentPictureInPicture) {
      console.warn('Document Picture-in-Picture API is not supported');
      return;
    }

    // 重複オープン防止
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    try {
      // PiPウィンドウを作成
      const pip = await window.documentPictureInPicture.requestWindow({
        width: options.width,
        height: options.height,
      });

      // スタイルを注入
      const style = pip.document.createElement('style');
      style.textContent = getPipStyles();
      pip.document.head.appendChild(style);

      // React用のコンテナを作成
      const container = pip.document.createElement('div');
      container.id = 'pip-root';
      pip.document.body.appendChild(container);

      setPipWindow(pip);
      setPipContainer(container);

      // ウィンドウが閉じられたときの処理
      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
        setPipContainer(null);
      });
    } catch (err) {
      console.error('Failed to open PiP window:', err);
    } finally {
      isOpeningRef.current = false;
    }
  }, [options.width, options.height]);

  const closePipWindow = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      setPipContainer(null);
    }
  }, [pipWindow]);

  return { pipWindow, pipContainer, openPipWindow, closePipWindow };
}
```

### 2. createPortal でレンダリング

```typescript
function PiPPanel({ isOpen, onClose, children }) {
  const { pipContainer, openPipWindow, closePipWindow } = usePiPWindow({
    width: 400,
    height: 500,
  });

  useEffect(() => {
    if (isOpen && !pipContainer) {
      openPipWindow();
    } else if (!isOpen && pipContainer) {
      closePipWindow();
    }
  }, [isOpen, pipContainer, openPipWindow, closePipWindow]);

  if (!pipContainer) return null;

  // PiPウィンドウ内にReactコンポーネントをレンダリング
  return createPortal(
    <div className="pip-container">
      <header className="pip-header">
        <span>タイトル</span>
        <button onClick={closePipWindow}>×</button>
      </header>
      <main className="pip-content">
        {children}
      </main>
    </div>,
    pipContainer
  );
}
```

### 3. スタイル注入

PiPウィンドウは独立したドキュメントなので、親ウィンドウのCSSは適用されない。
スタイルは文字列として注入する。

```typescript
function getPipStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fff;
      overflow: hidden;
    }

    .pip-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .pip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #043E80;
      color: #fff;
    }

    .pip-content {
      flex: 1;
      overflow: auto;
      padding: 24px;
    }

    /* Material Symbols アイコン */
    .pip-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    /* スピンアニメーション */
    .pip-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
}
```

## アイコン

Material Symbols Outlined を CDN から読み込む。

```html
<span className="pip-icon">menu_book</span>
<span className="pip-icon">close</span>
<span className="pip-icon">download</span>
<span className="pip-icon pip-spin">progress_activity</span>
```

## イベント処理

### ウィンドウクローズの検知

```typescript
pip.addEventListener('pagehide', () => {
  // クリーンアップ処理
  onClose();
});
```

### 親ウィンドウとの連携

PiPウィンドウ内のイベントは通常のReactイベントハンドラで処理可能。
親ウィンドウへの通知はコールバック props で行う。

```typescript
// PiP内でのアクション → 親ウィンドウへ通知
<button onClick={() => onAppNavigate('/some-route')}>
  アプリ画面へ移動
</button>
```

## debug-notes での適用

### PiPパネル（DebugPanel）での使用

```typescript
// 入力フォームをPiPウィンドウで表示
export function DebugPanel({ isOpen, onClose, onSave, apiBaseUrl }) {
  // ... PiPウィンドウ管理

  return createPortal(
    <div className="pip-container">
      <header>デバッグノート</header>
      <main>
        <input name="title" placeholder="タイトル" />
        <textarea name="content" placeholder="内容" />
        <button onClick={handleSave}>保存</button>
      </main>
    </div>,
    pipContainer
  );
}
```

### API通信

PiPウィンドウ内からのAPI呼び出しは通常通り fetch で行う。

```typescript
const handleSave = async () => {
  await fetch(`${apiBaseUrl}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  onClose();
};
```

## 3タブ構成

PiPウィンドウ内は3つのタブで構成される。

### 記録タブ（record）
- バグ報告フォーム（内容、重要度、補足メモ）
- 添付オプション（トグル展開）: GETレスポンス、通信時間、ヘッダー
- 保存時に `logCapture` からコンソール/ネットワークログを自動添付（ネットワークログは添付オプションに応じてフィルタ）
- 環境情報（userAgent, viewport, URL, timestamp）も自動添付
- footer: 「クリア」「保存」

### 管理タブ（manage）
- `useDebugNotes` から取得した notes を `status === 'open'` でフィルタ
- 各行に severity ドット + content プレビュー + source badge（🧪 = test）+ セレクトボックス（open/fixed）
- ステータス変更: open → fixed のみ（再オープン不可）
- footer: なし（各行にアクション付き）

### テストタブ（test）
- `testCases` props が提供された場合のみ表示
- Domain > Capability > Case の3階層ツリー構造
- 各階層はトグル可能（展開/折りたたみ）
- Case: チェックボックス + 直近結果（passed/fail/-）+ open件数
- バグ報告フォーム: ケースセレクト + 内容 + 重要度
- Capability単位で「送信」ボタン（API: POST /test-runs）
  - チェック済み → pass、バグ報告あり → fail + ノート自動作成

### タブ制御
- `testCases` が未提供の場合、テストタブは非表示（2タブ構成）
- タブ切替時に `message` をリセット
- `saving` 状態は全タブで共有

## logCapture 連携

```typescript
// DebugPanel props に logCapture を渡す
<DebugPanel logCapture={logCapture} />
```

保存時の処理:
1. `logCapture.getConsoleLogs()` でコンソールログを取得
2. `logCapture.getNetworkLogs()` でネットワークログを取得
3. `navigator.userAgent`, `window.innerWidth/Height` 等から環境情報を生成
4. これらを `NoteInput` に含めて `createNote` を呼び出し

## 注意事項

1. **ユーザージェスチャー必須**: `requestWindow()` はユーザーアクション（クリック等）から呼び出す必要がある
2. **同時に1つのみ**: Document PiP ウィンドウは同時に1つしか開けない
3. **スタイル独立**: 親ウィンドウの CSS は継承されないため、必要なスタイルをすべて注入する
4. **テスト**: jsdom では非対応。Vitest Browser Mode (Playwright) でテストする
