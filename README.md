# 拾光集 · 个人图文存档网站

> 当前进度：**第一阶段已完成**（Astro 静态网站 + GitHub Actions + GitHub Pages）。
> 本仓库只包含 Astro 网站。Cloudflare Worker 和 Android App 会作为独立项目开发，目前尚未开始。

这是一个只给自己使用的图文归档网站。帖子以 Markdown 保存，图片放在 `public/uploads/` 中，Astro 在构建时生成静态页面，GitHub Actions 自动部署到 GitHub Pages。后续 Cloudflare Worker 会写入 `content/posts/` 和 `public/uploads/YYYY/MM/`。

本文件中的命令都在仓库根目录执行。

- 仓库：https://github.com/wuhulamb/t
- 网站：https://wuhulamb.github.io/t/

## 1. 第一阶段包含什么

- Astro 7 静态网站，Markdown 内容集合。
- 首页帖子列表、全部归档页、帖子详情页、404 页面。
- 多图展示：列表封面、详情页图片网格、正文内嵌图片。
- 详情页显示 Asia/Shanghai 日期时间；列表卡片和归档显示每篇正文字符数。
- 标题为空时自动使用“无标题 · 日期”作为展示标题。
- 响应式布局、浅色/深色模式、打印样式、基础 SEO/Open Graph 标签。
- 兼容 GitHub Pages 项目页路径（`https://user.github.io/repo/`）和用户主页路径（`https://user.github.io/`）。
- GitHub Actions：安装依赖 → 类型检查 → 自动化测试 → 构建 → 检查构建产物 → 上传并部署 Pages。
- 4 篇示例帖子和 4 张 SVG 占位图片，可直接替换。
- 不加载外部字体、统计脚本或 Cookie。

数据流（第一阶段）：

```text
手动添加 content/posts/*.md + public/uploads/*
        ↓ git push
GitHub Actions
        ↓ npm ci / check / test / build
GitHub Pages（公开静态网站）
```

## 2. 技术栈与环境

| 组件 | 版本/说明 |
| --- | --- |
| Astro | 7.4.1 |
| Markdown 处理器 | `@astrojs/markdown-remark` 7.3.3（Unified） |
| Node.js | 需要 `>= 22.22.0`，推荐 24（`.nvmrc` 为 24） |
| 包管理器 | npm（提交了 `package-lock.json`） |
| 测试 | Vitest 5.0.5 |
| 部署 | GitHub Actions + GitHub Pages |
| 数据存储 | Git 仓库中的 Markdown 和图片 |

## 3. 目录结构

```text
.
├── .github/workflows/deploy.yml   # GitHub Pages 构建与部署
├── content/posts/                 # 帖子 Markdown
│   ├── 2026-09-28-small-things.md
│   ├── 2026-10-08-untitled.md
│   ├── 2026-10-15-city-walk.md
│   └── 2026-10-18-morning-light.md
├── public/
│   ├── .nojekyll                  # 避免 GitHub Pages 的 Jekyll 处理
│   ├── favicon.svg
│   ├── robots.txt
│   └── uploads/2026/10/           # 图片（构建时原样复制）
├── scripts/check-built-site.mjs   # 构建产物链接/图片检查
├── src/
│   ├── components/
│   │   ├── ImageGallery.astro
│   │   └── PostCard.astro
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── content-schema.ts      # frontmatter 校验规则
│   │   ├── content.ts             # Astro 内容读取
│   │   ├── posts.ts               # 日期、排序、摘要、base 等纯函数
│   │   └── rehype-base-paths.mjs  # 给正文图片补 GitHub Pages base
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   └── posts/
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── styles/global.css
│   ├── config.ts
│   ├── content.config.ts
│   └── env.d.ts
├── tests/                         # Vitest 单元/内容测试
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

`dist/`、`.astro/`、`node_modules/` 已在本仓库的 `.gitignore` 中排除。

## 4. 本地运行

```bash
npm ci
npm run dev
```

打开终端输出的地址（默认 `http://localhost:4321`）。

常用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 本地开发服务器 |
| `npm run check` | Astro 内容同步 + TypeScript/Astro 类型检查 |
| `npm test` | 运行 Vitest 单元与内容测试 |
| `npm run build` | 生成 `dist/` 静态站点 |
| `npm run preview` | 预览 `dist/`（本地根路径预览） |
| `npm run test:site` | 检查构建产物中的链接、图片和页面是否完整 |
| `npm run verify` | 依次执行 check → test → build → test:site |

