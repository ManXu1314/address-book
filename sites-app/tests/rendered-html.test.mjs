import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the address book application", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>拾光通讯录<\/title>/i);
  assert.match(html, /拾光通讯录/);
  assert.match(html, /新建联系人/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("includes CRUD routes and a contacts migration", async () => {
  const [collectionRoute, itemRoute, migration, schema] = await Promise.all([
    readFile(new URL("../app/api/contacts/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/contacts/[id]/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../drizzle/0000_create_contacts.sql", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);
  assert.match(collectionRoute, /export async function GET/);
  assert.match(collectionRoute, /export async function POST/);
  assert.match(itemRoute, /export async function PUT/);
  assert.match(itemRoute, /export async function DELETE/);
  assert.match(migration, /CREATE TABLE `contacts`/);
  assert.match(schema, /sqliteTable\("contacts"/);
});
