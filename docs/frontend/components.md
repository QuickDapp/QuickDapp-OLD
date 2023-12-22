---
order: 95
---

# React components

The bundled React components are mostly generic, although some are specific to the built-in dapp, e.g [`CreateTokenDialog`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/components/dapp/CreateTokenDialog.tsx). All dapp-specific components are in the `src/frontend/components/dapp` folder.

The re-usable generic components are:

* `Button` - Buttons. Supports a number of sizes and variants, and you can easily add your own.
* `ClientOnly` - Only renders its children client-side - useful for wrapping any components that should not be rendered server-side. If you have React hydration issues you might need to use this component to wrap parts of your UI.
* `ConnectWallet` - Wallet connection button.
* `ContractValue` - Displaying values returned from a smart contract. Handles loading/error states and allows for values sanitization prior to rendering.
* `Dialog` - Modal dialog popups.
* `ErrorButton` - Error buttons (uses `Button` under the hood).
* `ErrorMessageBox` - Messages boxes which show large error traces.
* `Footer` - The site footer.
* `Form` - Forms and their fields, to be used in conjunction with the [form hooks](./forms.md).
* `Header` - The site header.
* `Icons` - SVG icons from [Lucide React](https://lucide.dev/guide/packages/lucide-react).
* `IfWalletConnected` - Only renders its children if the user is authenticated; otherwise it renders the wallet connection button (`ConnectWallet`).
* `Loading` - Loading indicator animation.
* `Notifications` - [User notifications](../users/notifications.md) dialog and indicator icon.
* `OnceVisibleInViewport`- Triggers a passed-in callback when its UI (a `<div />`) comes into view. This is useful for performing visibility-based actions.
* `PingAnimation` - pinging animation (used for notifications icon).
* `Popover` - In-place popups (used by `Tooltip` component).
* `Svg` - SVG rendering.
* `Tooltip` - Tooltip popups.

## @shadcn/ui

Key reusable UI components - `Dialog`, `Popover`, etc - are actually [@shadcn/ui](https://ui.shadcn.com/) components. These are a great set of starter components to build on top of as they are well architected, so we recommend you first check these component libraries before rolling your own.

The bundled [`components.json`](https://github.com/QuickDapp/QuickDapp/tree/master/components.json) file is the configuration for `@shadcn/ui`.

To install a new component:

```ts
npx shadcn-ui@latest add <component name>
```

At this point the `src/frontend/components` folder will contain a `<component name>.tsx` file containing the code to use. Feel free to then modify this code as you see fit.