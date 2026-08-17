const grid = document.querySelector("#contactGrid");
const empty = document.querySelector("#emptyState");
const count = document.querySelector("#contactCount");
const search = document.querySelector("#searchInput");
const dialog = document.querySelector("#contactDialog");
const form = document.querySelector("#contactForm");
const deleteDialog = document.querySelector("#deleteDialog");
const toast = document.querySelector("#toast");
let deleteId = null;
let debounce;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "操作失败，请稍后重试");
  }
  return response.status === 204 ? null : response.json();
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

async function loadContacts() {
  grid.innerHTML = '<p class="loading">正在读取联系人…</p>';
  try {
    const contacts = await request(`/api/contacts?search=${encodeURIComponent(search.value.trim())}`);
    count.textContent = contacts.length;
    empty.hidden = contacts.length > 0;
    grid.hidden = contacts.length === 0;
    grid.innerHTML = contacts.map((contact) => `
      <article class="contact-card">
        <div class="card-top">
          <div class="avatar">${escapeHtml(contact.name.slice(0, 1).toUpperCase())}</div>
          <div class="card-title"><h3>${escapeHtml(contact.name)}</h3><p>${escapeHtml(contact.company || "未填写公司")}</p></div>
          <div class="card-menu">
            <button class="icon-button" data-edit="${contact.id}" aria-label="编辑 ${escapeHtml(contact.name)}" title="编辑">✎</button>
            <button class="icon-button" data-delete="${contact.id}" aria-label="删除 ${escapeHtml(contact.name)}" title="删除">×</button>
          </div>
        </div>
        <div class="details">
          <a href="tel:${escapeHtml(contact.phone)}">电话　${escapeHtml(contact.phone)}</a>
          <a href="mailto:${escapeHtml(contact.email)}">邮箱　${escapeHtml(contact.email || "未填写")}</a>
          <span>备注　${escapeHtml(contact.notes || "无")}</span>
        </div>
      </article>`).join("");
  } catch (error) {
    grid.hidden = false;
    empty.hidden = true;
    grid.innerHTML = `<p class="loading">${escapeHtml(error.message)}</p>`;
  }
}

function openForm(contact = null) {
  form.reset();
  document.querySelector("#formError").textContent = "";
  document.querySelector("#contactId").value = contact?.id ?? "";
  document.querySelector("#dialogTitle").textContent = contact ? "编辑联系人" : "新建联系人";
  for (const field of ["name", "phone", "email", "company", "notes"]) document.querySelector(`#${field}`).value = contact?.[field] ?? "";
  dialog.showModal();
  document.querySelector("#name").focus();
}

document.querySelector("#addButton").addEventListener("click", () => openForm());
document.querySelector("[data-add]").addEventListener("click", () => openForm());
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancelDialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancelDelete").addEventListener("click", () => deleteDialog.close());
search.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(loadContacts, 250); });

grid.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    try { openForm(await request(`/api/contacts/${editButton.dataset.edit}`)); } catch (error) { notify(error.message); }
  }
  if (deleteButton) { deleteId = deleteButton.dataset.delete; deleteDialog.showModal(); }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#contactId").value;
  const body = Object.fromEntries(new FormData(form));
  try {
    await request(id ? `/api/contacts/${id}` : "/api/contacts", { method: id ? "PUT" : "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(body) });
    dialog.close();
    notify(id ? "联系人已更新" : "联系人已添加");
    await loadContacts();
  } catch (error) { document.querySelector("#formError").textContent = error.message; }
});

document.querySelector("#confirmDelete").addEventListener("click", async () => {
  try {
    await request(`/api/contacts/${deleteId}`, { method:"DELETE" });
    deleteDialog.close();
    notify("联系人已删除");
    await loadContacts();
  } catch (error) { notify(error.message); }
});

loadContacts();
