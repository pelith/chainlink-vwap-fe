# Modal 共用機制

本目錄提供以 **key** 註冊的 modal 開關控制，讓父層可以透過 `useModalActions(key)` 開關 modal，modal 元件內部則用 `useModalRegister(key)` 與 store 同步開關狀態。適合需要從外部觸發開啟的對話框（例如列表頁的「填單」按鈕打開同一個 FillOrderModal）。

## 依賴

- **store**: `@/modules/commons/stores/modal-store`
- **disclosure**: `../use-disclosure`（提供 `isOpen` / `setOpen` / `onOpen` / `onClose` / `onToggle`）

## 使用方式

### 1. Modal 元件內：`useModalRegister(key)`

在 **modal 元件**裡呼叫 `useModalRegister(key)`，會把該 key 的開關狀態註冊到全域 modal store，並回傳與 `useDisclosure` 相同的介面（`isOpen`, `setOpen`, `onOpen`, `onClose`, `onToggle`）。

- 用 `open={isOpen}`、`onOpenChange={setOpen}` 接到 shadcn `Dialog`（或其它 UI）上。
- 建議把 **key 常數**（例如 `FILL_ORDER_MODAL_KEY`）從 modal 檔案 export，給呼叫端使用，避免字串不一致。

範例（搭配 shadcn Dialog）：

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useModalRegister } from "@/modules/commons/hooks/modal/use-modal-register";

export const MY_MODAL_KEY = "my-modal";

export function MyModal({ onCloseCallback }: { onCloseCallback?: () => void }) {
  const { isOpen, setOpen } = useModalRegister(MY_MODAL_KEY);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) onCloseCallback?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>標題</DialogTitle>
        </DialogHeader>
        {/* 內容 */}
      </DialogContent>
    </Dialog>
  );
}
```

### 2. 呼叫端（父層）：`useModalActions(key)`

在 **打開 modal 的那一頁/元件**使用 `useModalActions(key)`，取得：

- `onOpen()`：打開 modal
- `onClose()`：關閉 modal
- `onToggle()`：切換開/關
- `isOpen`：目前是否開啟（getter）

同一頁若需要帶「目前選中的資料」給 modal（例如選中的訂單），可自行用 `useState` 存選中項，在點擊時先 `setSelected(order)` 再 `onOpen()`；modal 關閉時用 `onCloseCallback` 清掉選中狀態。

範例：

```tsx
import { useModalActions } from "@/modules/commons/hooks/modal/use-modal-actions";
import { MyModal, MY_MODAL_KEY } from "./my-modal";

export function SomePage() {
  const [selected, setSelected] = useState<Order | null>(null);
  const { onOpen, onClose } = useModalActions(MY_MODAL_KEY);

  const handleOpenModal = (order: Order) => {
    setSelected(order);
    onOpen();
  };

  return (
    <>
      <button onClick={() => handleOpenModal(someOrder)}>打開</button>
      <MyModal
        data={selected}
        onCloseCallback={() => setSelected(null)}
        onConfirm={() => {
          onClose();
          setSelected(null);
        }}
      />
    </>
  );
}
```

## 注意事項

- **Key 要一致**：`useModalRegister(key)` 與 `useModalActions(key)` 必須使用同一個字串（建議用常數共用在兩邊）。
- **Modal 需常駐掛載**：因為開關狀態存在 store，modal 元件需要一直掛在樹上（例如放在頁面根底下），才能透過 `onOpen()` 顯示；不要用 `{isOpen && <MyModal />}` 這種條件式掛載，否則 store 裡沒有該 key 的 handler。
- **關閉時清空選中狀態**：若 modal 需要「當前選中的一筆資料」，關閉時記得在 `onCloseCallback` 或 `onConfirm` 裡把選中狀態清掉，避免下次打開還看到上一筆。

## 檔案說明

| 檔案 | 說明 |
|------|------|
| `use-modal-register.ts` | 在 modal 元件內使用，註冊 key 並回傳 disclosure 狀態與方法。 |
| `use-modal-actions.ts` | 在呼叫端使用，依 key 取得 `onOpen` / `onClose` / `onToggle` 與 `isOpen`。 |

Store 實作與型別定義在 `@/modules/commons/stores/modal-store`。
