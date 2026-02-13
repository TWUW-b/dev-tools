import type { ParsedTestCase } from '../types';

/**
 * テストケースMDをパースする
 *
 * フォーマット:
 * - frontmatter `domain:` → Domain名
 * - `# 見出し` → Capability名
 * - `## 見出し` → 視覚的グルーピング（データ保持しない）
 * - `- テキスト` → Case（テストケース）
 */
export function parseTestCaseMd(md: string): ParsedTestCase[] {
  const lines = md.split('\n');
  const results: ParsedTestCase[] = [];

  let domain = '';
  let capability = '';
  let inFrontmatter = false;
  let frontmatterDone = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // frontmatter 処理
    if (trimmed === '---' && !frontmatterDone) {
      if (inFrontmatter) {
        // 閉じる
        inFrontmatter = false;
        frontmatterDone = true;
      } else {
        // 開く
        inFrontmatter = true;
      }
      continue;
    }

    if (inFrontmatter) {
      const match = trimmed.match(/^domain:\s*(.+)$/);
      if (match) {
        domain = match[1].trim();
      }
      continue;
    }

    // # = Capability
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      capability = trimmed.slice(2).trim();
      continue;
    }

    // ## = 視覚的グルーピング（無視）
    if (trimmed.startsWith('## ')) {
      continue;
    }

    // - = Case
    if (trimmed.startsWith('- ') && capability) {
      const text = trimmed.slice(2).trim().replace(/^\[[ x]\]\s*/, '');
      if (text) {
        results.push({ domain, capability, title: text });
      }
    }
  }

  return results;
}
