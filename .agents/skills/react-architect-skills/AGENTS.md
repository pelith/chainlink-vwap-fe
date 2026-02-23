# React Feature Module Architecture Guidelines

Full guide for agents. Skill definition and triggers: [SKILL.md](SKILL.md).

## Architectural Principles

1.  **All features modules should be create in `modules` repo**
2.  **Colocation**: Code that changes together stays together. Assets, styles, tests, and components related to a specific feature reside within that feature's module.
3.  **Encapsulation**: Feature modules are "black boxes". They expose public API through explicitly named files (not barrel `index.ts`). Enforce module boundaries via ESLint rules (e.g., `eslint-plugin-boundaries`, `eslint-plugin-import/no-restricted-paths`) instead of barrel re-exports.
4.  **Unidirectional Data Flow**: Data flows down (Props), Events flow up (Callbacks). Side effects and state management are lifted to the integration layer (Containers).
5.  **Separation of Concerns**:
    -   **Presentational Layer (Components)**: Pure UI, styling, and interaction. No business logic.
    -   **Integration Layer (Containers/Pages)**: Connects UI to Data/Logic.
    -   **Domain Layer (Hooks/Utils)**: Reusable business logic and data transformations.
    -   **Data Layer (API/Store)**: Server state synchronization and client state management.

## Feature Module Classification

### Module Splitting Criteria

Choose module boundaries based on these principles (in order of priority):

1.  **Domain/Business Boundaries (DDD)**
    -   Independent business logic domains (e.g., `checkout`, `identity`, `inventory`).
    -   distinct data models and API requirements.

2.  **Design Boundaries (Figma)**
    -   Separate modules for distinct design sections/flows.
    -   Maintain design-code alignment.

3.  **Route-Level Separation**
    -   Each major route group = separate module.
    -   **Constraint**: Route-based modules should map to Domain boundaries where possible.

### Module Granularity Guidelines

**✅ Good Module Examples:**

-   `user-profile` - User identity and preferences.
-   `product-catalog` - Browsing and filtering products.
-   `order-processing` - Checkout and payment flows.
-   `analytics-dashboard` - Data visualization domain.

**❌ Avoid Over-nesting:**

```
❌ dashboard/
   ├── analytics/
   ├── settings/
   └── user/
```

**✅ Better Approach (Flat & Domain-Focused):**

```
✅ analytics-dashboard/
✅ settings-manager/
✅ user-management/
```

## Naming Conventions

### Files

-   **Components**: kebab-case - `user-card.tsx`
-   **Modules**: kebab-case - `user-profile/`
-   **Constants**: kebab-case - `api-endpoints.ts`
-   **Pages**: kebab-case + `-page` suffix - `profile-page.tsx`
-   **Containers**: kebab-case + `-container` suffix - `profile-details-container.tsx`
-   **Form Items**: kebab-case + `.form` - `address-input.form.tsx`
-   **Schemas**: kebab-case + `.schema` - `user-validation.schema.ts`
-   **Hooks**: kebab-case with `use` prefix - `use-permissions.ts`
-   **Utils**: kebab-case - `currency-formatter.ts`
-   **Context**: kebab-case + `-context` suffix - `auth-context.tsx`
-   **Store**: kebab-case + `.{suffix}` - `cart.store.ts` (suffix: `atom`, `store`, `slice`)
-   **Types**: kebab-case + `.types` - `user-profile.types.ts`
-   **Services/API**: kebab-case + `.service` or `.api` - `auth.service.ts`

### Folders

-   All folders use **kebab-case**.

## Module Internal Structure

Each feature module must adhere to this structure. Empty folders should be omitted.

```
feature-module/
├── api/                # API definitions and mutation hooks (Data Layer)
├── assets/             # Module-specific static assets
├── components/         # Pure UI components (Presentational Layer)
│   └── form-items/     # Form-specific UI inputs
├── containers/         # Smart components connecting Data to UI (Integration Layer)
├── contexts/           # Module-level state (Dependency Injection)
├── hooks/              # Business logic extracted from components
├── pages/              # Route entry points (Lazy Load Boundaries)
├── stores/             # Complex state management (Global/Cross-component)
├── types/              # Domain interfaces and types
└── utils/              # Pure functions and transformations
```

## Layer Guidelines

### 1. Data Layer (`api/`, `stores/`)
-   **API**:
    -   Define clear request/response schemas (Zod/Valibot recommended).
    -   Use explicit cache keys for Query/SWR (e.g., `['user', 'details', id]`).
    -   **Rule**: Never export raw fetcher functions; export typed hooks or service objects.
    -   Handle data normalization here, not in the view.
-   **Stores**:
    -   Use for cross-component communication *within* the module.
    -   Use for high-frequency updates where React Context causes excessive re-renders.

### 2. Domain Layer (`hooks/`, `utils/`, `types/`, `contexts/`)
-   **Hooks**:
    -   Encapsulate stateful logic and side effects.
    -   Must be agnostic of the UI rendering.
-   **Utils**:
    -   **Strict Rule**: Pure synchronous functions only. No async usage.
    -   Must have 100% test coverage.
    -   Complex data transformations belong here.
-   **Contexts**:
    -   Dependency injection for the module.
    -   Avoid for high-frequency updates (use Store).
    -   No complex logic in Providers; delegate to hooks.

