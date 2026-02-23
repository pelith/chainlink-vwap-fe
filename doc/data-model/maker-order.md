# MakerOrder（Maker 報價單）

Maker 在「My Quotes」建立的 RFQ 報價單，可視為市集上 Order 的 Maker 視角，含狀態與建立時間。

## 對應程式

- 型別：`src/modules/my-quotes/types/my-quotes.types.ts`
- 模組：`my-quotes`

## 欄位說明

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | 訂單唯一識別 |
| `pair` | `string` | 交易對（如 WETH/USDC） |
| `direction` | `"SELL_WETH" \| "SELL_USDC"` | 方向：賣出 WETH 或賣出 USDC |
| `amount` | `number` | 數量 |
| `token` | `string` | 標的代幣（WETH 或 USDC） |
| `delta` | `number` | 價格偏移 |
| `minAmountOut` | `number` | 最少可接受之對方代幣數量 |
| `expiryHours` | `number` | 到期小時數（無 expiryMinutes，與 Order 略有差異） |
| `status` | `"active" \| "filled" \| "cancelled" \| "expired"` | 訂單狀態 |
| `createdAt` | `Date` | 建立時間 |

## 狀態說明

| 狀態 | 說明 |
|------|------|
| `active` | 有效報價，顯示於市集供 Taker 填單 |
| `filled` | 已被 Taker 填單，對應 Trade 已成立 |
| `cancelled` | Maker 取消 |
| `expired` | 逾時未成交 |

## 使用情境

- 建立報價：`CreateQuoteForm` 送出後產生新的 MakerOrder（status: active）
- 管理報價：`OrderManagement` 列表顯示、取消（改為 cancelled）
- 風險監控：`RiskMonitor` 依現有 MakerOrder 計算曝險

## 與其他模型的關係

- **Order**：同一筆報價在市集上以 Order 形式呈現（不含 status/createdAt）
- **Trade**：當 Taker 填單後，該 MakerOrder 可視為 filled，並產生一筆 Trade（Maker 端）
