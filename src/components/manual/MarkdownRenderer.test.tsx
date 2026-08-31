import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';

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
