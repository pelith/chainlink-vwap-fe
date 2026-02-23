# Connect Wallet Button — Proposal

## Why

應用需要讓使用者透過 Web3 錢包連線以進行鏈上操作（例如報價、交易）。預設使用 Sepolia 測試網，並透過 Reown AppKit（useAppKit）開啟連線 modal，連線後需在 UI 顯示已連線錢包地址（來自 useAppKitAccount），以建立清楚的「已連線」狀態與後續功能入口。

## What Changes

- 在 Header 提供 **Connect Wallet** 按鈕，點擊後透過 Reown AppKit 的 `useAppKit().open()` 開啟連線 modal。
- 預設鏈為 **Sepolia**（已在 `wagmi.ts` 設定，不需變更）。
- 錢包連線後（依據 `useAppKitAccount` 的 `isConnected` / `address`）改為顯示 **已連線錢包地址**（可縮短顯示，例如 `0x1234…5678`），不再只顯示「Connect Wallet」。
- 網路標籤由「Ethereum」改為 **Sepolia**，與實際預設鏈一致。

## Capabilities

### New Capabilities

- `connect-wallet-button`: Header 上的 Connect Wallet 按鈕；點擊開啟 AppKit modal；連線後顯示錢包地址；預設鏈 Sepolia；依賴 `@reown/appkit/react` 的 `useAppKit`、`useAppKitAccount`。

### Modified Capabilities

- （無既有 spec 變更）

## Impact

- **程式**：`src/components/Header.tsx` — 整合 `useAppKit`、`useAppKitAccount`，按鈕行為與連線狀態顯示。
- **依賴**：已使用 `@reown/appkit`、`@reown/appkit-adapter-wagmi`、`wagmi`，無新增依賴。
- **環境**：需 `VITE_REOWN_PROJECT_ID`（已存在）；Sepolia RPC 使用 `VITE_SEPOLIA_RPC_URL` 或預設。
