import type { EnvironmentInfoDoc } from '../types';
/**
 * 環境情報 MD をパースする。
 *
 * 規約:
 * - frontmatter: `title` / `warning` を抽出
 * - `# プロジェクト名` → プロジェクト（折り畳み単位）
 * - プロジェクト直下 `phase: xxx` → phase
 * - `## 環境 / ラベル` → env 付きセクション（`/` で分割）
 * - `## ラベル` → 共通セクション
 * - `- key: value` → KV エントリ
 * - `| ... |` → テーブル
 * - ラベルに「前提」「注意」「note」を含むセクションは KV 抽出せず notes として生 MD 保持
 * - パース不能な行・段落・`###` 以降の見出し等は extraMd として保持
 */
export declare function parseEnvironmentsMd(md: string): EnvironmentInfoDoc;
