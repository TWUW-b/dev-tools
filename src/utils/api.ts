import type { Note, NoteInput, NoteAttachment, NoteActivity, NotesResponse, Environment, Status, Severity, ParsedTestCase, DomainTree, TestRunInput, TestRunResponse } from '../types';

/** API Base URL（グローバル設定） */
let apiBaseUrl = '/__debug/api';

/**
 * API Base URL を設定
 */
export function setDebugApiBaseUrl(url: string): void {
  apiBaseUrl = url.replace(/\/$/, ''); // 末尾スラッシュを除去
}

/**
 * API Base URL を取得
 */
export function getDebugApiBaseUrl(): string {
  return apiBaseUrl;
}

/** Auth Token Provider（呼び出し側で Firebase 等の ID Token を返す） */
export type AuthTokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

let authTokenProvider: AuthTokenProvider | null = null;

/**
 * 認証トークンプロバイダを登録する。
 * 各 API リクエストの前に呼び出され、戻り値が文字列なら
 * `Authorization: Bearer {token}` ヘッダが自動付与される。
 * null/undefined を返す/プロバイダ未設定の場合は従来通りヘッダ無しで送信。
 *
 * 用途: ホスト側のアプリで Firebase 等の認証ゲートを通すために使用。
 */
export function setAuthTokenProvider(provider: AuthTokenProvider | null): void {
  authTokenProvider = provider;
}

/**
 * 設定済み provider から Authorization ヘッダを構築する。失敗時は空オブジェクトを返す。
 */
export async function buildAuthHeaders(): Promise<Record<string, string>> {
  if (!authTokenProvider) return {};
  try {
    const token = await authTokenProvider();
    if (typeof token === 'string' && token.length > 0) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // プロバイダ失敗時はヘッダ無しで継続
  }
  return {};
}

/**
 * バックエンドのエラーレスポンスからメッセージ文字列を抽出する。
 * `error` フィールドは文字列・オブジェクト ({code, message}) のどちらの形式も許容する。
 */
export function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const err = (data as Record<string, unknown>).error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const msg = (err as Record<string, unknown>).message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  const top = (data as Record<string, unknown>).message;
  if (typeof top === 'string' && top.length > 0) return top;
  return fallback;
}

/**
 * fetch のラッパー。設定済み AuthTokenProvider があれば
 * Authorization ヘッダを自動付与する。
 */
export async function dbgFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const authHeaders = await buildAuthHeaders();
  const mergedInit: RequestInit = {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      ...authHeaders,
    },
  };
  return fetch(input, mergedInit);
}

/**
 * レスポンスを安全にパースする
 */
async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: T;
  try {
    data = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }
    throw new Error('Invalid JSON response');
  }
  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `HTTP ${response.status}`));
  }
  return data;
}

/**
 * API クライアント
 */
