import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const captures = "/private/tmp/gochauffeur-mobile-navigation";
test.use({ reducedMotion: "reduce" });

test("Top navigation reaches pages, the planner and WhatsApp without a bottom bar", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.locator(".mobile-app-nav")).toHaveCount(0);
  if (info.project.name !== "mobile") {
    await expect(page.getByRole("navigation", { name: "Main navigation", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open navigation", exact: true })).not.toBeVisible();
    return;
  }

  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  for (const [label, path] of [["Destinations", "/destinations"], ["Things to do", "/things-to-do"], ["Home", "/"]]) {
    await trigger.click();
    await menu.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(menu).not.toBeVisible();
  }
  await trigger.click();
  await menu.getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/#services$/);
  await expect(page.locator(".quote-widget h2")).toBeInViewport();
  await expect(page.getByLabel("Pickup", { exact: true })).toHaveCSS("font-size", "16px");

  await trigger.click();
  await page.context().route("https://wa.me/**", (route) => route.fulfill({ body: "WhatsApp handoff" }));
  const handoffPromise = page.waitForEvent("popup");
  await menu.getByRole("button", { name: "Chat on WhatsApp", exact: true }).click();
  const handoff = await handoffPromise;
  await handoff.waitForLoadState();
  expect(new URL(handoff.url()).searchParams.get("text")).toContain("web-home-header");
  await expect(page.locator(".enquiry-dialog[open]")).toHaveCount(0);
  await handoff.close();
  await page.keyboard.press("Escape");

  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect(page.getByRole("link", { name: "Back to top", exact: true })).toBeInViewport();
  await expect(trigger).toBeInViewport();
  await expect(page.locator("body")).toHaveCSS("padding-bottom", "0px");
  await page.screenshot({ path: `${captures}/footer.png`, animations: "disabled" });
});

test("Top menu preserves native modal keyboard and scroll behaviour", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "Mobile header menu");
  await mkdir(captures, { recursive: true });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  const bounds = (await menu.boundingBox())!;
  expect(bounds.y).toBe(0);
  expect(bounds.x + bounds.width).toBeCloseTo(page.viewportSize()!.width, 0);
  expect(bounds.height).toBeCloseTo(page.viewportSize()!.height, 0);
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    // Native dialogs allow tabbing into browser chrome, which reports body as active.
    expect(await menu.evaluate((element) => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
  }
  await menu.getByRole("button", { name: "Close navigation", exact: true }).focus();
  await page.locator("main a").first().evaluate((element) => (element as HTMLElement).focus());
  await expect(menu.getByRole("button", { name: "Close navigation", exact: true })).toBeFocused();
  await page.screenshot({ path: `${captures}/menu.png`, animations: "disabled" });
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await trigger.click();
  await menu.getByRole("link", { name: "Destinations", exact: true }).click();
  await expect(page).toHaveURL(/\/destinations$/);
  await expect(menu).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("Header and menu fit phone and tablet widths and preserve desktop navigation", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "Responsive header navigation");
  await mkdir(captures, { recursive: true });
  const trigger = page.getByRole("button", { name: "Open navigation", exact: true });
  const menu = page.getByRole("dialog", { name: "Navigation", exact: true });
  for (const width of [320, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/", "/destinations", "/things-to-do"]) {
      await page.goto(path);
      await expect(page.locator(".mobile-app-nav")).toHaveCount(0);
      await expect(trigger).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const box = (await trigger.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await trigger.click();
    await expect(menu).toBeInViewport();
    for (const link of await menu.getByRole("link").all()) await expect(link).toBeInViewport();
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [path, name] of [["/", "home"], ["/destinations", "destinations"], ["/things-to-do", "experiences"]]) {
    await page.goto(path);
    await page.screenshot({ path: `${captures}/${name}.png`, animations: "disabled" });
  }
  await trigger.click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(menu).not.toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(trigger).not.toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation", exact: true })).toBeVisible();
});
