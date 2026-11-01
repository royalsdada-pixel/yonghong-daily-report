# 永鴻消防器材行｜每日施工報表（第一版）

本專案是手機優先的靜態網頁，使用 GitHub Pages 發佈，Supabase Auth 登入與 Postgres 資料庫儲存資料。

## 專案檔案

- `index.html`：網頁結構與登入畫面
- `styles.css`：手機優先版面
- `app.js`：登入、施工紀錄新增／修改／刪除、篩選、統計、CSV 匯出
- `schema.sql`：資料表、初始設備目錄、登入角色、RLS 與施工照片 Storage 權限政策
- `.nojekyll`：GitHub Pages 設定輔助檔

## 重要安全提醒

1. 前端只能放 Supabase **Project URL** 與 **anon / publishable key**。
2. **絕不可**把 `service_role`、secret key、資料庫密碼放進 `app.js` 或公開 GitHub 儲存庫。
3. 本版本不提供公開註冊。公司管理者需從 Supabase Dashboard 的 Authentication > Users 建立使用者。
4. 施工人員預設只能讀取、修改及刪除自己建立的紀錄；主管可讀取及管理全公司紀錄。
5. 任何資料庫正式上線前，請先用一個測試施工人員帳號及一個主管帳號測試權限。

## A. 建立 Supabase 專案

1. 使用瀏覽器開啟 https://supabase.com/ ，登入或註冊。
2. 建立新 Project，設定專案名稱與資料庫密碼。資料庫密碼請自行妥善保存，不要貼給任何人。
3. 等待資料庫建立完成。
4. 進入 Project 的 SQL Editor，新增查詢，貼上 `schema.sql` 全文並執行。
5. 進入 Project Settings / API（或 Connect，依介面版本而異），複製 Project URL 及 **anon / publishable key**。
6. 在 Authentication 設定中確認 Email 登入可用。建議正式使用時啟用電子郵件驗證，並限制管理者建立帳號；若啟用驗證，使用者需先完成信箱驗證才能登入。
7. 在 Authentication > URL Configuration 設定 Site URL 與 Redirect URLs。部署後加入你的 GitHub Pages 網址，例如 `https://你的GitHub帳號.github.io/你的儲存庫名稱/`。尚未部署前可先使用 localhost 測試網址。

## B. 建立公司帳號及主管權限

1. 進入 Supabase Dashboard > Authentication > Users。
2. 使用 Add user / Create new user 建立每位施工人員的 Email 與密碼。請不要共用帳號。
3. `schema.sql` 的觸發器會自動在 `public.profiles` 建立預設 `worker` 角色。
4. 建立主管帳號後，複製該帳號的 User UID。
5. 在 SQL Editor 執行以下 SQL，將 UUID 替換成主管的實際 UID：

```sql
update public.profiles
set role = 'supervisor'
where id = '貼上主管的實際 User UID';
```

6. 施工人員不應獲得 Supabase 專案管理權限。只需獲得網站登入帳號。

## C. 設定前端連線

1. 開啟 `app.js`。
2. 找到最上方兩個設定：

```js
const SUPABASE_URL = "請填入你的_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "請填入你的_SUPABASE_ANON_OR_PUBLISHABLE_KEY";
```

3. 將字串替換成自己的 Project URL 與 anon / publishable key。請保留引號。
4. 不要使用 service_role 或 secret key。
5. 儲存檔案。

## D. 部署到 GitHub Pages

建議使用電腦操作 GitHub 初次設定；之後日常填報可用 iPhone。

1. 登入 GitHub，建立一個新的 Repository，例如 `yonghong-daily-report`。
2. 將 `index.html`、`styles.css`、`app.js`、`.nojekyll` 上傳到 Repository 根目錄。`README.md` 可以一併上傳。
3. `schema.sql` 是資料庫初始化檔案，可放在儲存庫供內部維護，但它不需要由網頁載入。若公司不希望公開資料庫結構，可不要上傳它，只保存在公司安全位置。
4. 進入 Repository > Settings > Pages。
5. 在 Build and deployment 選擇 Deploy from a branch，分支選 `main`，資料夾選 `/(root)`，儲存。
6. 等待 GitHub Pages 發佈完成，開啟顯示的網址。
7. 回到 Supabase Authentication > URL Configuration，把正式網址加入 Redirect URLs。
8. 重新整理網頁，測試登入、建立紀錄、重新整理後是否仍存在。