export const api = {
  /**
   * ノート一覧を取得
   */
  async getNotes(options: {
    env: Environment;
    status?: Status | '';
    q?: string;
    includeDeleted?: boolean;
    signal?: AbortSignal;
  }): Promise<Note[]> {
    const params = new URLSearchParams({
      env: options.env,
      status: options.status || '',
      q: options.q || '',
      includeDeleted: options.includeDeleted ? '1' : '0',
    });

    const response = await dbgFetch(`${apiBaseUrl}/notes?${params}`, {
      signal: options.signal,
    });
    const data = await parseResponse<NotesResponse>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch notes');
    }

    return data.data || [];
  },

  /**
   * ノート詳細を取得
   */
  async getNote(env: Environment, id: number): Promise<Note> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${id}?env=${env}`);
    const data = await parseResponse<NotesResponse>(response);

    if (!data.success || !data.note) {
      throw new Error(data.error || 'Failed to fetch note');
    }

    return data.note;
  },

  /**
   * ノートを作成
   */
  async createNote(env: Environment, input: NoteInput): Promise<Note> {
    const response = await dbgFetch(`${apiBaseUrl}/notes?env=${env}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: input.title || null,
        content: input.content,
        userLog: input.userLog || null,
        severity: input.severity || null,
        status: input.status || 'open',
        route: input.route || (typeof window !== 'undefined'
          ? window.location.pathname + window.location.search + window.location.hash
          : ''),
        screenName: input.screenName || (typeof document !== 'undefined' ? document.title : ''),
        consoleLogs: input.consoleLogs || null,
        networkLogs: input.networkLogs || null,
        environment: input.environment || null,
        source: input.source || null,
        testCaseIds: input.testCaseIds ?? null,
      }),
    });

    const data = await parseResponse<NotesResponse>(response);

    if (!data.success || !data.note) {
      throw new Error(data.error || 'Failed to create note');
    }

    return data.note;
  },

  /**
   * ノートのステータスを更新
   */
  async updateStatus(env: Environment, id: number, status: Status, options?: { comment?: string; author?: string }): Promise<void> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${id}/status?env=${env}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...options }),
    });

    const data = await parseResponse<NotesResponse>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to update status');
    }
  },

  /**
   * ノートの重要度を更新
   */
  async updateSeverity(env: Environment, id: number, severity: Severity | null): Promise<void> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${id}/severity?env=${env}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity }),
    });

    const data = await parseResponse<NotesResponse>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to update severity');
    }
  },

  /**
   * ノートを削除（論理削除）
   */
  async deleteNote(env: Environment, id: number): Promise<void> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${id}?env=${env}`, {
      method: 'DELETE',
    });

    const data = await parseResponse<NotesResponse>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete note');
    }
  },

  /**
   * テストケースインポート
   */
  async importTestCases(cases: ParsedTestCase[]): Promise<{ total: number }> {
    const response = await dbgFetch(`${apiBaseUrl}/test-cases/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cases }),
    });

    const data = await parseResponse<{ success: boolean; total: number; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to import test cases');
    }

    return { total: data.total };
  },

  /**
   * テストツリー取得
   */
  async getTestTree(env: Environment): Promise<DomainTree[]> {
    const response = await dbgFetch(`${apiBaseUrl}/test-cases/tree?env=${env}`);
    const data = await parseResponse<{ success: boolean; data: DomainTree[]; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch test tree');
    }

    return data.data;
  },

  /**
   * テスト実行結果一括送信
   */
  async submitTestRuns(env: Environment, runs: TestRunInput[], failNote?: {
    content: string;
    severity?: Severity;
    route?: string;
    screenName?: string;
    consoleLogs?: import('../types').ConsoleLogEntry[];
    networkLogs?: import('../types').NetworkLogEntry[];
    environment?: import('../types').EnvironmentInfo;
  }): Promise<TestRunResponse> {
    // バグ報告ノートにも通常ノート (createNote) と同様、現在ページの route / screen_name を付与する。
    // これが無いとバックエンドが空文字で保存し、管理画面で「/」「(不明)」固定表示になる。
    const notePayload = failNote
      ? {
          ...failNote,
          route: failNote.route || (typeof window !== 'undefined'
            ? window.location.pathname + window.location.search + window.location.hash
            : ''),
          screen_name: failNote.screenName || (typeof document !== 'undefined' ? document.title : ''),
        }
      : undefined;

    const response = await dbgFetch(`${apiBaseUrl}/test-runs?env=${env}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runs, failNote: notePayload }),
    });

    const data = await parseResponse<{ success: boolean; results: TestRunResponse['results']; capability: TestRunResponse['capability']; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to submit test runs');
    }

    return {
      results: data.results,
      capability: data.capability,
    };
  },

  /**
   * 画像アップロード
   */
  async uploadAttachment(env: Environment, noteId: number, file: File): Promise<NoteAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await dbgFetch(`${apiBaseUrl}/notes/${noteId}/attachments?env=${env}`, {
      method: 'POST',
      body: formData,
    });

    const data = await parseResponse<{ success: boolean; attachment: NoteAttachment; error?: string }>(response);

    if (!data.success || !data.attachment) {
      throw new Error(data.error || 'Failed to upload attachment');
    }

    return data.attachment;
  },

  /**
   * 添付一覧取得
   */
  async getAttachments(env: Environment, noteId: number): Promise<NoteAttachment[]> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${noteId}/attachments?env=${env}`);
    const data = await parseResponse<{ success: boolean; attachments: NoteAttachment[]; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch attachments');
    }

    return data.attachments;
  },

  /**
   * 添付削除
   */
  async deleteAttachment(env: Environment, noteId: number, attachmentId: number): Promise<void> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${noteId}/attachments/${attachmentId}?env=${env}`, {
      method: 'DELETE',
    });

    const data = await parseResponse<{ success: boolean; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete attachment');
    }
  },

  /**
   * アクティビティ一覧取得
   */
  async getActivities(env: Environment, noteId: number): Promise<NoteActivity[]> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${noteId}/activities?env=${env}`);
    const data = await parseResponse<{ success: boolean; activities: NoteActivity[]; error?: string }>(response);

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch activities');
    }

    return data.activities;
  },

  /**
   * コメント追加
   */
  async addActivity(env: Environment, noteId: number, input: { content: string; author?: string }): Promise<NoteActivity> {
    const response = await dbgFetch(`${apiBaseUrl}/notes/${noteId}/activities?env=${env}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await parseResponse<{ success: boolean; activity: NoteActivity; error?: string }>(response);

    if (!data.success || !data.activity) {
      throw new Error(data.error || 'Failed to add activity');
    }

    return data.activity;
  },

  /**
   * 添付ファイルURL取得（同期）
   */
  getAttachmentUrl(filename: string): string {
    return `${apiBaseUrl}/attachments/${filename}`;
  },
};
