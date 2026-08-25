# AGENTS.md

本檔提供 Codex 在此 repository 工作時必須遵守的指引。這是**樞紐文件**，只放工作規則與重點索引；所有細節文檔一律放在 [`docs/`](docs/README.md)。

## 這個 Repo 是什麼

`github.com/lily0822/workspace.git` 是商品站 `pinkkkuin_shop` 的**後台管理端**。

- 純原生 HTML / CSS / JavaScript，**沒有 `package.json`、沒有建置步驟、沒有測試框架**。
- 主線是 `lily-backend.html`（麗麗後台、商品站後台）和 `lily-backend-Code.gs`（Apps Script API）。
- 另外一併托管 `daniel-backend.html`（大牛後台、獨立系統）與三個 legacy 靜態頁，見 [docs/module-legacy-portal.md](docs/module-legacy-portal.md)。

## 動手前必讀

完整風險清單見 [docs/risk-review.md](docs/risk-review.md)；以下只列動手前一定要知道的重點。

1. **寫入與讀取的主從相反**：寫入以 Google Sheet 為主、Supabase 為鏡像；讀取以 Supabase 為主、Sheet 為 fallback。鏡像失敗會被 `safeSupabaseMirror()` 吞掉，後台仍顯示成功，但前台看不到新資料。詳見 [docs/architecture.md](docs/architecture.md)。
2. **前台只讀 Supabase**：「後台存檔成功」不等於「前台會更新」。
3. **分支**：`main` = 開發分支，`release/workspace` = 正式環境部署分支。目前 `.github/workflows/static.yml` 仍綁 `main`，尚未切換，見 [docs/environments.md](docs/environments.md)。
4. **本機開發一律走 staging**：複製 `backend-env.example.js` 為 `backend-env.local.js`（已 gitignore），填 staging Apps Script URL。沒填時 `fetchAPI` 會直接擋下，避免誤打正式 API。
5. **總帳表與 legacy 擺攤紀錄只存在 localStorage**，沒有後端備份；動到相關程式碼要特別小心。
6. **圖片一律走前台的 `/api/upload` 到 Cloudinary**，後台不持有任何金鑰；`data:` URL 會被 `normalizeProductImageUrl()` 直接丟棄。
7. **`schedule_settings` 被當成通用 KV 表**（`type` 當 key、`image` 欄位塞 JSON），這是已知技術債；新增設定前先讀 [docs/module-brand-appearance.md](docs/module-brand-appearance.md)。

## 工作規則

### 通用

- **語言**：文檔與對話一律使用繁體（正體）中文。
- **需求釐清與建議**：需求不明確時主動提出；有更好的做法或風險也一併反饋，不要悶著頭做。
- **模塊化**：程式碼須適度模塊化。共用邏輯（型別、狀態標籤、格式化）集中收斂，不要散落各處。本 repo 目前是單一超大 HTML 檔，新增功能時盡量沿用既有的共用函式，不要重複造輪子。
- **保護既有變更**：工作樹可能有使用者或其他流程留下的變更；不要還原未經要求的修改。若變更與任務相關，先讀懂再接著做。

### 文檔

- 除本檔 `AGENTS.md` 外，所有文檔一律放 **`docs/`**。
- 新增**功能模塊**時建立 `docs/module-{英文名稱}.md`，固定五段結構：**需求 / 選項與取捨 / 定案（現況實作） / 資料源與呼叫關係 / 後續待辦**，並在 [docs/README.md](docs/README.md) 加連結；開發過程持續更新。
- 適用：新增後台功能模塊、金流 / 物流串接、改動 Apps Script API、抽出共用模塊等。
- 不適用：改文案、調樣式、新增商品資料、修 bug。這類直接做即可。
- 不針對特定模塊的文檔（架構、環境、資料模型等）可自由命名，不必套用 `module-` 前綴。
- **發現風險時一律登錄到 [docs/risk-review.md](docs/risk-review.md)**：給編號、判嚴重度、寫影響與建議處置。模塊文檔的「後續待辦」只放一行連結與嚴重度，不重複描述細節。風險處理完畢時兩邊一起更新。
- **模塊需求變動時，完成後必須同步修改對應的 `docs/module-*.md`**，不得只改程式碼：
  - 需求本身改了：更新「需求」，並在「選項與取捨」補上這次為什麼這樣改。
  - 實作方式改了：更新「定案（現況實作）」，讓文檔與程式碼一致。
  - 資料流或 API 改了：更新「資料源與呼叫關係」。
  - 待辦做掉了或新增了：更新「後續待辦」。
  - 文檔更新算在該工作項目內，與程式碼**同一次提交**，不留到之後補。

