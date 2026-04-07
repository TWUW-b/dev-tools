/**
 * PiP ウィンドウに対応したクリップボードコピー。
 *
 * `navigator.clipboard.writeText()` は PiP 子ウィンドウ内ではフォーカス/権限要件で
 * 失敗することがある。そのため以下の順で試行する:
 *
 * 1. 指定 document（PiP なら pipDocument）の defaultView.navigator.clipboard.writeText
 * 2. メインウィンドウの navigator.clipboard.writeText
 * 3. 指定 document 内に textarea を生成して execCommand('copy') でフォールバック
 *
 * @returns 成功時 true
 */
export async function copyToClipboard(
  text: string,
  doc: Document | null = typeof document !== 'undefined' ? document : null,
): Promise<boolean> {
  // 1. PiP window の navigator.clipboard
  const pipNav = doc?.defaultView?.navigator;
  if (pipNav?.clipboard?.writeText) {
    try {
      await pipNav.clipboard.writeText(text);
      return true;
    } catch {
      // 続行してフォールバック
    }
  }

  // 2. メインウィンドウの navigator.clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 続行してフォールバック
    }
  }

  // 3. execCommand('copy') フォールバック（PiP の document 内で実行）
  const targetDoc = doc ?? (typeof document !== 'undefined' ? document : null);
  if (!targetDoc) return false;

  try {
    const textarea = targetDoc.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    (targetDoc.body || targetDoc.documentElement).appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = targetDoc.execCommand('copy');
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}
