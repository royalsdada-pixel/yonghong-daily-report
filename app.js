/* 永鴻消防每日施工報表
 * 前端只可使用 Supabase Project URL + anon/publishable key。
 * 絕不可放入 service_role / secret key。
 */
const SUPABASE_URL = "https://mupbbqsizvioywweirnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SMP0YsMXN51AkSBxhmAl6w_7V-pXPaG";

const defaultEquipment = [
  { name: "緊急照明燈", specs: ["小型", "中型", "大型"], unit: "具" },
  { name: "緊急方向指示燈", specs: ["小型", "中型", "大型"], unit: "具" },
  { name: "偵煙式探測器", specs: ["一般型", "其他／未分類"], unit: "顆" },
  { name: "差動式探測器", specs: ["一般型", "其他／未分類"], unit: "顆" },
  { name: "定溫式探測器", specs: ["一般型", "其他／未分類"], unit: "顆" },
  { name: "火警壓扣", specs: ["一般型", "其他／未分類"], unit: "個" },
  { name: "中繼器", specs: ["一般型", "其他／未分類"], unit: "只" },
  { name: "喇叭", specs: ["一般型", "其他／未分類"], unit: "只" },
  { name: "火警受信總機", specs: ["一般型", "其他／未分類"], unit: "台" },
  { name: "消防栓箱／箱門", specs: ["一般型", "其他／未分類"], unit: "組" },
  { name: "滅火器", specs: ["ABC乾粉", "二氧化碳", "其他／未分類"], unit: "支" },
  { name: "其他設備", specs: ["其他／未分類"], unit: "個" }
];

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let equipmentCatalog = [];
let cachedEntries = [];
let editingId = null;

const $ = (id) => document.getElementById(id);
const today = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[ch]));
const isConfigured = () =>
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("請填入") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("請填入");

function setMessage(id, text, kind = "") {
  const el = $(id);
  el.textContent = text || "";
  el.className = "message" + (kind ? ` ${kind}` : "");
}
function setConnection(text) { $("connectionStatus").textContent = text; }
function isSupervisor() { return currentProfile?.role === "supervisor"; }

function showTab(name) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("hidden", panel.id !== `tab-${name}`));
  if (name === "records") loadRecords();
  if (name === "stats") loadStats();
}

function seedEquipmentSelects() {
  const select = $("equipmentName");
  select.innerHTML = equipmentCatalog.map(item =>
    `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`
  ).join("");
  if (!equipmentCatalog.length) {
    select.innerHTML = `<option value="">尚無設備資料</option>`;
  }
  updateSpecOptions();
}
function getSelectedEquipment() {
  return equipmentCatalog.find(item => item.name === $("equipmentName").value) || null;
}
function updateSpecOptions() {
  const item = getSelectedEquipment();
  const specs = Array.isArray(item?.specs) ? item.specs : [];
  $("equipmentSpec").innerHTML = `<option value="">不適用／未指定</option>` +
    specs.map(spec => `<option value="${escapeHtml(spec)}">${escapeHtml(spec)}</option>`).join("");
  $("unit").value = item?.unit || "";
  $("specHelp").textContent = specs.length ? "規格依設備類別設定；需要時可於資料庫擴充。" : "此設備未設定規格，可留空。";
}

async function loadEquipmentCatalog() {
  const { data, error } = await supabaseClient.from("equipment_catalog")
    .select("name,specs,unit,active").eq("active", true).order("sort_order").order("name");
  if (error) {
    console.warn("設備目錄讀取失敗，暫用內建選項：", error.message);
    equipmentCatalog = defaultEquipment;
  } else {
    equipmentCatalog = data?.length ? data : defaultEquipment;
  }
  seedEquipmentSelects();
}

async function loadProfile(user) {
  const { data, error } = await supabaseClient.from("profiles").select("display_name,role").eq("id", user.id).single();
  if (error) throw new Error("讀取使用者權限失敗。請確認已執行 schema.sql，且帳號已建立 profile。");
  currentProfile = data;
  $("userSummary").textContent = `${data.display_name || user.email} · ${user.email}`;
  $("roleBadge").textContent = isSupervisor() ? "主管" : "施工人員";
  $("welcomeTitle").textContent = isSupervisor() ? "主管工作台" : "施工工作台";
}

