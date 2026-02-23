# 資料來源分析：後端 API vs 鏈上合約

本文件依 **VWAP-RFQ Spot Backend DDD PRD（v1.1）** 與鏈上流程，標示前端各資料與操作來自**後端 API** 或**鏈上合約**。

---

## 一、總覽

| 來源 | 負責內容 | 備註 |
|------|----------|------|
| **後端 API** | Order 建立／查詢、Trade 查詢、Order 過期處理 | Orderbook Context + Trade Context + API Layer |
| **鏈上合約** | 填單（Fill）、結算（Settle）、退還（Refund）、取消（若為鏈上） | 使用者發送交易；後端 Indexer 監聽事件並更新 DB |

**重要**：Trade 不由後端主動建立，而是 **Indexer 監聽到鏈上 Filled 事件後** 在後端建立並持久化；前端查 Trade 時是呼叫後端 **GET /trades**，資料來源仍是「鏈上事件經 Indexer 寫入 DB」。

---

## 二、來自後端的資料與 API

### 2.1 Orderbook Context（訂單）

後端 **Order Aggregate** 為 Maker 離線簽名訂單，由後端驗證、儲存與查詢。

| 後端 API | 用途 | 前端對應 |
|----------|------|----------|
| **POST /orders** | 建立訂單（CreateOrderService） | My Quotes「建立報價」→ 前端組 EIP-712 簽名後送此 API |
| **GET /orders** | 訂單列表／篩選（OrderQueryService） | 市集訂單列表、My Quotes 我的報價列表 |
| **GET /orders/:hash** | 單筆訂單（OrderQueryService） | 訂單詳情、填單前檢查 |

**後端 Order 欄位（對應前端 Order / MakerOrder）：**

| 後端欄位 | 前端對應 | 說明 |
|----------|----------|------|
| orderHash | Order.id / MakerOrder.id | 訂單唯一識別 |
| maker | — | 由後端／錢包取得，前端可從 auth 取得當前 address |
| makerIsSellETH | direction (SELL_WETH / SELL_USDC) | 布林轉方向列舉 |
| amountIn | amount, token | 數量 + 代幣 |
| minAmountOut | minAmountOut | 最少可接受數量 |
| deltaBps | delta | 價格偏移（基點） |
| deadline | expiryHours / expiryMinutes, expiredAt | 到期時間 |
| status (Active/Filled/Cancelled/Expired) | MakerOrder.status | 訂單狀態 |
| createdAt | MakerOrder.createdAt | 建立時間 |
| filledAt / cancelledAt / expiredAt | — | 可選顯示於詳情 |

**訂單過期**：由後端 **ExpireOrdersService** 排程處理（deadline < now 且 status == Active → Expired），前端不需計算過期，只讀後端回傳的 status。

---

### 2.2 Trade Context（交易查詢）

Trade 在鏈上成交後，由 **Blockchain Sync Context（Indexer）** 監聽事件寫入 DB；前端透過後端 **Trade Query API** 查詢。

| 後端 API | 用途 | 前端對應 |
|----------|------|----------|
| **GET /trades** | 查詢列表（依 address / status 等） | My Trades 列表（依當前錢包 address 篩選） |
| **GET /trades/:id** | 單筆交易 | 交易詳情、Settle/Refund 前檢查 |

**後端 Trade 欄位（對應前端 Trade）：**

| 後端欄位 | 前端對應 | 說明 |
|----------|----------|------|
| tradeId (orderHash) | Trade.id | 交易唯一識別 |
| maker / taker | — | 用於判斷前端 role（當前 address == maker → Maker） |
| makerIsSellETH | depositedToken, targetToken, role | 推得存入／目標代幣 |
| makerAmountIn / takerDeposit | depositedAmount（依 role 取其一） | 存入數量 |
| startTime / endTime | fillTime, endTime | 鎖倉開始／結算視窗結束 |
| status (Open/Settled/Refunded) | — | 後端存鏈上狀態，不直接暴露 |
| **DisplayStatus**（後端計算） | Trade.status | 見下表 |
| settlementPrice | finalVWAP | 結算價（VWAP） |
| makerPayout / takerPayout | receivedAmount | 依 role 取對應 payout |
| makerRefund / takerRefund | refundedAmount | 退還金額 |
| settledAt / refundedAt | settledTime | 結算／退還時間 |

