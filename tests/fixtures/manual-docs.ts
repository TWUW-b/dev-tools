/**
 * tests/manual-toc.spec.ts が参照する、マニュアル関連の文字列の単一ソース。
 *
 * 値の出どころは2種類あり、どちらも実ファイルをそのまま書き写したものなので、
 * 該当ファイルを変更したときはこの定数も合わせて更新すること。
 *
 * 1. `pageLabel` / `category` … sample/App.tsx の `manualItems` 配列（ManualItem.title / .category）
 * 2. `heading.*`             … sample/public/docs/*.md 内の実際の見出しテキスト（h1/h2/h3）
 *
 * pageLabel と h1 見出しはたまたま同じ文言のページ（guide, api）もあるが、
 * 定義元（App.tsx の manualItems と .md の本文）は別物であるため、あえて別フィールドに分けている。
 */

export const MANUAL_CATEGORIES = {
  intro: 'はじめに',
  reference: 'リファレンス',
} as const;

export const MANUAL_DOCS = {
  guide: {
    path: '/docs/guide.md',
    /** sample/App.tsx manualItems[id="guide"].title / TOC 上のページボタン名 */
    pageLabel: '使い方ガイド',
    category: MANUAL_CATEGORIES.intro,
    heading: {
      /** h1 */
      title: '使い方ガイド',
      /** h2 */
      debugModeStart: 'デバッグモードの起動',
      /** h2 */
      debugPanel: 'デバッグパネル',
      /** h3 */
      recordTab: 'Record タブ',
    },
  },
  faq: {
    path: '/docs/faq.md',
    /** sample/App.tsx manualItems[id="faq"].title / TOC 上のページボタン名 */
    pageLabel: 'FAQ',
    category: MANUAL_CATEGORIES.intro,
    heading: {
      /** h1 */
      title: 'よくある質問',
      /** h2 */
      debugModeNotEnabled: 'Q: デバッグモードが有効にならない',
      /** h2 */
      pipWindowNotOpening: 'Q: PiP ウィンドウが開かない',
      /** h2 */
      logCaptureNotWorking: 'Q: ログキャプチャが動作しない',
      /** h2 */
      apiConnectionFailed: 'Q: API に接続できない',
    },
  },
  api: {
    path: '/docs/api.md',
    /** sample/App.tsx manualItems[id="api"].title / TOC 上のページボタン名 */
    pageLabel: 'API リファレンス',
    category: MANUAL_CATEGORIES.reference,
    heading: {
      /** h1 */
      title: 'API リファレンス',
      /** h3 */
      putNoteStatus: 'PUT /notes/:id/status',
    },
  },
} as const;