> 本地 `npm run preview` 始终在根路径 `/` 预览。要验证 GitHub Pages 项目页 `/repo/` 路径，请使用 `BASE_PATH=/repo npm run build`，再把 `dist/` 挂到某个静态服务器的 `/repo/` 路径下，或直接运行 `BASE_PATH=/repo npm run test:site`。CI 会自动完成这两种检查。

## 5. 添加一篇帖子

在 `content/posts/` 新建 Markdown 文件，例如 `2026-10-20-example.md`：

```markdown
---
id: 0f8fad5b-d9cb-469f-a165-70867728950e
title: 标题可以留空
createdAt: 2026-10-20T09:30:00+08:00
updatedAt: 2026-10-21T10:00:00+08:00
images:
  - /uploads/2026/10/example-1.webp
  - /uploads/2026/10/example-2.webp
draft: false
---

正文使用普通 Markdown。

![正文内嵌图片](/uploads/2026/10/example-3.webp)

## 小标题

正文可以包含列表、引用、代码等。
```

字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | UUID，稳定且唯一。后续 Worker 阶段用于防重复发布，发布后不要修改。 |
| `title` | 否 | 最多 200 个 Unicode code point。为空或只含空格时显示为“无标题 · 日期”。 |
| `createdAt` | 是 | ISO 8601 时间，例如 `2026-10-20T09:30:00+08:00`。存储统一为 UTC，展示统一为 Asia/Shanghai。 |
| `updatedAt` | 否 | 最近更新时间，显示在详情页。 |
| `images` | 否 | 图片根路径数组，不限制数量；默认空数组。 |
| `draft` | 否 | `true` 时不会出现在构建产物中，默认 `false`。 |

图片规则：

1. 放到 `public/uploads/YYYY/MM/`。
2. 文件名只使用字母、数字、点、下划线、连字符，例如 `2026-10-20-01.webp`，避免空格和中文。
3. frontmatter 和正文中的路径写成根路径：`/uploads/2026/10/example.webp`。
4. 正文内嵌图片会自动加上 GitHub Pages 的 base；已经出现在正文中的图片不会在底部画廊重复展示。
5. 图片原样发布，不做压缩/转码。建议上传前压缩到合理尺寸（例如长边 2000px 内、单张小于 500KB）。
6. 正文字符数不设上限；网站按 Unicode code point 统计并在卡片、详情和归档中显示。

URL 由文件名决定：`content/posts/2026-10-20-example.md` → `/posts/2026-10-20-example/`。发布后如需保持链接稳定，不要重命名文件。

添加后提交并推送：

```bash
git add content/posts public/uploads
git commit -m "post: add example"
git push
```

GitHub Actions 会自动构建和部署，不需要手动修改首页或归档页。

## 6. 站点信息与可选环境变量

默认站点信息在 `src/config.ts`。也可以在本地 `.env` 或 GitHub 仓库的 **Settings → Secrets and variables → Actions → Variables** 中配置：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PUBLIC_SITE_TITLE` | `拾光集` | 站点标题 |
| `PUBLIC_SITE_TAGLINE` | `把日常收进 Git` | 标题下的小字 |
| `PUBLIC_SITE_DESCRIPTION` | 内置描述 | 首页介绍和 meta description |
| `PUBLIC_SITE_AUTHOR` | 空 | 页脚署名，空时使用站点标题 |
| `PUBLIC_REPO_URL` | 空 | 页脚“查看仓库”链接；公开仓库才建议填写 |

日期和 `YYYY-MM-DD` 统一使用 `Asia/Shanghai`，不再提供时区覆盖变量。

以下变量由 CI 自动设置，不需要手动配置：

- `BASE_PATH`：项目页为 `/仓库名`，用户主页为 `/`。
- `SITE_URL`：默认 `https://<用户名>.github.io`；自定义域名时由仓库变量 `SITE_URL` 覆盖。

所有 `PUBLIC_*` 变量都会出现在公开的前端产物中，**不要放任何密钥**。

## 7. 部署到 GitHub Pages

### 7.1 首次部署

