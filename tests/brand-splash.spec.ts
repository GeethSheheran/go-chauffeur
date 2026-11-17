import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("Logo intro draws, reveals the page, and stays dismissed during navigation", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const splash = page.locator(".brand-splash");
  const content = page.locator("#site-content");
  await expect(splash).toHaveAttribute("data-playing", "true");
  await expect(content).toHaveAttribute("inert", "");
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);

  await mkdir("/private/tmp/gochauffeur-splash", { recursive: true });
  for (const [frame, time] of [["mark", 900], ["wordmark", 2200]] as const) {
    await splash.evaluate((element, time) => {
      element.getAnimations({ subtree: true }).forEach((animation) => {
        animation.pause();
        animation.currentTime = time;
      });
    }, time);
    await page.screenshot({ path: `/private/tmp/gochauffeur-splash/${frame}-${info.project.name}.png` });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await splash.evaluate((element) => element.getAnimations({ subtree: true }).forEach((animation) => animation.play()));
  await expect(splash).toBeHidden();
  await expect(content).not.toHaveAttribute("inert");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  await expect(page.getByRole("heading", { name: /Your own chauffeur/ })).toBeVisible();

  await page.locator(".explore-destinations").click();
  await expect(page).toHaveURL(/\/destinations$/);
  await expect(splash).toBeHidden();
  await page.screenshot({ path: `/private/tmp/gochauffeur-splash/ready-${info.project.name}.png` });
  expect(errors).toEqual([]);
});

for (const key of ["Escape", "Tab"]) {
  test(`${key} skips the intro and restores keyboard access`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#site-content")).toHaveAttribute("inert", "");
    await page.keyboard.press(key);
    await expect(page.locator(".brand-splash")).toBeHidden();
    await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
    if (key === "Tab") await expect(page.getByRole("link", { name: "Skip to content", exact: true })).toBeFocused();
  });
}

test("Reduced motion skips the intro, including changes made during playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".brand-splash")).toBeHidden();
  await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#site-content")).toHaveAttribute("inert", "");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".brand-splash")).toBeHidden();
  await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
});

test("Direct section links open without the intro", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#prices");
  await expect(page.locator(".brand-splash")).toBeHidden();
  await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
  await expect(page.locator("#prices")).toBeInViewport();
});

test("The page unlocks even when the exit animation cannot finish", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#site-content")).toHaveAttribute("inert", "");
  await page.addStyleTag({ content: ".brand-splash { animation: none !important; }" });
  await expect(page.locator(".brand-splash")).toBeHidden({ timeout: 5500 });
  await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
});

test("The page remains usable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".brand-splash")).toBeHidden();
    await expect(page.locator("#site-content")).not.toHaveAttribute("inert");
    await expect(page.getByRole("heading", { name: /Your own chauffeur/ })).toBeVisible();
  } finally {
    await context.close();
  }
});
