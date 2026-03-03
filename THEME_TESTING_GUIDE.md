# 主題系統測試指南

## 實施完成

動態主題切換系統已成功實施，包含以下功能：

### ✅ 已完成的功能

1. **三套主題配色**
   - 🎋 Bamboo & Flow (綠竹流水) - 預設主題
   - 🌌 Northern Future (未來極光)
   - 💰 Digital Gold (數位黃金)

2. **獨立 Dark Mode 支援**
   - 每套主題都有完整的 Light 和 Dark 版本
   - 共 6 種視覺組合 (3 主題 × 2 模式)

3. **Bamboo 主題特殊效果**
   - 竹子水墨畫背景圖 (`/public/bamboo-bg.jpg`)
   - 半透明卡片效果
   - 30% 透明度遮罩 (Light Mode: 白色 / Dark Mode: 黑色)

4. **其他主題純色背景**
   - Aurora 和 Gold 使用實色背景
   - 不透明卡片元素

5. **UI 整合**
   - Header 導航欄新增主題切換按鈕 (Palette 圖標)
   - Dropdown 選單顯示所有主題選項
   - 當前選中主題顯示 checkmark
   - Dark Mode 按鈕保持獨立運作

6. **狀態持久化**
   - 主題偏好存儲在 LocalStorage
   - Dark Mode 偏好存儲在 LocalStorage
   - 重新載入頁面後恢復上次設定

7. **平滑過渡動畫**
   - 0.3 秒 CSS transition
   - 顏色、背景、邊框等屬性自動過渡

## 測試清單

請按照以下步驟測試所有功能：

### 1. 啟動開發伺服器

```bash
pnpm dev
```

訪問 `http://localhost:3000`

### 2. 測試主題切換

#### 2.1 Bamboo Theme 測試
- [ ] Light Mode
  - [ ] 點擊 Palette 按鈕，選擇 "🎋 Bamboo & Flow"
  - [ ] 確認竹子背景圖顯示
  - [ ] 確認背景有淡白色遮罩
  - [ ] 確認卡片和介面元素呈現半透明效果
  - [ ] 主色調為翠竹綠 (oklch(0.7 0.25 160))
  - [ ] 輔助色為流水藍 (oklch(0.6 0.18 230))
  
- [ ] Dark Mode
  - [ ] 點擊 Moon 圖標切換到 Dark Mode
  - [ ] 確認竹子背景圖變暗 (brightness: 0.4)
  - [ ] 確認遮罩變為深色 (30% 黑色)
  - [ ] 確認卡片仍保持半透明但顏色變深
  - [ ] 文字顏色正確反轉為淺色

#### 2.2 Aurora Theme 測試
- [ ] Light Mode
  - [ ] 切換到 "🌌 Northern Future"
  - [ ] 確認竹子背景圖消失
  - [ ] 確認背景為淡紫色 (oklch(0.99 0.005 280))
  - [ ] 主色調為紫紅極光 (oklch(0.6 0.2 330))
  - [ ] 輔助色為青綠極光 (oklch(0.7 0.15 190))
  - [ ] 卡片為不透明純色
  
- [ ] Dark Mode
  - [ ] 切換到 Dark Mode
  - [ ] 確認背景為深靛藍 (oklch(0.12 0.03 280))
  - [ ] 主色調變亮 (oklch(0.7 0.25 330))
  - [ ] 整體呈現深色科技感

#### 2.3 Gold Theme 測試
- [ ] Light Mode
  - [ ] 切換到 "💰 Digital Gold"
  - [ ] 確認竹子背景圖消失
  - [ ] 確認背景為淡金色 (oklch(0.98 0.005 60))
  - [ ] 主色調為琥珀金 (oklch(0.75 0.12 70))
  - [ ] 輔助色為深灰 (oklch(0.3 0.02 60))
  - [ ] 卡片為不透明純色
  
- [ ] Dark Mode
  - [ ] 切換到 Dark Mode
  - [ ] 確認背景為深碳灰 (oklch(0.12 0.015 60))
  - [ ] 金色變得更明亮璀璨 (oklch(0.8 0.14 70))
  - [ ] 整體呈現低調奢華感

### 3. 測試 UI 組件響應

每個主題和模式下，請檢查以下組件：

- [ ] **Header 導航欄**
  - Logo 顏色正確 (使用 primary)
  - 連結 hover 效果正確
  - 當前頁面連結高亮正確
  
- [ ] **主題切換 Dropdown**
  - 按鈕 hover 效果
  - Dropdown 背景和文字顏色
  - Checkmark 顯示在當前主題上
  
- [ ] **Dark Mode 按鈕**
  - 圖標正確切換 (Sun/Moon)
  - Hover 效果正確
  
- [ ] **Network 指示器**
  - 背景色使用 muted
  - 文字使用 muted-foreground
  
- [ ] **Connect Wallet 按鈕**
  - 背景使用 primary
  - 文字使用 primary-foreground
  - Hover 效果 (opacity: 0.9)

### 4. 測試狀態持久化

- [ ] 切換主題後重新整理頁面，主題保持
- [ ] 切換 Dark Mode 後重新整理頁面，模式保持
- [ ] 關閉瀏覽器後重新開啟，設定依然保留

### 5. 測試過渡動畫

- [ ] 主題切換時有平滑的顏色過渡
- [ ] Dark Mode 切換時有平滑的過渡
- [ ] Bamboo 背景圖切換時無閃爍

### 6. 測試邊界情況

- [ ] 快速連續點擊主題切換，無卡頓或錯誤
- [ ] 快速切換 Dark Mode，無閃爍
- [ ] 主題和 Dark Mode 同時切換，效果正確

## 技術架構說明

### 檔案結構

```
src/
├── config/
│   └── themes.ts              # 主題配置與 CSS variables 定義
├── contexts/
│   └── theme-context.tsx      # 主題狀態管理與 runtime injection
├── components/
│   └── Header.tsx             # 主題切換 UI
└── styles.css                 # CSS attribute selector 定義
```

### 核心實現原理

1. **CSS Variables + Attribute Selectors**
   ```css
   [data-theme='bamboo'] { --primary: oklch(...); }
   [data-theme='aurora'] { --primary: oklch(...); }
   [data-theme='gold'] { --primary: oklch(...); }
   ```

2. **Runtime CSS Injection (雙重保險)**
   ```typescript
   document.documentElement.style.setProperty('--primary', value);
   ```

3. **Bamboo 背景特殊處理**
   ```typescript
   if (theme === 'bamboo') {
     document.body.classList.add('theme-bamboo');
   }
   ```

### 為何能動態切換？

與之前失敗的 `@theme inline` 方案不同，現在使用：
- ✅ `[data-theme]` attribute selector (runtime 解析)
- ✅ JavaScript 直接注入 CSS variables (runtime 執行)
- ✅ Tailwind 的 `@theme inline` 僅作為映射層

## 已知問題

無已知問題。

## 維護指南

### 新增新主題

1. 在 `src/config/themes.ts` 添加新主題定義
2. 在 `src/styles.css` 添加對應的 CSS variables
3. 主題會自動出現在 Dropdown 選單中

### 修改現有主題顏色

直接修改 `src/config/themes.ts` 中對應主題的 variables 值。

### 調整過渡動畫時間

修改 `src/styles.css` 中的 `transition` 屬性：
```css
transition: background-color 0.3s ease, color 0.3s ease, ...
```

## 成功標準

如果以上所有測試項目都通過，則主題系統實施成功！✨