1. 在 GitHub 创建仓库，把仓库根目录推送到 `main` 分支。
2. 打开仓库 **Settings → Pages**。
3. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
4. 确认 **Settings → Actions → General → Workflow permissions** 允许工作流写入（选择 **Read and write permissions**）。工作流自身声明了 `pages: write` 和 `id-token: write`。
5. 推送到 `main`，或在 **Actions** 页面手动运行 **Build and deploy to GitHub Pages**。
6. 部署完成后，页面地址通常是：
   - 仓库名为 `<用户名>.github.io`：`https://<用户名>.github.io/`
   - 其他仓库：`https://<用户名>.github.io/<仓库名>/`

项目页的 base 由工作流根据仓库名自动计算，不需要修改 `astro.config.mjs`。如果仓库改名，重新运行工作流即可。

> 私有仓库使用 GitHub Pages 取决于 GitHub 账户/组织套餐。免费账户通常需要公开仓库才能使用 Pages。公开网站上的内容不要放私人信息。
>
> 仓库默认分支如果不是 `main`，请修改仓库根目录的 `.github/workflows/deploy.yml` 中的 `branches: [main]`。

### 7.2 自定义域名（可选）

1. 在仓库 **Settings → Secrets and variables → Actions → Variables** 新建变量 `SITE_URL`，值为 `https://你的域名`（不要带路径）。
2. 在 `public/` 下新建 `CNAME` 文件，内容为域名（例如 `blog.example.com`），提交后重新部署。
3. 按 GitHub Pages 文档配置 DNS，并在 **Settings → Pages → Custom domain** 保存域名。
4. 自定义域名下工作流会自动使用根路径 base。若没有设置 `SITE_URL`，站点仍会按项目页路径构建。

### 7.3 工作流做了什么

本仓库的 `.github/workflows/deploy.yml`：

1. `actions/checkout@v7` 检出代码。
2. `actions/setup-node@v7` 安装 Node 24 并缓存 npm。
3. `npm ci` 安装锁定依赖。
4. 根据仓库名/`SITE_URL` 计算 `BASE_PATH` 与 `SITE_URL`。
5. `npm run verify`：类型检查 → 30 个测试 → 构建 → 检查构建产物中的帖子、图片、站内链接。
6. `actions/configure-pages@v6`、`actions/upload-pages-artifact@v5` 上传 `dist/`。
7. `actions/deploy-pages@v5` 发布到 `github-pages` 环境。

测试不通过时不会部署。

## 8. 测试与当前验证结果

已在本地实际执行：

```text
npm run check
  Result (22 files): 0 errors, 0 warnings, 0 hints

npm test
  Test Files  4 passed (4)
  Tests       29 passed (29)

npm run build
  8 page(s) built

npm run test:site
  base: /
  帖子: 4 篇
  图片: 4 张
  站内链接: 12 个
```

另外还验证了 GitHub Pages 项目页路径：

```text
BASE_PATH=/personal-photo-journal SITE_URL=https://example.github.io npm run build
BASE_PATH=/personal-photo-journal npm run test:site
  → 构建产物检查通过

将 dist/ 挂载到 /personal-photo-journal/ 后用静态服务器访问：
  → 首页 200
  → 帖子详情 200
  → SVG 图片 200 (image/svg+xml)
  → CSS 200 (text/css)
```

工作流文件通过 `actionlint 1.7.12` 检查。`package-lock.json` 已生成，依赖审计结果为 0 个已知漏洞。

GitHub Actions 已实际运行成功：

```text
https://github.com/wuhulamb/t/actions/runs/39438201961
```

公网部署也已验证：

```text
https://wuhulamb.github.io/t/                    → 200，标题“拾光集”
/posts/2026-10-15-city-walk/                    → 200
/uploads/2026/10/city-walk.svg                  → 200 image/svg+xml
/t/_astro/BaseLayout.CoXZlaOc.css               → 200 text/css
```

Pages 当前构建方式为 GitHub Actions，状态为 `built`。

测试覆盖：

- frontmatter：UUID、日期、标题长度（按 Unicode code point）、图片路径安全、任意图片数量、草稿默认值。
- 内容文件：ID 唯一、正文非空、图片文件真实存在、正文图片路径位于 `/uploads/`。
- URL/base：`/` 与 `/repo/`、重复 base、外部链接、锚点。
- 日期：Asia/Shanghai 时区、跨日边界、日期时间、归档年月。
- 排序、标题回退、摘要提取、正文图片去重、字符计数。
- Markdown rehype 插件对正文图片/链接的 base 处理。
- 构建产物：首页帖子链接、每篇详情页、正文首段、图片文件、归档页、404、所有站内链接。

