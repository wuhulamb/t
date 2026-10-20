import { z } from 'astro/zod';

/**
 * 图片必须位于 public/uploads/YYYY/MM/ 下。
 * 这里同时限制了路径穿越、协议和查询字符串，保证 Markdown 中的图片路径稳定可迁移。
 */
export const uploadPathSchema = z
  .string()
  .max(200, '图片路径过长')
  .regex(
    /^\/uploads\/\d{4}\/\d{2}\/[A-Za-z0-9][A-Za-z0-9._-]*$/,
    '图片路径必须是 /uploads/YYYY/MM/文件名，且文件名只能包含字母、数字、点、下划线和连字符',
  );

export const postFrontmatterSchema = z.object({
  /** 稳定且唯一的帖子 ID，建议使用 UUID。 */
  id: z.uuid('帖子 ID 必须是 UUID'),
  /** 标题可以为空；为空时网站使用“无标题 · 日期”作为展示标题。 */
  title: z.string().trim().max(200, '标题不能超过 200 个字符').optional(),
  /** 创建时间，支持 ISO 8601 字符串。 */
  createdAt: z.coerce.date(),
  /** 最近更新时间，可选。 */
  updatedAt: z.coerce.date().optional(),
  /** 图片路径列表，按展示顺序排列。 */
  images: z.array(uploadPathSchema).max(30, '单篇帖子最多 30 张图片').default([]),
  /** 草稿不会出现在构建产物中。 */
  draft: z.boolean().default(false),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
