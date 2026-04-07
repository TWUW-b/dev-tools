import type {
  EnvironmentInfoDoc,
  EnvironmentProject,
  EnvironmentSection,
  EnvironmentKV,
  EnvironmentTable,
} from '../types';

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
export function parseEnvironmentsMd(md: string): EnvironmentInfoDoc {
  const { meta, body } = extractFrontmatter(md);
  const lines = body.split('\n');

  const doc: EnvironmentInfoDoc = {
    title: meta.title,
    warning: meta.warning,
    projects: [],
  };

  let preambleLines: string[] = [];
  let currentProject: EnvironmentProject | null = null;
  let currentEnv: string | null = null;
  let currentSection: EnvironmentSection | null = null;
  let currentIsNotes = false;
  let notesBuffer: string[] = [];
  let extraBuffer: string[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const table = parseTable(tableBuffer);
    tableBuffer = [];
    if (!table) return;
    if (currentSection) currentSection.table = table;
    else extraBuffer.push(...renderTable(table));
  };

  const flushExtraToSection = () => {
    flushTable();
    if (currentSection && extraBuffer.length > 0) {
      const text = extraBuffer.join('\n').trim();
      if (text) currentSection.extraMd = (currentSection.extraMd ? currentSection.extraMd + '\n' : '') + text;
    }
    extraBuffer = [];
  };

  const closeCurrentSection = () => {
    flushExtraToSection();
    if (currentProject && currentSection) {
      if (currentIsNotes) {
        const merged = [
          currentSection.entries.map(e => `- ${e.key}: ${e.value}`).join('\n'),
          currentSection.extraMd ?? '',
        ].filter(Boolean).join('\n\n');
        if (merged.trim()) {
          notesBuffer.push(`## ${currentSection.label}\n\n${merged}`);
        }
      } else if (currentEnv) {
        let group = currentProject.envs.find(g => g.env === currentEnv);
        if (!group) {
          group = { env: currentEnv, sections: [] };
          currentProject.envs.push(group);
        }
        group.sections.push(currentSection);
      } else {
        currentProject.common.push(currentSection);
      }
    }
    currentSection = null;
    currentEnv = null;
    currentIsNotes = false;
  };

  const closeCurrentProject = () => {
    closeCurrentSection();
    if (currentProject) {
      if (notesBuffer.length > 0) {
        currentProject.notes = notesBuffer.join('\n\n').trim();
      }
      notesBuffer = [];
      doc.projects.push(currentProject);
    }
    currentProject = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // テーブル行
    if (/^\|.*\|$/.test(trimmed)) {
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    // 水平線はセクション区切りとして無視
    if (/^---+$/.test(trimmed)) continue;

    // H1 プロジェクト
    const h1 = /^#\s+(.+)$/.exec(line);
    if (h1) {
      closeCurrentProject();
      const name = h1[1].trim();
      if (name === '共通' || /^(common|shared)$/i.test(name)) {
        currentProject = { name: '共通', envs: [], common: [] };
      } else {
        currentProject = { name, envs: [], common: [] };
      }
      continue;
    }

    // H2 セクション
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      closeCurrentSection();
      if (!currentProject) {
        // H1 無しで H2 が出た場合は暗黙の "共通" プロジェクトを作る
        currentProject = { name: '共通', envs: [], common: [] };
      }
      const raw = h2[1].trim();

      // notes 判定
      if (/前提|注意|注記|note|備考/i.test(raw)) {
        currentSection = { label: raw, entries: [] };
        currentIsNotes = true;
        continue;
      }

      // "env / label" 分解
      const slashMatch = /^(.+?)\s*\/\s*(.+)$/.exec(raw);
      if (slashMatch) {
        currentEnv = normalizeEnvName(slashMatch[1].trim());
        currentSection = { label: slashMatch[2].trim(), entries: [] };
      } else {
        // "dev環境" 等、末尾の「環境」を削って env 名になるかチェック
        const envOnly = normalizeEnvName(raw.replace(/環境$/, '').trim());
        if (envOnly && /^(dev|staging|stg|prod|production|local|test)$/i.test(envOnly)) {
          currentEnv = envOnly;
          currentSection = { label: 'アカウント', entries: [] };
        } else {
          currentEnv = null;
          currentSection = { label: raw, entries: [] };
        }
      }
      continue;
    }

    // プロジェクト直下 `phase: xxx`
    if (currentProject && !currentSection) {
      const phaseMatch = /^phase\s*:\s*(.+)$/i.exec(trimmed);
      if (phaseMatch) {
        currentProject.phase = phaseMatch[1].trim();
        continue;
      }
    }

    // リスト項目 - key: value
    const listKv = /^\s*-\s+([^:]+?):\s*(.+)$/.exec(line);
    if (listKv && currentSection && !currentIsNotes) {
      const key = listKv[1].trim();
      const value = listKv[2].trim().replace(/^`|`$/g, '');
      currentSection.entries.push({
        key,
        value,
        kind: detectKind(key, value),
      });
      continue;
    }

    // その他 → currentSection の extraMd or project preamble
    if (trimmed === '' && extraBuffer.length === 0) continue;
    if (currentSection) {
      extraBuffer.push(line);
    } else if (!currentProject) {
      preambleLines.push(line);
    }
    // H1 直下・H2 無しの自由記述は現プロジェクトの common 配下に後で flush される extraBuffer へ
  }

  // 最終フラッシュ
  closeCurrentProject();

  const preamble = preambleLines.join('\n').trim();
  if (preamble) doc.preamble = preamble;

  return doc;
}

