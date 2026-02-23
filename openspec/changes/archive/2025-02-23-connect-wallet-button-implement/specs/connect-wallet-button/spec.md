# Connect Wallet Button — Spec

## ADDED Requirements

### Requirement: Header SHALL provide a Connect Wallet button that opens AppKit modal when not connected

The Header MUST display a "Connect Wallet" button. When the user is not connected, clicking the button SHALL open the Reown AppKit connection modal via `useAppKit().open({ view: 'Connect' })`.

#### Scenario: User clicks Connect Wallet when disconnected

- **WHEN** the user is not connected and clicks the "Connect Wallet" button in the Header
- **THEN** the AppKit modal opens with the Connect view so the user can select and connect a wallet

### Requirement: Header SHALL display the connected wallet address when the user is connected

When the user is connected (as determined by `useAppKitAccount().isConnected` and `address`), the same button area MUST show the connected wallet address in shortened form (e.g. `0x1234…5678`) instead of "Connect Wallet".

#### Scenario: Connected state shows shortened address

- **WHEN** the user is connected and has address available from `useAppKitAccount()`
- **THEN** the Header button displays the address in shortened format (e.g. first 4 + "…" + last 4 characters) instead of "Connect Wallet"

### Requirement: Clicking the button when connected SHALL open AppKit Account view

When the user is already connected, clicking the same button SHALL open the AppKit modal with the Account view via `useAppKit().open({ view: 'Account' })`.

#### Scenario: User clicks address when connected

- **WHEN** the user is connected and clicks the button that shows the shortened address
- **THEN** the AppKit modal opens with the Account view so the user can manage account or disconnect

### Requirement: Network label SHALL show Sepolia

The network indicator in the Header MUST display "Sepolia" to match the default chain configured in the application (wagmi / AppKit).

#### Scenario: Network label matches default chain

- **WHEN** the user views the Header
- **THEN** the network label displays "Sepolia" (not "Ethereum") to reflect the actual default chain

### Requirement: Implementation SHALL use Reown AppKit hooks

The Connect Wallet button and connected state MUST be implemented using `useAppKit` and `useAppKitAccount` from `@reown/appkit/react`; the default chain SHALL remain Sepolia as configured in `wagmi.ts`. No additional runtime dependencies are required.

#### Scenario: AppKit hooks drive button behavior

- **WHEN** the Header component renders
- **THEN** it uses `useAppKit()` for `open()` and `useAppKitAccount()` for `isConnected` and `address` to control button label and modal view (Connect vs Account)
