import type { Feedback, FeedbackStatus, NoteAttachment } from '../types';

function validateApiBaseUrl(url: string): string {
  // 相対パス (/api/__debug 等) はそのまま使用
  if (url.startsWith('/')) {
    return url.replace(/\/$/, '');
  }
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Invalid API base URL protocol: ${parsed.protocol}`);
  }
  return parsed.origin + parsed.pathname.replace(/\/$/, '');
}

interface PostFeedbackParams {
  apiBaseUrl: string;
  body: Record<string, unknown>;
  signal?: AbortSignal;
}

interface AdminRequestParams {
  apiBaseUrl: string;
  adminKey: string;
  signal?: AbortSignal;
}

export async function postFeedback({ apiBaseUrl, body, signal }: PostFeedbackParams): Promise<Feedback> {
  const base = validateApiBaseUrl(apiBaseUrl);
  const res = await fetch(`${base}/feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to submit feedback');
  }
  return json.data;
}

export async function getFeedbacks(
  params: AdminRequestParams & { query?: Record<string, string> }
): Promise<{ data: Feedback[]; total: number; page: number; limit: number; customTags: string[] }> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const query = new URLSearchParams(params.query ?? {}).toString();
  const url = `${base}/feedbacks${query ? '?' + query : ''}`;
  const res = await fetch(url, {
    headers: { 'X-Admin-Key': params.adminKey },
    signal: params.signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch feedbacks');
  }
  return json;
}

export async function getFeedbackDetail(
  params: AdminRequestParams & { id: number }
): Promise<Feedback> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const res = await fetch(`${base}/feedbacks/${params.id}`, {
    headers: { 'X-Admin-Key': params.adminKey },
    signal: params.signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch feedback');
  }
  return json.data;
}

export async function updateFeedbackStatus(
  params: AdminRequestParams & { id: number; status: FeedbackStatus }
): Promise<{ id: number; status: FeedbackStatus; updatedAt: string }> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const res = await fetch(`${base}/feedbacks/${params.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': params.adminKey,
    },
    body: JSON.stringify({ status: params.status }),
    signal: params.signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to update status');
  }
  return json.data;
}

export async function deleteFeedback(
  params: AdminRequestParams & { id: number }
): Promise<void> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const res = await fetch(`${base}/feedbacks/${params.id}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': params.adminKey },
    signal: params.signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to delete feedback');
  }
}

export async function uploadFeedbackAttachment(
  params: { apiBaseUrl: string; feedbackId: number; file: File }
): Promise<NoteAttachment> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const formData = new FormData();
  formData.append('file', params.file);

  const res = await fetch(`${base}/feedbacks/${params.feedbackId}/attachments`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!json.success || !json.attachment) {
    throw new Error(json.error || 'Failed to upload attachment');
  }
  return json.attachment;
}

export async function deleteFeedbackAttachment(
  params: AdminRequestParams & { feedbackId: number; attachmentId: number }
): Promise<void> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const res = await fetch(`${base}/feedbacks/${params.feedbackId}/attachments/${params.attachmentId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Key': params.adminKey },
    signal: params.signal,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to delete attachment');
  }
}

export async function exportFeedbacks(params: {
  apiBaseUrl: string;
  adminKey: string;
  format: 'json' | 'csv' | 'sqlite';
}): Promise<void> {
  const base = validateApiBaseUrl(params.apiBaseUrl);
  const url = `${base}/feedbacks/export/${params.format}`;

  const res = await fetch(url, {
    headers: { 'X-Admin-Key': params.adminKey },
  });

  if (!res.ok) {
    throw new Error(`Export failed: ${res.status}`);
  }

  const blob = await res.blob();
  const filename = res.headers.get('Content-Disposition')
    ?.match(/filename="?([^"]+)"?/)?.[1]
    ?? `feedbacks-export.${params.format}`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
