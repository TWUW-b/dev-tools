import type { Note, NoteInput, NoteAttachment, NoteActivity, Environment, Status, Severity, ParsedTestCase, DomainTree, TestRunInput, TestRunResponse } from '../types';
/**
 * API Base URL を設定
 */
export declare function setDebugApiBaseUrl(url: string): void;
/**
 * API Base URL を取得
 */
export declare function getDebugApiBaseUrl(): string;
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
