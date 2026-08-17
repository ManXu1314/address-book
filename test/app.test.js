import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../src/app.js";

function memoryDb() {
  let nextId = 1;
  let rows = [];
  return {
    list: async (search = "") => rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(search.toLowerCase()))),
    get: async (id) => rows.find((row) => row.id === Number(id)) ?? null,
    create: async (contact) => { const row = { id: nextId++, ...contact }; rows.push(row); return row; },
    update: async (id, contact) => { const index = rows.findIndex((row) => row.id === Number(id)); if (index < 0) return null; rows[index] = { ...rows[index], ...contact }; return rows[index]; },
    remove: async (id) => { const before = rows.length; rows = rows.filter((row) => row.id !== Number(id)); return rows.length < before; },
  };
}

test("contact CRUD flow", async () => {
  const app = createApp(memoryDb());
  const created = await request(app).post("/api/contacts").send({ name: "林悦", phone: "13800138000", email: "lin@example.com" }).expect(201);
  assert.equal(created.body.name, "林悦");
  await request(app).get("/api/contacts").expect(200).expect((res) => assert.equal(res.body.length, 1));
  await request(app).put(`/api/contacts/${created.body.id}`).send({ name: "林悦", phone: "13900139000", company: "星河工作室" }).expect(200).expect((res) => assert.equal(res.body.phone, "13900139000"));
  await request(app).get("/api/contacts?search=星河").expect(200).expect((res) => assert.equal(res.body.length, 1));
  await request(app).delete(`/api/contacts/${created.body.id}`).expect(204);
  await request(app).get(`/api/contacts/${created.body.id}`).expect(404);
});

test("rejects invalid contacts", async () => {
  const app = createApp(memoryDb());
  await request(app).post("/api/contacts").send({ name: "没有电话" }).expect(400);
  await request(app).post("/api/contacts").send({ name: "测试", phone: "123", email: "invalid" }).expect(400);
});
