import { useMemo, useState, useCallback } from 'react';
import { MarkdownRenderer } from '../manual/MarkdownRenderer';
import { parseEnvironmentsMd } from '../../utils/parseEnvironmentsMd';
import { DEBUG_COLORS as COLORS } from '../../styles/colors';
import type {
  EnvironmentInfoDoc,
  EnvironmentProject,
  EnvironmentSection,
  EnvironmentKV,
} from '../../types';

interface EnvironmentTabProps {
  md: string;
}

export function EnvironmentTab({ md }: EnvironmentTabProps) {
  const doc = useMemo<EnvironmentInfoDoc>(() => parseEnvironmentsMd(md), [md]);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(doc.projects.map(p => p.name)),
  );

  const toggle = useCallback((name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  return (
    <div className="debug-env-tab">
      {doc.title && <h3 style={{ margin: '0 0 8px', fontSize: '14px' }}>{doc.title}</h3>}
      {doc.warning && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 10px',
            marginBottom: '10px',
            background: '#FEF3C7',
            border: '1px solid #FCD34D',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400E',
          }}
        >
          <span className="debug-icon" style={{ fontSize: '16px' }}>warning</span>
          <span>{doc.warning}</span>
        </div>
      )}
      {doc.preamble && (
        <div style={{ marginBottom: '10px', fontSize: '12px' }}>
          <MarkdownRenderer content={doc.preamble} />
        </div>
      )}

      {doc.projects.length === 0 && (
        <div className="debug-empty">環境情報が空です</div>
      )}

      {doc.projects.map(project => (
        <ProjectBlock
          key={project.name}
          project={project}
          isExpanded={expanded.has(project.name)}
          onToggle={() => toggle(project.name)}
        />
      ))}
    </div>
  );
}

