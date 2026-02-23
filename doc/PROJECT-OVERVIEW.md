# Chainlink VWAP Spot 專案簡述

## 一句話說明

**Chainlink VWAP Spot** 是一個基於 **12 小時 VWAP（成交量加權平均價）** 的 **現貨 RFQ（報價請求）** 交易前端：Maker 建立報價、訂單出現在市集，Taker 填單後資金鎖倉 12 小時依 VWAP 結算或退還。

## 技術棧

- **框架**：TanStack Start（React 19）+ TanStack Router（file-based routing）
- **樣式**：Tailwind CSS + Shadcn UI
- **Web3**：wagmi、viem、Reown AppKit（錢包連線）
- **狀態**：Zustand、TanStack Query
- **環境**：T3Env 型別安全、Vite 建置

## 核心流程

1. **Maker**：在「My Quotes」建立報價（含 delta、到期時間）→ 報價顯示於市集  
2. **Taker**：在市集瀏覽訂單 → 點 Fill → 確認並鎖定資金 → 產生 **Trade**  
3. **結算**：鎖倉 12 小時後依 **12H VWAP** 決定結算價 → 使用者可 **Settle**（依 finalVWAP 結算）或 **Refund**（領回鎖定資金）

訂單與交易列表來自**後端 API**；Fill / Settle / Refund 為**鏈上合約**操作，後端 Indexer 監聽事件後更新資料。

## 主要頁面

| 路由 | 功能 |
|------|------|
| `/` | 首頁、市集訂單列表 |
| `/my-quotes` | Maker 報價管理（建立、取消） |
| `/my-trades` | 鎖倉中 / 可結算 / 可退還 / 歷史交易 |

## 文件索引

規格與對接細節見 [doc/README.md](./README.md)：API、資料來源、操作流程、合約整合與資料模型。
