import { useState, useCallback, useRef, useEffect } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import { createFeedbackLogCapture } from '../../utils/feedbackLogCapture';
import { uploadFeedbackAttachment } from '../../utils/feedbackApi';
import { ImageDropZone } from '../debug/ImageDropZone';
import { loadMaterialSymbols, isAutoLoadDisabled } from '../../styles/material-symbols';
import type { FeedbackKind, Feedback, FeedbackLogCapture } from '../../types';

/** FeedbackForm 内部プロパティ（exportしない） */
interface FeedbackFormProps {
  apiBaseUrl: string;
  userType?: string;
  appVersion?: string;
  onSubmitSuccess?: (feedback: Feedback) => void;
  onSubmitError?: (error: Error) => void;
}

const KIND_OPTIONS: { value: FeedbackKind; label: string; color: string }[] = [
  { value: 'bug', label: '不具合', color: '#DC2626' },
  { value: 'question', label: '質問', color: '#2563EB' },
  { value: 'request', label: '要望', color: '#059669' },
  { value: 'share', label: '共有', color: '#6B7280' },
  { value: 'other', label: 'その他', color: '#9333EA' },
];

/** ImageDropZone が使用する CSS クラスのスタイル定義 */
const IMAGE_DROP_ZONE_CSS = `
  .debug-field { margin-bottom: 0; }
  .debug-field > label { display: block; font-size: 12px; color: #6B7280; margin-bottom: 6px; }
  .debug-dropzone {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; padding: 12px; border: 2px dashed #D1D5DB; border-radius: 8px;
    cursor: pointer; transition: all 0.15s; background: #fff;
  }
  .debug-dropzone:hover { border-color: #3B82F6; background: #F9FAFB; }
  .debug-dropzone.dragging { border-color: #3B82F6; background: rgba(59,130,246,0.05); }
  .debug-dropzone.disabled { opacity: 0.5; cursor: not-allowed; }
  .debug-icon { font-family: 'Material Symbols Outlined'; }
  .debug-thumbnails { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .debug-thumbnail {
    position: relative; width: 56px; height: 56px; border-radius: 6px;
    overflow: hidden; border: 1px solid #E5E7EB;
  }
  .debug-thumbnail-img { width: 100%; height: 100%; object-fit: cover; }
  .debug-thumbnail-remove {
    position: absolute; top: 2px; right: 2px; width: 18px; height: 18px;
    border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff;
    border: none; cursor: pointer; display: flex; align-items: center;
    justify-content: center; padding: 0;
  }
  .debug-thumbnail-info {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 2px 4px;
    background: rgba(0,0,0,0.5); color: #fff; font-size: 9px; text-align: center;
  }
`;

