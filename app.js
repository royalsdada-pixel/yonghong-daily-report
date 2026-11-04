/* 永鴻消防每日施工報表
 * 前端只可使用 Supabase Project URL + anon/publishable key。
 * 絕不可放入 service_role / secret key。
 */
const SUPABASE_URL = "https://mupbbqsizvioywweirnz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SMP0YsMXN51AkSBxhmAl6w_7V-pXPaG";

const defaultEquipment = [
  { category: "火警自動警報設備", name: "偵煙式探測器", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 10 },
  { category: "火警自動警報設備", name: "差動式探測器", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 20 },
  { category: "火警自動警報設備", name: "定溫式探測器", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 30 },
  { category: "火警自動警報設備", name: "火焰式探測器", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 40 },
  { category: "火警自動警報設備", name: "火警壓扣", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 50 },
  { category: "火警自動警報設備", name: "火警受信總機", specs: ["P型", "R型", "其他／未分類"], unit: "台", sort_order: 60 },
  { category: "火警自動警報設備", name: "中繼器", specs: ["一般型", "隔離型", "其他／未分類"], unit: "只", sort_order: 70 },
  { category: "火警自動警報設備", name: "警鈴", specs: ["一般型", "其他／未分類"], unit: "只", sort_order: 80 },
  { category: "火警自動警報設備", name: "喇叭", specs: ["一般型", "其他／未分類"], unit: "只", sort_order: 90 },
  { category: "火警自動警報設備", name: "緊急廣播設備", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 100 },
  { category: "火警自動警報設備", name: "119 通報裝置", specs: ["一般型", "其他／未分類"], unit: "台", sort_order: 110 },
  { category: "滅火設備", name: "10 型乾粉滅火器", specs: ["ABC乾粉", "其他／未分類"], unit: "支", sort_order: 120 },
  { category: "滅火設備", name: "20 型乾粉滅火器", specs: ["ABC乾粉", "其他／未分類"], unit: "支", sort_order: 130 },
  { category: "滅火設備", name: "二氧化碳滅火器", specs: ["5 型", "10 型", "其他／未分類"], unit: "支", sort_order: 140 },
  { category: "滅火設備", name: "泡沫滅火設備", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 150 },
  { category: "滅火設備", name: "室內消防栓", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 160 },
  { category: "滅火設備", name: "室外消防栓", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 170 },
  { category: "滅火設備", name: "消防泵浦", specs: ["一般型", "其他／未分類"], unit: "台", sort_order: 180 },
  { category: "滅火設備", name: "消防送水口", specs: ["一般型", "其他／未分類"], unit: "口", sort_order: 190 },
  { category: "滅火設備", name: "撒水頭", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 200 },
  { category: "滅火設備", name: "撒水泵浦", specs: ["一般型", "其他／未分類"], unit: "台", sort_order: 210 },
  { category: "避難逃生設備", name: "緊急照明燈", specs: ["小型", "中型", "大型", "其他／未分類"], unit: "具", sort_order: 220 },
  { category: "避難逃生設備", name: "出口標示燈", specs: ["小型", "中型", "大型", "其他／未分類"], unit: "具", sort_order: 230 },
  { category: "避難逃生設備", name: "避難方向指示燈", specs: ["小型", "中型", "大型", "其他／未分類"], unit: "具", sort_order: 240 },
  { category: "避難逃生設備", name: "避難器具", specs: ["一般型", "其他／未分類"], unit: "具", sort_order: 250 },
  { category: "避難逃生設備", name: "緩降機", specs: ["一般型", "其他／未分類"], unit: "具", sort_order: 260 },
  { category: "避難逃生設備", name: "排煙設備", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 270 },
  { category: "避難逃生設備", name: "防火門", specs: ["一般型", "其他／未分類"], unit: "樘", sort_order: 280 },
  { category: "消防箱與配件", name: "消防栓箱", specs: ["一般型", "其他／未分類"], unit: "組", sort_order: 290 },
  { category: "消防箱與配件", name: "消防箱門扣", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 300 },
  { category: "消防箱與配件", name: "消防水帶", specs: ["一般型", "其他／未分類"], unit: "條", sort_order: 310 },
  { category: "消防箱與配件", name: "瞄子", specs: ["一般型", "其他／未分類"], unit: "支", sort_order: 320 },
  { category: "消防箱與配件", name: "消防栓閥", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 330 },
  { category: "消防箱與配件", name: "消防管路", specs: ["一般型", "其他／未分類"], unit: "式", sort_order: 340 },
  { category: "消防箱與配件", name: "消防箱玻璃", specs: ["一般型", "其他／未分類"], unit: "片", sort_order: 350 },
  { category: "消防箱與配件", name: "消防箱配件", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 360 },
  { category: "施工與維修材料", name: "電線", specs: ["一般型", "其他／未分類"], unit: "公尺", sort_order: 370 },
  { category: "施工與維修材料", name: "配管", specs: ["一般型", "其他／未分類"], unit: "公尺", sort_order: 380 },
  { category: "施工與維修材料", name: "接線盒", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 390 },
  { category: "施工與維修材料", name: "繼電器", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 400 },
  { category: "施工與維修材料", name: "保險絲", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 410 },
  { category: "施工與維修材料", name: "電源供應器", specs: ["一般型", "其他／未分類"], unit: "台", sort_order: 420 },
  { category: "施工與維修材料", name: "電池", specs: ["一般型", "其他／未分類"], unit: "顆", sort_order: 430 },
  { category: "施工與維修材料", name: "端子台", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 440 },
  { category: "施工與維修材料", name: "其他材料", specs: ["其他／未分類"], unit: "個", sort_order: 450 },
  { category: "其他設備", name: "太平龍頭", specs: ["一般型", "其他／未分類"], unit: "個", sort_order: 460 },
  { category: "其他設備", name: "其他設備", specs: ["其他／未分類"], unit: "個", sort_order: 999 }
];

