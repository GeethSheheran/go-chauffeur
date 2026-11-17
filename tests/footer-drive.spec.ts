import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test("Footer scenery moves behind a fixed car, pauses offscreen, and respects reduced motion", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/things-to-do");
  const scene = page.locator(".footer-drive");
  const track = scene.locator(".footer-drive-track");
  const car = scene.locator(".footer-drive-car");
  const exhaust = car.locator(".footer-exhaust span");
  await expect(exhaust).toHaveCount(3);
  await expect(scene.locator(".footer-drive-elephants")).toHaveCount(1);
  await expect(scene.locator(".footer-drive-tower")).toHaveCount(1);
  await expect(scene.locator(".footer-drive-temple")).toHaveCount(1);
  await expect(car.locator("svg image")).toHaveAttribute("href", "/brand/go-symbol.png");
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-running", "true");
  await expect(exhaust.first()).toHaveCSS("animation-play-state", "running");
  const carPosition = await car.boundingBox();
  const start = await track.evaluate((node) => getComputedStyle(node).transform);
  await expect.poll(() => track.evaluate((node) => getComputedStyle(node).transform)).not.toBe(start);
  expect((await car.boundingBox())!.x).toBeCloseTo(carPosition!.x, 1);
  await expect(scene.getByRole("button")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(scene).toHaveAttribute("data-running", "false");
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await expect(exhaust.first()).toHaveCSS("animation-play-state", "paused");
  await track.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const paused = await track.evaluate((node) => getComputedStyle(node).transform);
  await page.waitForTimeout(200);
  expect(await track.evaluate((node) => getComputedStyle(node).transform)).toBe(paused);
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-running", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene).toHaveAttribute("data-running", "false");
  await expect(track).toHaveCSS("animation-name", "none");
  await expect(car.locator(".footer-exhaust")).toBeHidden();
  await page.locator("footer img").evaluateAll((images) => Promise.all(images.map((image) => (image as HTMLImageElement).decode())));
  const panorama = await scene.locator(".footer-drive-tile img").first().evaluate((image) => ({ width: (image as HTMLImageElement).naturalWidth, height: (image as HTMLImageElement).naturalHeight }));
  expect(panorama.width / panorama.height).toBeCloseTo(3, 2);
  await expect(scene.locator(".footer-drive-tile img").first()).toHaveAttribute("src", "/images/illustrations/footer-panorama-soft.webp");
  await mkdir("/private/tmp/gochauffeur-footer-review", { recursive: true });
  await page.locator("footer").screenshot({ path: `/private/tmp/gochauffeur-footer-review/final-${info.project.name}.png`, style: ".site-header, .skip-link { visibility: hidden !important; }" });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene).toHaveAttribute("data-running", "true");
  await track.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.pause();
    animation.currentTime = 35000;
  });
  await exhaust.evaluateAll((elements) => elements.forEach((element, index) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 500 + index * 900;
  }));
  await page.locator("footer").screenshot({ path: `/private/tmp/gochauffeur-footer-review/valley-${info.project.name}.png`, style: ".site-header, .skip-link { visibility: hidden !important; }" });
  if (info.project.name === "desktop") {
    await page.setViewportSize({ width: panorama.width, height: panorama.height });
    await page.goto("/images/illustrations/footer-panorama-soft.webp");
    await page.screenshot({ path: "/private/tmp/gochauffeur-footer-review/panorama-full.png" });
  }
});

test("Taller desktop footer keeps text at the top and the slim credits strip at the bottom", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Mobile footer stacks its navigation naturally.");
  await page.goto("/");
  for (const [width, height] of [[1440, 1000], [1440, 800], [1024, 768], [1440, 650]]) {
    await page.setViewportSize({ width, height });
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    const bounds = (await footer.boundingBox())!;
    expect(bounds.height).toBeLessThanOrEqual(height * 0.75 + 1);
    const strip = (await footer.locator(".footer-baseline").boundingBox())!;
    expect(strip.height).toBeLessThanOrEqual(54);
    expect(strip.y + strip.height).toBeCloseTo(bounds.y + bounds.height, 0);
    const heading = (await footer.locator(".footer-contact h2").boundingBox())!;
    expect(heading.y - bounds.y).toBeLessThanOrEqual(60);
    expect(heading.x).toBeGreaterThan(bounds.x + bounds.width / 2);
    expect((await footer.locator(".footer-intro-copy").boundingBox())!.x).toBeLessThan(heading.x);
    expect((await footer.locator(".footer-brand").boundingBox())!.y).toBeLessThan((await footer.locator(".footer-intro-copy").boundingBox())!.y);
    expect((await footer.locator(".footer-drive-tile").first().boundingBox())!.width).toBeGreaterThanOrEqual(bounds.width - 1);
    for (const link of await footer.getByRole("link").all()) {
      const box = (await link.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(bounds.y);
      expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
});

test("Campaign badges use the supplied GO artwork and stay aligned with the hero image", async ({ page }, info) => {
  await mkdir("/private/tmp/gochauffeur-footer-review", { recursive: true });
  for (const route of ["destinations", "things-to-do"]) {
    await page.goto(`/${route}`);
    const badge = page.locator(".page-hero .campaign-go-badge");
    await expect(badge.locator("image")).toHaveAttribute("href", "/brand/go-symbol.png");
    const hero = page.locator(".page-hero");
    await hero.locator("img").evaluateAll((images) => Promise.all(images.map((image) => (image as HTMLImageElement).decode())));
    await hero.screenshot({ path: `/private/tmp/gochauffeur-footer-review/${route}-${info.project.name}.png` });
  }
});
