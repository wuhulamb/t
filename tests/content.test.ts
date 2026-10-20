import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { postFrontmatterSchema } from '../src/lib/content-schema';

const root = fileURLToPath(new URL('..', import.meta.url));
const postsDir = join(root, 'content', 'posts');
const publicDir = join(root, 'public');

interface ParsedPost {
  file: string;
  id: string;
  body: string;
  data: ReturnType<typeof postFrontmatterSchema.parse>;
}

async function readPosts(): Promise<ParsedPost[]> {
  const files = (await readdir(postsDir)).filter((file) => file.endsWith('.md')).sort();
  const posts: ParsedPost[] = [];

  for (const file of files) {
    const raw = await readFile(join(postsDir, file), 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
    expect(match, `${file} 缺少合法的 frontmatter`).not.toBeNull();

    const frontmatter = parse(match![1]) as unknown;
    const data = postFrontmatterSchema.parse(frontmatter);
    posts.push({
      file,
      id: file.replace(/\.md$/, ''),
      body: match![2].trim(),
      data,
    });
  }

  return posts;
}

const posts = await readPosts();

describe('content/posts', () => {
  it('contains at least one post', () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it('has unique IDs and filenames', () => {
    expect(new Set(posts.map((post) => post.data.id)).size).toBe(posts.length);
    expect(new Set(posts.map((post) => post.id)).size).toBe(posts.length);
  });

  it('has non-empty Markdown bodies', () => {
    for (const post of posts) {
      expect(post.body.length, post.file).toBeGreaterThan(0);
    }
  });

  it('references only existing image files', async () => {
    for (const post of posts) {
      expect(new Set(post.data.images).size, post.file).toBe(post.data.images.length);

      for (const image of post.data.images) {
        const filePath = join(publicDir, image.replace(/^\//, ''));
        await expect(access(filePath), `${post.file} -> ${image}`).resolves.toBeUndefined();
      }
    }
  });

  it('keeps body image paths inside public/uploads', () => {
    const imagePattern = /!\[[^\]]*\]\(([^)\s]+)/g;

    for (const post of posts) {
      for (const match of post.body.matchAll(imagePattern)) {
        const image = match[1];
        expect(image.startsWith('/uploads/'), `${post.file} -> ${image}`).toBe(true);
      }
    }
  });
});
