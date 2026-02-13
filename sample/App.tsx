import { useState } from 'react';
import {
  // Components
  DebugPanel,
  DebugAdmin,
  ManualPiP,
  ManualTabPage,
  ManualSidebar,
  MarkdownRenderer,
  // Hooks
  useDebugMode,
  useManualPiP,
  useManualLoader,
  useFeedbackAdminMode,
  setManualTabBaseUrl,
  // Utils
  setDebugApiBaseUrl,
  parseTestCaseMd,
  createLogCapture,
  createFeedbackLogCapture,
  maskSensitive,
  loadMaterialSymbols,
} from '@/index';
import type { ParsedTestCase, ManualItem } from '@/types';

// --- 初期化（モジュールレベルで1回） ---

setDebugApiBaseUrl('http://localhost:8081');
setManualTabBaseUrl('/manual');
loadMaterialSymbols();

const logCapture = createLogCapture({
  console: true,
  network: ['/api/**', 'http://localhost:8081/**'],
});

const feedbackLogCapture = createFeedbackLogCapture({
  maxConsoleLogs: 50,
  networkInclude: ['http://localhost:8081/**'],
});

// サンプルテストケース
const sampleTestCases: ParsedTestCase[] = parseTestCaseMd(`
---
domain: sample
---

# S1 基本表示
## 表示
- ナビゲーションが表示される
- 各ビューに切り替えできる
- デバッグモードの状態が表示される

# S2 デバッグモード
## 動作
- #debug でデバッグパネルが表示される
- パネルからバグ報告ができる
- テストケースが実行できる

# S3 マニュアル表示
## PiP
- PiP ウィンドウが開く
- ドキュメントが表示される
- リンクで遷移できる
## タブ表示
- ManualTabPage が表示される
- サイドバーが動作する
`);

// マニュアル項目
const manualItems: ManualItem[] = [
  { id: 'guide', title: '使い方ガイド', path: '/docs/guide.md', category: 'はじめに', order: 1 },
  { id: 'faq', title: 'FAQ', path: '/docs/faq.md', category: 'はじめに', order: 2 },
  { id: 'api', title: 'API リファレンス', path: '/docs/api.md', category: 'リファレンス', order: 3 },
];

const FEEDBACK_API = 'http://localhost:8081';
const FEEDBACK_ADMIN_KEY = 'dev-admin-key-change-in-production';

type View = 'app' | 'admin' | 'manual-tab' | 'manual-sidebar' | 'utils';

const NAV_ITEMS: { key: View; label: string }[] = [
  { key: 'app', label: 'App' },
  { key: 'admin', label: 'Admin' },
  { key: 'manual-tab', label: 'Manual (Tab)' },
  { key: 'manual-sidebar', label: 'Manual (Sidebar)' },
  { key: 'utils', label: 'Utils' },
];

