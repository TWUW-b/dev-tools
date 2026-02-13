import { useState } from 'react';
import { DebugPanel, DebugAdmin, useDebugMode, setDebugApiBaseUrl, parseTestCaseMd, createLogCapture } from '@/index';
import type { ParsedTestCase } from '@/types';

// API URL を設定（ローカル開発用）
setDebugApiBaseUrl('http://localhost:8081');

// ログキャプチャ初期化（アプリ起動時に1回）
const logCapture = createLogCapture({
  console: true,
  network: ['/api/**', 'http://localhost:8081/**'],
});

// サンプルテストケース
const sampleTestCases: ParsedTestCase[] = parseTestCaseMd(`
---
domain: sample
---

# S1 基本表示
## 表示
- ナビゲーションが表示される
- 「アプリ画面」ボタンが表示される
- 「管理画面」ボタンが表示される

# S2 デバッグモード
## 動作
- ?mode=debug でデバッグパネルが表示される
- パネルからバグ報告ができる
`);

export function App() {
  const { isDebugMode } = useDebugMode();
  const [view, setView] = useState<'app' | 'admin'>('app');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ナビゲーション */}
      <nav
        style={{
          padding: '16px 24px',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
          Debug Notes Sample
        </h1>
        <button
          onClick={() => setView('app')}
          style={{
            padding: '8px 16px',
            background: view === 'app' ? '#1E40AF' : '#fff',
            color: view === 'app' ? '#fff' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          アプリ画面
        </button>
        <button
          onClick={() => setView('admin')}
          style={{
            padding: '8px 16px',
            background: view === 'admin' ? '#1E40AF' : '#fff',
            color: view === 'admin' ? '#fff' : '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          管理画面
        </button>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          {isDebugMode ? '🟢 Debug Mode ON' : '⚪ Debug Mode OFF'}
          {!isDebugMode && (
            <a
              href="?mode=debug"
              style={{ marginLeft: '8px', color: '#1E40AF' }}
            >
              有効にする
            </a>
          )}
        </span>
      </nav>

      {/* メインコンテンツ */}
      {view === 'app' ? (
        <main style={{ padding: '24px' }}>
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '800px',
            }}
          >
            <h2 style={{ marginBottom: '16px' }}>サンプルアプリ画面</h2>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              これはデバッグノートライブラリのサンプルアプリです。
            </p>
            <p style={{ color: '#6b7280', marginBottom: '16px' }}>
              URL に <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>?mode=debug</code> を付けると、
              デバッグパネルが表示されます。
            </p>

            <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>使い方</h3>
            <ol style={{ paddingLeft: '24px', color: '#6b7280' }}>
              <li>PHP ビルトインサーバーを起動: <code>php -S localhost:8080 -t api</code></li>
              <li>サンプルアプリを起動: <code>npm run sample</code></li>
              <li><a href="?mode=debug">?mode=debug</a> をつけてアクセス</li>
              <li>右下のバグアイコンをクリックしてパネルを開く</li>
            </ol>
          </div>

          {/* デバッグパネル（debug mode 時のみ表示） */}
          {isDebugMode && (
            <DebugPanel
              env="dev"
              onSave={(note) => console.log('Saved:', note)}
              testCases={sampleTestCases}
              logCapture={logCapture}
            />
          )}
        </main>
      ) : (
        <DebugAdmin env="dev" />
      )}
    </div>
  );
}
