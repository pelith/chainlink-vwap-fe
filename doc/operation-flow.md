# 整體操作流程圖

本文件以流程圖說明 Chainlink VWAP 前端的整體操作邏輯：Maker 報價、Taker 填單、鎖倉與結算／退還。

## 高層流程（泳道圖）

```mermaid
flowchart TB
    subgraph Maker["Maker 流程"]
        A1[My Quotes 建立報價] --> A2[MakerOrder 建立<br/>status: active]
        A2 --> A3[報價顯示於市集]
        A3 --> A4{Taker 填單?}
        A4 -->|是| A5[MakerOrder status: filled]
        A5 --> A6[My Trades 出現一筆 Trade<br/>role: Maker]
        A4 -->|否| A7[取消或過期]
        A7 --> A8[status: cancelled / expired]
    end

    subgraph Taker["Taker 流程"]
        B1[市集瀏覽 Order] --> B2[選擇訂單點 Fill]
        B2 --> B3[確認金額並鎖定資金]
        B3 --> B4[Trade 建立<br/>status: locking, role: Taker]
        B4 --> B5[My Trades - Locking 顯示]
    end

    subgraph Settlement["結算流程（Maker / Taker 共用）"]
        C1[等待至 endTime]
        C1 --> C2[status: ready_to_settle<br/>或 expired_refundable]
        C2 --> C3{選擇動作}
        C3 -->|Settle| C4[依 finalVWAP 結算<br/>status: settled]
        C3 -->|Refund| C5[領回鎖定資金<br/>status: refunded]
    end

    A6 --> C1
    B5 --> C1
```

## 交易狀態流（Trade 狀態機）

```mermaid
stateDiagram-v2
    [*] --> locking: Taker 填單後
    locking --> ready_to_settle: 到達 endTime，可結算
    locking --> expired_refundable: 逾結算視窗，可退還
    ready_to_settle --> settled: 使用者點 Settle
    ready_to_settle --> refunded: 使用者點 Refund
    expired_refundable --> refunded: 使用者點 Refund
    settled --> [*]
    refunded --> [*]
```

## 頁面與操作對照

```mermaid
flowchart LR
    subgraph Pages["頁面"]
        P1["/ (首頁)"]
        P2["/my-quotes"]
        P3["/ (市集)"]
        P4["/my-trades"]
    end

    subgraph Actions["主要操作"]
        O1[建立 RFQ 報價]
        O2[取消報價]
        O3[瀏覽訂單]
        O4[Fill 訂單]
        O5[查看 Locking]
        O6[Settle / Refund]
        O7[查看 History]
    end

    P2 --> O1
    P2 --> O2
    P3 --> O3
    P3 --> O4
    P4 --> O5
    P4 --> O6
    P4 --> O7
```

## MakerOrder 狀態與 Trade 的對應

```mermaid
flowchart LR
    subgraph MakerOrder_status["MakerOrder status"]
        M1[active] --> M2[filled]
        M1 --> M3[cancelled]
        M1 --> M4[expired]
    end

    subgraph Trigger["觸發條件"]
        T1[Taker 填單] --> M2
        T2[Maker 取消] --> M3
        T3[逾時未成交] --> M4
    end

    M2 --> Trade[產生 Trade<br/>Maker 端]
```

## 資料流摘要

1. **Maker**：在 My Quotes 建立 MakerOrder（active）→ 顯示於市集 → 被填單後變 filled，並在 My Trades 出現一筆 Trade（Maker）。
2. **Taker**：在市集選擇 Order → Fill → 鎖定資金後在 My Trades 出現一筆 Trade（Taker），狀態為 locking。
3. **雙方**：鎖倉至 endTime 後，Trade 變為 ready_to_settle 或 expired_refundable，可選擇 Settle（依 VWAP 結算）或 Refund（退還），完成後為 settled 或 refunded。

流程圖使用 Mermaid，可在支援 Mermaid 的 Markdown 預覽或文件中直接渲染（如 GitHub、GitLab、VS Code 外掛等）。
