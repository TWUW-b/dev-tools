import { describe, it, expect } from 'vitest';
import { parseTestCaseMd } from './parseTestCaseMd';

describe('parseTestCaseMd', () => {
  it('should parse basic markdown with domain, capability, and cases', () => {
    const md = `
---
domain: sample
---

# 基本表示
- ナビゲーションが表示される
- ボタンが表示される
`;

    const result = parseTestCaseMd(md);

    expect(result).toEqual([
      { domain: 'sample', capability: '基本表示', title: 'ナビゲーションが表示される' },
      { domain: 'sample', capability: '基本表示', title: 'ボタンが表示される' },
    ]);
  });

  it('should handle multiple capabilities', () => {
    const md = `
---
domain: auth
---

# ログイン
- ログインボタンが表示される
- エラー時にメッセージが表示される

# ログアウト
- ログアウトボタンが表示される
`;

    const result = parseTestCaseMd(md);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ domain: 'auth', capability: 'ログイン', title: 'ログインボタンが表示される' });
    expect(result[1]).toEqual({ domain: 'auth', capability: 'ログイン', title: 'エラー時にメッセージが表示される' });
    expect(result[2]).toEqual({ domain: 'auth', capability: 'ログアウト', title: 'ログアウトボタンが表示される' });
  });

  it('should ignore ## headings (visual grouping)', () => {
    const md = `
---
domain: test
---

# 表示
## 正常系
- 正常に表示される
## 異常系
- エラー表示される
`;

    const result = parseTestCaseMd(md);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('正常に表示される');
    expect(result[1].title).toBe('エラー表示される');
    // Both belong to same capability
    expect(result[0].capability).toBe('表示');
    expect(result[1].capability).toBe('表示');
  });

  it('should strip checkbox markers from cases', () => {
    const md = `
---
domain: test
---

# チェック
- [ ] 未完了タスク
- [x] 完了タスク
- 通常のケース
`;

    const result = parseTestCaseMd(md);

    expect(result).toEqual([
      { domain: 'test', capability: 'チェック', title: '未完了タスク' },
      { domain: 'test', capability: 'チェック', title: '完了タスク' },
      { domain: 'test', capability: 'チェック', title: '通常のケース' },
    ]);
  });

  it('should ignore cases before first capability', () => {
    const md = `
---
domain: test
---

- これは無視される

# 最初のCapability
- これは含まれる
`;

    const result = parseTestCaseMd(md);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('これは含まれる');
  });

  it('should handle empty domain', () => {
    const md = `
# 機能テスト
- テストケース
`;

    const result = parseTestCaseMd(md);

    expect(result).toEqual([
      { domain: '', capability: '機能テスト', title: 'テストケース' },
    ]);
  });

  it('should ignore empty case text', () => {
    const md = `
---
domain: test
---

# テスト
-
-
- 有効なケース
`;

    const result = parseTestCaseMd(md);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('有効なケース');
  });

  it('should return empty array for empty input', () => {
    expect(parseTestCaseMd('')).toEqual([]);
    expect(parseTestCaseMd('   ')).toEqual([]);
  });

  it('should handle frontmatter without domain', () => {
    const md = `
---
other: value
---

# テスト
- ケース
`;

    const result = parseTestCaseMd(md);

    expect(result).toEqual([
      { domain: '', capability: 'テスト', title: 'ケース' },
    ]);
  });

  it('should handle real-world sample', () => {
    const md = `
---
domain: sample
---

# S1 基本表示
## 表示
- ナビゲーションが表示される
- 「アプリ画面」ボタンが表示される
- 「管理画面」ボタンが表示される

# S2 デバッグモード
## 動作
- ?mode=debug でデバッグパネルが表示される
- パネルからバグ報告ができる
`;

    const result = parseTestCaseMd(md);

    expect(result).toHaveLength(5);
    expect(result.filter(r => r.capability === 'S1 基本表示')).toHaveLength(3);
    expect(result.filter(r => r.capability === 'S2 デバッグモード')).toHaveLength(2);
    expect(result.every(r => r.domain === 'sample')).toBe(true);
  });
});
