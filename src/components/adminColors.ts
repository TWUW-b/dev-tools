/**
 * 管理 UI のカラーパレット（@TWUWB-005）。
 *
 * もともと DebugAdmin.tsx の中に閉じていた。ReleaseNotesTab を単体で export したとき、
 * ホスト側が colors を組み立てられないと使えないので、ここへ出して公開する。
 * DebugAdmin もここから import するので、パレットの実体は 1 箇所のまま。
 */

/** ライトモード カラー定義 */
export const LIGHT_COLORS = {
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  primaryDark: '#4F46E5',
  accent: '#EC4899',
  bg: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgTertiary: '#F3F4F6',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  critical: '#7C2D12',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
  link: '#6366F1',
};

/** ダークモード カラー定義 */
export const DARK_COLORS = {
  primary: '#818CF8',
  primaryLight: '#1E1B4B',
  primaryDark: '#A5B4FC',
  accent: '#F472B6',
  bg: '#0F172A',
  bgSecondary: '#1E293B',
  bgTertiary: '#334155',
  border: '#334155',
  borderLight: '#475569',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  error: '#F87171',
  errorBg: '#450A0A',
  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#78350F',
  critical: '#FB923C',
  high: '#F87171',
  medium: '#FBBF24',
  low: '#60A5FA',
  link: '#818CF8',
};

/** 管理 UI のパレット型。ホストが自前の色を渡すときの形。 */
export type AdminColors = typeof LIGHT_COLORS;
