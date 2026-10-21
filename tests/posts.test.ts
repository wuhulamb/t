import { describe, expect, it } from 'vitest';
import {
  extractImagePaths,
  formatDate,
  formatDateTime,
  formatMonthDay,
  getPostExcerpt,
  getPostTitle,
  getYear,
  normalizeBase,
  postPath,
  sortPosts,
  toDateISO,
  withBase,
} from '../src/lib/posts';

describe('normalizeBase / withBase', () => {
  it('normalizes base paths', () => {
    expect(normalizeBase(undefined)).toBe('/');
    expect(normalizeBase('')).toBe('/');
    expect(normalizeBase('/')).toBe('/');
    expect(normalizeBase('repo')).toBe('/repo');
    expect(normalizeBase('/repo/')).toBe('/repo');
    expect(normalizeBase('///repo///')).toBe('/repo');
  });

  it('keeps root paths unchanged when base is root', () => {
    expect(withBase('/uploads/a.jpg', '/')).toBe('/uploads/a.jpg');
    expect(withBase('/', '/')).toBe('/');
  });

  it('prefixes project-page paths', () => {
    expect(withBase('/uploads/2026/10/a.jpg', '/repo')).toBe('/repo/uploads/2026/10/a.jpg');
    expect(withBase('/', '/repo')).toBe('/repo/');
    expect(withBase('/posts/demo/', '/repo/')).toBe('/repo/posts/demo/');
  });

  it('does not double-prefix or rewrite external URLs', () => {
    expect(withBase('/repo/uploads/a.jpg', '/repo')).toBe('/repo/uploads/a.jpg');
    expect(withBase('https://example.com/a.jpg', '/repo')).toBe('https://example.com/a.jpg');
    expect(withBase('//cdn.example.com/a.jpg', '/repo')).toBe('//cdn.example.com/a.jpg');
    expect(withBase('mailto:me@example.com', '/repo')).toBe('mailto:me@example.com');
    expect(withBase('#content', '/repo')).toBe('#content');
  });
});

describe('postPath', () => {
  it('builds stable post URLs and encodes segments', () => {
    expect(postPath('2026-10-18-morning-light')).toBe('/posts/2026-10-18-morning-light/');
    expect(postPath('folder/hello world')).toBe('/posts/folder/hello%20world/');
  });
});

describe('date formatting', () => {
  const date = new Date('2026-10-18T07:20:00+08:00');

  it('formats dates in Asia/Shanghai', () => {
    expect(formatDate(date)).toBe('2026年10月18日');
    expect(formatDateTime(date)).toBe('2026年10月18日 07:20');
    expect(toDateISO(date)).toBe('2026-10-18');
    expect(getYear(date)).toBe('2026');
    expect(formatMonthDay(date)).toBe('10.18');
  });

  it('uses Asia/Shanghai at the day boundary', () => {
    const lateUtc = new Date('2026-10-17T18:30:00Z');
    expect(toDateISO(lateUtc)).toBe('2026-10-18');
    expect(formatDateTime(lateUtc)).toBe('2026年10月18日 02:30');
  });
});

describe('post presentation helpers', () => {
  const date = new Date('2026-10-08T21:10:00+08:00');

  it('falls back to a dated title when title is empty', () => {
    expect(getPostTitle({ data: { createdAt: date } })).toBe('无标题 · 2026年10月8日');
    expect(getPostTitle({ data: { createdAt: date, title: '   ' } })).toBe(
      '无标题 · 2026年10月8日',
    );
    expect(getPostTitle({ data: { createdAt: date, title: '手记' } })).toBe('手记');
  });

  it('sorts newest first without mutating the input', () => {
    const posts = [
      { id: 'b', data: { createdAt: new Date('2026-10-01T00:00:00Z') } },
      { id: 'a', data: { createdAt: new Date('2026-10-03T00:00:00Z') } },
      { id: 'c', data: { createdAt: new Date('2026-10-03T00:00:00Z') } },
    ];
    const sorted = sortPosts(posts);
    expect(sorted.map((post) => post.id)).toEqual(['a', 'c', 'b']);
    expect(posts.map((post) => post.id)).toEqual(['b', 'a', 'c']);
  });
});

describe('extractImagePaths', () => {
  it('finds Markdown and HTML images', () => {
    const markdown = [
      '![封面](/uploads/2026/10/cover.jpg)',
      '![带标题](/uploads/2026/10/title.jpg "标题")',
      '<img src="/uploads/2026/10/html.jpg" alt="html">',
      '![外部](https://example.com/a.jpg)',
      '普通段落',
    ].join('\n\n');

    expect(extractImagePaths(markdown)).toEqual([
      '/uploads/2026/10/cover.jpg',
      '/uploads/2026/10/title.jpg',
      'https://example.com/a.jpg',
      '/uploads/2026/10/html.jpg',
    ]);
  });

  it('deduplicates repeated images', () => {
    expect(
      extractImagePaths(
        '![a](/uploads/2026/10/a.jpg)\n\n![b](/uploads/2026/10/a.jpg)',
      ),
    ).toEqual(['/uploads/2026/10/a.jpg']);
  });
});

describe('getPostExcerpt', () => {
  it('strips Markdown syntax and collapses whitespace', () => {
    const body = [
      '# 标题',
      '',
      '这是一段**正文**，包含 `inline code` 和[链接](/posts/demo/)。',
      '',
      '![图片](/uploads/2026/10/a.jpg)',
      '',
      '> 引用内容',
      '',
      '```js',
      'const secret = "code";',
      '```',
    ].join('\n');

    const excerpt = getPostExcerpt(body, 80);
    expect(excerpt).toContain('标题');
    expect(excerpt).toContain('这是一段正文');
    expect(excerpt).toContain('inline code');
    expect(excerpt).toContain('链接');
    expect(excerpt).not.toContain('![');
    expect(excerpt).not.toContain('```');
    expect(excerpt).not.toContain('const secret');
  });

  it('truncates long text by code point and appends an ellipsis', () => {
    const excerpt = getPostExcerpt('一二三四五六七八九十', 6);
    expect(excerpt).toBe('一二三四五…');
    expect(Array.from(excerpt)).toHaveLength(6);
  });

  it('returns empty text for an image-only body', () => {
    expect(getPostExcerpt('![图](/uploads/2026/10/a.jpg)')).toBe('');
  });
});
