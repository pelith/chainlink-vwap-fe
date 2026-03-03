# Chainlink VWAP Frontend

Frontend for Chainlink VWAP-RFQ: Maker quotes (My Quotes), marketplace order filling, and locking/settlement/refund (My Trades). Orders and trades are queried via the backend API; Fill, Settle, and Refund are executed on-chain. The app connects to the backend API and wallet for chain interactions.

---

## Tech Stack

- **Framework**: TanStack Start (React + Vite), TanStack Router (file-based routing), TanStack Query
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI)
- **Chain**: wagmi, viem, Reown AppKit (wallet connection)
- **Forms & validation**: React Hook Form, Zod, T3 Env (typed env vars)
- **Code quality**: Biome (lint/format), Vitest

---

## Requirements

- **Node.js** 18+
- **pnpm** 8+ (this project uses pnpm as the package manager)

```bash
# Install pnpm if needed
npm install -g pnpm
```

---

## Project Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

Copy the example file and adjust for your environment:

```bash
cp .env.sample .env.local
```

Edit `.env.local`. All client-side variables use the `VITE_` prefix (see `src/env.ts`):

| Variable | Description | Notes |
|----------|-------------|--------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://api.example.com`) | Used for orders/trades API |
| `VITE_REOWN_PROJECT_ID` | Reown (WalletConnect) project ID | Wallet connection |
| `VITE_SEPOLIA_RPC_URL` | Sepolia RPC URL | Optional, for chain read/write |
| `VITE_VWAP_CONTRACT_ADDRESS` | VWAPRFQSpot contract address | Required for Fill/Settle/Refund; must match deployed chain (e.g. Sepolia) |
| `VITE_VWAP_ORACLE_CONTRACT_ADDRESS` | VWAP Oracle contract address | Optional |
| `VITE_CHAINLINK_ETH_USD_FEED_ADDRESS` | Chainlink ETH/USD price feed | Optional |
| `VITE_TARGET_CHAIN_ID` | Target chain ID (default `11155111` for Sepolia) | Numeric |

For the My Quotes create-order flow, set `VITE_VWAP_CONTRACT_ADDRESS` to the VWAPRFQSpot address on your deployment chain.

### 3. Using env vars in code

```ts
import { env } from "@/env";

console.log(env.VITE_API_URL);
console.log(env.VITE_VWAP_CONTRACT_ADDRESS);
```

---

## Run & Build

### Development (default port 3000)

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

### Production build

```bash
pnpm build
```

Output is in `dist/`.

### Preview production build

```bash
pnpm preview
```

---

## Other scripts

| Command | Description |
|---------|-------------|
| `pnpm test` | Run Vitest tests |
| `pnpm lint` | Biome lint |
| `pnpm format` | Biome format (write) |
| `pnpm format:check` | Check format only |
| `pnpm check` | Full Biome check (lint + format) |

---

## Project structure

```
├── doc/                    # Specs and docs (see Documentation index below)
├── src/
│   ├── api/                # Backend API client (orders, trades, etc.)
│   ├── components/        # Shared UI (including components/ui from shadcn)
│   ├── config/            # Theme and other config
│   ├── contexts/          # React context (e.g. theme)
│   ├── integrations/     # TanStack Query, etc.
│   ├── lib/              # Utilities
│   ├── modules/          # Feature modules
│   │   ├── marketplace/  # Marketplace (order list, Fill)
│   │   ├── my-quotes/    # My Quotes (create/cancel quotes)
│   │   ├── my-trades/    # My Trades (Locking / Settle / Refund / History)
│   │   ├── eth-deposit/  # Deposit / faucet, etc.
│   │   └── contracts/   # Contract ABIs, hooks, signing
│   ├── routes/           # TanStack Router file-based routes
│   ├── env.ts            # T3 Env schema
│   ├── main.tsx
│   ├── router.tsx
│   └── wagmi.ts          # wagmi config
├── .env.sample           # Env example
├── package.json
└── vite.config.ts
```

---

## Documentation (doc/)

See **[doc/README.md](./doc/README.md)** for the full index. Quick reference:

| When you need… | See |
|----------------|-----|
| Backend API (orders, trades) | [doc/api.md](./doc/api.md) |
| What comes from backend vs on-chain | [doc/data-sources.md](./doc/data-sources.md) |
| Overall flow (Maker/Taker, lock, settle) | [doc/operation-flow.md](./doc/operation-flow.md) |
| On-chain contracts, Fill/Settle/Refund | [doc/contracts/frontend-integrate.md](./doc/contracts/frontend-integrate.md) |
| Domain models (Order / MakerOrder / Trade) | [doc/data-model/README.md](./doc/data-model/README.md) |

---

## Conventions & development

- **UI copy**: Use **English** for all user-facing text (buttons, toasts, form labels, errors, loading states).
- **Adding shadcn components**: Use the latest shadcn CLI with pnpm:
  ```bash
  pnpm dlx shadcn@latest add button
  ```
- **Routing**: TanStack Router file-based routing. Add new routes under `src/routes/`. Root layout is `src/routes/__root.tsx`.

---

## License & references

- Use according to the project’s license.
- TanStack: <https://tanstack.com>  
- TanStack Start: <https://tanstack.com/start>