function setLoggedInUI(loggedIn) {
  $("loginPanel").classList.toggle("hidden", loggedIn);
  $("appPanel").classList.toggle("hidden", !loggedIn);
  $("logoutBtn").classList.toggle("hidden", !loggedIn);
}
async function onSession(session) {
  currentUser = session?.user || null;
  if (!currentUser) {
    currentProfile = null;
    setLoggedInUI(false);
    setConnection("尚未登入");
    return;
  }
  try {
    await loadProfile(currentUser);
    await loadEquipmentCatalog();
    setLoggedInUI(true);
    setConnection("雲端已連線");
    await loadRecords();
  } catch (err) {
    setLoggedInUI(false);
    setMessage("loginMessage", err.message, "error");
    setConnection("設定有誤");
  }
}

async function login(event) {
  event.preventDefault();
  setMessage("loginMessage", "登入中…");
  const { error } = await supabaseClient.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });
  if (error) setMessage("loginMessage", `登入失敗：${error.message}`, "error");
  else setMessage("loginMessage", "登入成功。", "success");
}
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) alert(`登出失敗：${error.message}`);
  else {
    setLoggedInUI(false);
    setConnection("已登出");
  }
}

function resetForm() {
  editingId = null;
  $("entryId").value = "";
  $("entryForm").reset();
  $("workDate").value = today();
  $("quantity").value = "1";
  $("status").value = "已完工";
  updateSpecOptions();
  $("formTitle").textContent = "新增施工紀錄";
  $("saveBtn").textContent = "儲存施工紀錄";
  $("cancelEditBtn").classList.add("hidden");
  setMessage("entryMessage", "");
}
function startEdit(entry) {
  editingId = entry.id;
  $("entryId").value = entry.id;
  $("workDate").value = entry.work_date;
  $("siteName").value = entry.site_name || "";
  $("siteAddress").value = entry.site_address || "";
  $("floorArea").value = entry.floor_area || "";
  if (![...$("equipmentName").options].some(o => o.value === entry.equipment_name)) {
    const option = document.createElement("option");
    option.value = entry.equipment_name; option.textContent = entry.equipment_name;
    $("equipmentName").appendChild(option);
  }
  $("equipmentName").value = entry.equipment_name;
  updateSpecOptions();
  if (entry.equipment_spec && ![...$("equipmentSpec").options].some(o => o.value === entry.equipment_spec)) {
    const option = document.createElement("option");
    option.value = entry.equipment_spec; option.textContent = entry.equipment_spec;
    $("equipmentSpec").appendChild(option);
  }
  $("equipmentSpec").value = entry.equipment_spec || "";
  $("workType").value = entry.work_type;
  $("quantity").value = entry.quantity;
  $("unit").value = entry.unit || "";
  $("status").value = entry.status;
  $("pointName").value = entry.point_name || "";
  $("notes").value = entry.notes || "";
  $("formTitle").textContent = "修改施工紀錄";
  $("saveBtn").textContent = "儲存修改";
  $("cancelEditBtn").classList.remove("hidden");
  setMessage("entryMessage", "正在修改既有紀錄。");
  showTab("entry");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveEntry(event) {
  event.preventDefault();
  if (!currentUser) return;
  const payload = {
    work_date: $("workDate").value,
    site_name: $("siteName").value.trim(),
    site_address: $("siteAddress").value.trim() || null,
    floor_area: $("floorArea").value.trim() || null,
    equipment_name: $("equipmentName").value,
    equipment_spec: $("equipmentSpec").value || null,
    work_type: $("workType").value,
    quantity: Number($("quantity").value),
    unit: $("unit").value.trim(),
    status: $("status").value,
    point_name: $("pointName").value.trim() || null,
    notes: $("notes").value.trim() || null
  };
  if (!payload.site_name || !payload.equipment_name || !payload.work_date || !(payload.quantity > 0) || !payload.unit) {
    setMessage("entryMessage", "請確認日期、場所、設備、正確數量及單位。", "error");
    return;
  }
  $("saveBtn").disabled = true;
  setMessage("entryMessage", "正在儲存至雲端…");
  let result;
  if (editingId) {
    result = await supabaseClient.from("work_entries").update(payload).eq("id", editingId).select("id").single();
  } else {
    result = await supabaseClient.from("work_entries").insert({ ...payload, created_by: currentUser.id }).select("id").single();
  }
  $("saveBtn").disabled = false;
  if (result.error) {
    setMessage("entryMessage", `儲存失敗：${result.error.message}`, "error");
    return;
  }
  setMessage("entryMessage", editingId ? "修改已儲存。" : "施工紀錄已儲存至雲端。", "success");
  resetForm();
  await loadRecords();
}

function readFilters(prefix = "filter") {
  if (prefix === "stats") return { from: $("statsFrom").value, to: $("statsTo").value };
  return {
    from: $("filterFrom").value, to: $("filterTo").value,
    site: $("filterSite").value.trim().toLowerCase(),
    workType: $("filterWorkType").value, status: $("filterStatus").value
  };
}
async function fetchEntries(filters = readFilters()) {
  let query = supabaseClient.from("work_entries").select("*").order("work_date", { ascending: false }).order("created_at", { ascending: false }).limit(2000);
  if (filters.from) query = query.gte("work_date", filters.from);
  if (filters.to) query = query.lte("work_date", filters.to);
  if (filters.workType) query = query.eq("work_type", filters.workType);
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query;
  if (error) throw error;
  let rows = data || [];
  if (filters.site) rows = rows.filter(r => (r.site_name || "").toLowerCase().includes(filters.site));
  return rows;
}
function canEdit(entry) { return isSupervisor() || entry.created_by === currentUser?.id; }
function renderRecord(entry) {
  const statusClass = entry.status === "已完工" ? "status-done" : entry.status === "施工中" ? "status-progress" : "status-pending";
  const editButtons = canEdit(entry) ? `
    <div class="record-actions">
      <button class="btn btn-secondary" data-action="edit" data-id="${escapeHtml(entry.id)}" type="button">修改</button>
      <button class="btn btn-secondary" data-action="delete" data-id="${escapeHtml(entry.id)}" type="button">刪除</button>
    </div>` : "";
  return `<article class="record-card">
    <div class="record-top">
      <div><h3>${escapeHtml(entry.site_name)}</h3><div class="record-meta">${escapeHtml(entry.work_date)}${entry.floor_area ? " · " + escapeHtml(entry.floor_area) : ""}</div></div>
      <div class="record-quantity">${escapeHtml(entry.quantity)} ${escapeHtml(entry.unit)}</div>
    </div>
    <p><strong>${escapeHtml(entry.equipment_name)}</strong>${entry.equipment_spec ? " · " + escapeHtml(entry.equipment_spec) : ""}</p>
    <p class="record-meta">施工方式：${escapeHtml(entry.work_type)}　<span class="pill ${statusClass}">${escapeHtml(entry.status)}</span></p>
    ${entry.point_name ? `<p class="record-meta">點位：${escapeHtml(entry.point_name)}</p>` : ""}
    ${entry.site_address ? `<p class="record-meta">地址：${escapeHtml(entry.site_address)}</p>` : ""}
    ${entry.notes ? `<p class="record-meta">備註：${escapeHtml(entry.notes)}</p>` : ""}
    ${isSupervisor() && entry.created_by_name ? `<p class="record-meta">填報人：${escapeHtml(entry.created_by_name)}</p>` : ""}
    ${editButtons}
  </article>`;
}
async function loadRecords() {
  if (!currentUser || !currentProfile) return;
  $("recordsList").innerHTML = `<p class="muted">載入中…</p>`;
  try {
    cachedEntries = await fetchEntries();
    $("recordsSummary").textContent = `共 ${cachedEntries.length} 筆紀錄${isSupervisor() ? "（主管檢視全公司可讀取資料）" : "（僅顯示自己的紀錄）"}`;
    $("recordsList").innerHTML = cachedEntries.length
      ? cachedEntries.map(renderRecord).join("")
      : `<div class="record-card"><p class="muted">目前沒有符合條件的紀錄。</p></div>`;
  } catch (err) {
    $("recordsList").innerHTML = `<p class="message error">讀取失敗：${escapeHtml(err.message)}</p>`;
  }
}
async function deleteEntry(id) {
  const entry = cachedEntries.find(item => item.id === id);
  if (!entry || !confirm(`確定刪除「${entry.site_name}／${entry.equipment_name}」這筆紀錄嗎？此操作無法復原。`)) return;
  const { error } = await supabaseClient.from("work_entries").delete().eq("id", id);
  if (error) alert(`刪除失敗：${error.message}`);
  else await loadRecords();
}

function csvCell(value) {
  let s = String(value ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s; // 降低試算表公式注入風險
  return `"${s.replace(/"/g, '""')}"`;
}
function exportCsv() {
  const columns = [
    ["work_date","施工日期"],["site_name","施工場所"],["site_address","場所地址"],
    ["floor_area","樓層／區域"],["equipment_name","設備類別"],["equipment_spec","設備規格"],
    ["work_type","施工方式"],["quantity","數量"],["unit","單位"],["status","施工狀態"],
    ["point_name","點位／編號"],["notes","備註"],["created_at","建立時間"]
  ];
  const rows = [columns.map(c => csvCell(c[1])).join(",")];
  cachedEntries.forEach(entry => rows.push(columns.map(([key]) => csvCell(entry[key])).join(",")));
  const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `永鴻消防施工紀錄_${today()}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
async function loadStats() {
  if (!currentUser) return;
  $("statsTable").innerHTML = `<tr><td colspan="5">統計中…</td></tr>`;
  try {
    const entries = await fetchEntries(readFilters("stats"));
    const total = entries.reduce((sum, e) => sum + Number(e.quantity || 0), 0);
    const sites = new Set(entries.map(e => e.site_name)).size;
    const done = entries.filter(e => e.status === "已完工").length;
    $("statsSummary").innerHTML = `
      <div class="stat-card"><div class="stat-label">紀錄筆數</div><div class="stat-number">${entries.length}</div></div>
      <div class="stat-card"><div class="stat-label">施工場所數</div><div class="stat-number">${sites}</div></div>
      <div class="stat-card"><div class="stat-label">已完工筆數</div><div class="stat-number">${done}</div></div>`;
    const groups = new Map();
    entries.forEach(e => {
      const key = [e.equipment_name, e.equipment_spec || "未指定", e.work_type, e.unit].join("|||");
      const old = groups.get(key) || { equipment_name:e.equipment_name, equipment_spec:e.equipment_spec || "未指定", work_type:e.work_type, unit:e.unit, quantity:0 };
      old.quantity += Number(e.quantity || 0);
      groups.set(key, old);
    });
    const sorted = [...groups.values()].sort((a,b) => a.equipment_name.localeCompare(b.equipment_name, "zh-Hant") || a.work_type.localeCompare(b.work_type, "zh-Hant"));
    $("statsTable").innerHTML = sorted.length ? sorted.map(g =>
      `<tr><td>${escapeHtml(g.equipment_name)}</td><td>${escapeHtml(g.equipment_spec)}</td><td>${escapeHtml(g.work_type)}</td><td>${escapeHtml(g.quantity)}</td><td>${escapeHtml(g.unit)}</td></tr>`
    ).join("") : `<tr><td colspan="5">目前沒有統計資料</td></tr>`;
    $("statsSummary").dataset.totalQuantity = String(total);
  } catch (err) {
    $("statsTable").innerHTML = `<tr><td colspan="5">統計失敗：${escapeHtml(err.message)}</td></tr>`;
  }
}

function wireEvents() {
  $("loginForm").addEventListener("submit", login);
  $("logoutBtn").addEventListener("click", logout);
  $("entryForm").addEventListener("submit", saveEntry);
  $("equipmentName").addEventListener("change", updateSpecOptions);
  $("cancelEditBtn").addEventListener("click", resetForm);
  document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));
  $("refreshBtn").addEventListener("click", loadRecords);
  $("applyFiltersBtn").addEventListener("click", loadRecords);
  $("clearFiltersBtn").addEventListener("click", () => {
    ["filterFrom","filterTo","filterSite","filterWorkType","filterStatus"].forEach(id => $(id).value = "");
    loadRecords();
  });
  $("exportCsvBtn").addEventListener("click", exportCsv);
  $("statsBtn").addEventListener("click", loadStats);
  $("recordsList").addEventListener("click", async event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const entry = cachedEntries.find(item => item.id === btn.dataset.id);
    if (!entry) return;
    if (btn.dataset.action === "edit") startEdit(entry);
    if (btn.dataset.action === "delete") await deleteEntry(entry.id);
  });
}

async function init() {
  wireEvents();
  $("workDate").value = today();
  $("statsFrom").value = today().slice(0, 7) + "-01";
  $("statsTo").value = today();
  if (!isConfigured()) {
    $("configNotice").classList.remove("hidden");
    setConnection("等待 Supabase 設定");
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setMessage("loginMessage", error.message, "error");
    return;
  }
  await onSession(data.session);
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    // 避免在 auth callback 內直接執行太多同步工作。
    setTimeout(() => onSession(session), 0);
  });
}
document.addEventListener("DOMContentLoaded", init);
                           