**DisplayStatus 計算（後端 Domain Policy，前端不重算）：**

| 後端邏輯 | 前端 Trade.status |
|----------|-------------------|
| status == Settled → settled | `settled` |
| status == Refunded → refunded | `refunded` |
| status == Open && now < endTime → locking | `locking` |
| status == Open && endTime ≤ now < endTime+grace → ready | `ready_to_settle` |
| status == Open && now ≥ endTime+grace → refundable | `expired_refundable` |

即：**Trade 的列表與詳情、包含 DisplayStatus，一律來自後端 GET /trades、GET /trades/:id**；後端內部資料則來自 Indexer 寫入的鏈上事件。

---

## 三、來自鏈上合約的資料與操作

以下「來自鏈上」指：**觸發來源是使用者與合約互動（簽名／送 tx）**，合約發出事件後由後端 Indexer 消費並更新 DB；前端若要顯示最新狀態，仍透過後端 API 查詢。

### 3.1 填單（Fill Order）

| 項目 | 說明 |
|------|------|
| **觸發** | 使用者（Taker）在市集選擇 Order，確認金額後在**前端／錢包簽名並送出鏈上交易** |
| **合約** | 呼叫 Fill 相關介面（參數含 order 或 orderHash、數量等），鎖定 Maker/Taker 資金 |
| **鏈上事件** | Filled Event |
| **後端** | Indexer 收到 Filled → `Order.markFilled()`、建立 **Trade Aggregate（status=Open）** 並 Persist |
| **前端** | 送 tx 後輪詢或經 WebSocket 得知確認後，可呼叫 **GET /trades** 取得新 Trade（DisplayStatus = locking） |

**小結**：Fill 的「執行」在鏈上；Trade 的「建立與查詢」經由後端 Indexer + Trade API。

---

### 3.2 結算（Settle）

| 項目 | 說明 |
|------|------|
| **觸發** | 使用者在 My Trades 對狀態為 ready_to_settle 的 Trade 點「Settle」 |
| **合約** | 使用者送 **Settle 交易**（依 VWAP 結算，資金分配在鏈上執行） |
| **鏈上事件** | Settled Event（應含 settlementPrice、payout 等） |
| **後端** | Indexer 收到 Settled → `Trade.markSettled(...)`，更新 DB 狀態為 Settled、寫入 settlementPrice / payout 等 |
| **前端** | 送 tx 後可輪詢 **GET /trades/:id**，取得 status=settled、finalVWAP、receivedAmount 等 |

**小結**：Settle 的「執行」在鏈上；前端顯示的結算結果來自後端 API（Indexer 已更新）。

---

### 3.3 退還（Refund）

| 項目 | 說明 |
|------|------|
| **觸發** | 使用者在 My Trades 對 ready_to_settle 或 expired_refundable 的 Trade 點「Refund」 |
| **合約** | 使用者送 **Refund 交易**，領回鎖定資金 |
| **鏈上事件** | Refunded Event |
| **後端** | Indexer 收到 Refunded → `Trade.markRefunded(...)`，更新 DB 狀態為 Refunded、refundedAt 等 |
| **前端** | 送 tx 後可輪詢 **GET /trades/:id**，取得 status=refunded、refundedAmount 等 |

**小結**：Refund 的「執行」在鏈上；前端顯示的退還結果來自後端 API。

---

### 3.4 取消訂單（Cancel Order）

| 項目 | 說明 |
|------|------|
| **觸發** | Maker 在 My Quotes 對某筆報價點「取消」 |
| **PRD** | 後端有 **Cancelled Event → Order.markCancelled()**，需釐清取消是「僅後端標記」或「鏈上也有 Cancel tx + 事件」 |
| **若為鏈上** | 使用者送 Cancel 交易 → 鏈上 Cancelled Event → Indexer → Order.markCancelled() |
| **若僅後端** | 前端呼叫後端 **PATCH /orders/:hash/cancel**（若 PRD 有提供）或透過其他 API 標記 Cancelled |
| **前端** | 取消後列表來自 **GET /orders**（篩選 maker=當前 address），狀態為 cancelled |

