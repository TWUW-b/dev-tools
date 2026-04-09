import { DEBUG_COLORS as COLORS } from '../../styles/colors';

/** トリガーボタンのスタイル */
export const triggerButtonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '24px',
  right: '24px',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: COLORS.primary,
  color: COLORS.white,
  border: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

/** フォールバック用スタイル */
export const fallbackStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  panel: {
    width: '400px',
    maxHeight: '90vh',
    background: COLORS.white,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
};

/**
 * PiPウィンドウ用スタイル
 */
export function getPipStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: ${COLORS.white};
      font-size: 14px;
      color: ${COLORS.gray900};
    }

    .debug-icon {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      line-height: 1;
    }

    .debug-panel {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .debug-header-left .debug-icon {
      color: ${COLORS.secondary};
    }

    .debug-title {
      font-size: 16px;
      font-weight: 600;
    }

    .debug-env {
      font-size: 11px;
      padding: 2px 6px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      text-transform: uppercase;
    }

    .debug-header-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .debug-refresh-btn {
      background: transparent;
      border: none;
      color: ${COLORS.white};
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
    }
    .debug-refresh-btn:hover {
      background: rgba(255,255,255,0.15);
    }
    .debug-refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .debug-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: ${COLORS.white};
      cursor: pointer;
    }

    .debug-close-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    /* タブ */
    .debug-tabs {
      display: flex;
      border-bottom: 1px solid ${COLORS.gray200};
      background: ${COLORS.gray100};
    }

    .debug-tab {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: ${COLORS.gray500};
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .debug-tab:hover {
      color: ${COLORS.gray700};
    }

    .debug-tab.active {
      color: ${COLORS.primary};
      border-bottom-color: ${COLORS.primary};
    }

    .debug-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .debug-message {
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
    }

    .debug-message-success {
      background: ${COLORS.successBg};
      color: ${COLORS.success};
    }

    .debug-message-error {
      background: ${COLORS.errorBg};
      color: ${COLORS.error};
    }

    .debug-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .debug-field label {
      font-size: 13px;
      font-weight: 500;
      color: ${COLORS.gray700};
    }

    .debug-field input,
    .debug-field textarea,
    .debug-field select {
      padding: 10px 12px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 6px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s;
    }

    .debug-field input:focus,
    .debug-field textarea:focus,
    .debug-field select:focus {
      outline: none;
      border-color: ${COLORS.primary};
    }

    .debug-field textarea {
      resize: vertical;
      min-height: 60px;
    }

    .debug-hint {
      font-size: 11px;
      color: ${COLORS.gray500};
    }

    .debug-toggle {
      display: flex;
      justify-content: center;
    }

    .debug-toggle-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: transparent;
      border: 1px dashed ${COLORS.gray300};
      border-radius: 6px;
      color: ${COLORS.gray500};
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-toggle-btn:hover {
      border-color: ${COLORS.primary};
      color: ${COLORS.primary};
    }

    .debug-attach-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
    }

    .debug-attach-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: ${COLORS.gray700};
      cursor: pointer;
    }

    .debug-attach-option input[type="checkbox"] {
      accent-color: ${COLORS.primary};
    }

    .debug-footer {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid ${COLORS.gray200};
      background: ${COLORS.gray100};
    }

    .debug-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
    }

    .debug-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .debug-btn-primary {
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-btn-primary:hover:not(:disabled) {
      background: ${COLORS.primaryHover};
    }

    .debug-btn-secondary {
      background: ${COLORS.white};
      color: ${COLORS.gray700};
      border: 1px solid ${COLORS.gray300};
    }

    .debug-btn-secondary:hover:not(:disabled) {
      background: ${COLORS.gray100};
    }

    /* 管理タブ: ステータスフィルタ */
    .debug-status-filter {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      padding-bottom: 8px;
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-status-chip {
      padding: 4px 10px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 12px;
      background: ${COLORS.white};
      color: ${COLORS.gray500};
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-status-chip:hover {
      border-color: ${COLORS.primary};
      color: ${COLORS.primary};
    }

    .debug-status-chip.active {
      background: ${COLORS.primary};
      border-color: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-filter-count {
      font-size: 11px;
      color: ${COLORS.gray500};
      margin-left: auto;
    }

    /* 管理タブ */
    .debug-manage {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-note-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
    }

    .debug-note-row[data-status="resolved"] {
      background: #FFFBEB;
      border-left: 3px solid #F59E0B;
    }

    .debug-note-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .debug-note-id {
      font-size: 11px;
      color: ${COLORS.gray500};
      font-family: monospace;
      min-width: 32px;
      flex-shrink: 0;
    }

    .debug-note-preview {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-source-badge {
      margin-right: 4px;
    }

    .debug-tc-badge {
      font-family: monospace;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.12);
      color: #6366F1;
      white-space: nowrap;
    }

    .debug-severity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .debug-severity-dot.critical { background: #7C2D12; }
    .debug-severity-dot.high { background: ${COLORS.error}; }
    .debug-severity-dot.medium { background: ${COLORS.secondary}; }
    .debug-severity-dot.low { background: ${COLORS.primary}; }
    .debug-severity-dot.none { background: ${COLORS.gray300}; }

    .debug-status-select {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid ${COLORS.gray300};
      border-radius: 4px;
      background: ${COLORS.white};
      cursor: pointer;
      flex-shrink: 0;
    }

    .debug-empty {
      text-align: center;
      padding: 40px 16px;
      color: ${COLORS.gray500};
      font-size: 13px;
    }

    /* テストタブ: ツリー */
    .debug-test-tree {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .debug-tree-domain {
      display: flex;
      flex-direction: column;
    }

    .debug-tree-toggle {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: ${COLORS.gray900};
      font-weight: 600;
      width: 100%;
      text-align: left;
    }

    .debug-tree-toggle:hover {
      background: ${COLORS.gray100};
      border-radius: 4px;
    }

    .debug-tree-label {
      flex: 1;
    }

    .debug-tree-count {
      font-size: 12px;
      color: ${COLORS.gray500};
      font-weight: 500;
    }

    .debug-tree-status {
      font-size: 11px;
      font-weight: 600;
    }

    .debug-tree-issues {
      font-size: 11px;
      color: ${COLORS.error};
      font-weight: 500;
    }

    .debug-tree-capability {
      margin-left: 16px;
      display: flex;
      flex-direction: column;
    }

    .debug-tree-cap-toggle {
      font-weight: 500;
      font-size: 13px;
    }

    .debug-tree-cases {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px 0;
    }

    .debug-tree-case {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: ${COLORS.gray700};
    }

    .debug-tree-case:hover {
      background: ${COLORS.gray100};
    }

    .debug-tree-case input[type="checkbox"] {
      flex-shrink: 0;
      accent-color: ${COLORS.primary};
    }

    .debug-tree-case-title {
      flex: 1;
    }

    .debug-tree-case-status {
      font-size: 11px;
      font-weight: 500;
      flex-shrink: 0;
    }

    /* バグ報告フォーム */
    .debug-bug-form {
      margin-top: 8px;
      padding: 12px;
      background: ${COLORS.gray100};
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .debug-bug-form-title {
      font-size: 12px;
      font-weight: 600;
      color: ${COLORS.gray700};
      padding-bottom: 4px;
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-bug-form .debug-field {
      gap: 4px;
    }

    .debug-bug-form .debug-field label {
      font-size: 12px;
    }

    .debug-bug-form .debug-field select,
    .debug-bug-form .debug-field textarea {
      padding: 6px 8px;
      font-size: 12px;
    }

    .debug-bug-form .debug-field textarea {
      min-height: 40px;
    }

    .debug-bug-cases {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 120px;
      overflow-y: auto;
    }

    .debug-bug-case-option {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      color: ${COLORS.gray700};
    }

    .debug-bug-case-option:hover {
      background: ${COLORS.gray200};
    }

    .debug-bug-case-option input[type="checkbox"] {
      accent-color: ${COLORS.error};
      flex-shrink: 0;
    }

    .debug-cap-submit {
      margin-top: 8px;
      flex: none;
      padding: 8px 16px;
      font-size: 13px;
    }

    /* マニュアルタブ */
    .debug-manual-tab {
      display: flex;
      height: 100%;
      min-height: 0;
    }

    .debug-manual-sidebar {
      width: 140px;
      min-width: 140px;
      border-right: 1px solid ${COLORS.gray200};
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 4px;
    }

    .debug-manual-item {
      display: block;
      width: 100%;
      text-align: left;
      padding: 6px 8px;
      border: none;
      background: transparent;
      font-size: 12px;
      color: ${COLORS.gray700};
      cursor: pointer;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .debug-manual-item:hover {
      background: ${COLORS.gray100};
    }

    .debug-manual-item.active {
      background: ${COLORS.primary};
      color: ${COLORS.white};
    }

    .debug-manual-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      min-width: 0;
    }

    /* Markdown スタイル */
    .manual-markdown {
      font-size: 13px;
      line-height: 1.6;
      color: ${COLORS.gray900};
    }

    .manual-markdown h1 { font-size: 20px; font-weight: 700; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid ${COLORS.gray200}; }
    .manual-markdown h2 { font-size: 17px; font-weight: 600; margin: 14px 0 6px; }
    .manual-markdown h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
    .manual-markdown h4 { font-size: 13px; font-weight: 600; margin: 10px 0 4px; }

    .manual-markdown p { margin: 8px 0; }

    .manual-markdown ul, .manual-markdown ol {
      margin: 8px 0;
      padding-left: 20px;
    }

    .manual-markdown li { margin: 2px 0; }

    .manual-markdown code {
      background: ${COLORS.gray100};
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 12px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }

    .manual-markdown pre {
      background: ${COLORS.gray100};
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .manual-markdown pre code {
      background: none;
      padding: 0;
    }

    .manual-markdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 8px 0;
      font-size: 12px;
    }

    .manual-markdown th, .manual-markdown td {
      border: 1px solid ${COLORS.gray200};
      padding: 6px 8px;
      text-align: left;
    }

    .manual-markdown th {
      background: ${COLORS.gray100};
      font-weight: 600;
    }

    .manual-markdown blockquote {
      border-left: 3px solid ${COLORS.gray300};
      padding-left: 12px;
      margin: 8px 0;
      color: ${COLORS.gray500};
    }

    .manual-markdown img {
      max-width: 100%;
      height: auto;
    }

    .manual-markdown hr {
      border: none;
      border-top: 1px solid ${COLORS.gray200};
      margin: 16px 0;
    }

    /* ドロップゾーン */
    .debug-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 16px;
      border: 2px dashed ${COLORS.gray300};
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s;
      background: ${COLORS.white};
    }

    .debug-dropzone:hover {
      border-color: ${COLORS.primary};
      background: ${COLORS.gray100};
    }

    .debug-dropzone.dragging {
      border-color: ${COLORS.primary};
      background: rgba(59, 130, 246, 0.05);
    }

    .debug-dropzone.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* サムネイル一覧 */
    .debug-thumbnails {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .debug-thumbnail {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid ${COLORS.gray200};
    }

    .debug-thumbnail-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .debug-thumbnail-remove {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(0,0,0,0.6);
      color: ${COLORS.white};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    .debug-thumbnail-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2px 4px;
      background: rgba(0,0,0,0.5);
      color: ${COLORS.white};
      font-size: 9px;
      text-align: center;
    }

    /* 管理タブ: ビュー切り替え */
    .debug-manage-toolbar {
      padding-bottom: 8px;
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-view-toggle {
      display: flex;
      gap: 4px;
      background: ${COLORS.gray100};
      border-radius: 8px;
      padding: 3px;
    }

    .debug-view-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: ${COLORS.gray500};
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .debug-view-btn:hover {
      color: ${COLORS.gray700};
    }

    .debug-view-btn.active {
      background: ${COLORS.white};
      color: ${COLORS.primary};
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .debug-view-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: ${COLORS.primary};
      color: ${COLORS.white};
      font-size: 10px;
      font-weight: 600;
    }

    .debug-view-btn.active .debug-view-badge {
      background: ${COLORS.secondary};
      color: ${COLORS.gray900};
    }

    /* 確認手順ビュー */
    .debug-checklist-view {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .debug-checklist-card {
      border: 1px solid ${COLORS.gray200};
      border-radius: 8px;
      overflow: hidden;
    }

    .debug-checklist-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: ${COLORS.gray100};
      border-bottom: 1px solid ${COLORS.gray200};
    }

    .debug-checklist-title {
      font-size: 13px;
      font-weight: 600;
      color: ${COLORS.gray900};
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .debug-checklist-items {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }

    .debug-checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      color: ${COLORS.gray700};
      cursor: pointer;
      transition: background 0.1s;
      line-height: 1.4;
    }

    .debug-checklist-item:hover {
      background: ${COLORS.gray100};
    }

    .debug-checklist-item input[type="checkbox"] {
      margin-top: 2px;
      flex-shrink: 0;
      accent-color: ${COLORS.primary};
    }

    .debug-checklist-done {
      text-decoration: line-through;
      color: ${COLORS.gray500};
    }

    .debug-checklist-no-items {
      padding: 12px;
      font-size: 12px;
      color: ${COLORS.gray500};
      text-align: center;
    }

    .debug-checklist-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-top: 1px solid ${COLORS.gray200};
      background: ${COLORS.gray100};
    }

    .debug-checklist-progress {
      font-size: 12px;
      color: ${COLORS.gray500};
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    .debug-btn-resolve {
      padding: 6px 12px;
      font-size: 12px;
      background: ${COLORS.primary};
      color: ${COLORS.white};
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s;
    }

    .debug-btn-resolve:hover:not(:disabled) {
      background: ${COLORS.primaryHover};
    }

    .debug-btn-resolve:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
}
