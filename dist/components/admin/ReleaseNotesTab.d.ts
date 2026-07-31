import type { Environment } from '../../types';
import { type AdminColors } from '../adminColors';
type Colors = AdminColors;
export interface ReleaseNotesTabProps {
    apiBaseUrl: string;
    env: Environment;
    adminKey?: string;
    /** 省略時はライトモードのパレット。DebugAdmin 以外のホストでもそのまま置ける。 */
    colors?: Colors;
    /** 外から再取得させたいときに変える。省略時は 0 固定（自前で再取得しない）。 */
    refreshKey?: number;
}
export declare function ReleaseNotesTab({ apiBaseUrl, env, adminKey, colors, refreshKey }: ReleaseNotesTabProps): import("react/jsx-runtime").JSX.Element;
export {};
