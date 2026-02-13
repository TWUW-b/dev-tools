/** Spinner（@keyframes 自己完結） */
export function Spinner({ size = 16, color }: { size?: number; color?: string }) {
  return (
    <>
      <span
        role="status"
        aria-label="読み込み中"
        style={{
          display: 'inline-block',
          width: `${size}px`,
          height: `${size}px`,
          border: `2px solid ${color || 'currentColor'}30`,
          borderTopColor: color || 'currentColor',
          borderRadius: '50%',
          animation: 'debug-notes-spin 0.6s linear infinite',
        }}
      />
      <style>{`@keyframes debug-notes-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

/** Material Icon */
export function Icon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: `${size}px`,
        color: color,
        lineHeight: 1,
        verticalAlign: 'middle',
      }}
    >
      {name}
    </span>
  );
}
