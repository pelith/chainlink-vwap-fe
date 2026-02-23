## 1. AppKit integration in Header

- [ ] 1.1 Import and use `useAppKit` and `useAppKitAccount` from `@reown/appkit/react` in `src/components/Header.tsx`
- [ ] 1.2 Add `shortenAddress(address, chars)` helper (e.g. first 4 + "…" + last 4) for address display in Header

## 2. Connect Wallet button behavior

- [ ] 2.1 When user is not connected, show "Connect Wallet" label and call `open({ view: 'Connect' })` on button click
- [ ] 2.2 When user is connected, show shortened address on the button and call `open({ view: 'Account' })` on button click

## 3. Network label

- [ ] 3.1 Display "Sepolia" as the network label in the Header (matching default chain)
