# 拾光通讯录

一个适合学习全栈开发与云部署的简单通讯录系统。支持联系人新增、查询、编辑、删除和关键词搜索，数据保存在 PostgreSQL 中。

## 技术栈

- 前端：HTML、CSS、JavaScript
- 后端：Node.js、Express
- 数据库：PostgreSQL
- 部署：Render Blueprint

## 本地运行

1. 安装 Node.js 20+ 和 PostgreSQL。
2. 复制 `.env.example` 为 `.env`，填写本地 `DATABASE_URL`。
3. 执行 `pnpm install` 后运行 `pnpm dev`。
4. 打开 `http://localhost:3000`。

应用启动时会自动创建 `contacts` 表。

## 部署到 Render

仓库内的 `render.yaml` 会同时创建 Web Service 和 PostgreSQL 数据库，并自动把数据库连接地址注入应用。登录 Render 后选择 **New > Blueprint**，连接本仓库并应用配置即可。
