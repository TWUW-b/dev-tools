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
export declare const MATERIAL_SYMBOLS_CDN = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap";
/**
 * Material Symbols アイコン用の基本スタイル
 */
export declare const materialSymbolsStyle = "\n  .material-symbols-outlined {\n    font-family: 'Material Symbols Outlined';\n    font-weight: normal;\n    font-style: normal;\n    font-size: 24px;\n    line-height: 1;\n    letter-spacing: normal;\n    text-transform: none;\n    display: inline-block;\n    white-space: nowrap;\n    word-wrap: normal;\n    direction: ltr;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    text-rendering: optimizeLegibility;\n    font-feature-settings: 'liga';\n  }\n";
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
export declare function loadMaterialSymbols(force?: boolean): boolean;
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
export declare function isAutoLoadDisabled(): boolean;