## E. iPhone 操作方式

1. 用 iPhone Safari 開啟 GitHub Pages 網址。
2. 點 Safari 的「分享」按鈕。
3. 選擇「加入主畫面」。
4. 命名為「永鴻施工日報」，點「加入」。
5. 從主畫面圖示開啟，使用公司帳號登入。
6. 新增施工時，先選日期與場所，再選設備、規格、施工方式、數量、單位及狀態，最後按「儲存施工紀錄」。
7. 到「施工紀錄」可篩選日期、場所、施工方式或狀態；CSV 可用 Excel 或試算表開啟。
8. 使用「數量統計」依日期範圍查看設備及施工方式加總。
9. 新增施工紀錄時，可在「施工照片」選擇多張照片；iPhone 通常會提供拍照或從照片圖庫選取的選項。
10. 照片會放在私人 Storage bucket `work-photos`，資料庫只保存照片路徑；查看既有照片時由系統產生限時簽名網址。

## F. 施工照片設定與注意事項

- 執行更新版 `schema.sql` 會建立／補上 `work_entries.photo_paths`，並建立私人 `work-photos` bucket 及 Storage RLS policies。
- 每張照片上限 8 MB，允許 JPEG、PNG、WebP、HEIC、HEIF。若 HEIC 預覽失敗，請改選 JPEG。
- 在 Supabase Dashboard > Storage 確認 `work-photos` 是 **Private**，不可公開整個 bucket。
- 新增照片時，先儲存施工紀錄，再上傳照片；若照片上傳失敗，施工紀錄仍可能已保存，請編輯該筆紀錄後重試。
- CSV 匯出的是照片路徑文字，不會把圖片本體嵌入 CSV。
- 第一版尚未提供單張照片刪除、照片註解、PDF 內嵌照片與批次壓縮。請勿上傳含不必要個資的照片。

## G. 權限測試清單

正式投入工作前，至少測試：

- [ ] 施工人員 A 可以登入並新增紀錄。
- [ ] 施工人員 A 重新登入後仍看得到自己的紀錄。
- [ ] 施工人員 B 登入後看不到 A 的紀錄。
- [ ] 主管登入後看得到 A、B 的紀錄。
- [ ] 施工人員不能自行把自己的角色改成 supervisor。
- [ ] 未登入者無法讀取施工紀錄。
- [ ] CSV 匯出內容與目前篩選結果一致。
- [ ] 不同手機登入後，看到的是同一份雲端資料。

## 第一版的範圍與限制

- 目前採「一筆設備／施工項目一列」設計。同一天同一場所的不同設備，分別新增紀錄。
- 場所名稱目前是文字欄位，能快速輸入不同場所；第一版尚未建立獨立場所管理頁面。
- 主管可查看全公司紀錄，但目前列表不顯示填報人姓名；可在下一版加入 profiles 關聯查詢。
- CSV 匯出依目前已載入的篩選結果。查詢最多載入 2,000 筆，若未來資料量大，需改為分頁匯出。
- 目前使用線上儲存，不具備離線自動同步。
- 規格選項初始值只是範例，請按公司實際設備規格調整。
- 本版本尚未加入 PDF 正式版面、照片附件、簽名、審核流程、操作稽核日誌及多公司隔離功能。

## 故障排查

- **登入失敗**：確認 Email／密碼、Supabase Auth 設定與 Redirect URLs。
- **登入成功但讀取 profile 失敗**：確認 `schema.sql` 已完整執行，並確認 Auth 使用者建立後 `profiles` 有對應資料。
- **儲存失敗／permission denied**：確認 RLS 政策已建立，登入使用者的 profile 存在。
- **設備清單未載入**：確認 `equipment_catalog` 有資料且登入者可以讀取；若目錄查詢失敗，網頁會暫用內建選項，但正式儲存仍需資料庫正常運作。
- **更新程式後手機仍顯示舊畫面**：在 Safari 重新整理頁面，必要時關閉網頁再開啟；GitHub Pages 更新可能需要稍候。
