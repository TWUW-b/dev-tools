import { useCallback, useEffect, useRef, useState } from 'react';
import GithubSlugger from 'github-slugger';
import type { ManualHeading } from '../types';

/** useManualHeadings 戻り値 */
export interface UseManualHeadingsReturn {
  /** 指定パスの見出し一覧を返す。未フェッチなら undefined */
  getHeadings: (path: string) => ManualHeading[] | undefined;
  /** 指定パスの見出しを遅延フェッチする。フェッチ済み/フェッチ中なら何もしない（冪等） */
  loadHeadings: (path: string) => Promise<void>;
  /** 指定パスが読み込み中かどうか */
  isLoading: (path: string) => boolean;
  /** 指定パスの読み込みエラー（なければ null） */
  getError: (path: string) => Error | null;
}

/**
 * インライン Markdown 記法（太字のアスタリスク2つ・アンダースコア2つ、斜体のアスタリスク1つ・
 * アンダースコア1つ、インラインコードのバッククォート1つ、リンク `[text](url)`、画像
 * `![alt](url)`）を素朴に除去する。完全な Markdown AST 解析は行わない。
 * rehype-slug が実際にレンダリングする plain text（hast-util-to-string 相当）に
 * できるだけ近づけ、id 生成結果を一致させるための前処理。
 * - リンクは表示テキストのみを残す（実際のレンダリングでは <a> の子テキストノードが残るため）
 * - 画像は alt 属性が実際には子テキストノードにならないため、丸ごと除去する
 *
 * NOTE: ここでは trim しない。除去した跡に残る空白は、レンダリング後のテキストにも
 * そのまま残る（例: `## ![icon](x.png) 手順` のレンダリング結果は " 手順"）ため、
 * 落とすと id が rehype-slug 側とズレる。表示用のテキストだけを後段で trim する。
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

/**
 * 見出しに直接書かれた生 HTML タグを除去する。
 *
 * マニュアル本文の見出しにアイコンを入れる書き方（`### <app-icon name="building"></app-icon>
 * 新しい物件情報が入ったとき` や lucide の SVG をそのまま貼る形）に対応するためのもの。
 * rehype-raw が処理するこれらの要素はテキストを持たないので、rehype-slug が見る
 * plain text からは消える。ここで同じように落とさないと、
 * 本文側 `-新しい物件情報が入ったとき` に対して目次側が
 * `svg-xmlnshttpwwww3org2000svg-width18-...` のような別 id になり、
 * 目次から見出しへジャンプできなくなる（かつ目次に HTML ソースがそのまま並ぶ）。
 *
 * NOTE: ここでも trim しない（理由は stripInlineMarkdown と同じ）。
 */
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

/**
 * ATX見出し（`## Heading ##` のような閉じ側の # 列）を CommonMark 仕様どおりに除去する。
 * 閉じ側の # 列は直前に空白（またはテキストの先頭）が必要。
 */
function stripAtxClosingSequence(text: string): string {
  return text.replace(/(?:^|[ \t])#+[ \t]*$/, '').trim();
}

/**
 * Markdown テキストから h2/h3 見出しを抽出する。
 * - コードフェンス（``` または ~~~ で開始・終了する範囲。CommonMark/GFM 両対応）内の
 *   # 始まり行は見出しとして扱わない
 * - h1, h4-h6 は対象外
 * - ATX見出しは 0-3 個までの行頭インデントを許容する（CommonMark 仕様）
 * - ATX見出しの閉じ側 # 列（`## Heading ##`）は除去する
 * - rehypeRaw で処理される生の HTML 見出し（`<h2>...</h2>` / `<h3>...</h3>`、単一行のみ）も
 *   見出しとして扱う
 * - id は GithubSlugger（rehype-slug と同じアルゴリズム）で生成する。
 *   ページをまたいで連番サフィックスが汚染されないよう、呼び出し毎に新しいインスタンスを使う
 */
function extractHeadings(markdown: string): ManualHeading[] {
  const slugger = new GithubSlugger();
  const headings: ManualHeading[] = [];
  const lines = markdown.split(/\r?\n/);
  // 現在開いているコードフェンスの文字種（``` か ~~~）。null ならフェンス外。
  let fenceChar: '`' | '~' | null = null;

  for (const line of lines) {
    const fenceMatch = /^(`{3,}|~{3,})/.exec(line.trim());
    if (fenceMatch) {
      const char = fenceMatch[1][0] as '`' | '~';
      if (fenceChar === null) {
        fenceChar = char;
      } else if (fenceChar === char) {
        fenceChar = null;
      }
      // 異なる種類のフェンス文字はネストとして扱わずそのまま無視する
      continue;
    }
    if (fenceChar) continue;

    let level: 2 | 3 | null = null;
    let rawText = '';

    const atxMatch = /^ {0,3}(#{2,3})(?:[ \t]+(.*))?$/.exec(line);
    if (atxMatch) {
      level = atxMatch[1].length as 2 | 3;
      rawText = stripAtxClosingSequence((atxMatch[2] ?? '').trim());
    } else {
      const htmlMatch = /^\s{0,3}<h([23])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>\s*$/i.exec(line);
      if (htmlMatch) {
        level = Number(htmlMatch[1]) as 2 | 3;
        // 内側のタグ除去と trim は共通処理（stripHtmlTags）に任せる。
        // ここで trim すると、レンダリング後に残る前後の空白まで落として id がズレる。
        rawText = htmlMatch[2];
      }
    }

    if (level === null) continue;

    // id は「レンダリング後の plain text」から作る（＝ trim しない）。
    // 表示用テキストだけを trim する（目次に前後の空白は要らない）。
    const slugSource = stripHtmlTags(stripInlineMarkdown(rawText));
    const text = slugSource.trim();
    if (!text) continue;

    const id = slugger.slug(slugSource);
    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * マニュアル各ページの見出し（h2/h3）を、展開されたタイミングで遅延フェッチ・キャッシュするフック。
 * 呼び出し側が path を渡してフェッチをトリガーする（事前に全ページを一括フェッチしない）。
 */
export function useManualHeadings(): UseManualHeadingsReturn {
  const [cache, setCache] = useState<Record<string, ManualHeading[]>>({});
  const [loadingPaths, setLoadingPaths] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error | null>>({});

  // フェッチ開始済み判定（state の再レンダー反映を待たず、同期的に冪等性を保証するため ref で追跡）
  const startedRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const getHeadings = useCallback((path: string) => cache[path], [cache]);
  const isLoading = useCallback((path: string) => loadingPaths[path] ?? false, [loadingPaths]);
  const getError = useCallback((path: string) => errors[path] ?? null, [errors]);

  const loadHeadings = useCallback(async (path: string) => {
    if (startedRef.current.has(path)) return;
    startedRef.current.add(path);

    setLoadingPaths((prev) => ({ ...prev, [path]: true }));
    setErrors((prev) => ({ ...prev, [path]: null }));

    try {
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      const headings = extractHeadings(text);

      if (!mountedRef.current) return;
      setCache((prev) => ({ ...prev, [path]: headings }));
    } catch (err) {
      // 失敗時は再試行できるよう、フェッチ開始済みフラグを戻す
      startedRef.current.delete(path);

      if (!mountedRef.current) return;
      setErrors((prev) => ({
        ...prev,
        [path]: err instanceof Error ? err : new Error(String(err)),
      }));
    } finally {
      if (mountedRef.current) {
        setLoadingPaths((prev) => ({ ...prev, [path]: false }));
      }
    }
  }, []);

  return { getHeadings, loadHeadings, isLoading, getError };
}
