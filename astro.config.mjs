import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { rehypeBasePaths } from './src/lib/rehype-base-paths.mjs';

function normalizeBase(value) {
  const base = (value ?? '/').trim();
  if (!base || base === '/') return '/';
  const trimmed = base.replace(/^\/+/, '').replace(/\/+$/, '');
  return trimmed ? `/${trimmed}` : '/';
}

/**
 * GitHub Pages 项目页部署在 /<repo>/ 下，因此 base 由 CI 通过 BASE_PATH 传入。
 * 本地开发或 <user>.github.io 仓库使用根路径。
 */
const base = normalizeBase(process.env.BASE_PATH);
const site = process.env.SITE_URL?.trim() || 'http://localhost:4321';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    processor: unified({
      rehypePlugins: base === '/' ? [] : [[rehypeBasePaths, { base }]],
    }),
  },
});
