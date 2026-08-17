# 拾光通讯录

一个适合学习全栈开发与云部署的简单通讯录系统。支持联系人新增、查询、编辑、删除和关键词搜索，数据保存在 PostgreSQL 中。

## 技术栈

- 前端：HTML、CSS、JavaScript
- 后端：Node.js、Express
- 数据库：PostgreSQL
- 部署：Vercel + Neon PostgreSQL

## 本地运行

1. 安装 Node.js 20+ 和 PostgreSQL。
2. 复制 `.env.example` 为 `.env`，填写本地 `DATABASE_URL`。
3. 执行 `pnpm install` 后运行 `pnpm dev`。
4. 打开 `http://localhost:3000`。

应用启动时会自动创建 `contacts` 表。

## 部署到 Vercel

1. 在 Neon 创建 PostgreSQL 项目，并取得连接字符串。
2. 在 Vercel 导入本 GitHub 仓库。
3. 添加名为 `DATABASE_URL` 的环境变量，值为 Neon 连接字符串。
4. 部署完成后，Vercel 会提供公开的 HTTPS 地址。

根目录的 `index.js` 是 Vercel Express 函数入口，`public` 中的前端资源由 Vercel CDN 提供。
