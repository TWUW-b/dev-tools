import type { ManualTabPageProps } from '../../types';
/**
 * 別タブ用マニュアル表示ページ
 * URLクエリパラメータ `?path=/docs/xxx.md` でマニュアルを表示
 * `sidebarPath` を指定するとリサイズ可能なサイドバーが開く
 * `feedbackApiBaseUrl` を指定するとフィードバック機能が有効化
 */
export declare function ManualTabPage({ defaultDocPath, sidebarPath, onSidebarNavigate, onSidebarAppNavigate, sidebarDefaultWidth, sidebarMinWidth, sidebarMaxWidth, feedbackApiBaseUrl, feedbackUserType, feedbackAppVersion, feedbackAdminUrl, feedbackDefaultHeight, feedbackMinHeight, feedbackMaxHeight, onFeedbackSubmitSuccess, onFeedbackSubmitError, }?: ManualTabPageProps): import("react/jsx-runtime").JSX.Element;
