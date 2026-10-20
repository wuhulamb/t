/**
 * 与 Astro 内容集合解耦的纯函数，方便单独测试。
 * 这里不要导入 astro:content，避免单元测试依赖 Astro 运行时。
 */

const DEFAULT_BASE = import.meta.env.BASE_URL || '/';
const DATE_TIME_ZONE = import.meta.env.PUBLIC_TIME_ZONE?.trim() || 'Asia/Shanghai';

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: DATE_TIME_ZONE,
});

const isoFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: DATE_TIME_ZONE,
});

export interface PostDataLike {
  createdAt: Date;
  title?: string;
  images?: string[];
  draft?: boolean;
}

export interface PostLike {
  id: string;
  data: PostDataLike;
}

/** 统一 base 的写法：根路径为 `/`，其余为 `/repo` 形式（不带尾斜杠）。 */
export function normalizeBase(base?: string): string {
  const value = (base ?? '/').trim();
  if (!value || value === '/') return '/';
  const trimmed = value.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `/${trimmed}` : '/';
}

/**
 * 给站内根路径加上 Astro base，兼容 GitHub Pages 项目页（/repo/）。
 * 外部链接、协议相对地址和锚点保持原样；已经带 base 的地址不会重复添加。
 */
export function withBase(path: string, base: string = DEFAULT_BASE): string {
  const normalizedBase = normalizeBase(base);
  if (!path) return normalizedBase === '/' ? '/' : `${normalizedBase}/`;
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//') || path.startsWith('#')) {
    return path;
  }

  const suffix = path.startsWith('/') ? path : `/${path}`;
  if (normalizedBase === '/') return suffix;
  if (suffix === normalizedBase || suffix.startsWith(`${normalizedBase}/`)) return suffix;
  return `${normalizedBase}${suffix}`;
}

/** 帖子详情页的站内路径（不含 base）。 */
export function postPath(id: string): string {
  const safeId = id
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `/posts/${safeId}/`;
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/** 生成与站点时区一致的 YYYY-MM-DD，用于 <time datetime>。 */
export function toDateISO(date: Date): string {
  const parts = isoFormatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getYear(date: Date): string {
  return toDateISO(date).slice(0, 4);
}

export function formatMonthDay(date: Date): string {
  const iso = toDateISO(date);
  return `${iso.slice(5, 7)}.${iso.slice(8, 10)}`;
}

export function getPostTitle(post: Pick<PostLike, 'data'>): string {
  const title = post.data.title?.trim();
  return title || `无标题 · ${formatDate(post.data.createdAt)}`;
}

export function isPublished(post: Pick<PostLike, 'data'>): boolean {
  return post.data.draft !== true;
}

/** 按创建时间倒序；时间相同时按 ID 排序，保证构建结果稳定。 */
export function sortPosts<T extends PostLike>(posts: readonly T[]): T[] {
  return [...posts].sort((a, b) => {
    const diff = b.data.createdAt.getTime() - a.data.createdAt.getTime();
    return diff !== 0 ? diff : a.id.localeCompare(b.id);
  });
}

/** 从 Markdown / HTML 中提取图片路径，用于避免正文图片和画廊重复展示。 */
export function extractImagePaths(markdown: string): string[] {
  const paths = new Set<string>();
  const markdownImage =
    /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  const htmlImage = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

  for (const match of markdown.matchAll(markdownImage)) {
    const value = (match[1] ?? match[2] ?? '').trim();
    if (value) paths.add(value);
  }
  for (const match of markdown.matchAll(htmlImage)) {
    const value = (match[1] ?? '').trim();
    if (value) paths.add(value);
  }

  return [...paths];
}

/** 把 Markdown 正文转换成适合列表展示的纯文本摘要。 */
export function getPostExcerpt(body: string, maxLength = 140): string {
  const plain = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+\.)\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const chars = Array.from(plain);
  if (chars.length <= maxLength) return plain;
  if (maxLength <= 1) return '…';
  return `${chars.slice(0, maxLength - 1).join('').trimEnd()}…`;
}
