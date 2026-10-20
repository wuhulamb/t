import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, sortPosts } from './posts';

export type Post = CollectionEntry<'posts'>;

/** 只返回可公开的帖子，并按时间倒序排列。 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => isPublished({ data }));
  return sortPosts(posts);
}

export async function getPublishedPost(id: string): Promise<Post | undefined> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.id === id);
}