**小結**：取消的「資料來源」取決於產品實作（純後端 vs 鏈上）；無論哪種，訂單狀態的查詢皆透過後端 **GET /orders**。

---

## 四、對照表：前端畫面 ↔ 資料來源

| 前端畫面／操作 | 資料／動作來源 | API / 鏈上 |
|----------------|----------------|------------|
| 市集訂單列表 | 後端 | GET /orders（篩選 status=Active 等） |
| 市集單筆訂單詳情 | 後端 | GET /orders/:hash |
| My Quotes 我的報價列表 | 後端 | GET /orders?maker=當前 address |
| My Quotes 建立報價 | 後端 + 簽名 | 前端組 EIP-712 簽名 → POST /orders |
| My Quotes 取消報價 | 後端 或 鏈上 | 依實作：PATCH/cancel 或 Cancel tx |
| 市集「Fill」按鈕（填單） | 鏈上 | 使用者簽名並送 Fill tx → Indexer 建 Trade |
| My Trades 列表（Locking / Ready / History） | 後端 | GET /trades?address=當前 address，DisplayStatus 由後端計算 |
| My Trades 單筆交易詳情 | 後端 | GET /trades/:id |
| My Trades「Settle」按鈕 | 鏈上 | 使用者送 Settle tx → Indexer 更新 Trade |
| My Trades「Refund」按鈕 | 鏈上 | 使用者送 Refund tx → Indexer 更新 Trade |
| 訂單過期（Active → Expired） | 後端 | ExpireOrdersService 排程，前端只讀 GET /orders 的 status |

---

## 五、欄位對照：後端 ↔ 前端（對接時參考）

### Order / MakerOrder

| 前端 Order / MakerOrder | 後端 Order | 備註 |
|-------------------------|------------|------|
| id | orderHash | |
| direction | makerIsSellETH | true → SELL_WETH, false → SELL_USDC |
| amount | amountIn | 單位需一致（後端 PRD：最小單位字串） |
| token | 由 makerIsSellETH 推得 | WETH / USDC |
| minAmountOut | minAmountOut | |
| delta | deltaBps | 基點 |
| expiryHours / expiryMinutes | deadline | 前端可送相對時間，後端存 timestamp |
| status（MakerOrder） | status | Active/Filled/Cancelled/Expired |
| createdAt | createdAt | |

### Trade

| 前端 Trade | 後端 Trade / DisplayStatus | 備註 |
|------------|----------------------------|------|
| id | tradeId (orderHash) | |
| role | 由 maker / taker 與當前 address 比對 | 前端或後端算皆可 |
| status | DisplayStatus | locking / ready_to_settle / settled / refunded / expired_refundable |
| depositedAmount | makerAmountIn 或 takerDeposit（依 role） | |
| depositedToken / targetToken | makerIsSellETH + role 推得 | |
| targetAmount | 依 role 與合約定義對應 | 可從後端 DTO 明確欄位 |
| fillTime | startTime | |
| endTime | endTime | |
| settledTime | settledAt 或 refundedAt | |
| finalVWAP | settlementPrice | |
| receivedAmount | makerPayout 或 takerPayout | |
| refundedAmount | makerRefund 或 takerRefund | |

---

## 六、簡短結論

- **後端負責**：Order 的建立與查詢、Order 過期、Trade 的查詢與 DisplayStatus 計算；所有「讀取」訂單／交易列表與詳情均來自後端 API。
- **鏈上合約負責**：Fill、Settle、Refund（以及若有的 Cancel）的**執行**；使用者送 tx，合約發出事件，Indexer 寫入／更新後端，前端再經由後端 API 取得最新狀態。
- **前端**：呼叫後端 GET/POST /orders、GET /trades 取得資料；需要執行 Fill / Settle / Refund 時，引導使用者與錢包送鏈上交易，再依需要輪詢或訂閱後端 API 更新 UI。
