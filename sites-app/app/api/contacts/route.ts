import { desc, like, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { contacts } from "../../../db/schema";

type ContactInput = { name?: unknown; phone?: unknown; email?: unknown; company?: unknown; notes?: unknown };
function clean(body: ContactInput) { return { name: String(body.name ?? "").trim(), phone: String(body.phone ?? "").trim(), email: String(body.email ?? "").trim(), company: String(body.company ?? "").trim(), notes: String(body.notes ?? "").trim() }; }
export function validateContact(contact: ReturnType<typeof clean>) {
  if (!contact.name || !contact.phone) return "姓名和电话为必填项";
  if (contact.name.length > 100 || contact.phone.length > 40) return "姓名或电话号码过长";
  if (contact.email.length > 160 || contact.company.length > 120) return "邮箱或公司名称过长";
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return "邮箱格式不正确";
  return null;
}
export async function GET(request: Request) {
  try {
    const search = new URL(request.url).searchParams.get("search")?.trim() ?? "";
    const rows = await getDb().select().from(contacts).where(search ? or(like(contacts.name, `%${search}%`), like(contacts.phone, `%${search}%`), like(contacts.email, `%${search}%`), like(contacts.company, `%${search}%`)) : undefined).orderBy(desc(contacts.updatedAt), desc(contacts.id));
    return Response.json(rows);
  } catch { return Response.json({ error: "联系人暂时无法读取" }, { status: 500 }); }
}
export async function POST(request: Request) {
  try {
    const contact = clean(await request.json() as ContactInput);
    const error = validateContact(contact);
    if (error) return Response.json({ error }, { status: 400 });
    const [created] = await getDb().insert(contacts).values(contact).returning();
    return Response.json(created, { status: 201 });
  } catch { return Response.json({ error: "联系人暂时无法保存" }, { status: 500 }); }
}
