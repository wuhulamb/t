import { describe, expect, it } from 'vitest';
import { postFrontmatterSchema } from '../src/lib/content-schema';

const valid = {
  id: '41ffec43-0218-4777-9d9b-d610667a95c6',
  createdAt: '2026-10-18T07:20:00+08:00',
};

describe('postFrontmatterSchema', () => {
  it('accepts a minimal post and applies defaults', () => {
    const parsed = postFrontmatterSchema.parse(valid);
    expect(parsed.createdAt).toBeInstanceOf(Date);
    expect(parsed.images).toEqual([]);
    expect(parsed.draft).toBe(false);
    expect(parsed.title).toBeUndefined();
  });

  it('accepts an empty title and valid upload paths', () => {
    const parsed = postFrontmatterSchema.parse({
      ...valid,
      title: '   ',
      images: ['/uploads/2026/10/example-1.jpg'],
      draft: true,
    });
    expect(parsed.title).toBe('');
    expect(parsed.images).toEqual(['/uploads/2026/10/example-1.jpg']);
    expect(parsed.draft).toBe(true);
  });

  it('rejects invalid IDs', () => {
    expect(postFrontmatterSchema.safeParse({ ...valid, id: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects unsafe or unsupported image paths', () => {
    for (const path of [
      '/uploads/2026/10/../secret.jpg',
      '/uploads/2026/10/',
      '/uploads/2026/10/file name.jpg',
      'uploads/2026/10/file.jpg',
      'https://example.com/file.jpg',
    ]) {
      expect(
        postFrontmatterSchema.safeParse({ ...valid, images: [path] }).success,
        path,
      ).toBe(false);
    }
  });

  it('rejects too many images', () => {
    const images = Array.from(
      { length: 31 },
      (_, index) => `/uploads/2026/10/image-${index}.jpg`,
    );
    expect(postFrontmatterSchema.safeParse({ ...valid, images }).success).toBe(false);
  });

  it('rejects overlong titles', () => {
    expect(
      postFrontmatterSchema.safeParse({ ...valid, title: '长'.repeat(201) }).success,
    ).toBe(false);
  });
});