export function App() {
  const { isDebugMode } = useDebugMode();
  const pip = useManualPiP();
  const [view, setView] = useState<View>('app');

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ナビゲーション */}
      <nav style={styles.nav}>
        <h1 style={{ fontSize: '16px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
          dev-tools sample
        </h1>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {NAV_ITEMS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                ...styles.navBtn,
                background: view === key ? '#1E40AF' : '#fff',
                color: view === key ? '#fff' : '#374151',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
          <button onClick={() => pip.openPiP('/docs/guide.md')} style={styles.linkBtn}>
            PiP
          </button>
          <span style={{ color: '#6b7280' }}>
            {isDebugMode ? 'Debug ON' : 'Debug OFF'}
          </span>
          {!isDebugMode && (
            <a href="#debug" style={{ color: '#1E40AF', fontSize: '12px' }}>
              有効にする
            </a>
          )}
        </div>
      </nav>

      {/* メインコンテンツ */}
      {view === 'app' && <AppView />}
      {view === 'admin' && (
        <DebugAdmin
          env="dev"
          feedbackApiBaseUrl={FEEDBACK_API}
          feedbackAdminKey={FEEDBACK_ADMIN_KEY}
        />
      )}
      {view === 'manual-tab' && (
        <ManualTabPage
          sidebarPath="/docs/index.md"
          defaultDocPath="/docs/guide.md"
          onSidebarNavigate={(path) => console.log('Navigate:', path)}
          onSidebarAppNavigate={(path) => alert(`app: リンク → ${path}`)}
          feedbackApiBaseUrl={FEEDBACK_API}
          feedbackUserType="developer"
          feedbackAppVersion="1.0.0"
        />
      )}
      {view === 'manual-sidebar' && <ManualSidebarView pip={pip} />}
      {view === 'utils' && <UtilsView />}

      {/* PiP（全ビュー共通） */}
      <ManualPiP
        isOpen={pip.isOpen}
        docPath={pip.currentPath}
        onClose={pip.closePiP}
        onNavigate={pip.setPath}
        onAppNavigate={(path) => alert(`app: リンク → ${path}`)}
        showDownloadButton
        feedbackApiBaseUrl={FEEDBACK_API}
        feedbackUserType="developer"
        feedbackAppVersion="1.0.0"
      />

      {/* デバッグパネル（debug mode 時のみ） */}
      {isDebugMode && (
        <DebugPanel
          env="dev"
          onSave={(note) => console.log('Saved:', note)}
          testCases={sampleTestCases}
          logCapture={logCapture}
          manualItems={manualItems}
          onManualNavigate={(path) => pip.openPiP(path)}
          onManualAppNavigate={(path) => alert(`app: リンク → ${path}`)}
        />
      )}
    </div>
  );
}

/** App View: サンプルアプリ画面 */
function AppView() {
  return (
    <main style={{ padding: '24px' }}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>サンプルアプリ</h2>
        <p style={styles.text}>
          <code style={styles.code}>@twuw-b/dev-tools</code> の全機能を確認するサンプルアプリです。
        </p>

        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>起動方法</h3>
        <ol style={{ paddingLeft: '24px', color: '#6b7280', lineHeight: 2 }}>
          <li>Docker で API 起動: <code style={styles.code}>npm run docker:up</code></li>
          <li>サンプル起動: <code style={styles.code}>npm run sample</code></li>
          <li><a href="#debug">#debug</a> でデバッグモード有効化</li>
          <li>右下のバグアイコンでパネル表示</li>
        </ol>

        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>各ビューの機能</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>ビュー</th>
              <th style={{ padding: '8px' }}>コンポーネント</th>
              <th style={{ padding: '8px' }}>機能</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['App', 'DebugPanel', 'バグ報告・画像添付・テスト実行・マニュアル表示'],
              ['Admin', 'DebugAdmin', 'ノート管理・画像表示・ステータス変更・テスト概要・フィードバック管理'],
              ['Manual (Tab)', 'ManualTabPage', 'タブ表示・サイドバー・フィードバック'],
              ['Manual (Sidebar)', 'ManualSidebar + MarkdownRenderer', 'サイドバー選択・ページ表示・PiP'],
              ['Utils', '—', 'maskSensitive・parseTestCaseMd・logCapture'],
            ].map(([view, comp, desc]) => (
              <tr key={view} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '8px', fontWeight: 500 }}>{view}</td>
                <td style={{ padding: '8px' }}><code style={styles.code}>{comp}</code></td>
                <td style={{ padding: '8px', color: '#6b7280' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

/** Manual Sidebar View: サイドバー + ページ表示 */
function ManualSidebarView({ pip }: { pip: ReturnType<typeof useManualPiP> }) {
  const [activePath, setActivePath] = useState<string>('/docs/guide.md');
  const { content, loading, error } = useManualLoader(activePath);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
      <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', overflow: 'auto', background: '#fff' }}>
        <ManualSidebar
          items={manualItems}
          onSelect={setActivePath}
          activePath={activePath}
          onPiP={(path) => pip.openPiP(path)}
          onNewTab={(path) => pip.openTab(path)}
        />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {loading && <p style={{ color: '#6b7280' }}>読み込み中...</p>}
        {error && <p style={{ color: '#dc2626' }}>エラー: {error.message}</p>}
        {content && (
          <MarkdownRenderer
            content={content}
            className="manual-markdown"
            onLinkClick={setActivePath}
            onAppLinkClick={(path) => alert(`app: リンク → ${path}`)}
          />
        )}
      </div>
    </div>
  );
}

/** Utils View: ユーティリティデモ */
function UtilsView() {
  const isFeedbackAdmin = useFeedbackAdminMode();
  const [maskInput, setMaskInput] = useState('Authorization: Bearer sk-12345\nEmail: user@example.com\n電話: 090-1234-5678');
  const [masked, setMasked] = useState('');

  return (
    <main style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      {/* maskSensitive */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>maskSensitive</h2>
        <p style={{ ...styles.text, marginBottom: '12px' }}>
          個人情報・認証情報を自動マスクします。
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>入力</label>
            <textarea
              value={maskInput}
              onChange={(e) => setMaskInput(e.target.value)}
              style={{ ...styles.textarea, height: '120px' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>出力</label>
            <pre style={{ ...styles.textarea, height: '120px', overflow: 'auto', margin: 0 }}>
              {masked || '「マスク実行」をクリック'}
            </pre>
          </div>
        </div>
        <button
          onClick={() => setMasked(maskSensitive(maskInput))}
          style={{ ...styles.navBtn, background: '#1E40AF', color: '#fff', marginTop: '8px' }}
        >
          マスク実行
        </button>
      </div>

      {/* parseTestCaseMd */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>parseTestCaseMd</h2>
        <p style={{ ...styles.text, marginBottom: '12px' }}>
          Markdown からテストケースを解析します。現在のサンプル:
        </p>
        <pre style={{ ...styles.textarea, overflow: 'auto' }}>
          {JSON.stringify(sampleTestCases, null, 2)}
        </pre>
      </div>

      {/* logCapture */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>createLogCapture</h2>
        <p style={{ ...styles.text, marginBottom: '12px' }}>
          コンソール・ネットワークログのキャプチャ状態:
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Console Logs ({logCapture.getConsoleLogs().length})</label>
            <pre style={{ ...styles.textarea, height: '150px', overflow: 'auto', margin: 0, fontSize: '11px' }}>
              {JSON.stringify(logCapture.getConsoleLogs().slice(-5), null, 2) || '(empty)'}
            </pre>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Network Logs ({logCapture.getNetworkLogs().length})</label>
            <pre style={{ ...styles.textarea, height: '150px', overflow: 'auto', margin: 0, fontSize: '11px' }}>
              {JSON.stringify(logCapture.getNetworkLogs().slice(-5), null, 2) || '(empty)'}
            </pre>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            onClick={() => console.log('Test log from sample app')}
            style={{ ...styles.navBtn, background: '#059669', color: '#fff' }}
          >
            console.log テスト
          </button>
          <button
            onClick={() => console.error('Test error from sample app')}
            style={{ ...styles.navBtn, background: '#dc2626', color: '#fff' }}
          >
            console.error テスト
          </button>
          <button
            onClick={() => fetch('http://localhost:8081/notes?env=dev').catch(() => {})}
            style={{ ...styles.navBtn, background: '#7c3aed', color: '#fff' }}
          >
            fetch テスト
          </button>
        </div>
      </div>

      {/* feedbackLogCapture */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>createFeedbackLogCapture</h2>
        <p style={styles.text}>
          フィードバック用の軽量ログキャプチャ。Console: {feedbackLogCapture.getConsoleLogs().length} 件、
          Network: {feedbackLogCapture.getNetworkLogs().length} 件
        </p>
      </div>

      {/* useFeedbackAdminMode */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: '16px' }}>useFeedbackAdminMode</h2>
        <p style={styles.text}>
          URL に <code style={styles.code}>?feedback=admin</code> を付けると管理モードを検知。
          現在: {isFeedbackAdmin ? 'ON' : 'OFF'}
          {!isFeedbackAdmin && (
            <a href="?feedback=admin" style={{ marginLeft: '8px', color: '#1E40AF' }}>有効にする</a>
          )}
        </p>
      </div>
    </main>
  );
}

// --- Styles ---

const styles = {
  nav: {
    padding: '12px 24px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  } as const,
  navBtn: {
    padding: '6px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
  } as const,
  linkBtn: {
    padding: '4px 10px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#1E40AF',
  } as const,
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  } as const,
  text: {
    color: '#6b7280',
    fontSize: '14px',
  } as const,
  code: {
    background: '#f3f4f6',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
  } as const,
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '4px',
  } as const,
  textarea: {
    width: '100%',
    padding: '12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
  } as const,
};
