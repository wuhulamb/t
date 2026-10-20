import { describe, expect, it } from 'vitest';
import { prefixBase, rehypeBasePaths } from '../src/lib/rehype-base-paths.mjs';

describe('prefixBase', () => {
  it('leaves root-base and external URLs unchanged', () => {
    expect(prefixBase('/uploads/a.jpg', '/')).toBe('/uploads/a.jpg');
    expect(prefixBase('https://example.com/a.jpg', '/repo')).toBe(
      'https://example.com/a.jpg',
    );
    expect(prefixBase('//cdn.example.com/a.jpg', '/repo')).toBe(
      '//cdn.example.com/a.jpg',
    );
  });

  it('prefixes internal paths and avoids double prefixes', () => {
    expect(prefixBase('/uploads/a.jpg', '/repo')).toBe('/repo/uploads/a.jpg');
    expect(prefixBase('/', '/repo')).toBe('/repo/');
    expect(prefixBase('/repo/uploads/a.jpg', '/repo')).toBe('/repo/uploads/a.jpg');
    expect(prefixBase('/repo', '/repo')).toBe('/repo');
  });
});

describe('rehypeBasePaths', () => {
  it('rewrites image and link attributes in the HAST tree', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: '/uploads/2026/10/a.jpg', alt: 'a' },
          children: [],
        },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: '/posts/demo/' },
          children: [],
        },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'https://example.com/' },
          children: [],
        },
      ],
    };

    rehypeBasePaths({ base: '/repo' })(tree);

    expect(tree.children[0].properties.src).toBe('/repo/uploads/2026/10/a.jpg');
    expect(tree.children[1].properties.href).toBe('/repo/posts/demo/');
    expect(tree.children[2].properties.href).toBe('https://example.com/');
  });

  it('does not rewrite anything when base is root', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'img',
          properties: { src: '/uploads/a.jpg' },
          children: [],
        },
      ],
    };
    rehypeBasePaths({ base: '/' })(tree);
    expect(tree.children[0].properties.src).toBe('/uploads/a.jpg');
  });
});
