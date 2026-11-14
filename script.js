"use strict";

const KEY = "azani_isp_system_customers";
const THEME_KEY = "azani_isp_system_theme";
const PACKAGES = {
  Basic: { speed: "5 Mbps", price: 1500, color: "#64748b" },
  Standard: { speed: "10 Mbps", price: 2500, color: "#0284c7" },
  Premium: { speed: "20 Mbps", price: 4000, color: "#7c3aed" },
  Business: { speed: "50 Mbps", price: 8000, color: "#0f766e" }
};

let customers = load();
const $ = (id) => document.getElementById(id);

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch (e) { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(customers)); } catch (e) {}
}
function money(n) { return "KES " + n.toLocaleString("en-KE"); }
function bill(c) { return PACKAGES[c.pkg].price; }

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let toastTimer;
function toast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

function render() {
  const q = $("search").value.trim().toLowerCase();
  const fp = $("filterPkg").value;
  const fs = $("filterStatus").value;
  const sortBy = $("sort").value;

  const list = customers.filter((c) =>
    (c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.acc.toLowerCase().includes(q)) &&
    (!fp || c.pkg === fp) && (!fs || c.status === fs));

  list.sort((a, b) => {
    if (sortBy === "price") return bill(b) - bill(a);
    if (sortBy === "acc") return a.acc.localeCompare(b.acc, undefined, { numeric: true });
    return a.name.localeCompare(b.name);
  });

  $("tbody").innerHTML = list.map((c) => `<tr>
      <td>${escapeHtml(c.acc)}</td>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.phone)}</td>
      <td>${escapeHtml(c.loc)}</td>
      <td><span class="badge p-${c.pkg}">${c.pkg}</span> <small>${PACKAGES[c.pkg].speed}</small></td>
      <td>${money(bill(c))}</td>
      <td><button class="badge b-${c.pay} toggle-pay" data-acc="${escapeHtml(c.acc)}" title="Click to toggle">${c.pay}</button></td>
      <td><button class="badge b-${c.status} toggle-status" data-acc="${escapeHtml(c.acc)}" title="Click to toggle">${c.status}</button></td>
      <td><button class="del" data-acc="${escapeHtml(c.acc)}" title="Delete" aria-label="Delete customer">&times;</button></td>
    </tr>`).join("");

  $("empty").style.display = list.length ? "none" : "block";
  updateStats();
  renderChart();
}

function updateStats() {
  $("statTotal").textContent = customers.length;
  $("statActive").textContent = customers.filter((c) => c.status === "Active").length;
  const revenue = customers.filter((c) => c.pay === "Paid").reduce((t, c) => t + bill(c), 0);
  const due = customers.filter((c) => c.pay === "Unpaid").reduce((t, c) => t + bill(c), 0);
  $("statRevenue").textContent = money(revenue);
  $("statDue").textContent = money(due);
}

function renderChart() {
  const counts = {};
  Object.keys(PACKAGES).forEach((p) => (counts[p] = 0));
  customers.forEach((c) => counts[c.pkg]++);
  const max = Math.max(1, ...Object.values(counts));
  $("chart").innerHTML = Object.keys(counts).map((p) => `
    <div class="bar-row">
      <span class="badge p-${p}">${p}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(counts[p] / max) * 100}%;background:${PACKAGES[p].color}"></div></div>
      <span class="bar-count">${counts[p]}</span>
    </div>`).join("");
}

function setMsg(el, text, type) {
  el.textContent = text;
  el.className = "msg " + (type || "");
}

// Register customer
$("custForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("formMsg");
  const acc = $("acc").value.trim();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim().replace(/\s+/g, "");
  const loc = $("loc").value.trim();
  const pkg = $("pkg").value;
  const pay = $("pay").value;

  if (!acc || !name || !phone || !loc || !pkg)
    return setMsg(msg, "Please fill in all fields.", "error");
  if (!/^[A-Za-z][A-Za-z\s.'-]+$/.test(name))
    return setMsg(msg, "Name must contain letters only.", "error");
  if (!/^(\+254|0)[17]\d{8}$/.test(phone))
    return setMsg(msg, "Enter a valid Kenyan phone number (e.g. 0712345678).", "error");
  if (customers.some((c) => c.acc.toLowerCase() === acc.toLowerCase()))
    return setMsg(msg, "Account number already exists.", "error");

  customers.push({ acc, name, phone, loc, pkg, pay, status: "Active" });
  save();
  e.target.reset();
  setMsg(msg, "", "");
  toast("Customer registered successfully");
  render();
});

// Table actions: toggle payment, toggle status, delete
$("tbody").addEventListener("click", (e) => {
  const payBtn = e.target.closest(".toggle-pay");
  const statBtn = e.target.closest(".toggle-status");
  const delBtn = e.target.closest(".del");
  const find = (acc) => customers.find((c) => c.acc === acc);

  if (payBtn) {
    const c = find(payBtn.dataset.acc);
    c.pay = c.pay === "Paid" ? "Unpaid" : "Paid";
    save(); render(); toast(`Payment marked ${c.pay}`);
  } else if (statBtn) {
    const c = find(statBtn.dataset.acc);
    c.status = c.status === "Active" ? "Suspended" : "Active";
    save(); render(); toast(`Connection ${c.status}`);
  } else if (delBtn) {
    if (confirm("Delete this customer?")) {
      customers = customers.filter((c) => c.acc !== delBtn.dataset.acc);
      save(); render(); toast("Customer deleted");
    }
  }
});

// Clear all
$("clearBtn").addEventListener("click", () => {
  if (customers.length && confirm("Delete ALL customers? This cannot be undone.")) {
    customers = [];
    save(); render(); toast("All records cleared");
  }
});

// Export CSV
$("exportBtn").addEventListener("click", () => {
  if (!customers.length) return toast("No records to export");
  const rows = [["Account", "Name", "Phone", "Location", "Package", "Speed", "Monthly Bill (KES)", "Payment", "Status"]];
  customers.forEach((c) => rows.push([c.acc, c.name, c.phone, c.loc, c.pkg, PACKAGES[c.pkg].speed, bill(c), c.pay, c.status]));
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "AZANI_ISP_customers.csv";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("CSV exported");
});

// Support form (front-end demo)
$("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("contactMsg");
  const email = $("cEmail").value.trim();
  if (!$("cName").value.trim() || !$("cMsg").value.trim() || !email)
    return setMsg(msg, "Please fill in all fields.", "error");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return setMsg(msg, "Enter a valid email address.", "error");
  e.target.reset();
  setMsg(msg, "", "");
  toast("Thank you! Our support team will reply soon.");
});

// Theme toggle
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  $("themeBtn").innerHTML = t === "dark" ? "&#9728;" : "&#9790;";
}
let theme = "light";
try { theme = localStorage.getItem(THEME_KEY) || "light"; } catch (e) {}
applyTheme(theme);
$("themeBtn").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  applyTheme(theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
});

// Controls
["search"].forEach((id) => $(id).addEventListener("input", render));
["sort", "filterPkg", "filterStatus"].forEach((id) => $(id).addEventListener("change", render));
$("menuBtn").addEventListener("click", () => $("nav").classList.toggle("open"));
$("nav").addEventListener("click", () => $("nav").classList.remove("open"));

render();

// Installable app (PWA)
let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  $("installBtn").hidden = false;
});
$("installBtn").addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $("installBtn").hidden = true;
});
window.addEventListener("appinstalled", () => { $("installBtn").hidden = true; toast("App installed"); });
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
