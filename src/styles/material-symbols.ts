/**
 * Material Symbols フォント設定
 *
 * このライブラリは Material Symbols Outlined フォントを使用します。
 * デフォルトでは自動的にGoogle Fontsからフォントを読み込みます。
 */

/**
 * Material Symbols CDN URL
 * 可変フォント設定: opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
 */
export const MATERIAL_SYMBOLS_CDN =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';

/**
 * Material Symbols アイコン用の基本スタイル
 */
export const materialSymbolsStyle = `
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'liga';
  }
`;

/**
 * Material Symbols フォントを読み込む
 *
 * @param force - true の場合、既存のリンクがあっても再度読み込む
 * @returns フォントが読み込まれたかどうか
 *
 * @example
 * ```tsx
 * import { loadMaterialSymbols } from '@twuw-b/dev-tools';
 *
 * // アプリ起動時に一度だけ実行
 * loadMaterialSymbols();
 *
 * // または、既に読み込んでいる場合はスキップ
 * if (!loadMaterialSymbols()) {
 *   console.log('Material Symbols is already loaded');
 * }
 * ```
 */
export function loadMaterialSymbols(force = false): boolean {
  // SSR環境ではスキップ
  if (typeof document === 'undefined') {
    return false;
  }

  // 既に読み込まれているかチェック
  const existingLink = document.querySelector('link[href*="Material+Symbols"]');
  if (existingLink && !force) {
    return false;
  }

  // 既存のリンクを削除（force = true の場合）
  if (existingLink && force) {
    existingLink.remove();
  }

  // フォントを読み込む
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = MATERIAL_SYMBOLS_CDN;
  document.head.appendChild(link);

  return true;
}

/**
 * Material Symbols フォントの読み込みを無効化するフラグ
 *
 * グローバル変数で設定することで、自動読み込みを無効化できます。
 *
 * @example
 * ```tsx
 * // index.html または アプリのエントリーポイントで設定
 * window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ = true;
 * ```
 */
declare global {
  interface Window {
    __MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__?: boolean;
  }
}

/**
 * 自動読み込みが無効化されているかチェック
 */
export function isAutoLoadDisabled(): boolean {
  return typeof window !== 'undefined' && window.__MANUAL_VIEWER_DISABLE_AUTO_LOAD_MATERIAL_SYMBOLS__ === true;
}