function ProjectBlock({
  project,
  isExpanded,
  onToggle,
}: {
  project: EnvironmentProject;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const envNames = project.envs.map(g => g.env);
  const [activeEnv, setActiveEnv] = useState<string | null>(envNames[0] ?? null);

  return (
    <div
      style={{
        marginBottom: '10px',
        border: `1px solid ${COLORS.gray300}`,
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          width: '100%',
          padding: '8px 10px',
          background: COLORS.gray100,
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        <span className="debug-icon" style={{ fontSize: '18px' }}>
          {isExpanded ? 'expand_more' : 'chevron_right'}
        </span>
        <span>{project.name}</span>
        {project.phase && (
          <span
            style={{
              marginLeft: 'auto',
              padding: '1px 8px',
              background: COLORS.gray200,
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 400,
              color: COLORS.gray700,
            }}
          >
            {project.phase}
          </span>
        )}
      </button>

      {isExpanded && (
        <div style={{ padding: '8px 10px' }}>
          {project.common.map((section, i) => (
            <SectionBlock key={`common-${i}`} section={section} />
          ))}

          {project.envs.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '8px',
                  borderBottom: `1px solid ${COLORS.gray200}`,
                }}
              >
                {project.envs.map(group => (
                  <button
                    key={group.env}
                    type="button"
                    onClick={() => setActiveEnv(group.env)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom:
                        activeEnv === group.env
                          ? `2px solid ${COLORS.primary}`
                          : '2px solid transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: activeEnv === group.env ? 600 : 400,
                      color: activeEnv === group.env ? COLORS.primary : COLORS.gray700,
                    }}
                  >
                    {group.env}
                  </button>
                ))}
              </div>
              {project.envs
                .find(g => g.env === activeEnv)
                ?.sections.map((section, i) => (
                  <SectionBlock key={`${activeEnv}-${i}`} section={section} />
                ))}
            </>
          )}

          {project.notes && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: COLORS.gray700 }}>
                📝 前提・注意点
              </summary>
              <div style={{ marginTop: '6px', fontSize: '12px' }}>
                <MarkdownRenderer content={project.notes} />
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function SectionBlock({ section }: { section: EnvironmentSection }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: COLORS.gray700, marginBottom: '4px' }}>
        {section.label}
      </div>
      {section.entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {section.entries.map((entry, i) => (
            <KVRow key={i} entry={entry} />
          ))}
        </div>
      )}
      {section.table && (
        <div style={{ marginTop: '6px', overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '4px 6px',
                      borderBottom: `1px solid ${COLORS.gray300}`,
                      textAlign: 'left',
                      background: COLORS.gray100,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell
                      key={ci}
                      value={cell}
                      header={section.table!.headers[ci] ?? ''}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.extraMd && (
        <div style={{ marginTop: '6px', fontSize: '12px' }}>
          <MarkdownRenderer content={section.extraMd} />
        </div>
      )}
    </div>
  );
}

function KVRow({ entry }: { entry: EnvironmentKV }) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = entry.kind === 'password';
  const displayValue = isPassword && !revealed ? '•'.repeat(Math.min(entry.value.length, 10)) : entry.value;

  const icon =
    entry.kind === 'url' ? 'link' :
    entry.kind === 'email' ? 'mail' :
    entry.kind === 'password' ? 'key' :
    entry.kind === 'user' ? 'person' : 'label';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 6px',
        background: '#F9FAFB',
        borderRadius: '4px',
        fontSize: '12px',
      }}
    >
      <span className="debug-icon" style={{ fontSize: '14px', color: COLORS.gray500 }}>{icon}</span>
      <span style={{ minWidth: '60px', color: COLORS.gray700 }}>{entry.key}</span>
      <span
        style={{
          flex: 1,
          fontFamily: entry.kind === 'password' || entry.kind === 'user' ? 'monospace' : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {displayValue}
      </span>
      {isPassword && (
        <button
          type="button"
          onClick={() => setRevealed(r => !r)}
          title={revealed ? '隠す' : '表示'}
          style={iconBtnStyle}
        >
          <span className="debug-icon" style={{ fontSize: '14px' }}>
            {revealed ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      )}
      {entry.kind === 'url' && (
        <button
          type="button"
          onClick={() => window.open(entry.value, '_blank', 'noopener')}
          title="開く"
          style={iconBtnStyle}
        >
          <span className="debug-icon" style={{ fontSize: '14px' }}>open_in_new</span>
        </button>
      )}
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(entry.value)}
        title="コピー"
        style={iconBtnStyle}
      >
        <span className="debug-icon" style={{ fontSize: '14px' }}>content_copy</span>
      </button>
    </div>
  );
}

function TableCell({ value, header }: { value: string; header: string }) {
  const isPassword = /pass|pwd|パスワード/i.test(header);
  const isUrl = /^https?:\/\//.test(value);
  const isEmail = /^[^\s@]+@[^\s@]+$/.test(value);
  const [revealed, setRevealed] = useState(false);
  const display = isPassword && !revealed ? '•'.repeat(Math.min(value.length, 10)) : value;

  return (
    <td
      style={{
        padding: '4px 6px',
        borderBottom: `1px solid ${COLORS.gray200}`,
        fontFamily: isPassword ? 'monospace' : 'inherit',
        wordBreak: 'break-all',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {isUrl ? (
          <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, flex: 1 }}>
            {value}
          </a>
        ) : isEmail ? (
          <span style={{ flex: 1 }}>{value}</span>
        ) : (
          <span style={{ flex: 1 }}>{display}</span>
        )}
        {isPassword && (
          <button type="button" onClick={() => setRevealed(r => !r)} style={iconBtnStyle} title={revealed ? '隠す' : '表示'}>
            <span className="debug-icon" style={{ fontSize: '12px' }}>{revealed ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(value)}
          style={iconBtnStyle}
          title="コピー"
        >
          <span className="debug-icon" style={{ fontSize: '12px' }}>content_copy</span>
        </button>
      </div>
    </td>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  color: COLORS.gray500,
  display: 'inline-flex',
  alignItems: 'center',
};
