# 資料模型總覽

本專案前端領域資料模型分屬三個功能模組，對應「市集訂單」「Maker 報價」「交易／鎖倉」三種視角。

## 模型一覽

| 模型 | 檔案 | 模組 | 說明 |
|------|------|------|------|
| **Order** | [order.md](./order.md) | marketplace | 市集上的 RFQ 訂單（Taker 視角） |
| **MakerOrder** | [maker-order.md](./maker-order.md) | my-quotes | Maker 建立的報價單（含狀態與建立時間） |
| **Trade** | [trade.md](./trade.md) | my-trades | 填單後產生的鎖倉交易，含結算／退還狀態 |

## 關係簡圖

```
Maker 建立報價                    Taker 瀏覽市集
     │                                  │
     ▼                                  ▼
 MakerOrder  ────────────────►  Order（同一筆報價）
 (my-quotes)                      (marketplace)
     │                                  │
     │         Taker 填單 (Fill)        │
     │◄─────────────────────────────────┘
     │
     ▼
  Trade（Maker 與 Taker 各一筆，role 不同）
  (my-trades)
     │
     ├─ locking → ready_to_settle → settled / refunded / expired_refundable
```

## 路由與模型對應

- **/**：首頁（入口）
- **/my-quotes**：Maker 報價管理 → MakerOrder
- **/**（市集）：訂單列表與填單 → Order → 產生 Trade
- **/my-trades**：鎖倉與結算管理 → Trade

各模型欄位與狀態細節請見上表連結之個別文件。

## 資料來源（後端 vs 鏈上）

訂單與交易的**資料從哪裡來**、**操作由誰執行**，請見專案根目錄下的 [資料來源分析](../data-sources.md)（[doc/data-sources.md](../data-sources.md)）：後端 API 負責 Order 建立／查詢、Trade 查詢與 DisplayStatus；鏈上合約負責 Fill、Settle、Refund 的執行，後端 Indexer 監聽事件後寫入 DB，前端再透過 API 取得最新狀態。
