/** ダウンロード対象ファイル */
export interface DownloadFile {
    /** MDファイルへのパス */
    path: string;
    /** ダウンロード時のファイル名 */
    filename?: string;
}
/** useManualDownload 戻り値 */
export interface UseManualDownloadReturn {
    /** 単体MDファイルをダウンロード */
    downloadMd: (path: string, filename?: string) => Promise<void>;
    /** 複数MDファイルをZIPでダウンロード */
    downloadMultipleMd: (files: DownloadFile[], zipName?: string) => Promise<void>;
}
/**
 * MDファイルのダウンロード機能を提供するフック
 */
export declare function useManualDownload(): UseManualDownloadReturn;
