# Repro: next/dynamic in _app.tsx causes hydration error under Turbopack

Reproduction repository for [vercel/next.js#85370](https://github.com/vercel/next.js/issues/85370).

## Bug

An SSR-enabled `next/dynamic` component in `_app.tsx` causes a hydration mismatch under Turbopack. The component's chunk is not included in Turbopack's preload manifest, so during client hydration React sees the page content where it expects the dynamic component's HTML:

```diff
<main>
  <LoadableComponent>
  <Home>
+   <p data-testid="page-index">           ← client
-   <h1 data-testid="dynamic-component">   ← server
```

React bails out of hydration and regenerates the tree on the client. With a fragment wrapper instead of `<main>`, the symptom is a double-render (the component appears twice in the DOM).

`ssr: false` components are not affected — they're skipped on the server so there's nothing to reconcile.

## Repro

`pages/_app.tsx`:

```tsx
const Dynamic = dynamic(() => import("../components/Dynamic")); // SSR-enabled (no ssr:false)

export default function App({ Component, pageProps }) {
  return (
    <main>
      <Dynamic />
      <Component {...pageProps} />
    </main>
  );
}
```

## Versions

| Version | Result |
| ------- | ------ |
| `15.1.6` | ✅ Works |
| `15.2.0` | ❌ Broken — hydration error |
| `16.1.7` | ❌ Broken — hydration error |
| `16.2.0` | ❌ Broken — hydration error |
| `16.2.1-canary.2` | ❌ Broken — hydration error |

Fix is tracked in draft PR [#85803](https://github.com/vercel/next.js/pull/85803).

## Running the repro manually

```bash
pnpm install
pnpm dev
# open http://localhost:3000 — observe hydration error in the browser console
```

## Automated Playwright test

The test visits `/`, waits for the dynamic component, and asserts no hydration errors and exactly **1** instance of `<Dynamic>` in the DOM.

```bash
pnpm install
pnpm playwright install chromium
pnpm test
```

Expected output on a broken version:

```text
Error: Hydration errors detected:
[pageerror] Hydration failed because the server rendered HTML didn't match the client...
```

### Test all versions at once

```bash
./run-matrix.sh
```

Expected output (as of testing on 2026-03-20):

```text
  ✅ PASS  15.1.6 (last good)     (next@15.1.6)
  ❌ FAIL  15.2.0 (first bad)     (next@15.2.0)
  ❌ FAIL  16.1.7 (current)       (next@16.1.7)
  ❌ FAIL  16.2.0 (latest stable) (next@16.2.0)
  ❌ FAIL  16.2.1-canary.2        (next@canary)
```