let supabaseClient = null;
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
  if (name === "catalog") showCatalogTab();
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
    .select("id,category,name,specs,unit,active,sort_order").eq("active", true).order("sort_order").order("name");
  if (error) {
    console.warn("設備目錄讀取失敗，暫用內建選項：", error.message);
    equipmentCatalog = defaultEquipment;
  } else {
    equipmentCatalog = data?.length ? data : defaultEquipment;
  }
  seedEquipmentSelects();
  if (isSupervisor()) renderCatalogManager();
}

let equipmentCatalogAll = [];

function showCatalogTab() {
  if (!isSupervisor()) return;
  loadCatalogManager();
}
function resetCatalogForm() {
  $("catalogId").value = "";
  $("catalogCategory").value = "火警自動警報設備";
  $("catalogName").value = "";
  $("catalogSpecs").value = "一般型, 其他／未分類";
  $("catalogUnit").value = "個";
  $("catalogSort").value = "100";
  $("catalogActive").checked = true;
  $("catalogSaveBtn").textContent = "新增品項";
  setMessage("catalogMessage", "");
}
async function loadCatalogManager() {
  if (!isSupervisor()) return;
  const { data, error } = await supabaseClient.from("equipment_catalog")
    .select("id,category,name,specs,unit,active,sort_order").order("sort_order").order("name");
  if (error) { setMessage("catalogMessage", `讀取品項失敗：${error.message}`, "error"); return; }
  equipmentCatalogAll = data || [];
  renderCatalogManager();
}
function renderCatalogManager() {
  const target = $("catalogList");
  if (!target || !isSupervisor()) return;
  target.innerHTML = equipmentCatalogAll.length ? equipmentCatalogAll.map(item => `
    <tr><td>${escapeHtml(item.category || "其他設備")}</td><td>${escapeHtml(item.name)}</td>
    <td>${escapeHtml((item.specs || []).join("、"))}</td><td>${escapeHtml(item.unit)}</td>
    <td>${item.active ? "啟用" : "停用"}</td><td><button class="btn btn-secondary" type="button" data-catalog-action="edit" data-id="${item.id}">編輯</button>
    <button class="btn btn-secondary" type="button" data-catalog-action="toggle" data-id="${item.id}">${item.active ? "停用" : "啟用"}</button></td></tr>`).join("")
    : `<tr><td colspan="6">尚無品項</td></tr>`;
}
async function saveCatalogItem(event) {
  event.preventDefault();
  if (!isSupervisor()) return;
  const name = $("catalogName").value.trim();
  const specs = [...new Set($("catalogSpecs").value.split(/[,，、\n]/).map(x => x.trim()).filter(Boolean))];
  const payload = { category: $("catalogCategory").value, name, specs, unit: $("catalogUnit").value.trim(), sort_order: Number($("catalogSort").value || 100), active: $("catalogActive").checked };
  if (!name || !payload.unit) { setMessage("catalogMessage", "請填寫品項名稱與單位。", "error"); return; }
  const id = $("catalogId").value;
  const result = id
    ? await supabaseClient.from("equipment_catalog").update(payload).eq("id", Number(id))
    : await supabaseClient.from("equipment_catalog").insert(payload);
  if (result.error) { setMessage("catalogMessage", `儲存失敗：${result.error.message}`, "error"); return; }
  setMessage("catalogMessage", id ? "品項已更新。" : "品項已新增。", "success");
  resetCatalogForm();
  await loadCatalogManager();
  await loadEquipmentCatalog();
}
async function catalogAction(event) {
  const btn = event.target.closest("button[data-catalog-action]");
  if (!btn || !isSupervisor()) return;
  const item = equipmentCatalogAll.find(x => String(x.id) === btn.dataset.id);
  if (!item) return;
  if (btn.dataset.catalogAction === "edit") {
    $("catalogId").value = item.id;
    $("catalogCategory").value = item.category || "其他設備";
    $("catalogName").value = item.name;
    $("catalogSpecs").value = (item.specs || []).join(", ");
    $("catalogUnit").value = item.unit || "個";
    $("catalogSort").value = item.sort_order ?? 100;
    $("catalogActive").checked = !!item.active;
    $("catalogSaveBtn").textContent = "儲存修改";
    setMessage("catalogMessage", `正在編輯：${item.name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (btn.dataset.catalogAction === "toggle") {
    const { error } = await supabaseClient.from("equipment_catalog").update({ active: !item.active }).eq("id", item.id);
    if (error) setMessage("catalogMessage", `更新失敗：${error.message}`, "error");
    else { await loadCatalogManager(); await loadEquipmentCatalog(); }
  }
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
    $("catalogTabBtn").classList.toggle("hidden", !isSupervisor());
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

function isPasswordRecoveryLink() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hash.get("type") === "recovery" || window.location.hash.includes("reset-password");
}

function showPasswordResetPanel() {
  $("loginPanel").classList.add("hidden");
  $("appPanel").classList.add("hidden");
  $("passwordResetPanel").classList.remove("hidden");
  $("logoutBtn").classList.add("hidden");
  setConnection("正在重設密碼");
}

function showLoginPanel(message = "", kind = "") {
  $("passwordResetPanel").classList.add("hidden");
  $("loginPanel").classList.remove("hidden");
  $("appPanel").classList.add("hidden");
  setMessage("loginMessage", message, kind);
}

async function requestPasswordReset() {
  const email = $("email").value.trim();
  if (!email) {
    setMessage("loginMessage", "請先輸入電子郵件，再點選忘記密碼。", "error");
    $("email").focus();
    return;
  }
  if (!$("email").checkValidity()) {
    setMessage("loginMessage", "請輸入有效的電子郵件地址。", "error");
    $("email").focus();
    return;
  }
  const button = $("forgotPasswordBtn");
  button.disabled = true;
  setMessage("loginMessage", "正在寄送重設密碼信…");
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
  button.disabled = false;
  if (error) {
    setMessage("loginMessage", `寄送失敗：${error.message}`, "error");
  } else {
    setMessage("loginMessage", "已提出寄送要求。請查看信箱及垃圾郵件匣，並由同一個永鴻系統網址開啟信件連結。", "success");
  }
}

async function updatePassword(event) {
  event.preventDefault();
  const password = $("newPassword").value;
  const confirm = $("confirmPassword").value;
  if (password.length < 8) {
    setMessage("resetPasswordMessage", "新密碼至少需要 8 個字元。", "error");
    return;
  }
  if (password !== confirm) {
    setMessage("resetPasswordMessage", "兩次輸入的新密碼不一致，請再確認。", "error");
    return;
  }
  const button = $("updatePasswordBtn");
  button.disabled = true;
  setMessage("resetPasswordMessage", "正在更新密碼…");
  const { error } = await supabaseClient.auth.updateUser({ password });
  button.disabled = false;
  if (error) {
    setMessage("resetPasswordMessage", `更新失敗：${error.message}`, "error");
    return;
  }
  await supabaseClient.auth.signOut();
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  $("passwordResetForm").reset();
  showLoginPanel("密碼已更新，請使用新密碼登入。", "success");
  setConnection("尚未登入");
}
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
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
  if (!paths?.length || !supabaseClient) return;
  const heading = document.createElement("div");
  heading.className = "muted small";
  heading.textContent = "已儲存的施工照片";
  container.appendChild(heading);
  for (const path of paths) {
    const { data, error } = await supabaseClient.storage.from(PHOTO_BUCKET).createSignedUrl(path, 604800);
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
    const { error } = await supabaseClient.storage.from(PHOTO_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
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
  if (editingId) result = await supabaseClient.from("work_entries").update(payload).eq("id", editingId).select("id").single();
  else {
    result = await supabaseClient.from("work_entries").insert({ ...payload, created_by: currentUser.id }).select("id").single();
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
      const { error: photoDbError } = await supabaseClient.from("work_entries").update({ photo_paths: nextPaths }).eq("id", entryId);
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
    ${Array.isArray(entry.photo_paths) && entry.photo_paths.length ? `<p class="record-meta">施工照片：${entry.photo_paths.length} 張（編輯紀錄可查看）</p>` : ""}
    ${isSupervisor() && entry.created_by_name ? `<p class="record-meta">填報人：${escapeHtml(entry.created_by_name)}</p>` : ""}
    <div class="record-export-actions">
      <button class="btn btn-secondary" data-action="export-excel" data-id="${escapeHtml(entry.id)}" type="button">匯出 Excel</button>
      <button class="btn btn-secondary" data-action="export-word" data-id="${escapeHtml(entry.id)}" type="button">匯出 Word</button>
    </div>
    ${editButtons}
  </article>`;
}
async function loadRecords() {
  if (!currentUser || !currentProfile) return;
  $("recordsList").innerHTML = `<p class="muted">載入中…</p>`;
  try {
    cachedEntries = await fetchEntries();
    populateExportSiteFilters(cachedEntries);
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
function populateExportSiteFilters(entries) {
  const container = $("exportSiteFilters");
  if (!container) return;
  const previouslySelected = new Set(
    [...container.querySelectorAll('input[name="exportSite"]:checked')].map(input => input.value)
  );
  const sites = [...new Set((entries || []).map(e => String(e.site_name || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "zh-Hant"));
  if (!sites.length) {
    container.innerHTML = '<p class="muted small">目前篩選條件下沒有施工場所。</p>';
    return;
  }
  container.innerHTML = sites.map(site => `
    <label class="inline-check" style="display:flex;align-items:center;gap:8px;padding:6px 8px;">
      <input type="checkbox" name="exportSite" value="${escapeHtml(site)}" ${previouslySelected.has(site) ? "checked" : ""}>
      <span>${escapeHtml(site)}</span>
    </label>`).join("");
}
function setExportMessage(message, kind = "") {
  const el = $("exportExcelMessage");
  if (!el) return;
  el.textContent = message;
  el.className = `message${kind ? " " + kind : ""}`;
}
function sortExportEntries(entries) {
  return [...entries].sort((a, b) =>
    String(b.work_date || "").localeCompare(String(a.work_date || "")) ||
    String(a.site_name || "").localeCompare(String(b.site_name || ""), "zh-Hant") ||
    String(a.equipment_name || "").localeCompare(String(b.equipment_name || ""), "zh-Hant") ||
    String(a.equipment_spec || "").localeCompare(String(b.equipment_spec || ""), "zh-Hant") ||
    String(a.work_type || "").localeCompare(String(b.work_type || ""), "zh-Hant")
  );
}
function styleWorksheetHeader(row) {
  row.height = 28;
  row.eachCell(cell => {
    cell.font = { name: "Microsoft JhengHei", bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF174E46" } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { bottom: { style: "thin", color: { argb: "FFB7C9C5" } } };
  });
}
function workbookImageBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
async function addPhotoSheet(workbook, entries) {
  const photos = [];
  for (const entry of entries) {
    for (const path of (Array.isArray(entry.photo_paths) ? entry.photo_paths : [])) {
      photos.push({ entry, path });
    }
  }
  if (!photos.length) return { count: 0, failed: 0 };
  const ws = workbook.addWorksheet("施工照片", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "施工日期", key: "date", width: 14 },
    { header: "施工場所", key: "site", width: 28 },
    { header: "施工項目", key: "item", width: 26 },
    { header: "施工方式", key: "type", width: 14 },
    { header: "照片", key: "photo", width: 24 },
    { header: "照片連結", key: "link", width: 42 }
  ];
  styleWorksheetHeader(ws.getRow(1));
  ws.views = [{ state: "frozen", ySplit: 1 }];
  let embedded = 0, failed = 0, rowNum = 2;
  for (const photo of photos) {
    const { entry, path } = photo;
    const row = ws.getRow(rowNum);
    row.getCell(1).value = entry.work_date || "";
    row.getCell(2).value = entry.site_name || "";
    row.getCell(3).value = `${entry.equipment_name || ""}${entry.equipment_spec ? "／" + entry.equipment_spec : ""}`;
    row.getCell(4).value = entry.work_type || "";
    row.height = 92;
    try {
      const { data, error } = await supabaseClient.storage.from(PHOTO_BUCKET).createSignedUrl(path, 604800);
      if (error || !data?.signedUrl) throw new Error(error?.message || "無法取得照片連結");
      row.getCell(6).value = { text: "開啟施工照片", hyperlink: data.signedUrl, tooltip: "照片連結約 7 天有效，請在有效時間內開啟" };
      row.getCell(6).font = { color: { argb: "FF0563C1" }, underline: true };
      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error(`照片下載失敗：HTTP ${response.status}`);
      const buffer = await response.arrayBuffer();
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      let extension = contentType.includes("png") || path.toLowerCase().endsWith(".png") ? "png" :
        (contentType.includes("gif") || path.toLowerCase().endsWith(".gif") ? "gif" : "jpeg");
      // ExcelJS supports PNG/JPEG reliably; convert only by preserving supported formats.
      if (extension === "gif") throw new Error("GIF 不支援直接嵌入，已保留照片連結");
      const imageId = workbook.addImage({ base64: workbookImageBase64(buffer), extension });
      ws.addImage(imageId, { tl: { col: 4, row: rowNum - 1 }, br: { col: 5, row: rowNum } });
      embedded++;
    } catch (err) {
      failed++;
      if (!row.getCell(6).value) row.getCell(6).value = `無法產生連結：${err.message || "未知錯誤"}`;
    }
    row.eachCell(cell => { cell.alignment = { vertical: "middle", wrapText: true }; });
    rowNum++;
  }
  ws.autoFilter = { from: "A1", to: `F${Math.max(1, rowNum - 1)}` };
  return { count: embedded, failed, total: photos.length };
}

function wordText(label, value) {
  const d = window.docx;
  return new d.Paragraph({ spacing: { after: 120 }, children: [
    new d.TextRun({ text: label + "：", bold: true, size: 22 }),
    new d.TextRun({ text: String(value == null ? "未填寫" : value), size: 22 })
  ]});
}
function getImageDimensions(bytes, mimeType) {
  return new Promise(resolve => {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const w = image.naturalWidth || 1, h = image.naturalHeight || 1;
      URL.revokeObjectURL(url);
      const scale = Math.min(460 / w, 320 / h, 1);
      resolve({ width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) });
    };
    image.onerror = () => { URL.revokeObjectURL(url); resolve({ width: 400, height: 260 }); };
    image.src = url;
  });
}
async function exportEntryWord(entryId) {
  const d = window.docx;
  if (!d || !d.Document || !d.Packer || !d.ImageRun) {
    setExportMessage("Word 匯出元件載入失敗，請重新整理頁面後再試。", "error"); return;
  }
  const entry = cachedEntries.find(item => String(item.id) === String(entryId));
  if (!entry) { setExportMessage("找不到這筆施工紀錄，請重新整理紀錄後再試。", "error"); return; }
  const buttons = [...document.querySelectorAll('button[data-action="export-word"]')].filter(button => String(button.dataset.id) === String(entryId));
  buttons.forEach(button => button.disabled = true);
  setExportMessage("正在製作 Word 施工紀錄並整理照片，請稍候…");
  try {
    const children = [
      new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 100 }, children: [new d.TextRun({ text: "永鴻消防器材行", bold: true, size: 32, font: "Microsoft JhengHei" })] }),
      new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 300 }, children: [new d.TextRun({ text: "施工紀錄單", bold: true, size: 28, font: "Microsoft JhengHei" })] }),
      wordText("施工日期", entry.work_date),
      wordText("施工場所", entry.site_name),
      wordText("場所地址", entry.site_address || "未填寫"),
      wordText("樓層／區域", entry.floor_area || "未填寫"),
      wordText("施工項目", entry.equipment_name),
      wordText("設備規格", entry.equipment_spec || "未填寫"),
      wordText("施工方式", entry.work_type),
      wordText("施工數量", String(entry.quantity == null ? "" : entry.quantity) + " " + (entry.unit || "")),
      wordText("施工狀態", entry.status),
      wordText("點位／編號", entry.point_name || "未填寫"),
      wordText("備註", entry.notes || "無"),
      wordText("施工照片數量", Array.isArray(entry.photo_paths) ? entry.photo_paths.length : 0),
      new d.Paragraph({ spacing: { before: 240, after: 160 }, children: [new d.TextRun({ text: "施工照片", bold: true, size: 24, font: "Microsoft JhengHei" })] })
    ];
    let embedded = 0, failed = 0;
    for (let index = 0; index < (Array.isArray(entry.photo_paths) ? entry.photo_paths.length : 0); index++) {
      const path = entry.photo_paths[index];
      try {
        const signed = await supabaseClient.storage.from(PHOTO_BUCKET).createSignedUrl(path, 600);
        if (signed.error || !signed.data || !signed.data.signedUrl) throw new Error((signed.error && signed.error.message) || "無法取得照片連結");
        const response = await fetch(signed.data.signedUrl);
        if (!response.ok) throw new Error("照片下載失敗：HTTP " + response.status);
        const buffer = await response.arrayBuffer();
        const mimeType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
        const extension = mimeType.includes("png") ? "png" : (mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "");
        if (!extension) throw new Error("目前僅支援將 JPG/JPEG 或 PNG 照片嵌入 Word");
        const bytes = new Uint8Array(buffer), dimensions = await getImageDimensions(bytes, mimeType);
        children.push(new d.Paragraph({ spacing: { before: 120, after: 80 }, children: [new d.TextRun({ text: "照片 " + (index + 1), bold: true, size: 20 })] }));
        children.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 220 }, children: [new d.ImageRun({ data: bytes, transformation: dimensions, type: extension })] }));
        embedded++;
      } catch (error) {
        failed++;
        children.push(new d.Paragraph({ spacing: { after: 100 }, children: [new d.TextRun({ text: "照片 " + (index + 1) + " 未能嵌入：" + (error.message || "未知錯誤"), color: "AA3333", size: 18 })] }));
      }
    }
    if (!entry.photo_paths || !entry.photo_paths.length) children.push(new d.Paragraph({ children: [new d.TextRun({ text: "本筆紀錄沒有附加施工照片。", size: 20 })] }));
    children.push(new d.Paragraph({ spacing: { before: 300 }, children: [new d.TextRun({ text: "文件產生日期：" + today(), size: 18, color: "666666" })] }));
    const doc = new d.Document({
      creator: "永鴻消防器材行",
      title: "施工紀錄_" + (entry.work_date || "") + "_" + (entry.site_name || ""),
      description: "永鴻消防每日施工報表單筆施工紀錄",
      sections: [{ properties: { page: { margin: { top: 720, right: 850, bottom: 720, left: 850 } } }, children }]
    });
    const blob = await d.Packer.toBlob(doc), url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url;
    const filenamePart = value => String(value || "").replace(/[\\\\/:*?"<>|]/g, "_").slice(0, 60);
    anchor.download = "永鴻消防施工紀錄_" + (entry.work_date || today()) + "_" + filenamePart(entry.site_name) + "_" + filenamePart(entry.equipment_name) + ".docx";
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    setExportMessage("Word 已產生：" + entry.site_name + "／" + entry.equipment_name + "。照片 " + ((entry.photo_paths && entry.photo_paths.length) || 0) + " 張，成功嵌入 " + embedded + " 張" + (failed ? "，另有 " + failed + " 張未能嵌入" : "") + "。", failed ? "" : "success");
  } catch (error) {
    console.error("Word 匯出失敗", error);
    setExportMessage("Word 匯出失敗：" + (error.message || error) + "。原始施工紀錄未受影響。", "error");
  } finally { buttons.forEach(button => button.disabled = false); }
}

