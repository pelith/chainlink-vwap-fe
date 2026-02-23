# Trade（交易／鎖倉單）

Taker 在市集填單後產生的「鎖倉交易」，代表雙方資金鎖定直至結算視窗結束，再依 VWAP 結算或退還。

## 對應程式

- 型別：`src/modules/my-trades/types/my-trades.types.ts`
- 模組：`my-trades`

## 欄位說明

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | `string` | 交易唯一識別 |
| `role` | `"Maker" \| "Taker"` | 當前使用者角色 |
| `status` | 見下表 | 交易狀態 |
| `depositedAmount` | `number` | 已存入數量 |
| `depositedToken` | `string` | 存入代幣（WETH 或 USDC） |
| `targetAmount` | `number` | 目標換得數量 |
| `targetToken` | `string` | 目標代幣 |
| `fillTime` | `Date` | 成交（鎖倉）時間 |
| `endTime` | `Date` | 結算視窗結束時間 |
| `settledTime?` | `Date` | 實際結算時間（已結算／已退還時） |
| `finalVWAP?` | `number` | 結算用 VWAP（ready_to_settle 後才有） |
| `receivedAmount?` | `number` | 結算後收到數量 |
| `refundedAmount?` | `number` | 結算後退還數量（多付的差額） |

## 狀態說明

| 狀態 | 說明 | 使用者可操作 |
|------|------|----------------|
| `locking` | 資金鎖定中，等待結算視窗結束 | 僅檢視 |
| `ready_to_settle` | 結算視窗已結束，可依 VWAP 結算 | 結算（Settle）或 退還（Refund） |
| `settled` | 已依 VWAP 結算 | 僅檢視（歷史） |
| `refunded` | 已退還、未結算 | 僅檢視（歷史） |
| `expired_refundable` | 已逾結算視窗，可領回退還 | 退還（Refund） |

## 使用情境

- **Locking**：`LockingTab` 顯示進行中的鎖倉
- **Ready to Settle**：`ReadyToSettleTab` 顯示可結算／可退還的單，操作 Settle / Refund
- **History**：`HistoryTab` 顯示已 settled 或 refunded 的紀錄

## 與其他模型的關係

- **Order / MakerOrder**：一筆 Trade 源自 Taker 在市集填寫一筆 Order（對應 Maker 的一筆 MakerOrder）
- 同一筆 Trade 在 Maker 與 Taker 端各有一筆紀錄，`role` 不同（Maker vs Taker）
