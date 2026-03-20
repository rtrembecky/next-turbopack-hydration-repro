import { test, expect } from "@playwright/test";

/**
 * Regression test for https://github.com/vercel/next.js/issues/85370
 *
 * Bug: SSR-enabled next/dynamic components in _app.tsx render twice in the DOM
 * under Turbopack because the chunk is not preloaded in the manifest, causing
 * React to fail reconciliation and mount a second copy of the component.
 *
 * Affected:  next >= 15.2.0 (including all stable and canary releases as of testing)
 * Fixed in:  not yet — PR #85803 is still a draft
 * Last known-good: next@15.1.6
 */
test("Dynamic component in _app.tsx renders exactly once (no double-render)", async ({
  page,
}) => {
  const hydrationErrors: string[] = [];
  const mountEvents: string[] = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (
      text.includes("Hydration") ||
      text.includes("hydration") ||
      text.includes("did not match") ||
      text.includes("Minified React error") ||
      text.includes("Expected server HTML")
    ) {
      hydrationErrors.push(`[${msg.type()}] ${text}`);
    }
    if (text.includes("[Dynamic] mounted")) {
      mountEvents.push(text);
    }
  });

  page.on("pageerror", (err) => {
    if (
      err.message.includes("Hydration") ||
      err.message.includes("hydration")
    ) {
      hydrationErrors.push(`[pageerror] ${err.message}`);
    }
  });

  await page.goto("/");
  await page.waitForSelector("[data-testid='page-index']");

  // Wait for the dynamic component to appear (it's SSR-rendered so should be immediate,
  // but Turbopack may delay chunk availability)
  await page.waitForSelector("[data-testid='dynamic-component']", {
    timeout: 10000,
  });

  // Allow extra time for any double-render to settle
  await page.waitForTimeout(1500);

  const count = await page
    .locator("[data-testid='dynamic-component']")
    .count();

  console.log(
    `DOM count: ${count}, mount events: ${mountEvents.length}, hydration errors: ${hydrationErrors.length}`
  );
  if (hydrationErrors.length) {
    console.log("Hydration errors:\n" + hydrationErrors.join("\n"));
  }

  // Primary assertion: bug causes 2 DOM nodes instead of 1
  expect(
    count,
    `Dynamic rendered ${count}x in DOM — expected 1. Double-render bug is present.`
  ).toBe(1);

  expect(
    hydrationErrors,
    `Hydration errors detected:\n${hydrationErrors.join("\n")}`
  ).toHaveLength(0);

  // With reactStrictMode:false, exactly 1 mount event expected
  expect(
    mountEvents.length,
    `Expected 1 mount event, got ${mountEvents.length}`
  ).toBe(1);
});
