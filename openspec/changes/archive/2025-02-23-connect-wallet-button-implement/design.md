# Connect Wallet Button — Design

## Context

- 本專案為 VWAP Spot 前端，需讓使用者透過 Web3 錢包連線以進行鏈上操作（報價、交易等）。
- 已採用 **Reown AppKit**（`@reown/appkit/react`）與 **wagmi**（`@reown/appkit-adapter-wagmi`），並在 `src/wagmi.ts` 設定 Sepolia 為預設鏈；`__root.tsx` 已掛載 `WagmiProvider` 與 AppKit。
- Header 為全域導覽元件，是放置「連線錢包」入口的合理位置；需與既有導覽、主題切換、網路標籤並存。

## Goals / Non-Goals

**Goals:**

- 在 Header 提供單一「Connect Wallet」入口，點擊後開啟 AppKit 連線 modal。
- 連線後在同一按鈕位置顯示已連線錢包地址（縮短格式），並可點擊開啟 AppKit 的 Account 視圖。
- 網路標籤顯示為 Sepolia，與實際預設鏈一致。
- 不新增依賴；僅使用既有 `useAppKit`、`useAppKitAccount` 與 wagmi 設定。

**Non-Goals:**

- 不實作自訂連線 modal 或錢包選擇 UI（由 AppKit 提供）。
- 不在此變更內處理鏈切換、disconnect 流程的額外 UI（仍可透過 AppKit Account 視圖操作）。
- 不更動 wagmi/AppKit 的鏈或 connector 設定（僅使用既有 Sepolia 設定）。

## Decisions

### 1. 使用 Reown AppKit 的 `open()` 開啟 modal

- **選擇**：`useAppKit().open({ view: 'Connect' })` 未連線時、`open({ view: 'Account' })` 已連線時，由 AppKit 負責連線／帳戶 UI。
- **理由**：專案已整合 AppKit，一致使用其 modal 可減少維護成本並保持 UX 一致。
- **替代**：自建連線 modal 或使用 wagmi 的 `useConnect` 直接綁按鈕 — 捨棄，因會重複實作且與現有 AppKit 設定重疊。

### 2. 連線狀態與地址來自 `useAppKitAccount`

- **選擇**：以 `useAppKitAccount()` 的 `isConnected`、`address` 決定按鈕文案（「Connect Wallet」vs 縮短地址）。
- **理由**：與 AppKit 狀態同步，且與 wagmi 透過 adapter 一致。
- **替代**：使用 wagmi 的 `useAccount` — 可並行，但 AppKit 為單一來源，用 `useAppKitAccount` 與 AppKit UI 一致。

### 3. 地址顯示為縮短格式（例如 `0x1234…5678`）

- **選擇**：在 Header 內實作 `shortenAddress(address, chars)`（例如前 4 後 4），僅在按鈕上顯示縮短格式。
- **理由**：Header 空間有限，完整地址可於 AppKit Account 或複製時取得。
- **替代**：顯示完整 address 或僅「Connected」— 前者太長，後者資訊不足；縮短格式為折衷。

### 4. 網路標籤顯示「Sepolia」

- **選擇**：UI 上固定或依當前鏈顯示「Sepolia」（與 `wagmi.ts` 預設鏈一致）。
- **理由**：proposal 要求與實際預設鏈一致，避免使用者誤以為在 mainnet。
- **替代**：沿用「Ethereum」— 與實際鏈不符，故不採用。

### 5. 單一元件內完成（Header）

- **選擇**：所有邏輯與 UI 集中在 `src/components/Header.tsx`（hooks + 按鈕 + 網路標籤）。
- **理由**：僅影響 Header 一處，無需抽共用模組；若未來多處需要，再抽出 hook/component。
- **替代**：抽出 `ConnectWalletButton` 元件 — 目前僅一處使用，YAGNI；之後可重構。

## Risks / Trade-offs

| 風險／取捨 | 緩解 |
|------------|------|
| AppKit 依賴 Reown 服務與 `VITE_REOWN_PROJECT_ID` | 專案已使用；文件與 env 範例中註明必要變數。 |
| 僅支援 Sepolia，若日後要多鏈 | 本次不變更鏈設定；多鏈時可改為依 `useAppKitNetwork()` 或 wagmi chain 顯示標籤並擴充設定。 |
| 地址縮短格式在不同長度下可能重複 | 實務上 4+4 已足夠辨識；必要時可改為 6+4 或加上 chainId。 |

## Migration Plan

- **部署**：前端僅改動 Header 行為與文案，無 API 或合約變更；部署後即生效。
- **回滾**：還原 Header 變更即可；不影響既有 wagmi/AppKit 設定。
- **環境**：確認 `VITE_REOWN_PROJECT_ID` 與 Sepolia RPC（`VITE_SEPOLIA_RPC_URL` 或預設）可用。

## Open Questions

- 無。若未來要支援鏈切換或「Disconnect」獨立按鈕，可再補 spec 與設計。
