Reference: [architect](./.agents/skills/react-architect-skills)

## UI 顯示文案

**UI 顯示文案一律使用英文**。包含：按鈕文字、toast 訊息、表單提示、錯誤訊息、loading 狀態等。實作或新增功能時請以英文撰寫使用者可見的文案。

## 文件查閱（doc/）

規格與說明文件索引見 [doc/README.md](./doc/README.md)。實作或改動時請依情境查閱：

| 情境 | 需查閱 |
|------|--------|
| 對接後端、呼叫訂單／交易 API | [doc/api.md](./doc/api.md) |
| 釐清資料來自後端還是鏈上、誰負責哪個操作 | [doc/data-sources.md](./doc/data-sources.md) |
| 理解整體流程（Maker/Taker、鎖倉、結算） | [doc/operation-flow.md](./doc/operation-flow.md) |
| 鏈上合約結構、Fill/Settle/Refund 整合 | [doc/contracts/frontend-integrate.md](./doc/contracts/frontend-integrate.md) |
| 領域模型（Order / MakerOrder / Trade）與模組對應 | [doc/data-model/README.md](./doc/data-model/README.md)、[order](./doc/data-model/order.md)、[maker-order](./doc/data-model/maker-order.md)、[trade](./doc/data-model/trade.md) |