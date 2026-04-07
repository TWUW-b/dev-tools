import { describe, it, expect } from 'vitest';
import { parseEnvironmentsMd } from './parseEnvironmentsMd';

const SAMPLE = `---
title: アプリケーション アカウント情報
warning: 取り扱い注意
---

# 共通

## Basic認証

- user: demo_user
- pass: REDACTED_BASIC_AUTH

全環境共通で使用。

---

# trinos

phase: Phase 1

## dev / ルートアカウント

- url: https://d1example-dev.cloudfront.net/admin/login/
- email: admin@example.com
- pass: REDACTED_PASSWORD_ROOT_DEV

## dev / その他アカウント

| ロール | メール | パスワード |
|---|---|---|
| 閲覧 | viewer@example.com | REDACTED_PASSWORD_USER |
| 一般 | user@example.com | REDACTED_PASSWORD_USER |

## staging / ルートアカウント

- url: https://d2example-stg.cloudfront.net/admin/login/
- email: staging@example.com
- pass: REDACTED_PASSWORD_ROOT_STG

## 前提・注意点

- staging は毎週月曜リセット
- prod は書き込み厳禁
`;

describe('parseEnvironmentsMd', () => {
  const doc = parseEnvironmentsMd(SAMPLE);

  it('frontmatter を抽出する', () => {
    expect(doc.title).toBe('アプリケーション アカウント情報');
    expect(doc.warning).toBe('取り扱い注意');
  });

  it('プロジェクトを分解する', () => {
    expect(doc.projects.map(p => p.name)).toEqual(['共通', 'trinos']);
    expect(doc.projects[1].phase).toBe('Phase 1');
  });

  it('共通プロジェクトに Basic 認証が入る', () => {
    const common = doc.projects[0];
    expect(common.common).toHaveLength(1);
    expect(common.common[0].label).toBe('Basic認証');
    const kv = common.common[0].entries;
    expect(kv.find(e => e.key === 'user')?.value).toBe('demo_user');
    expect(kv.find(e => e.key === 'pass')?.kind).toBe('password');
    expect(common.common[0].extraMd).toMatch(/全環境共通/);
  });

  it('env 別セクションを分解する', () => {
    const trinos = doc.projects[1];
    const dev = trinos.envs.find(g => g.env === 'dev');
    expect(dev).toBeDefined();
    expect(dev!.sections.map(s => s.label)).toEqual(['ルートアカウント', 'その他アカウント']);
    const root = dev!.sections[0];
    expect(root.entries.find(e => e.key === 'url')?.kind).toBe('url');
    expect(root.entries.find(e => e.key === 'email')?.kind).toBe('email');
    expect(root.entries.find(e => e.key === 'pass')?.value).toBe('REDACTED_PASSWORD_ROOT_DEV');
  });

  it('テーブルを抽出する', () => {
    const others = doc.projects[1].envs.find(g => g.env === 'dev')!.sections[1];
    expect(others.table).toBeDefined();
    expect(others.table!.headers).toEqual(['ロール', 'メール', 'パスワード']);
    expect(others.table!.rows).toHaveLength(2);
    expect(others.table!.rows[0][1]).toBe('viewer@example.com');
  });

  it('staging が取れる', () => {
    const stg = doc.projects[1].envs.find(g => g.env === 'staging');
    expect(stg).toBeDefined();
    expect(stg!.sections[0].entries.find(e => e.key === 'email')?.value).toBe('staging@example.com');
  });

  it('notes セクションを抽出する', () => {
    expect(doc.projects[1].notes).toMatch(/前提・注意点/);
    expect(doc.projects[1].notes).toMatch(/staging は毎週月曜リセット/);
  });

  it('`## dev環境 ルートアカウント` 形式も解釈できる', () => {
    // ユーザー提示の元フォーマットの一部
    const md = `# trinos\n\n## dev環境\n\n- url: https://example.com\n- email: a@b.c\n- pass: xxx\n`;
    const d = parseEnvironmentsMd(md);
    const dev = d.projects[0].envs.find(g => g.env === 'dev');
    expect(dev).toBeDefined();
    expect(dev!.sections[0].entries).toHaveLength(3);
  });
});
