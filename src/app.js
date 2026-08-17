import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");

function cleanContact(body = {}) {
  return {
    name: String(body.name ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    email: String(body.email ?? "").trim(),
    company: String(body.company ?? "").trim(),
    notes: String(body.notes ?? "").trim(),
  };
}

function validate(contact) {
  if (!contact.name || !contact.phone) return "姓名和电话为必填项";
  if (contact.name.length > 100 || contact.phone.length > 40) return "姓名或电话号码过长";
  if (contact.email.length > 160 || contact.company.length > 120) return "邮箱或公司名称过长";
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return "邮箱格式不正确";
  return null;
}

export function createApp(db) {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use(express.static(publicDir));

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.get("/api/contacts", async (req, res, next) => {
    try {
      res.json(await db.list(String(req.query.search ?? "").trim()));
    } catch (error) { next(error); }
  });

  app.get("/api/contacts/:id", async (req, res, next) => {
    try {
      const contact = await db.get(req.params.id);
      if (!contact) return res.status(404).json({ error: "联系人不存在" });
      res.json(contact);
    } catch (error) { next(error); }
  });

  app.post("/api/contacts", async (req, res, next) => {
    try {
      const contact = cleanContact(req.body);
      const error = validate(contact);
      if (error) return res.status(400).json({ error });
      res.status(201).json(await db.create(contact));
    } catch (error) { next(error); }
  });

  app.put("/api/contacts/:id", async (req, res, next) => {
    try {
      const contact = cleanContact(req.body);
      const error = validate(contact);
      if (error) return res.status(400).json({ error });
      const updated = await db.update(req.params.id, contact);
      if (!updated) return res.status(404).json({ error: "联系人不存在" });
      res.json(updated);
    } catch (error) { next(error); }
  });

  app.delete("/api/contacts/:id", async (req, res, next) => {
    try {
      if (!(await db.remove(req.params.id))) return res.status(404).json({ error: "联系人不存在" });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: "服务器暂时无法处理请求" });
  });

  return app;
}