// ---------- helpers ----------

function extractFrontmatter(md: string): { meta: { title?: string; warning?: string }; body: string } {
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(md);
  if (!fm) return { meta: {}, body: md };
  const meta: { title?: string; warning?: string } = {};
  for (const line of fm[1].split('\n')) {
    const m = /^([a-zA-Z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (key === 'title') meta.title = value;
    else if (key === 'warning') meta.warning = value;
  }
  return { meta, body: md.slice(fm[0].length) };
}

function parseTable(rows: string[]): EnvironmentTable | null {
  if (rows.length < 2) return null;
  const split = (row: string) =>
    row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  const headers = split(rows[0]);
  // 2 行目は区切り (---)
  if (!/^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(rows[1])) {
    // 区切り行が無ければヘッダ行だけとして扱う
    return { headers, rows: rows.slice(1).map(split) };
  }
  const data = rows.slice(2).map(split);
  return { headers, rows: data };
}

function renderTable(t: EnvironmentTable): string[] {
  const out = ['| ' + t.headers.join(' | ') + ' |'];
  out.push('| ' + t.headers.map(() => '---').join(' | ') + ' |');
  for (const r of t.rows) out.push('| ' + r.join(' | ') + ' |');
  return out;
}

function normalizeEnvName(raw: string): string {
  const s = raw.toLowerCase();
  if (/^(staging|stg)$/.test(s)) return 'staging';
  if (/^(prod|production|本番)$/.test(s)) return 'prod';
  if (/^(dev|development|開発)$/.test(s)) return 'dev';
  if (/^(local|ローカル)$/.test(s)) return 'local';
  if (/^(test|テスト)$/.test(s)) return 'test';
  return raw;
}

function detectKind(key: string, value: string): EnvironmentKV['kind'] {
  const k = key.toLowerCase();
  if (/pass|pwd|password|パスワード/.test(k)) return 'password';
  if (/url|link|endpoint/.test(k) || /^https?:\/\//.test(value)) return 'url';
  if (/mail|email|メール/.test(k) || /^[^\s@]+@[^\s@]+$/.test(value)) return 'email';
  if (/user|id|name|account|ユーザー/.test(k)) return 'user';
  return 'text';
}