### 完工檢查

本 repo **沒有 `package.json`，不存在 `npm run lint` / `typecheck` / `build`**。不要嘗試執行，也不要回報跑過這些指令。

每個工作項目完成後執行下列檢查，並**如實回報結果**；失敗不得略過或隱瞞。

1. **瀏覽器實測**（唯一有效的驗證方式）：
   - 用本機 HTTP server 開 `lily-backend.html`（必須先設好 `backend-env.local.js` 指向 staging）。
   - 確認頁面沒有 console error，實際操作動到的功能：新增、存檔、重新整理、資料還在。
   - 動到會寫 Supabase 的功能時，**額外確認 staging Supabase 是否真的有資料**，因為鏡像失敗不會擋住存檔，畫面仍會顯示成功。
2. **改動 `lily-backend-Code.gs` 時**：貼回 Apps Script 編輯器重新部署 staging Web App 後才算完成。
3. **文檔同步**：動到任一模塊時，一併確認對應的 `docs/module-*.md` 已更新；未更新視為工作項目未完成。
4. **本專案尚無測試框架**。要回報測試結果時，明確說明「本專案尚無測試」，不要假裝跑過。

### 分支與部署

- 功能開發、修 bug 一律進 `main`。
- 上正式站時把 `main` 合併進 `release/workspace` 再推送，不要直接 push `release/workspace`。
- 部署設定與現況落差見 [docs/environments.md](docs/environments.md)。

## 專案慣例

- UI 文案以**繁體中文**為主。
- id 一律用 `Date.now()` 產生；跨表比對一律先 `String()` 再比較（`sameId`）。
- 出貨狀態存中文字串（`已出貨` / `未出貨`），不是 boolean。

## 文檔索引

完整索引見 [docs/README.md](docs/README.md)。

### 總覽

- [docs/architecture.md](docs/architecture.md)：系統架構、資料源呼叫關係、風險點
- [docs/environments.md](docs/environments.md)：環境、分支策略、部署
- [docs/data-model.md](docs/data-model.md)：Sheet、Supabase、前端欄位對應
- [docs/risk-review.md](docs/risk-review.md)：**風險登錄冊**（S1-S4 分級，含影響、觸發條件與建議處置）
- [docs/env-snapshot-2026-08-25.md](docs/env-snapshot-2026-08-25.md)：原始盤點快照（備查）

### 模塊文檔

- [docs/module-backend-api.md](docs/module-backend-api.md)：Apps Script Web App 與 Supabase 同步層
- [docs/module-media-upload.md](docs/module-media-upload.md)：圖片上傳與 Cloudinary
- [docs/module-purchasing.md](docs/module-purchasing.md)：叫貨管理
- [docs/module-customer-orders.md](docs/module-customer-orders.md)：客戶訂單明細
- [docs/module-product-management.md](docs/module-product-management.md)：現貨 / 預購商品管理
- [docs/module-product-tags.md](docs/module-product-tags.md)：商品標籤（IP / 類別）
- [docs/module-schedules.md](docs/module-schedules.md)：擺攤 / 連線時程
- [docs/module-brand-appearance.md](docs/module-brand-appearance.md)：品牌管理與前台外觀設定
- [docs/module-accounting.md](docs/module-accounting.md)：帳表管理
- [docs/module-exchange-rates.md](docs/module-exchange-rates.md)：匯率報表
- [docs/module-legacy-portal.md](docs/module-legacy-portal.md)：Portal 入口與 legacy 頁面
