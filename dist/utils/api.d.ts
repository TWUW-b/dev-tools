import type { Note, NoteInput, NoteAttachment, NoteActivity, Environment, Status, Severity, ParsedTestCase, DomainTree, TestRunInput, TestRunResponse } from '../types';
/**
 * API Base URL を設定
 */
export declare function setDebugApiBaseUrl(url: string): void;
/**
 * API Base URL を取得
 */
export declare function getDebugApiBaseUrl(): string;
/** Auth Token Provider（呼び出し側で Firebase 等の ID Token を返す） */
export type AuthTokenProvider = () => Promise<string | null | undefined> | string | null | undefined;
/**
 * 認証トークンプロバイダを登録する。
 * 各 API リクエストの前に呼び出され、戻り値が文字列なら
 * `Authorization: Bearer {token}` ヘッダが自動付与される。
 * null/undefined を返す/プロバイダ未設定の場合は従来通りヘッダ無しで送信。
 *
 * 用途: ホスト側のアプリで Firebase 等の認証ゲートを通すために使用。
 */
export declare function setAuthTokenProvider(provider: AuthTokenProvider | null): void;
/**
 * 設定済み provider から Authorization ヘッダを構築する。失敗時は空オブジェクトを返す。
 */
export declare function buildAuthHeaders(): Promise<Record<string, string>>;
/**
 * バックエンドのエラーレスポンスからメッセージ文字列を抽出する。
 * `error` フィールドは文字列・オブジェクト ({code, message}) のどちらの形式も許容する。
 */
export declare function extractErrorMessage(data: unknown, fallback: string): string;
/**
 * fetch のラッパー。設定済み AuthTokenProvider があれば
 * Authorization ヘッダを自動付与する。
 */
export declare function dbgFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
/**
 * API クライアント
 */
export declare const api: {
    /**
     * ノート一覧を取得
     */
    getNotes(options: {
        env: Environment;
        status?: Status | "";
        q?: string;
        includeDeleted?: boolean;
        signal?: AbortSignal;
    }): Promise<Note[]>;
    /**
     * ノート詳細を取得
     */
    getNote(env: Environment, id: number): Promise<Note>;
    /**
     * ノートを作成
     */
    createNote(env: Environment, input: NoteInput): Promise<Note>;
    /**
     * ノートのステータスを更新
     */
    updateStatus(env: Environment, id: number, status: Status, options?: {
        comment?: string;
        author?: string;
    }): Promise<void>;
    /**
     * ノートの重要度を更新
     */
    updateSeverity(env: Environment, id: number, severity: Severity | null): Promise<void>;
    /**
     * ノートを削除（論理削除）
     */
    deleteNote(env: Environment, id: number): Promise<void>;
    /**
     * テストケースインポート
     */
    importTestCases(cases: ParsedTestCase[]): Promise<{
        total: number;
    }>;
    /**
     * テストツリー取得
     */
    getTestTree(env: Environment): Promise<DomainTree[]>;
    /**
     * テスト実行結果一括送信
     */
    submitTestRuns(env: Environment, runs: TestRunInput[], failNote?: {
        content: string;
        severity?: Severity;
        consoleLogs?: import("../types").ConsoleLogEntry[];
        networkLogs?: import("../types").NetworkLogEntry[];
        environment?: import("../types").EnvironmentInfo;
    }): Promise<TestRunResponse>;
    /**
     * 画像アップロード
     */
    uploadAttachment(env: Environment, noteId: number, file: File): Promise<NoteAttachment>;
    /**
     * 添付一覧取得
     */
    getAttachments(env: Environment, noteId: number): Promise<NoteAttachment[]>;
    /**
     * 添付削除
     */
    deleteAttachment(env: Environment, noteId: number, attachmentId: number): Promise<void>;
    /**
     * アクティビティ一覧取得
     */
    getActivities(env: Environment, noteId: number): Promise<NoteActivity[]>;
    /**
     * コメント追加
     */
    addActivity(env: Environment, noteId: number, input: {
        content: string;
        author?: string;
    }): Promise<NoteActivity>;
    /**
     * 添付ファイルURL取得（同期）
     */
    getAttachmentUrl(filename: string): string;
};
