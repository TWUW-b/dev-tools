import { useCallback } from 'react';
import JSZip from 'jszip';

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
export function useManualDownload(): UseManualDownloadReturn {
  /**
   * 単体MDファイルをダウンロード
   */
  const downloadMd = useCallback(async (path: string, filename?: string): Promise<void> => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/markdown; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const defaultFilename = path.split('/').pop() || 'manual.md';
      const downloadFilename = filename || defaultFilename;

      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download MD file:', error);
      throw error;
    }
  }, []);

  /**
   * 複数MDファイルをZIPでダウンロード
   */
  const downloadMultipleMd = useCallback(
    async (files: DownloadFile[], zipName: string = 'manuals.zip'): Promise<void> => {
      try {
        const zip = new JSZip();

        await Promise.all(
          files.map(async ({ path, filename }) => {
            const response = await fetch(path);
            if (!response.ok) {
              console.warn(`Failed to fetch ${path}: ${response.status}`);
              return;
            }
            const content = await response.text();
            const defaultFilename = path.split('/').pop() || 'manual.md';
            zip.file(filename || defaultFilename, content);
          })
        );

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = zipName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download ZIP:', error);
        throw error;
      }
    },
    []
  );

  return {
    downloadMd,
    downloadMultipleMd,
  };
}
