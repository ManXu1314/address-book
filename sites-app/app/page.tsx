"use client";

import { FormEvent, useEffect, useState } from "react";

type Contact = { id: number; name: string; phone: string; email: string; company: string; notes: string };
const blankContact = { name: "", phone: "", email: "", company: "", notes: "" };

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(blankContact);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  async function loadContacts(term = search) {
    setLoading(true);
    try {
      const response = await fetch(`/api/contacts?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      setContacts(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  }

  useEffect(() => { const timer = setTimeout(() => void loadContacts(search), 220); return () => clearTimeout(timer); }, [search]);
  function showToast(message: string) { setToast(message); setTimeout(() => setToast(""), 2200); }
  function openCreate() { setEditingId(null); setForm(blankContact); setError(""); setDialogOpen(true); }
  function openEdit(contact: Contact) { setEditingId(contact.id); setForm({ name: contact.name, phone: contact.phone, email: contact.email, company: contact.company, notes: contact.notes }); setError(""); setDialogOpen(true); }

  async function saveContact(event: FormEvent) {
    event.preventDefault(); setError("");
    const response = await fetch(editingId ? `/api/contacts/${editingId}` : "/api/contacts", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return setError(data.error || "保存失败，请稍后重试");
    setDialogOpen(false); showToast(editingId ? "联系人已更新" : "联系人已添加"); await loadContacts();
  }

  async function removeContact() {
    if (deleteId === null) return;
    const response = await fetch(`/api/contacts/${deleteId}`, { method: "DELETE" });
    if (!response.ok) return showToast("删除失败，请稍后重试");
    setDeleteId(null); showToast("联系人已删除"); await loadContacts();
  }

  return <>
    <header className="topbar"><a className="brand" href="/" aria-label="拾光通讯录首页"><span className="brand-mark">拾</span><span>拾光通讯录</span></a><button className="primary-button" type="button" onClick={openCreate}><span aria-hidden="true">＋</span><span className="button-label">新建联系人</span></button></header>
    <main>
      <section className="intro"><div><p className="eyebrow">ADDRESS BOOK</p><h1>每一段联系，<br />都值得好好保存。</h1></div><p className="intro-copy">集中管理重要联系人，快速查找、更新与记录彼此之间的故事。</p></section>
      <section className="workspace" aria-label="联系人管理">
        <div className="toolbar"><div><h2>联系人</h2><p>{contacts.length} 位联系人</p></div><label className="search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索姓名、电话、邮箱或公司" /></label></div>
        {loading ? <p className="loading">正在读取联系人…</p> : contacts.length ? <div className="contact-grid">{contacts.map((contact) => <article className="contact-card" key={contact.id}><div className="card-top"><div className="avatar">{contact.name.slice(0, 1).toUpperCase()}</div><div className="card-title"><h3>{contact.name}</h3><p>{contact.company || "未填写公司"}</p></div><div className="card-menu"><button className="icon-button" onClick={() => openEdit(contact)} aria-label={`编辑 ${contact.name}`} title="编辑">✎</button><button className="icon-button" onClick={() => setDeleteId(contact.id)} aria-label={`删除 ${contact.name}`} title="删除">×</button></div></div><div className="details"><a href={`tel:${contact.phone}`}>电话　{contact.phone}</a><a href={`mailto:${contact.email}`}>邮箱　{contact.email || "未填写"}</a><span>备注　{contact.notes || "无"}</span></div></article>)}</div> : <div className="empty-state"><div className="empty-icon">＋</div><h3>通讯录还是空的</h3><p>添加第一位联系人，从这里开始整理你的联系网络。</p><button className="text-button" type="button" onClick={openCreate}>添加联系人</button></div>}
      </section>
    </main>
    {dialogOpen && <div className="modal-backdrop" role="presentation"><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><form onSubmit={saveContact}><div className="dialog-head"><div><p className="eyebrow">CONTACT</p><h2 id="dialog-title">{editingId ? "编辑联系人" : "新建联系人"}</h2></div><button className="icon-button" type="button" onClick={() => setDialogOpen(false)} aria-label="关闭">×</button></div><div className="form-grid">{(["name", "phone", "email", "company"] as const).map((field) => <label key={field}><span>{{ name: "姓名 *", phone: "电话 *", email: "邮箱", company: "公司 / 组织" }[field]}</span><input type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} required={field === "name" || field === "phone"} maxLength={field === "email" ? 160 : field === "company" ? 120 : 100} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}<label className="wide"><span>备注</span><textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label></div><p className="form-error" role="alert">{error}</p><div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setDialogOpen(false)}>取消</button><button className="primary-button" type="submit">保存联系人</button></div></form></section></div>}
    {deleteId !== null && <div className="modal-backdrop"><section className="dialog confirm-dialog" role="alertdialog" aria-modal="true"><h2>删除联系人？</h2><p>这条联系人记录将被永久删除。</p><div className="dialog-actions"><button className="secondary-button" onClick={() => setDeleteId(null)}>取消</button><button className="danger-button" onClick={removeContact}>确认删除</button></div></section></div>}
    <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
  </>;
}
