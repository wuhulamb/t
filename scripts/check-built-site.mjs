import { access, readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const dist = join(root, 'dist');
const postsDir = join(root, 'content', 'posts');

function normalizeBase(value) {
  const base = (value ?? '/').trim();
  if (!base || base === '/') return '/';
  const trimmed = base.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `/${trimmed}` : '/';
}

const base = normalizeBase(process.env.BASE_PATH);
const basePrefix = base === '/' ? '' : base;

function fail(message) {
  throw new Error(message);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function distPathForUrl(url) {
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);

  if (base !== '/') {
    if (clean === base) {
      return join(dist, 'index.html');
    }
    if (!clean.startsWith(`${base}/`)) {
      fail(`站内链接没有包含 base (${base}): ${url}`);
    }
  }

  let pathname = base === '/' ? clean : clean.slice(base.length);
  pathname = pathname.replace(/^\/+/, '');

  if (!pathname) return join(dist, 'index.html');
  return pathname.endsWith('/')
    ? join(dist, pathname, 'index.html')
    : join(dist, pathname);
}

function collectInternalUrls(html) {
  const urls = new Set();
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const url = match[1];
    if (
      !url.startsWith('/') ||
      url.startsWith('//') ||
      url.startsWith('#') ||
      /^[a-z][a-z\d+.-]*:/i.test(url)
    ) {
      continue;
    }
    urls.add(url);
  }
  return [...urls];
}

function stripMarkdown(text) {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = (await readdir(postsDir)).filter((file) => file.endsWith('.md')).sort();
const published = [];

for (const file of files) {
  const raw = await readFile(join(postsDir, file), 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) fail(`${file}: 缺少合法的 frontmatter`);

  const data = parse(match[1]) ?? {};
  if (data.draft === true) continue;

  published.push({
    file,
    id: file.replace(/\.md$/, ''),
    title: typeof data.title === 'string' ? data.title.trim() : '',
    images: Array.isArray(data.images) ? data.images : [],
    body: match[2].trim(),
  });
}

const indexPath = join(dist, 'index.html');
if (!(await exists(indexPath))) fail('dist/index.html 不存在，请先运行 npm run build');
const indexHtml = await readFile(indexPath, 'utf8');
if (!indexHtml.includes('id="image-lightbox"')) {
  fail('首页缺少图片灯箱组件');
}

const internalUrls = new Set();
let checkedImages = 0;
let checkedPosts = 0;

for (const post of published) {
  const postUrl = `${basePrefix}/posts/${post.id}/`;
  if (!indexHtml.includes(`href="${postUrl}"`)) {
    fail(`首页缺少帖子链接: ${postUrl}`);
  }

  const postFile = distPathForUrl(postUrl);
  if (!(await exists(postFile))) {
    fail(`帖子页面不存在: ${relative(root, postFile)}`);
  }

  const postHtml = await readFile(postFile, 'utf8');
  if (!postHtml.includes('id="image-lightbox"')) {
    fail(`帖子页面缺少图片灯箱组件: ${post.id}`);
  }
  const firstText =
    post.body
      .split(/\n\s*\n/)
      .map(stripMarkdown)
      .find((paragraph) => paragraph.length > 0) ?? '';

  if (firstText && !postHtml.includes(firstText.slice(0, 12))) {
    fail(`帖子正文没有出现在页面中: ${post.id}`);
  }

  for (const image of post.images) {
    const imageUrl = `${basePrefix}${image}`;
    if (!postHtml.includes(`src="${imageUrl}"`)) {
      fail(`帖子页面没有引用图片: ${post.id} -> ${imageUrl}`);
    }

    const imageFile = distPathForUrl(imageUrl);
    if (!(await exists(imageFile))) {
      fail(`构建产物中缺少图片: ${relative(root, imageFile)}`);
    }
    checkedImages += 1;
  }

  for (const url of collectInternalUrls(postHtml)) {
    internalUrls.add(url);
  }
  checkedPosts += 1;
}

for (const url of collectInternalUrls(indexHtml)) {
  internalUrls.add(url);
}

const archiveUrl = `${basePrefix}/posts/`;
const archiveHtml = await readFile(distPathForUrl(archiveUrl), 'utf8');
for (const post of published) {
  if (!archiveHtml.includes(`href="${basePrefix}/posts/${post.id}/"`)) {
    fail(`归档页缺少帖子链接: ${post.id}`);
  }
}
internalUrls.add(archiveUrl);

for (const url of collectInternalUrls(archiveHtml)) {
  internalUrls.add(url);
}

if (!(await exists(join(dist, '404.html')))) {
  fail('dist/404.html 不存在');
}

for (const url of internalUrls) {
  const file = distPathForUrl(url);
  if (!(await exists(file))) {
    fail(`站内链接指向不存在的文件: ${url} -> ${relative(root, file)}`);
  }
}

const distPostDirs = (await readdir(join(dist, 'posts'), { withFileTypes: true })).filter(
  (entry) => entry.isDirectory(),
);
if (distPostDirs.length !== published.length) {
  fail(
    `帖子数量不一致：内容目录 ${published.length} 篇，构建产物 ${distPostDirs.length} 篇`,
  );
}

console.log('构建产物检查通过');
console.log(`  base: ${base}`);
console.log(`  帖子: ${checkedPosts} 篇`);
console.log(`  图片: ${checkedImages} 张`);
console.log(`  站内链接: ${internalUrls.size} 个`);
