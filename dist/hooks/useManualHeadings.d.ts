import type { ManualHeading } from '../types';
/** useManualHeadings 戻り値 */
export interface UseManualHeadingsReturn {
    /** 指定パスの見出し一覧を返す。未フェッチなら undefined */
    getHeadings: (path: string) => ManualHeading[] | undefined;
    /** 指定パスの見出しを遅延フェッチする。フェッチ済み/フェッチ中なら何もしない（冪等） */
    loadHeadings: (path: string) => Promise<void>;
    /** 指定パスが読み込み中かどうか */
    isLoading: (path: string) => boolean;
    /** 指定パスの読み込みエラー（なければ null） */
    getError: (path: string) => Error | null;
}
/**
 * マニュアル各ページの見出し（h2/h3）を、展開されたタイミングで遅延フェッチ・キャッシュするフック。
 * 呼び出し側が path を渡してフェッチをトリガーする（事前に全ページを一括フェッチしない）。
 */
export declare function useManualHeadings(): UseManualHeadingsReturn;
