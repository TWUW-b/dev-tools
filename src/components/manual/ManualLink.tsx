import type { MouseEvent } from 'react';
import type { ManualLinkProps } from '../../types';

/**
 * マニュアルへのリンクコンポーネント
 *
 * クリック時にonClickハンドラを呼び出し、
 * 呼び出し側でPiP表示や別タブ表示を制御できる
 */
export function ManualLink({
  path,
  onClick,
  children,
  className = '',
}: ManualLinkProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    onClick(path);
  };

  return (
    <a
      href={path}
      onClick={handleClick}
      className={`manual-link ${className}`}
      style={{
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer',
      }}
    >
      {children}
    </a>
  );
}
