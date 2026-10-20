import { visit } from 'unist-util-visit';

function normalizeBase(value) {
  const base = (value ?? '/').trim();
  if (!base || base === '/') return '/';
  const trimmed = base.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `/${trimmed}` : '/';
}

/** 给 Markdown 渲染出的站内根路径加上 GitHub Pages base。 */
export function prefixBase(value, base) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return value;
  }

  const normalizedBase = normalizeBase(base);
  if (normalizedBase === '/') return value;
  if (value === normalizedBase || value.startsWith(`${normalizedBase}/`)) return value;
  if (value === '/') return `${normalizedBase}/`;
  return `${normalizedBase}${value}`;
}

/**
 * 帖子里的 Markdown 图片按约定写成 `/uploads/YYYY/MM/name.jpg`。
 * 部署到 `https://user.github.io/repo/` 时，实际地址需要变成
 * `/repo/uploads/YYYY/MM/name.jpg`。这个插件只处理站点内的路径，
 * 不会修改 http(s)、mailto、协议相对地址或锚点。
 */
export function rehypeBasePaths(options = {}) {
  const base = normalizeBase(options.base);
  return (tree) => {
    if (base === '/') return;
    visit(tree, 'element', (node) => {
      if (!node.properties) return;
      if (node.tagName === 'a' && 'href' in node.properties) {
        node.properties.href = prefixBase(node.properties.href, base);
      }
      if (node.tagName === 'img' && 'src' in node.properties) {
        node.properties.src = prefixBase(node.properties.src, base);
      }
    });
  };
}
