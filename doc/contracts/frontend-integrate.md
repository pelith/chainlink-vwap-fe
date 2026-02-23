# VWAPRFQSpot 前端整合指南

## 資料結構

```typescript
// Order（離線簽名用）
type Order = {
  maker: address;
  makerIsSellETH: boolean;  // true=maker賣WETH換USDC, false=反向
  amountIn: uint256;         // maker 賣出量
  minAmountOut: uint256;     // taker 最少需存入量
  deltaBps: int32;           // VWAP 調整 bps（帶符號）
  salt: uint256;             // 唯一性 nonce
  deadline: uint256;         // 過期 unix timestamp
};

// Trade 狀態
enum Status { Open=0, Settled=1, Refunded=2 }

type Trade = {
  maker: address;
  taker: address;
  makerIsSellETH: boolean;
  makerAmountIn: uint256;
  takerDeposit: uint256;
  deltaBps: int32;
  startTime: uint64;      // fill 時間
  endTime: uint64;        // startTime + 12h
  status: uint8;          // 0=Open, 1=Settled, 2=Refunded
};
```

## 寫入函式（需簽名交易）

### `fill(order, signature, takerAmountIn) → tradeId`

- **角色**：Taker 呼叫
- **作用**：執行訂單，鎖定雙方資金，開始 12h VWAP 窗口
- **前置**：Taker 需先 `approve` 合約對應代幣額度
  - `makerIsSellETH=true` → Taker approve USDC
  - `makerIsSellETH=false` → Taker approve WETH
- **驗證條件**：
  - 未過 deadline、deltaBps 合法（`10000 + deltaBps > 0`）
  - `takerAmountIn >= order.minAmountOut`
  - 簽名有效且 orderHash 未使用
- **回傳**：`tradeId`（= orderHash）

### `settle(tradeId)`

- **角色**：任何人（通常 keeper / 前端觸發）
- **作用**：12h 窗口結束後，以 VWAP + deltaBps 結算，分配代幣
- **時機**：`block.timestamp >= endTime` 且 `< endTime + REFUND_GRACE`
- **注意**：Oracle 資料不足時會 revert，稍後重試即可

### `refund(tradeId)`

- **角色**：任何人
- **作用**：超過寬限期後退還雙方原始存款
- **時機**：`block.timestamp >= endTime + REFUND_GRACE` 且 status = Open

### `cancelOrderHash(orderHash)`

- **角色**：Maker（`msg.sender` 即 maker）
- **作用**：取消未成交的 orderHash，不需暴露訂單內容
- **注意**：只能取消自己的訂單

## 讀取函式（view，免 gas）

| 函式 | 回傳 | 用途 |
|------|------|------|
| `getTrade(tradeId)` | `Trade` struct | 查詢交易狀態與詳情 |
| `trades(tradeId)` | Trade 各欄位（展開） | 同上，public mapping |
| `used(maker, orderHash)` | `bool` | 檢查訂單是否已用/已取消 |
| `hashOrder(order)` | `bytes32` | 鏈上計算 EIP-712 digest |
| `DOMAIN_SEPARATOR()` | `bytes32` | EIP-712 domain |
| `ORDER_TYPEHASH()` | `bytes32` | EIP-712 typehash |
| `USDC()` | `address` | USDC 合約地址 |
| `WETH()` | `address` | WETH 合約地址 |
| `oracle()` | `address` | Oracle 合約地址 |
| `VWAP_WINDOW()` | `uint256` | VWAP 窗口長度（12h，秒） |
| `REFUND_GRACE()` | `uint256` | 退款寬限期（秒） |

## EIP-712 離線簽名（Maker 端）

```typescript
const domain = {
  name: "VWAP-RFQ-Spot",
  version: "1",
  chainId,
  verifyingContract: contractAddress,
};

const types = {
  Order: [
    { name: "maker", type: "address" },
    { name: "makerIsSellETH", type: "bool" },
    { name: "amountIn", type: "uint256" },
    { name: "minAmountOut", type: "uint256" },
    { name: "deltaBps", type: "int32" },
    { name: "salt", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

// viem
const signature = await walletClient.signTypedData({
  domain,
  types,
  primaryType: "Order",
  message: order,
});

// ethers v6
const signature = await signer.signTypedData(domain, types, order);
```

## Events（監聽用）

| Event | indexed 欄位 | 用途 |
|-------|-------------|------|
| `Filled(maker, taker, orderHash, startTime, endTime, makerAmountIn, takerDeposit, makerIsSellETH, deltaBps)` | maker, taker, orderHash | 訂單成交 |
| `Settled(tradeId, usdcPerEth, adjustedPrice, makerPayout, takerPayout, makerRefund, takerRefund)` | tradeId | 結算完成 |
| `Refunded(tradeId, makerRefund, takerRefund)` | tradeId | 退款完成 |
| `Cancelled(maker, orderHash)` | maker, orderHash | 訂單取消 |

## 典型前端流程

```
Maker: 離線簽 EIP-712 Order → 傳給 Taker（鏈下）
  ↓
Taker: approve → fill(order, sig, amount) → 得到 tradeId
  ↓
等待 12h VWAP 窗口結束
  ↓
任何人: settle(tradeId) → 結算分幣
  ↓
（若 oracle 失敗且超過寬限期）→ refund(tradeId)
```

## Error 對照

| Error | 原因 |
|-------|------|
| `ExpiredOrder` | 超過 deadline |
| `BadSignature` | 簽名驗證失敗 |
| `OrderUsed` | orderHash 已使用或已取消 |
| `DeltaInvalid` | `10000 + deltaBps <= 0` |
| `TakerTooSmall` | `takerAmountIn < minAmountOut` |
| `TradeNotOpen` | trade status 非 Open |
| `NotMatured` | 還沒到 endTime，不能 settle |
| `TooLateToSettle` | 超過寬限期，只能 refund |
| `RefundNotAvailable` | 還沒到 `endTime + REFUND_GRACE` |
