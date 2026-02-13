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
    const errorMessage = (data as Record<string, unknown>).error || `HTTP ${response.status}`;
    throw new Error(String(errorMessage));
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

    const response = await fetch(`${apiBaseUrl}/notes?${params}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${id}?env=${env}`);
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
    const response = await fetch(`${apiBaseUrl}/notes?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${id}/status?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${id}/severity?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${id}?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/test-cases/import`, {
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
    const response = await fetch(`${apiBaseUrl}/test-cases/tree?env=${env}`);
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
    consoleLogs?: import('../types').ConsoleLogEntry[];
    networkLogs?: import('../types').NetworkLogEntry[];
    environment?: import('../types').EnvironmentInfo;
  }): Promise<TestRunResponse> {
    const response = await fetch(`${apiBaseUrl}/test-runs?env=${env}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ runs, failNote }),
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

    const response = await fetch(`${apiBaseUrl}/notes/${noteId}/attachments?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${noteId}/attachments?env=${env}`);
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
    const response = await fetch(`${apiBaseUrl}/notes/${noteId}/attachments/${attachmentId}?env=${env}`, {
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
    const response = await fetch(`${apiBaseUrl}/notes/${noteId}/activities?env=${env}`);
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
    const response = await fetch(`${apiBaseUrl}/notes/${noteId}/activities?env=${env}`, {
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