export function FeedbackForm({
  apiBaseUrl,
  userType,
  appVersion,
  onSubmitSuccess,
  onSubmitError,
}: FeedbackFormProps) {
  const { submitting, submitFeedback } = useFeedback({
    apiBaseUrl,
    userType,
    appVersion,
  });

  // Material Symbols フォントを読み込む（自動読み込みが無効化されていない場合）
  useEffect(() => {
    if (!isAutoLoadDisabled()) {
      loadMaterialSymbols();
    }
  }, []);

  // logCapture を内部で管理
  const logCaptureRef = useRef<FeedbackLogCapture | null>(null);
  useEffect(() => {
    try {
      const capture = createFeedbackLogCapture({
        // フィードバックAPI自身への fetch を除外（無限ループ防止）
        networkExclude: [apiBaseUrl],
      });
      logCaptureRef.current = capture;
      return () => {
        capture.destroy();
        logCaptureRef.current = null;
      };
    } catch (error) {
      console.error('Failed to create log capture:', error);
      return () => {}; // cleanup関数を返す
    }
  }, [apiBaseUrl]);

  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [toast, setToast] = useState(false);
  const [formError, setFormError] = useState<Error | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const submittingRef = useRef(false);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const canSubmit = kind !== null && message.trim() !== '' && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!kind || !message.trim()) return;
    if (submittingRef.current) return;
    submittingRef.current = true;

    let fullMessage = message.trim();
    if (steps.trim() || expected.trim()) {
      fullMessage += '\n\n---';
      if (steps.trim()) fullMessage += `\n再現手順:\n${steps.trim()}`;
      if (expected.trim()) fullMessage += `\n期待結果:\n${expected.trim()}`;
    }

    // bug時のみログスナップショットを取得
    const logs = kind === 'bug' && logCaptureRef.current ? {
      consoleLogs: logCaptureRef.current.getConsoleLogs(),
      networkLogs: logCaptureRef.current.getNetworkLogs(),
    } : undefined;

    const { data, error } = await submitFeedback({
      kind,
      message: fullMessage,
    }, logs);

    if (data) {
      // 画像添付を順次アップロード
      if (attachFiles.length > 0) {
        for (const file of attachFiles) {
          try {
            await uploadFeedbackAttachment({
              apiBaseUrl,
              feedbackId: data.id,
              file,
            });
          } catch (err) {
            console.error('Failed to upload attachment:', err);
          }
        }
      }

      setKind(null);
      setMessage('');
      setSteps('');
      setExpected('');
      setShowDetail(false);
      setAttachFiles([]);
      setFormError(null);
      // 送信後にバッファをリセット
      logCaptureRef.current?.clear();
      setToast(true);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(false), 3000);
      onSubmitSuccess?.(data);
    } else {
      setFormError(error);
      onSubmitError?.(error ?? new Error('Unknown error'));
    }
    submittingRef.current = false;
  }, [kind, message, steps, expected, attachFiles, apiBaseUrl, submitFeedback, onSubmitSuccess, onSubmitError]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [canSubmit, handleSubmit]
  );

  const handleAddFiles = useCallback((files: File[]) => {
    setAttachFiles(prev => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div style={styles.container}>
      {/* spin animation + ImageDropZone CSS */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }${IMAGE_DROP_ZONE_CSS}`}</style>
      {/* 種別タグ */}
      <div style={styles.section}>
        <div style={styles.tagGroup} role="radiogroup" aria-label="フィードバック種別">
          {KIND_OPTIONS.map(opt => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={kind === opt.value}
              onClick={() => setKind(kind === opt.value ? null : opt.value)}
              style={{
                ...styles.tag,
                ...(kind === opt.value
                  ? { backgroundColor: opt.color, color: '#fff', borderColor: opt.color }
                  : { borderColor: '#D1D5DB', color: '#6B7280' }),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={styles.tagHint}>どれか一つを選んでください</div>
      </div>

      {/* テキストエリア */}
      <div style={styles.section}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="気づいたことをそのまま書いてください（一言でもOK）"
          aria-label="フィードバックメッセージ"
          rows={4}
          maxLength={4000}
          style={styles.textarea}
        />
      </div>

      {/* 画像添付 */}
      <div style={styles.section}>
        <ImageDropZone
          files={attachFiles}
          onAdd={handleAddFiles}
          onRemove={handleRemoveFile}
          maxFiles={3}
          disabled={submitting}
        />
      </div>

      {/* bugログ通知 */}
      {kind === 'bug' && (
        <div style={styles.logNotice}>
          <span style={styles.iconSmall}>info</span>
          不具合タグを選択すると、直前の動作ログが自動で添付されます
        </div>
      )}

      {/* 詳細情報（折りたたみ） */}
      <div style={styles.section}>
        <button onClick={() => setShowDetail(!showDetail)} style={styles.detailToggle} aria-expanded={showDetail}>
          <span style={styles.iconSmall}>{showDetail ? 'expand_less' : 'expand_more'}</span>
          詳細情報（任意）
        </button>
        {showDetail && (
          <div style={styles.detailArea}>
            <label style={styles.label}>再現手順:</label>
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              aria-label="再現手順"
              rows={2}
              style={styles.textarea}
            />
            <label style={{ ...styles.label, marginTop: '8px' }}>期待結果:</label>
            <textarea
              value={expected}
              onChange={e => setExpected(e.target.value)}
              aria-label="期待結果"
              rows={2}
              style={styles.textarea}
            />
          </div>
        )}
      </div>

      {/* エラー */}
      {formError && (
        <div style={styles.errorMsg} role="alert">
          <span style={styles.iconSmall}>warning</span>
          {formError.message.slice(0, 200)}
        </div>
      )}

      {/* 送信ボタン */}
      <div style={styles.submitRow}>
        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          ...styles.submitButton,
          opacity: canSubmit ? 1 : 0.5,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}>
          {submitting ? (
            <span style={{ ...styles.iconSmall, animation: 'spin 1s linear infinite' }}>progress_activity</span>
          ) : '送信'}
        </button>
      </div>

      {/* トースト */}
      {toast && (
        <div style={styles.toast} role="status">送信しました</div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px',
    fontSize: '13px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
  },
  section: {
    marginBottom: '12px',
  },
  tagGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  tagHint: {
    fontSize: '10px',
    color: '#9CA3AF',
    marginTop: '4px',
  },
  tag: {
    padding: '4px 12px',
    borderRadius: '16px',
    border: '1px solid',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'transparent',
    transition: 'all 0.15s ease',
  },
  addTagButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'transparent',
    border: '1px dashed #D1D5DB',
    borderRadius: '8px',
    color: '#6B7280',
    fontSize: '12px',
    cursor: 'pointer',
  },
  iconSmall: {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '16px',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    padding: '6px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '13px',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  logNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    color: '#2563EB',
    fontSize: '12px',
    marginBottom: '12px',
  },
  detailToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
  },
  detailArea: {
    marginTop: '8px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '4px',
  },
  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 10px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
    borderRadius: '6px',
    color: '#DC2626',
    fontSize: '12px',
    marginBottom: '12px',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '8px 24px',
    backgroundColor: '#043E80',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
  },
  toast: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 20px',
    backgroundColor: '#059669',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
};
