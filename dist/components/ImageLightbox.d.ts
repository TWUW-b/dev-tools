import type { ImageLightboxProps } from '../types';
/**
 * 画像の拡大表示（ライトボックス）。
 *
 * 設計上の要点:
 * - **`position: fixed` を使い、描画された document をそのまま覆う**。ManualPiP は
 *   Document Picture-in-Picture の別ウィンドウへ `createPortal` で描画されるため、
 *   `document.body` へのポータルを使うと「PiP で開いた画像がメインウィンドウ側に出る」
 *   ことになる。この要素はツリー内にそのまま描画し、実際に載った document を覆う。
 * - **キー入力・スクロールロックは `ownerDocument` に対して行う**。同じ理由で
 *   `window` / `document` を直接掴むと PiP 側の Escape が拾えない。
 * - 拡大表示中は「画面に合わせる」と「実寸」を切り替えられる。マニュアルの画像は
 *   スクリーンショットが多く、PiP のような小さいウィンドウでは画面に合わせただけでは
 *   文字が潰れて読めないため。
 * - `overlaySource` を渡すと、画像に重ねた注記（絶対配置の兄弟要素）を複製して
 *   拡大画像の上にも重ねる。注記は % 指定なので、複製先を画像と同じ大きさの箱に
 *   すれば拡大率に追随する。
 */
export declare function ImageLightbox({ src, alt, caption, overlaySource, onClose }: ImageLightboxProps): import("react/jsx-runtime").JSX.Element;