未执行/无法在当前环境验证：

- 真实浏览器视觉回归测试（当前环境只做文本、HTML、构建产物和 HTTP 检查）。
- 自定义域名的实际 DNS 与证书。

## 9. 第一阶段验收对照

| 验收项 | 状态 |
| --- | --- |
| 能手动向仓库添加 Markdown 和图片 | 已完成，示例内容可直接参考 |
| 本地构建成功 | 已完成（8 个页面） |
| GitHub Actions 自动构建 | 已成功运行 |
| GitHub Pages 部署 | 已部署，Pages 状态 `built` |
| 公开网站正确展示文字和图片 | 已通过公网 HTTP 检查 |

## 10. 需要你手动完成的操作

- [x] 创建 GitHub 仓库并推送
- [x] 在仓库 **Settings → Pages** 把 Source 设置为 **GitHub Actions**
- [x] 在 **Settings → Actions → General → Workflow permissions** 允许读写
- [x] 确认 **Build and deploy to GitHub Pages** 成功
- [x] 打开部署地址，检查首页、帖子详情、图片
- [ ] 可选：配置自定义域名（`SITE_URL`、`public/CNAME` 和 DNS）
- [ ] 可选：把示例帖子/图片替换成你的真实内容

## 11. 关于 Secret

**第一阶段不需要任何 Cloudflare Secret 或 GitHub Secret。**

- GitHub Pages 部署使用 GitHub 自动提供的 `GITHUB_TOKEN`，权限写在 workflow 的 `permissions` 中。
- 站点没有任何私有密钥或 API 调用。
- 不要在当前阶段把 Token、密码或私人信息写进仓库。

进入第二阶段（Cloudflare Worker）后，会需要你在 Cloudflare 后台配置以下 Secret：

| 名称 | 用途 | 配置方式 |
| --- | --- | --- |
| `PUBLISH_SECRET` | Android App 调用发布接口的凭证 | `wrangler secret put PUBLISH_SECRET` 或 Cloudflare 控制台 |
| `GITHUB_TOKEN` | Worker 写入目标仓库的 Fine-grained PAT | `wrangler secret put GITHUB_TOKEN` |
| `GITHUB_OWNER` | 仓库所有者 | 普通环境变量即可 |
| `GITHUB_REPO` | 仓库名 | 普通环境变量即可 |

GitHub PAT 建议只授权目标仓库，权限只需要 **Contents: Read and write**。这些真实值请直接填入 Cloudflare/GitHub 后台，**不要发给我，也不要提交到仓库**。第二阶段会用 mock 测试覆盖认证、大小限制和 GitHub API 失败，不需要真实 Token 就能运行大部分测试。

## 12. 已知限制与后续阶段

当前限制：

- 还没有发布后台、Worker 或 Android App，只能通过 Git 添加内容。
- 没有分页、搜索、标签、RSS、评论。
- 图片不做优化，构建时原样复制；大图会影响加载速度。
- 示例图片是 SVG 占位图，正式使用时请替换。
- 帖子 URL 由文件名决定；稳定 UUID 已保存在 frontmatter 中，供后续发布流程使用。
- 已测试根路径和项目页路径；自定义域名只完成配置支持，尚未实际部署验证。
- GitHub Actions 使用主要版本标签（如 `actions/checkout@v7`），未固定到 commit SHA；如果未来需要更严格的供应链安全，可以再固定 SHA。

后续阶段：

1. **第二阶段**：Cloudflare Worker + TypeScript 发布 API（认证、校验、GitHub 写入、失败恢复、测试）。
2. **第三阶段**：Kotlin + Jetpack Compose Android App。
3. **第四阶段**：编辑/删除策略、完整备份、恢复演练、仓库体积与对象存储迁移说明。

## 13. 备份提示（第四阶段会展开）

Git 仓库是主要内容源，但不应是唯一备份。现在就可以使用：

```bash
# 完整克隆（含历史）
git clone --mirror https://github.com/<owner>/<repo>.git repo-backup.git

# 单文件归档，便于离线保存
git bundle create repo-$(date +%Y%m%d).bundle --all
```

恢复时从镜像或 bundle 克隆即可。不要在没有备份的情况下执行强制推送、重写历史或删除帖子目录。

---

如果第一阶段验收通过，请确认后我再开始 Cloudflare Worker。届时我会先给出接口、测试计划和需要你在 Cloudflare 后台配置的变量清单。
