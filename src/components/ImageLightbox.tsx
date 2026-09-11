import { useEffect, useRef, useState } from 'react';
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
export function ImageLightbox({ src, alt = '', caption, overlaySource, onClose }: ImageLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const figureBoxRef = useRef<HTMLDivElement>(null);
  const [actualSize, setActualSize] = useState(false);

  // onClose の同一性が変わっても「マウント時に1回だけ」の副作用にするため ref 経由で呼ぶ。
  // （毎レンダーで effect が再実行されると、フォーカス奪取と overflow の復元が繰り返される）
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const doc = overlay.ownerDocument;
    const previouslyFocused = doc.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    doc.addEventListener('keydown', handleKeyDown);

    // 背面のスクロールを止める（拡大中にホイールで本文が動くと戻り位置を見失う）
    const previousOverflow = doc.body.style.overflow;
    doc.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    return () => {
      doc.removeEventListener('keydown', handleKeyDown);
      doc.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, []);

  /*
   * 注記の複製。
   * 元の DOM ノードをそのまま cloneNode するので、class も inline style も維持される
   * （注記の位置は % 指定なので、複製先の箱＝拡大後の画像とサイズが一致すれば位置も合う）。
   * 絶対配置の要素だけに限定しているのは、キャプション等の通常フローの兄弟や
   * <script> のような非表示要素を巻き込まないため。
   */
  useEffect(() => {
    const box = figureBoxRef.current;
    if (!box || !overlaySource) return;
    const view = box.ownerDocument.defaultView;
    if (!view) return;
    const clones = Array.from(overlaySource.children)
      .filter((child): child is HTMLElement => child instanceof view.HTMLElement && child.tagName !== 'IMG')
      .filter((child) => view.getComputedStyle(child).position === 'absolute')
      .map((child) => child.cloneNode(true) as HTMLElement);
    clones.forEach((clone) => box.appendChild(clone));
    return () => clones.forEach((clone) => clone.remove());
  }, [overlaySource]);

  const captionText = caption ?? (alt || null);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={alt ? `拡大表示: ${alt}` : '画像の拡大表示'}
      onClick={() => onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483000,
        background: 'rgba(0, 0, 0, 0.82)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 16px 16px',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: '10px', right: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <button
          type="button"
          onClick={() => setActualSize((v) => !v)}
          style={{
            padding: '5px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontSize: '12px',
            lineHeight: 1.4,
            cursor: 'pointer',
          }}
        >
          {actualSize ? '画面に合わせる' : '実寸で表示'}
        </button>
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="閉じる"
          onClick={() => onClose()}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontSize: '20px',
            lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      <figure
        onClick={(e) => e.stopPropagation()}
        style={{
          margin: 0,
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: actualSize ? 'auto' : 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          ref={figureBoxRef}
          style={{
            position: 'relative',
            display: 'inline-block',
            lineHeight: 0,
            // 実寸表示では画像より小さく詰められると、% 指定の注記が画像とずれる
            // （注記の基準はこの箱なので、箱は常に画像と同じ大きさである必要がある）
            maxWidth: actualSize ? 'none' : '100%',
          }}
        >
          <img
            src={src}
            alt={alt}
            onClick={() => setActualSize((v) => !v)}
            style={{
              display: 'block',
              borderRadius: '6px',
              background: '#FFFFFF',
              cursor: actualSize ? 'zoom-out' : 'zoom-in',
              maxWidth: actualSize ? 'none' : '100%',
              maxHeight: actualSize ? 'none' : captionText ? 'calc(100vh - 120px)' : 'calc(100vh - 84px)',
            }}
          />
        </div>
        {captionText && (
          <figcaption
            style={{
              flexShrink: 0,
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            {captionText}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