async function exportExcel(singleItem = false, entryId = null) {
  if (!window.ExcelJS) {
    setExportMessage("Excel 匯出元件載入失敗，請重新整理頁面後再試。", "error");
    return;
  }
  const selectedSites = singleItem
    ? [...document.querySelectorAll('input[name="exportSite"]:checked')].map(input => input.value)
    : [];
  if (singleItem && !selectedSites.length) {
    setExportMessage("請至少勾選一個要匯出的施工場所。", "error");
    return;
  }
  const buttons = [$("exportExcelBtn"), $("exportSingleItemExcelBtn")].filter(Boolean);
  buttons.forEach(btn => btn.disabled = true);
  setExportMessage("正在整理施工明細與照片，請稍候…");
  try {
    // 匯出時重新依目前畫面篩選條件讀取，避免使用者未按「套用篩選」而匯出舊結果。
    // 單筆匯出依目前登入者可讀取的資料重新查詢，不受未套用的篩選欄位影響。
    let entries = await fetchEntries(entryId ? {} : readFilters());
    if (entryId) entries = entries.filter(e => String(e.id) === String(entryId));
    if (!entryId && selectedSites.length) entries = entries.filter(e => selectedSites.includes(e.site_name));
    if (!entries.length) {
      setExportMessage("目前條件沒有可匯出的施工紀錄。", "error");
      return;
    }
    entries = sortExportEntries(entries);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "永鴻消防器材行";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.subject = "每日施工報表";
    workbook.title = "永鴻消防施工日報明細";
    const ws = workbook.addWorksheet("施工明細", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [
      { header: "施工日期", key: "date", width: 14 },
      { header: "施工場所", key: "site", width: 28 },
      { header: "場所地址", key: "address", width: 28 },
      { header: "樓層／區域", key: "area", width: 18 },
      { header: "施工項目", key: "item", width: 24 },
      { header: "規格", key: "spec", width: 18 },
      { header: "施工方式", key: "type", width: 14 },
      { header: "數量", key: "quantity", width: 10 },
      { header: "單位", key: "unit", width: 10 },
      { header: "施工狀態", key: "status", width: 14 },
      { header: "點位／編號", key: "point", width: 22 },
      { header: "備註", key: "notes", width: 38 },
      { header: "照片數量", key: "photoCount", width: 12 },
      { header: "填報人", key: "worker", width: 18 }
    ];
    styleWorksheetHeader(ws.getRow(1));
    entries.forEach(entry => {
      const row = ws.addRow({
        date: entry.work_date || "", site: entry.site_name || "", address: entry.site_address || "",
        area: entry.floor_area || "", item: entry.equipment_name || "", spec: entry.equipment_spec || "",
        type: entry.work_type || "", quantity: Number(entry.quantity || 0), unit: entry.unit || "",
        status: entry.status || "", point: entry.point_name || "", notes: entry.notes || "",
        photoCount: Array.isArray(entry.photo_paths) ? entry.photo_paths.length : 0,
        worker: entry.created_by_name || ""
      });
      row.height = 25;
      row.eachCell(cell => { cell.alignment = { vertical: "middle", wrapText: true }; cell.border = { bottom: { style: "hair", color: { argb: "FFD9E2E0" } } }; });
    });
    // 同一天、同一施工場所的連續明細合併日期與場所欄；每個施工項目仍保留獨立一列。
    let index = 0;
    while (index < entries.length) {
      const first = entries[index];
      let endIndex = index + 1;
      while (endIndex < entries.length &&
             entries[endIndex].work_date === first.work_date &&
             entries[endIndex].site_name === first.site_name) {
        endIndex++;
      }
      const firstRow = index + 2;
      const lastRow = endIndex + 1;
      if (endIndex - index >= 2) {
        ws.mergeCells(firstRow, 1, lastRow, 1);
        ws.mergeCells(firstRow, 2, lastRow, 2);
        ws.getCell(firstRow, 1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        ws.getCell(firstRow, 2).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      }
      index = endIndex;
    }
    ws.autoFilter = { from: "A1", to: `N${entries.length + 1}` };
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
    ws.headerFooter.oddFooter = "永鴻消防器材行｜每日施工報表　&P / &N";
    const photoResult = await addPhotoSheet(workbook, entries);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filenamePart = value => String(value || "").replace(/[\\/:*?"<>|]/g, "_").slice(0, 60);
    const singleSuffix = entryId && entries[0] ? "_" + (entries[0].work_date || "") + "_" + filenamePart(entries[0].site_name) + "_" + filenamePart(entries[0].equipment_name) : "";
    const suffix = singleSuffix || (selectedSites.length ? `_${selectedSites.length === 1 ? selectedSites[0] : `選取${selectedSites.length}個場所`}` : "");
    a.download = `永鴻消防施工日報_${today()}${filenamePart(suffix)}.xlsx`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    const photoMessage = photoResult.total
      ? `照片 ${photoResult.total} 張，已嵌入 ${photoResult.count} 張${photoResult.failed ? `，另有 ${photoResult.failed} 張保留連結或未能嵌入` : ""}。`
      : "本次紀錄沒有附加照片。";
    setExportMessage(`Excel 已產生，共 ${entries.length} 筆明細。${photoMessage}`, photoResult.failed ? "" : "success");
  } catch (err) {
    console.error("Excel 匯出失敗", err);
    setExportMessage(`匯出失敗：${err.message || err}。原始施工紀錄未受影響。`, "error");
  } finally {
    buttons.forEach(btn => btn.disabled = false);
  }
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
  $("forgotPasswordBtn").addEventListener("click", requestPasswordReset);
  $("passwordResetForm").addEventListener("submit", updatePassword);
  $("catalogForm").addEventListener("submit", saveCatalogItem);
  $("catalogResetBtn").addEventListener("click", resetCatalogForm);
  $("catalogRefreshBtn").addEventListener("click", loadCatalogManager);
  $("catalogList").addEventListener("click", catalogAction);
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
  $("exportExcelBtn").addEventListener("click", () => exportExcel(false));
  $("exportSingleItemExcelBtn").addEventListener("click", () => exportExcel(true));
  $("clearExportSitesBtn").addEventListener("click", () => {
    document.querySelectorAll('input[name="exportSite"]').forEach(input => { input.checked = false; });
  });
  $("statsBtn").addEventListener("click", loadStats);
  $("recordsList").addEventListener("click", async event => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    const entry = cachedEntries.find(item => item.id === btn.dataset.id);
    if (!entry) return;
    if (btn.dataset.action === "edit") startEdit(entry);
    if (btn.dataset.action === "delete") await deleteEntry(entry.id);
    if (btn.dataset.action === "export-excel") await exportExcel(false, entry.id);
    if (btn.dataset.action === "export-word") await exportEntryWord(entry.id);
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

  // 必須在建立 Supabase client 前記住網址是否帶有 recovery 標記，
  // 因為 client 可能在處理驗證連結時變更網址 hash。
  let recoveryMode = isPasswordRecoveryLink();
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 先註冊事件，再呼叫 getSession，避免錯過 PASSWORD_RECOVERY 事件。
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      recoveryMode = true;
      showPasswordResetPanel();
      return;
    }

    // 重設流程剛載入時，不要讓初始登入工作階段搶先切回工作台。
    if (recoveryMode && event !== "SIGNED_OUT") {
      return;
    }

    // 避免在 auth callback 內直接執行太多同步工作。
    setTimeout(() => onSession(session), 0);
  });

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setMessage("loginMessage", error.message, "error");
    return;
  }

  if (recoveryMode) {
    showPasswordResetPanel();
  } else {
    await onSession(data.session);
  }
}
document.addEventListener("DOMContentLoaded", init);
