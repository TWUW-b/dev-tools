import type { ManualLinkProps } from '../../types';
/**
 * マニュアルへのリンクコンポーネント
 *
 * クリック時にonClickハンドラを呼び出し、
 * 呼び出し側でPiP表示や別タブ表示を制御できる
 */
export declare function ManualLink({ path, onClick, children, className, }: ManualLinkProps): import("react/jsx-runtime").JSX.Element;
