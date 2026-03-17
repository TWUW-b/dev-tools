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
export declare function parseTestCaseMd(md: string): ParsedTestCase[];