### 3. Integration Layer (`containers/`, `pages/`)
-   **Pages**:
    -   Entry point for the Router.
    -   **Responsibilities**: Reading URL parameters, SEO metadata, defining Layout structure.
    -   **Restriction**: No complex business logic. Delegate immediately to Containers.
-   **Containers**:
    -   **Responsibilities**: Fetching data, handling loading/error states, dispatching actions.
    -   **Restriction**: Minimal styling (layout only). No presentation logic (render HTML structure).
    -   Compose `components` to build the view.

### 4. Presentational Layer (`components/`)
-   **Responsibilities**: Rendering UI based on props.
-   **Restriction**: strict `props-down`, `events-up` flow.
-   **State**: Only ephemeral UI state (e.g., `isHovered`, `isOpen`). All data state comes from props.
-   **Dependencies**: Should not depend on `stores` or `api` directly.
-   **Documentation**: Complex components require Storybook stories.

#### No Redundant and Optional Params (Pure Components)

When defining props for **pure** presentational components, pass only the values the component needs—not full data shapes—and avoid optional props. Validate and handle undefined in the parent (Container/Page).

**Don't pass data shapes; pass primitives/specific values:**

```ts
// ❌ Don't do this
interface IUserNameProps {
  user: UserItem;
}

// ✅ Do this
interface IUserNameProps {
  userName: string;
}
```

**Don't use optional props; require values and validate in parent:**

```ts
// ❌ Don't do this
interface IUserNameProps {
  userName?: string;
}

// ✅ Do this
interface IUserNameProps {
  userName: string;
}
```

For values that might be undefined, verify and narrow in the parent (e.g., early return or conditional render) before passing to the pure component. The presentational component should receive only defined, required data.

#### Dialog / Modal: Two-Level Structure (Reference)

When a modal’s **open/close** is controlled by a store or parent (e.g. `useModalRegister` + `useModalActions`) and its **content** depends on external data (e.g. selected order) that can be `null`:

- **Level 1 – Dialog**: Always mounted. Owns only open/close state (`open`, `onOpenChange`). Do **not** early-return or unmount the whole Dialog when data is missing; otherwise the dialog shell disappears and store/accessibility break.
- **Level 2 – DialogContent**: Always mounted as the child of Dialog. Only the **content inside** DialogContent may be conditional on the external data.

**Wrong:** Early return when data is null, which unmounts Dialog and breaks registration/close handling:

```tsx
// ❌ Don't do this
if (!order) return null;
return (
  <Dialog open={isOpen} onOpenChange={handleOpenChange}>
    <DialogContent>...</DialogContent>
  </Dialog>
);
```

**Right:** Keep Dialog and DialogContent mounted; conditionally render only the inner content that uses the data. Use an inner component that receives the data as a **required** prop so that when data is set, the content never sees `undefined`:

```tsx
// ✅ Do this
return (
  <Dialog open={isOpen} onOpenChange={handleOpenChange}>
    <DialogContent>
      {order ? <FormContent order={order} ... /> : null}
    </DialogContent>
  </Dialog>
);
```

- The outer modal component keeps Dialog + DialogContent in the tree at all times and never returns `null` based on `order`.
- The inner component (e.g. `FormContent`) takes `order: Order` as required and contains all logic/UI that reads `order`; it is only mounted when `order` is defined, so no undefined access.

## Common Module (Shared Kernel)

The `common` module is a special project-level module for generic, domain-agnostic resources.

**✅ Allowed in Common:**
-   Design System primitives (Buttons, Inputs).
-   Generic hooks (`useOnClickOutside`, `useMediaQuery`).
-   Date/String formatting utilities.
-   Global types (`ApiResponse<T>`, `UserRole`).

**❌ Forbidden in Common:**
-   Business logic (e.g., `calculateTax` - belongs in `billing` module).
-   Domain components (e.g., `UserCard` - belongs in `user` module).

## Cross-Module Communication

1.  **Strict Boundary**: Modules cannot import internal implementation details from other modules.
    -   ❌ `import { InternalComp } from '../other-module/components/internal-comp'`
    -   ✅ `import { ProfileContainer } from '../user-profile/containers/profile-container'`
    -   Enforce boundaries with ESLint rules (`eslint-plugin-boundaries` or `eslint-plugin-import/no-restricted-paths`) to restrict which folders/files are importable across modules.
    -   **No barrel files (`index.ts`)**: Barrel re-exports cause 200-800ms import overhead and break tree-shaking. Import directly from source files.
2.  **Data Sharing**:
    -   **URL**: Prefer sharing state via URL parameters (Single Source of Truth).
    -   **Global Store**: For persistent session data (Auth, Theme).
    -   **Events**: For loose coupling (rarely needed in React, prefer State lifting).

## Code Quality & Testing Standards

-   **Testing**:
    -   **Utils**: Unit tests (Jest/Vitest).
    -   **Hooks**: `renderHook` testing.
    -   **Containers/Page**: Integration tests (React Testing Library) mocking network requests.
    -   **Components**: Visual regression or interaction tests (Storybook/Playwright) if complex.
-   **Performance**:
    -   Enforce strict dependency arrays in hooks.
    -   Use `React.memo` or fine-grained signals only when profiling indicates need.
    -   Lazy load all Route components (Pages).