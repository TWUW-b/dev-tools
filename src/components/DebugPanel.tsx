import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDebugNotes } from '../hooks/useDebugNotes';
import { setDebugApiBaseUrl, api } from '../utils/api';
import { maskSensitive } from '../utils/maskSensitive';
import type { DebugPanelProps, Severity, NoteInput, NetworkLogEntry } from '../types';
import { ManageTab } from './debug/ManageTab';
import { TestTab } from './debug/TestTab';
import type { TestTabHandle } from './debug/TestTab';
import { ManualTabContent } from './debug/ManualTabContent';
import { EnvironmentTab } from './debug/EnvironmentTab';
import { ImageDropZone } from './debug/ImageDropZone';
import { getPipStyles, getPanelStyles, getTriggerButtonStyle, fallbackStyles } from './debug/styles';

// Document Picture-in-Picture API 型定義
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

type PipTab = 'record' | 'manage' | 'test' | 'manual' | 'env';

/**
 * デバッグパネル（PiP）
 */
export function DebugPanel({
  apiBaseUrl,
  env = 'dev',
  onSave,
  onClose,
  initialSize = { width: 400, height: 500 },
  testCases,
  logCapture,
  manualItems,
  manualDefaultPath,
  onManualNavigate,
  onManualAppNavigate,
  environmentsMd,
  triggerOffset,
}: DebugPanelProps) {
  // --- PiP state ---
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isOpeningRef = useRef(false);

  // --- タブ ---
  const [activeTab, setActiveTab] = useState<PipTab>('record');
  const hasTestTab = testCases && testCases.length > 0;
  const hasManualTab = manualItems && manualItems.length > 0;
  const hasEnvTab = !!environmentsMd && environmentsMd.trim().length > 0;

  // --- 記録タブ: フォーム state ---
  const [content, setContent] = useState('');
  const [userLog, setUserLog] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [saving, setSaving] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [attachGetResponse, setAttachGetResponse] = useState(false);
  const [attachDuration, setAttachDuration] = useState(false);
  const [attachHeaders, setAttachHeaders] = useState(false);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- 実行中テストケース（record タブで自動紐付け用） ---
  const [runningTestCaseIds, setRunningTestCaseIds] = useState<number[]>([]);

  // --- リフレッシュ ---
  const [refreshing, setRefreshing] = useState(false);
  const testTabRef = useRef<TestTabHandle>(null);

  // API URL 設定
  useEffect(() => {
    if (apiBaseUrl) {
      setDebugApiBaseUrl(apiBaseUrl);
    }
  }, [apiBaseUrl]);

  const { notes, createNote, updateStatus, refresh, error: hookError } = useDebugNotes(env);
  const hookErrorRef = useRef(hookError);
  hookErrorRef.current = hookError;

  // --- PiP制御 ---
  const openPipWindow = useCallback(async () => {
    // モバイル幅では PiP ウィンドウを使わず画面内オーバーレイで表示（PiPは小さすぎて使いづらいため）
    const isMobileViewport =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(max-width: 768px)').matches;

    if (!window.documentPictureInPicture || isMobileViewport) {
      if (!window.documentPictureInPicture) {
        console.warn('Document Picture-in-Picture API is not supported');
      }
      setIsOpen(true);
      return;
    }

    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: initialSize.width,
        height: initialSize.height,
      });

      const style = pip.document.createElement('style');
      style.textContent = getPipStyles();
      pip.document.head.appendChild(style);

      const container = pip.document.createElement('div');
      container.id = 'debug-panel-root';
      pip.document.body.appendChild(container);

      setPipWindow(pip);
      setPipContainer(container);
      setIsOpen(true);

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
        setPipContainer(null);
        setIsOpen(false);
        onClose?.();
      });
    } catch (err) {
      console.error('Failed to open PiP window:', err);
      setIsOpen(true);
    } finally {
      isOpeningRef.current = false;
    }
  }, [initialSize.width, initialSize.height, onClose]);

  const closePipWindow = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
    } else {
      setIsOpen(false);
      onClose?.();
    }
  }, [pipWindow, onClose]);

  // 親コンポーネント unmount 時に PiP ウィンドウを閉じる
  const pipWindowRef = useRef(pipWindow);
  pipWindowRef.current = pipWindow;
  useEffect(() => {
    return () => {
      pipWindowRef.current?.close();
    };
  }, []);

  // fallback（画面内オーバーレイ）表示時に `.debug-*` スタイルを親 document に注入
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('twuw-debug-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'twuw-debug-panel-styles';
    style.textContent = getPanelStyles();
    document.head.appendChild(style);
  }, []);

  // --- 記録タブ: ハンドラ ---
  const resetForm = useCallback(() => {
    setContent('');
    setUserLog('');
    setSeverity('');
    setAttachFiles([]);
    setShowAttachOptions(false);
    setAttachGetResponse(false);
    setAttachDuration(false);
    setAttachHeaders(false);
    setMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      setMessage({ type: 'error', text: '内容は必須です' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const rawNetworkLogs = logCapture?.getNetworkLogs() ?? [];
    const filteredNetworkLogs = rawNetworkLogs.map(log => {
      const filtered: NetworkLogEntry = {
        timestamp: log.timestamp,
        method: log.method,
        url: log.url,
        status: log.status,
      };
      const isModifying = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(log.method);
      if (isModifying) {
        if (log.requestBody !== undefined) filtered.requestBody = log.requestBody;
        if (log.responseBody !== undefined) filtered.responseBody = log.responseBody;
      }
      if (!isModifying && attachGetResponse && log.responseBody !== undefined) {
        filtered.responseBody = log.responseBody;
      }
      if (attachDuration && log.duration != null) {
        filtered.duration = log.duration;
      }
      if (attachHeaders) {
        if (log.requestHeaders) filtered.requestHeaders = log.requestHeaders;
        if (log.responseHeaders) filtered.responseHeaders = log.responseHeaders;
      }
      return filtered;
    });

    const input: NoteInput = {
      content: content.trim(),
      userLog: userLog ? maskSensitive(userLog) : undefined,
      severity: severity || undefined,
      testCaseIds: runningTestCaseIds.length > 0 ? runningTestCaseIds : undefined,
      consoleLogs: logCapture?.getConsoleLogs(),
      networkLogs: filteredNetworkLogs.length > 0 ? filteredNetworkLogs : undefined,
      environment: typeof window !== 'undefined' ? {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      } : undefined,
    };

    const note = await createNote(input);

    if (note) {
      // 画像添付がある場合はアップロード
      if (attachFiles.length > 0) {
        try {
          for (const file of attachFiles) {
            await api.uploadAttachment(env, note.id, file);
          }
        } catch (err) {
          console.warn('Failed to upload some attachments:', err);
          setMessage({ type: 'success', text: '保存しました（一部画像のアップロードに失敗）' });
          setSaving(false);
          return;
        }
      }
      setMessage({ type: 'success', text: '保存しました' });
      onSave?.(note);
      setTimeout(() => {
        resetForm();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: hookErrorRef.current?.message || '保存に失敗しました' });
    }

    setSaving(false);
  }, [content, userLog, severity, runningTestCaseIds, attachFiles, attachGetResponse, attachDuration, attachHeaders, createNote, onSave, resetForm, logCapture, env]);

  // --- リフレッシュ ---
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'manage') {
        refresh();
      } else if (activeTab === 'test') {
        await testTabRef.current?.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, refresh]);

  // --- レンダリング ---
  const formContent = (
    <div className="debug-panel">
      <header className="debug-header">
        <div className="debug-header-left">
          <span className="debug-icon">edit_note</span>
          <span className="debug-title">デバッグノート</span>
          <span className="debug-env">{env}</span>
        </div>
        <div className="debug-header-right">
          {activeTab !== 'record' && (
            <button
              className="debug-refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              title="データを更新"
            >
              <span
                className="debug-icon"
                style={{
                  fontSize: '18px',
                  animation: refreshing ? 'spin 0.6s linear infinite' : 'none',
                }}
              >
                sync
              </span>
            </button>
          )}
          <button onClick={closePipWindow} className="debug-close-btn" aria-label="閉じる">
            <span className="debug-icon">close</span>
          </button>
        </div>
      </header>

      <nav className="debug-tabs">
        <button
          className={`debug-tab ${activeTab === 'record' ? 'active' : ''}`}
          onClick={() => { setActiveTab('record'); setMessage(null); }}
        >
          記録
        </button>
        <button
          className={`debug-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          管理
        </button>
        {hasTestTab && (
          <button
            className={`debug-tab ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            テスト
          </button>
        )}
        {hasManualTab && (
          <button
            className={`debug-tab ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            マニュアル
          </button>
        )}
        {hasEnvTab && (
          <button
            className={`debug-tab ${activeTab === 'env' ? 'active' : ''}`}
            onClick={() => setActiveTab('env')}
          >
            環境
          </button>
        )}
      </nav>

      <main className="debug-content">
        {/* 記録タブ */}
        {activeTab === 'record' && (
          <>
            {runningTestCaseIds.length > 0 && (
              <div
                className="debug-running-cases-badge"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  marginBottom: '8px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#3730A3',
                }}
              >
                <span className="debug-icon" style={{ fontSize: '14px' }}>science</span>
                <span>実行中: {runningTestCaseIds.map(id => `#${id}`).join(', ')}</span>
                <button
                  type="button"
                  onClick={() => setRunningTestCaseIds([])}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#3730A3',
                    fontSize: '11px',
                  }}
                  title="紐付けを解除"
                >
                  解除
                </button>
              </div>
            )}
            {message && (
              <div className={`debug-message debug-message-${message.type}`}>
                {message.text}
              </div>
            )}

            <div className="debug-field">
              <label htmlFor="debug-severity">重要度（任意）</label>
              <select
                id="debug-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity | '')}
              >
                <option value="">未設定</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="debug-field">
              <label htmlFor="debug-content">内容 *</label>
              <textarea
                id="debug-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="詳細な説明"
                rows={4}
                maxLength={4000}
              />
            </div>

            <div className="debug-field">
              <label htmlFor="debug-log">補足メモ（任意）</label>
              <textarea
                id="debug-log"
                value={userLog}
                onChange={(e) => setUserLog(e.target.value)}
                placeholder="状況や気づいたことを自由に記入"
                rows={3}
                maxLength={20000}
              />
              <span className="debug-hint">機密情報は自動でマスクされます</span>
            </div>

            <ImageDropZone
              files={attachFiles}
              onAdd={(newFiles) => setAttachFiles(prev => [...prev, ...newFiles])}
              onRemove={(index) => setAttachFiles(prev => prev.filter((_, i) => i !== index))}
              disabled={saving}
              pipDocument={pipWindowRef.current?.document ?? null}
            />

            <div className="debug-toggle">
              <button
                type="button"
                onClick={() => setShowAttachOptions(!showAttachOptions)}
                className="debug-toggle-btn"
              >
                <span className="debug-icon" style={{ fontSize: '18px' }}>
                  {showAttachOptions ? 'expand_less' : 'expand_more'}
                </span>
                添付オプション
              </button>
            </div>

            {showAttachOptions && (
              <div className="debug-attach-options">
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachGetResponse}
                    onChange={(e) => setAttachGetResponse(e.target.checked)}
                  />
                  GETレスポンスを含める
                </label>
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachDuration}
                    onChange={(e) => setAttachDuration(e.target.checked)}
                  />
                  通信時間を含める
                </label>
                <label className="debug-attach-option">
                  <input
                    type="checkbox"
                    checked={attachHeaders}
                    onChange={(e) => setAttachHeaders(e.target.checked)}
                  />
                  ヘッダーを含める
                </label>
              </div>
            )}
          </>
        )}

        {/* 管理タブ */}
        {activeTab === 'manage' && (
          <ManageTab notes={notes} updateStatus={updateStatus} />
        )}

        {/* マニュアルタブ */}
        {activeTab === 'manual' && hasManualTab && (
          <ManualTabContent
            items={manualItems!}
            defaultPath={manualDefaultPath}
            onNavigate={onManualNavigate}
            onAppNavigate={onManualAppNavigate}
          />
        )}

        {/* テストタブ */}
        {/* 環境タブ */}
        {activeTab === 'env' && hasEnvTab && (
          <EnvironmentTab md={environmentsMd!} pipDocument={pipWindowRef.current?.document ?? null} />
        )}

        {activeTab === 'test' && hasTestTab && (
          <TestTab
            ref={testTabRef}
            testCases={testCases!}
            env={env}
            logCapture={logCapture}
            onNotesRefresh={refresh}
            onRunningCasesChange={setRunningTestCaseIds}
          />
        )}
      </main>

      {/* 記録タブのfooter */}
      {activeTab === 'record' && (
        <footer className="debug-footer">
          <button onClick={resetForm} className="debug-btn debug-btn-secondary" disabled={saving}>
            クリア
          </button>
          <button onClick={handleSave} className="debug-btn debug-btn-primary" disabled={saving}>
            {saving ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                保存中
              </span>
            ) : '保存'}
          </button>
        </footer>
      )}
    </div>
  );

  // PiP対応の場合
  if (pipContainer) {
    return createPortal(formContent, pipContainer);
  }

  // フォールバック（DOM内表示）
  if (isOpen) {
    return (
      <div style={fallbackStyles.overlay}>
        <div style={fallbackStyles.panel}>
          {formContent}
        </div>
      </div>
    );
  }

  // トリガーボタン
  return (
    <button onClick={openPipWindow} style={getTriggerButtonStyle(triggerOffset)} aria-label="デバッグノートを開く">
      <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2, textAlign: 'center' }}>バグ<br />記録</span>
    </button>
  );
}
