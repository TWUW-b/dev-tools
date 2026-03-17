import type { UseDebugModeReturn } from '../types';
/**
 * デバッグモード検出フック
 *
 * - localStorage に保持（ブラウザを閉じても維持、再度3連打で解除）
 * - z キーを 500ms 以内に 3回連打でトグル
 * - #debug ハッシュでも有効化（localStorage に保存）
 * - 他タブでの変更を storage イベントで同期
 */
export declare function useDebugMode(): UseDebugModeReturn;
