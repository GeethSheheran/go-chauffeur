import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("Wheel scrolling eases, anchors clear the header, and navigation stops inertia", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Wheel smoothing is a desktop interaction.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".brand-splash")).toBeHidden();
  const root = page.locator("html");
  await expect(root).toHaveClass(/lenis/);
  // The planner handles its own wheel events; exercise page scrolling in the gutter.
  await page.mouse.move(8, 500);
  await page.mouse.wheel(0, 600);
  await expect(root).toHaveClass(/lenis-smooth/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(root).not.toHaveClass(/lenis-scrolling/);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(600, 0);

  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Prices", exact: true }).click();
  await expect(page).toHaveURL(/#prices$/);
  await expect(root).not.toHaveClass(/lenis-scrolling/);
  await expect.poll(() => page.locator("#prices").evaluate((element) => {
    return Math.abs(element.getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
  })).toBeLessThan(3);

  await page.mouse.wheel(0, 1500);
  await expect(root).toHaveClass(/lenis-smooth/);
  await page.getByRole("navigation", { name: "Main navigation", exact: true }).getByRole("link", { name: "Destinations", exact: true }).click();
  await expect(page).toHaveURL(/\/destinations$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => scrollY)).toBeLessThan(5);
  await page.getByRole("link", { name: "Back to top", exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(root).not.toHaveClass(/lenis-smooth/);
  expect(errors).toEqual([]);
});

test("Dialogs scroll independently, release the page on close, and reduced motion skips smoothing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 400 });
  await page.goto("/things-to-do");
  const root = page.locator("html");
  await expect(root).toHaveClass(/lenis/);
  await page.locator(".experience-card").first().getByRole("button", { name: "Add to my trip", exact: true }).click();
  const dialog = page.locator(".enquiry-dialog");
  await expect(dialog).toBeVisible();
  await expect(root).toHaveClass(/lenis-stopped/);
  const backgroundPosition = await page.evaluate(() => scrollY);
  await page.mouse.move(8, 100);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(backgroundPosition);

  await dialog.getByText("Review your enquiry", { exact: true }).click();
  await dialog.evaluate((element) => { element.scrollTop = 0; });
  const bounds = (await dialog.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.wheel(0, 200);
  await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(backgroundPosition);
  await page.keyboard.press("Escape");
  await expect(root).not.toHaveClass(/lenis-stopped/);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.mouse.move(8, 100);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(backgroundPosition + 300);
  await expect(root).not.toHaveClass(/lenis-smooth/);
  await expect(page.locator(".experience-card").first()).toHaveCSS("animation-name", "none");
});

test("Homepage closes with its own illustrated CTA before the footer", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const cta = page.locator("main > .page-cta-wrap");
  await expect(page.getByRole("heading", { name: "Rather talk it through?" })).toHaveCount(0);
  await expect(page.locator("main .section-label, .explore-card .eyebrow")).toHaveCount(0);
  await expect(cta.getByRole("heading", { name: "Your trip, with the driving sorted.", exact: true })).toBeVisible();
  const artwork = cta.locator("img");
  await cta.scrollIntoViewIfNeeded();
  await artwork.evaluate((element) => (element as HTMLImageElement).decode());
  await expect(artwork).toHaveAttribute("src", /home-route-planning/);
  expect(await cta.evaluate((element) => element === element.parentElement?.lastElementChild && element.parentElement.nextElementSibling?.tagName === "FOOTER")).toBe(true);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await cta.scrollIntoViewIfNeeded();
    const bounds = (await cta.boundingBox())!;
    const image = (await artwork.boundingBox())!;
    expect(image.x).toBeGreaterThanOrEqual(bounds.x);
    expect(image.x + image.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const panel = (await cta.locator(".page-cta").boundingBox())!;
    const notice = (await page.locator(".future-teaser").boundingBox())!;
    expect(notice.x).toBeCloseTo(panel.x, 0);
    expect(notice.width).toBeCloseTo(panel.width, 0);
  }
  await page.setViewportSize(info.project.name === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
  await cta.scrollIntoViewIfNeeded();
  await mkdir("/private/tmp/gochauffeur-motion", { recursive: true });
  await cta.screenshot({ path: `/private/tmp/gochauffeur-motion/home-cta-${info.project.name}.png` });
  await page.locator("main > aside").screenshot({ path: `/private/tmp/gochauffeur-motion/booking-notice-${info.project.name}.png` });
  await page.context().route("https://wa.me/**", (route) => route.fulfill({ body: "WhatsApp handoff" }));
  const handoffPromise = page.waitForEvent("popup");
  await cta.getByRole("button", { name: "Plan my trip on WhatsApp", exact: true }).click();
  const handoff = await handoffPromise;
  await handoff.waitForLoadState();
  expect(new URL(handoff.url()).searchParams.get("text")).toContain("web-home-page_cta");
  await expect(page.locator(".enquiry-dialog[open]")).toHaveCount(0);
  await handoff.close();
});
