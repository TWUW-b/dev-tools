import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useManualHeadings } from '../../hooks/useManualHeadings';
import { renderHook, act } from '@testing-library/react';

/**
 * app リンク (アプリ画面遷移) の解決テスト。
 *
 * 回帰の経緯: マニュアル本文で生 HTML `<a href="app:/properties">` と書くと、
 * react-markdown の defaultUrlTransform が未知スキームとみなして href を空文字に
 * 落としていた。その結果 app 分岐に入らず「外部リンク」フォールバック
 * (`<a href="" target="_blank">`) になり、クリックすると新しいタブが開いた上に
 * 空 href が SPA のルートへ解決され、まったく別の画面に飛んでいた。
 */
describe('MarkdownRenderer app リンク', () => {
  it('生 HTML の app: リンクをクリックすると onAppLinkClick にパスが渡る', () => {
    const onAppLinkClick = vi.fn();
    render(
      <MarkdownRenderer
        content={'<div>左メニュー <a href="app:/properties">物件管理</a> を開く</div>'}
        onAppLinkClick={onAppLinkClick}
      />
    );

    fireEvent.click(screen.getByText('物件管理'));

    expect(onAppLinkClick).toHaveBeenCalledWith('/properties');
  });

  it('生 HTML の app: リンクは新しいタブを開くリンクにならない', () => {
    render(
      <MarkdownRenderer
        content={'<div><a href="app:/properties">物件管理</a></div>'}
        onAppLinkClick={vi.fn()}
      />
    );

    const link = screen.getByText('物件管理');
    expect(link.tagName).toBe('SPAN');
    expect(link).not.toHaveAttribute('target');
  });

  it('Markdown 記法の app: リンクも同じく onAppLinkClick に渡る', () => {
    const onAppLinkClick = vi.fn();
    render(
      <MarkdownRenderer content={'[顧客管理](app:/customers) を開く'} onAppLinkClick={onAppLinkClick} />
    );

    fireEvent.click(screen.getByText('顧客管理'));

    expect(onAppLinkClick).toHaveBeenCalledWith('/customers');
  });

  it('useManualLoader が変換した #app: 形式も同じパスに解決される', () => {
    const onAppLinkClick = vi.fn();
    render(
      <MarkdownRenderer content={'[顧客管理](#app:/customers) を開く'} onAppLinkClick={onAppLinkClick} />
    );

    fireEvent.click(screen.getByText('顧客管理'));

    expect(onAppLinkClick).toHaveBeenCalledWith('/customers');
  });

  it('.md リンクは onLinkClick で処理される', () => {
    const onLinkClick = vi.fn();
    render(<MarkdownRenderer content={'[関連](property-images.md)'} onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByText('関連'));

    expect(onLinkClick).toHaveBeenCalledWith('property-images.md');
  });

  it('外部リンクは新しいタブで開く', () => {
    render(<MarkdownRenderer content={'[公式](https://example.com)'} />);

    const link = screen.getByText('公式');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('javascript: スキームは従来どおり除去される', () => {
    render(<MarkdownRenderer content={'<a href="javascript:alert(1)">危険</a>'} />);

    expect(screen.getByText('危険')).toHaveAttribute('href', '');
  });
});

/**
 * 本文中の画像のクリック拡大（ライトボックス）。
 *
 * マニュアルの画像はスクリーンショットが主で、本文の幅に収まった状態では
 * 画面内の文字が読めない。クリックで拡大できるようにした（v1.4.12）。
 */
describe('MarkdownRenderer 画像の拡大表示', () => {
  const md = '![物件一覧の画面](/img/properties.png)';

  it('画像自身がクリック対象になり、ラッパー要素は増えない', () => {
    // ホストのマニュアル CSS は `.manual-shot img { width: 100% }` のように
    // 「コンテナの直下の img」を前提に書かれている。間に要素を挟むと画像の幅が変わり、
    // 画像に重ねた注記マーカーの位置がずれるため、DOM 構造を変えないことを固定する。
    const { container } = render(<MarkdownRenderer content={md} />);

    const zoom = screen.getByRole('button', { name: '物件一覧の画面（クリックで拡大）' });
    expect(zoom.tagName).toBe('IMG');
    expect(zoom).toHaveAttribute('src', '/img/properties.png');
    expect(zoom.parentElement?.tagName).toBe('P');
    expect(container.querySelectorAll('.manual-markdown p > *')).toHaveLength(1);
  });

  it('クリックすると拡大ダイアログに同じ画像が表示される', () => {
    render(<MarkdownRenderer content={md} />);

    fireEvent.click(screen.getByRole('button', { name: '物件一覧の画面（クリックで拡大）' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', '/img/properties.png');
  });

  it('Escape で拡大ダイアログが閉じる', () => {
    render(<MarkdownRenderer content={md} />);
    fireEvent.click(screen.getByRole('button', { name: '物件一覧の画面（クリックで拡大）' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('背景クリックで拡大ダイアログが閉じる', () => {
    render(<MarkdownRenderer content={md} />);
    fireEvent.click(screen.getByRole('button', { name: '物件一覧の画面（クリックで拡大）' }));

    fireEvent.click(screen.getByRole('dialog'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('閉じると元の画像へフォーカスが戻る', () => {
    render(<MarkdownRenderer content={md} />);
    const zoom = screen.getByRole('button', { name: '物件一覧の画面（クリックで拡大）' });
    zoom.focus();
    fireEvent.click(zoom);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(zoom).toHaveFocus();
  });

  it('生 HTML の img に書いた class / style は失われない', () => {
    render(
      <MarkdownRenderer content={'<img src="/img/a.png" alt="図" class="shot-img" style="border:1px solid red">'} />
    );

    const img = screen.getByRole('button', { name: '図（クリックで拡大）' });
    expect(img).toHaveClass('shot-img');
    expect(img).toHaveStyle({ border: '1px solid red' });
  });

  it('画像に重ねた注記は拡大表示にも同じ位置で複製される', () => {
    render(
      <MarkdownRenderer
        content={
          '<div class="manual-shot"><img src="/img/step.png" alt="保存ボタン">' +
          '<div class="manual-mark" style="position:absolute;left:5.5%;top:76%"></div></div>'
        }
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '保存ボタン（クリックで拡大）' }));

    const mark = screen.getByRole('dialog').querySelector('.manual-mark');
    expect(mark).not.toBeNull();
    expect(mark).toHaveStyle({ left: '5.5%', top: '76%' });
  });

  it('別ウィンドウ（PiP）へ描画されても、その document の Escape で閉じる', () => {
    // ManualPiP は Document Picture-in-Picture の別ウィンドウへ描画される。
    // window / document を直接掴むと、PiP 側のキー操作を拾えない。
    // 別 document（実際の PiP と同じく window を持つもの）として iframe を使う
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    const pipDoc = frame.contentDocument as Document;
    const container = pipDoc.createElement('div');
    pipDoc.body.appendChild(container);

    render(<MarkdownRenderer content={md} />, { container, baseElement: pipDoc.body });

    const zoom = pipDoc.querySelector('img[data-zoomable]') as HTMLImageElement;
    fireEvent.click(zoom);
    expect(pipDoc.querySelector('[role="dialog"]')).not.toBeNull();

    fireEvent.keyDown(pipDoc, { key: 'Escape' });

    expect(pipDoc.querySelector('[role="dialog"]')).toBeNull();
    frame.remove();
  });

  it('リンクの中の画像はリンク遷移を優先し、拡大しない', () => {
    render(<MarkdownRenderer content={'[![図](/img/a.png)](https://example.com)'} />);

    fireEvent.click(screen.getByRole('button', { name: '図（クリックで拡大）' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disableImageZoom を指定すると画像はそのまま表示される', () => {
    render(<MarkdownRenderer content={md} disableImageZoom />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img/properties.png');
    expect(img).not.toHaveAttribute('data-zoomable');

    fireEvent.click(img);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

/**
 * 本文中のアイコン表示（v1.5.0）。
 *
 * アプリ本体が使っているアイコン（lucide 等の React コンポーネント）を、
 * SVG をマニュアルへコピーせずにそのまま出せるようにするための仕組み。
 */
describe('MarkdownRenderer 本文中のアイコン', () => {
  const icons = {
    building: <span data-testid="icon-building">🏢</span>,
    users: <span data-testid="icon-users">👥</span>,
  };

  it('<app-icon> が渡したノードに置き換わる', () => {
    render(
      <MarkdownRenderer
        content={'<app-icon name="building"></app-icon> 新しい物件情報が入ったとき'}
        icons={icons}
      />
    );

    expect(screen.getByTestId('icon-building')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-users')).not.toBeInTheDocument();
  });

  it('見出しの中でも置き換わる', () => {
    const { container } = render(
      <MarkdownRenderer content={'## <app-icon name="building"></app-icon> 物件'} icons={icons} />
    );

    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2?.querySelector('[data-testid="icon-building"]')).not.toBeNull();
  });

  it('未登録の name / icons 未指定では何も描画しない', () => {
    const { container } = render(
      <MarkdownRenderer content={'<app-icon name="unknown"></app-icon>テキスト'} icons={icons} />
    );

    expect(container.querySelector('.manual-icon')).toBeNull();
    expect(container.textContent).toContain('テキスト');
  });

  it('既定では装飾扱い（aria-hidden）、label 指定時は読み上げ対象になる', () => {
    const { container, rerender } = render(
      <MarkdownRenderer content={'<app-icon name="building"></app-icon>'} icons={icons} />
    );
    expect(container.querySelector('.manual-icon')).toHaveAttribute('aria-hidden', 'true');

    rerender(
      <MarkdownRenderer content={'<app-icon name="building" label="物件"></app-icon>'} icons={icons} />
    );
    expect(screen.getByRole('img', { name: '物件' })).toBeInTheDocument();
  });

  it('アイコンサイズの画像は拡大表示の対象にしない', () => {
    const { container } = render(
      <MarkdownRenderer content={'<img src="/icons/building.svg" alt="物件" width="18" height="18">'} />
    );

    const img = container.querySelector('img');
    expect(img).not.toHaveAttribute('data-zoomable');
    fireEvent.click(img!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('data-no-zoom を付けた画像は拡大表示の対象にしない', () => {
    const { container } = render(
      <MarkdownRenderer content={'<img src="/img/a.png" alt="図" data-no-zoom>'} />
    );

    expect(container.querySelector('img')).not.toHaveAttribute('data-zoomable');
  });

  it('サイズ指定が大きい画像は従来どおり拡大できる', () => {
    const { container } = render(
      <MarkdownRenderer content={'<img src="/img/a.png" alt="図" width="640" height="400">'} />
    );

    expect(container.querySelector('img')).toHaveAttribute('data-zoomable', 'true');
  });
});

/**
 * 本文側（rehype-slug）と目次側（useManualHeadings）の id が一致することを、
 * 実際に両方を動かして突き合わせる。アイコンを見出しに入れても目次から
 * ジャンプできることの最終的な保証。
 */
describe('見出し id の本文・目次間の一致', () => {
  const cases = [
    '## 手順',
    '## <app-icon name="building"></app-icon> 新しい物件情報が入ったとき',
    '## ![](/icons/building.svg) 物件',
    '## **太字** の見出し',
    '## [リンク](other.md) つき見出し',
  ];

  it.each(cases)('%s', async (markdown) => {
    const { container } = render(<MarkdownRenderer content={markdown} />);
    const renderedId = container.querySelector('h2')?.id;

    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve(markdown) });
    const { result } = renderHook(() => useManualHeadings());
    await act(async () => {
      await result.current.loadHeadings('/docs/parity.md');
    });
    const tocId = result.current.getHeadings('/docs/parity.md')?.[0]?.id;

    expect(tocId).toBe(renderedId);
  });
});
