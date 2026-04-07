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
export declare function copyToClipboard(text: string, doc?: Document | null): Promise<boolean>;
