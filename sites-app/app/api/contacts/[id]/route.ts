import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { contacts } from "../../../../db/schema";
import { validateContact } from "../route";

type ContactInput = { name?: unknown; phone?: unknown; email?: unknown; company?: unknown; notes?: unknown };
type RouteContext = { params: Promise<{ id: string }> };
function clean(body: ContactInput) { return { name: String(body.name ?? "").trim(), phone: String(body.phone ?? "").trim(), email: String(body.email ?? "").trim(), company: String(body.company ?? "").trim(), notes: String(body.notes ?? "").trim() }; }
export async function PUT(request: Request, context: RouteContext) {
  try {
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "联系人不存在" }, { status: 404 });
    const contact = clean(await request.json() as ContactInput);
    const error = validateContact(contact);
    if (error) return Response.json({ error }, { status: 400 });
    const [updated] = await getDb().update(contacts).set({ ...contact, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(contacts.id, id)).returning();
    return updated ? Response.json(updated) : Response.json({ error: "联系人不存在" }, { status: 404 });
  } catch { return Response.json({ error: "联系人暂时无法更新" }, { status: 500 }); }
}
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "联系人不存在" }, { status: 404 });
    const removed = await getDb().delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
    return removed.length ? new Response(null, { status: 204 }) : Response.json({ error: "联系人不存在" }, { status: 404 });
  } catch { return Response.json({ error: "联系人暂时无法删除" }, { status: 500 }); }
}
