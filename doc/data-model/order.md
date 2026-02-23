# Order（市集訂單）

市集頁面（Marketplace）顯示的 RFQ 訂單，供 Taker 瀏覽並選擇填單。

## 對應程式

- 型別：`src/modules/marketplace/types/marketplace.types.ts`
- 模組：`marketplace`

## 欄位說明

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | 訂單唯一識別 |
| `direction` | `"SELL_WETH" \| "SELL_USDC"` | 方向：賣出 WETH 或賣出 USDC |
| `amount` | `number` | 數量 |
| `token` | `string` | 標的代幣（WETH 或 USDC） |
| `delta` | `number` | 價格偏移（基點或百分比） |
| `minAmountOut` | `number` | 最少可接受之對方代幣數量 |
| `expiryHours` | `number` | 到期小時數 |
| `expiryMinutes` | `number` | 到期分鐘數 |

## 使用情境

- 市集列表：`MarketList` 顯示所有可填單的 Order
- 填單：Taker 點擊「Fill」後在 `FillOrderModal` 確認並鎖定資金，建立一筆 Trade（Maker 的 MakerOrder 被 Taker 成交）

## 與其他模型的關係

- **MakerOrder**：市集上的 Order 來自 Maker 建立的 MakerOrder（Maker 視角為 MakerOrder，Taker 視角為 Order）
- **Trade**：Taker 填單後會產生一筆 Trade，狀態為 `locking`
