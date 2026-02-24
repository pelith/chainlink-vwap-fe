# VWAP-RFQ 文件索引

本目錄為 Chainlink VWAP 前端的說明與規格文件，供開發對接與查閱。

---

## 前端慣例

| 項目 | 說明 |
|------|------|
| **UI 顯示文案** | 按鈕、toast、表單提示、錯誤訊息、loading 狀態等，一律使用英文 |

---

## 總覽文件

| 文件 | 說明 |
|------|------|
| [**整體操作流程圖**](./operation-flow.md) | Maker 報價、Taker 填單、鎖倉與結算／退還的流程圖與泳道說明 |
| [**資料來源分析**](./data-sources.md) | 後端 API vs 鏈上合約：各資料與操作由誰負責（Order、Trade、Fill、Settle 等） |
| [**VWAP-RFQ 後端 API**](./api.md) | 後端 REST API 規格（訂單、交易、健康檢查等），供前端對接使用 |

---

## 合約與整合

| 文件 | 說明 |
|------|------|
| [**VWAPRFQSpot 前端整合指南**](./contracts/frontend-integrate.md) | 鏈上合約資料結構（Order、Trade）、合約呼叫與前端整合要點 |
| [**EIP-712 簽名格式**](./eip712.md) | 訂單 EIP-712 typed data 格式，與後端驗證邏輯對齊，供 create order 簽名實作參考 |

---

## 資料模型

| 文件 | 說明 |
|------|------|
| [**資料模型總覽**](./data-model/README.md) | Order / MakerOrder / Trade 三模型關係、路由對應與資料來源連結 |
| [**Order**](./data-model/order.md) | 市集訂單（Marketplace），Taker 視角 |
| [**MakerOrder**](./data-model/maker-order.md) | Maker 報價單（My Quotes），含狀態與建立時間 |
| [**Trade**](./data-model/trade.md) | 填單後的鎖倉交易（My Trades），結算／退還狀態 |
