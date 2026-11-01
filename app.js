/* 永鴻消防每日施工報表
 * 前端只可使用 Supabase Project URL + anon/publishable key。
 * 絕不可放入 service_role / secret key。
 */
const SUPABASE_URL = "請填入你的_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "請填入你的_SUPABASE_ANON_OR_PUBLISHABLE_KEY";

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

let supabase = null;
let currentUser = null;
let currentProfile = null;
let equipmentCatalog = [];
let cachedEntries = [];
let editingId = null;
let existingPhotoPaths = [];
let selectedPhotoFiles = [];
const PHOTO_BUCKET = "work-photos";
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

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
  const { data, error } = await supabase.from("equipment_catalog")
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
  const { data, error } = await supabase.from("profiles").select("display_name,role").eq("id", user.id).single();
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
  const { error } = await supabase.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });
  if (error) setMessage("loginMessage", `登入失敗：${error.message}`, "error");
  else setMessage("loginMessage", "登入成功。", "success");
}
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) alert(`登出失敗：${error.message}`);
  else {
    setLoggedInUI(false);
    setConnection("已登出");
  }
}

function safeFileName(name) {
  const cleaned = String(name || "photo").normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-90);
  return cleaned || "photo";
}
function renderLocalPhotoPreview() {
  const preview = $("photoPreview");
  preview.innerHTML = "";
  selectedPhotoFiles.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement("div");
    item.className = "photo-item";
    item.innerHTML = `<img alt="待上傳施工照片"><button class="photo-remove" type="button" aria-label="移除照片">×</button><div class="photo-caption"></div>`;
    item.querySelector("img").src = url;
    item.querySelector(".photo-caption").textContent = file.name;
    item.querySelector("button").addEventListener("click", () => {
      URL.revokeObjectURL(url);
      selectedPhotoFiles.splice(index, 1);
      renderLocalPhotoPreview();
    });
    preview.appendChild(item);
  });
}
async function renderExistingPhotos(paths) {
  const container = $("existingPhotos");
  container.innerHTML = "";
  if (!paths?.length || !supabase) return;
  const heading = document.createElement("div");
  heading.className = "muted small";
  heading.textContent = "已儲存的施工照片";
  container.appendChild(heading);
  for (const path of paths) {
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) continue;
    const wrap = document.createElement("div"); wrap.className = "photo-item";
    const link = document.createElement("a"); link.href = data.signedUrl; link.target = "_blank"; link.rel = "noopener noreferrer";
    const img = document.createElement("img"); img.src = data.signedUrl; img.alt = "施工照片"; link.appendChild(img); wrap.appendChild(link);
    const caption = document.createElement("div"); caption.className = "photo-caption"; caption.textContent = "已上傳"; wrap.appendChild(caption);
    container.appendChild(wrap);
  }
}
async function uploadSelectedPhotos(entryId) {
  const uploaded = [];
  for (const file of selectedPhotoFiles) {
    if (!file.type.startsWith("image/")) throw new Error(`「${file.name}」不是圖片檔。`);
    if (file.size > MAX_PHOTO_BYTES) throw new Error(`「${file.name}」超過 8 MB，請先縮小照片。`);
    const path = `${currentUser.id}/${entryId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw new Error(`照片上傳失敗（${file.name}）：${error.message}`);
    uploaded.push(path);
  }
  return uploaded;
}

function resetForm() {
  editingId = null;
  existingPhotoPaths = [];
  selectedPhotoFiles = [];
  $("photoFiles").value = "";
  $("photoPreview").innerHTML = "";
  $("existingPhotos").innerHTML = "";
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
  existingPhotoPaths = Array.isArray(entry.photo_paths) ? [...entry.photo_paths] : [];
  selectedPhotoFiles = [];
  $("photoFiles").value = "";
  $("photoPreview").innerHTML = "";
  renderExistingPhotos(existingPhotoPaths);
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
    work_date: $("workDate").value, site_name: $("siteName").value.trim(),
    site_address: $("siteAddress").value.trim() || null, floor_area: $("floorArea").value.trim() || null,
    equipment_name: $("equipmentName").value, equipment_spec: $("equipmentSpec").value || null,
    work_type: $("workType").value, quantity: Number($("quantity").value), unit: $("unit").value.trim(),
    status: $("status").value, point_name: $("pointName").value.trim() || null, notes: $("notes").value.trim() || null
  };
  if (!payload.site_name || !payload.equipment_name || !payload.work_date || !(payload.quantity > 0) || !payload.unit) {
    setMessage("entryMessage", "請確認日期、場所、設備、正確數量及單位。", "error"); return;
  }
  $("saveBtn").disabled = true;
  setMessage("entryMessage", "正在儲存施工紀錄…");
  let entryId = editingId;
  let result;
  if (editingId) result = await supabase.from("work_entries").update(payload).eq("id", editingId).select("id").single();
  else {
    result = await supabase.from("work_entries").insert({ ...payload, created_by: currentUser.id }).select("id").single();
    entryId = result.data?.id || null;
  }
  if (result.error || !entryId) {
    $("saveBtn").disabled = false;
    setMessage("entryMessage", `儲存失敗：${result.error?.message || "無法取得施工紀錄編號"}`, "error"); return;
  }
  try {
    if (selectedPhotoFiles.length) {
      setMessage("entryMessage", "施工紀錄已儲存，正在上傳照片…");
      const uploadedPaths = await uploadSelectedPhotos(entryId);
      const nextPaths = [...existingPhotoPaths, ...uploadedPaths];
      const { error: photoDbError } = await supabase.from("work_entries").update({ photo_paths: nextPaths }).eq("id", entryId);
      if (photoDbError) throw new Error(`照片已上傳，但更新照片清單失敗：${photoDbError.message}`);
      existingPhotoPaths = nextPaths;
    }
    $("saveBtn").disabled = false;
    setMessage("entryMessage", editingId ? "修改已儲存。" : "施工紀錄已儲存至雲端。", "success");
    resetForm(); await loadRecords();
  } catch (err) {
    $("saveBtn").disabled = false;
    setMessage("entryMessage", `${err.message} 施工紀錄本身已保存，請檢查後再重試照片。`, "error");
    await loadRecords();
  }
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
  let query = supabase.from("work_entries").select("*").order("work_date", { ascending: false }).order("created_at", { ascending: false }).limit(2000);
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
    ${Array.isArray(entry.photo_paths) && entry.photo_paths.length ? `<p class="record-meta">施工照片：${entry.photo_paths.length} 張（編輯紀錄可查看）</p>` : ""}
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
  const { error } = await supabase.from("work_entries").delete().eq("id", id);
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
    ["point_name","點位／編號"],["notes","備註"],["photo_paths","施工照片路徑"],["created_at","建立時間"]
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
  $("photoFiles").addEventListener("change", event => {
    const newFiles = [...(event.target.files || [])];
    const invalid = newFiles.find(file => !file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES);
    if (invalid) { alert(`照片「${invalid.name}」格式不支援或超過 8 MB。請選擇圖片且每張不超過 8 MB。`); event.target.value = ""; return; }
    selectedPhotoFiles = [...selectedPhotoFiles, ...newFiles];
    event.target.value = ""; renderLocalPhotoPreview();
  });
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
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setMessage("loginMessage", error.message, "error");
    return;
  }
  await onSession(data.session);
  supabase.auth.onAuthStateChange((_event, session) => {
    // 避免在 auth callback 內直接執行太多同步工作。
    setTimeout(() => onSession(session), 0);
  });
}
document.addEventListener("DOMContentLoaded", init);
