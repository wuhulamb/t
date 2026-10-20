export const siteConfig = {
  title: import.meta.env.PUBLIC_SITE_TITLE?.trim() || '拾光集',
  tagline: import.meta.env.PUBLIC_SITE_TAGLINE?.trim() || '把日常收进 Git',
  description:
    import.meta.env.PUBLIC_SITE_DESCRIPTION?.trim() ||
    '一个只记录文字与照片的个人角落。内容以 Markdown 和图片的形式保存在 Git 仓库中。',
  author: import.meta.env.PUBLIC_SITE_AUTHOR?.trim() || '',
  repoUrl: import.meta.env.PUBLIC_REPO_URL?.trim() || '',
};
