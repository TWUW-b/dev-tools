/**
 * 共通カラー定数
 *
 * debug 系: DebugPanel / DebugAdmin で使用
 * manual 系: ManualPiP / ManualTabPage / ManualSidebar で使用
 */

/** デバッグ系カラー */
export const DEBUG_COLORS = {
  primary: '#1E40AF',
  primaryHover: '#1E3A8A',
  secondary: '#F59E0B',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  white: '#FFFFFF',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  success: '#059669',
  successBg: '#D1FAE5',
} as const;

/** マニュアル系カラー */
export const MANUAL_COLORS = {
  primary: '#043E80',
  secondary: '#F5B500',
  tertiary: '#1E3A5F',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  white: '#FFFFFF',
  error: '#DC2626',
  errorBg: '#FEE2E2',
} as const;
