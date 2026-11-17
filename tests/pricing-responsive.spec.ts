import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });
const captures = "/private/tmp/gochauffeur-responsive-prices";

test("Phone pricing keeps every capacity and rate readable without horizontal scrolling", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "Phone price layout");
  await page.goto("/#prices");
  const cards = page.locator(".mobile-price-card");
  const rows = page.locator(".price-table tbody tr");
  await expect(cards).toHaveCount(6);
  for (const width of [320, 390, 430, 760]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.locator(".price-scroll")).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (let index = 0; index < 6; index++) {
      const card = cards.nth(index);
      const cells = await rows.nth(index).locator("td").allTextContents();
      await expect(card.locator(".mobile-price-capacity dd")).toHaveText(cells[0]);
      await expect(card.locator(".mobile-price-rates dd")).toHaveText(cells.slice(1));
      expect(await card.evaluate((element) => [...element.querySelectorAll("h3, dt, dd")].every((child) => {
        const bounds = child.getBoundingClientRect();
        return bounds.left >= 0 && bounds.right <= innerWidth && child.scrollWidth <= child.clientWidth;
      })), `Readable prices at ${width}px`).toBe(true);
    }
    await cards.first().screenshot({ path: `${captures}/economy-${width}.png`, animations: "disabled" });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const comfort = cards.filter({ has: page.getByRole("heading", { name: "Comfort Sedan", exact: true }) });
  await expect(comfort.locator(".mobile-price-rates dd")).toHaveText(["US$65", "US$72", "US$35", "US$20"]);
  await cards.last().screenshot({ path: `${captures}/executive-mobile.png`, animations: "disabled" });
  const results = await new AxeBuilder({ page }).include("#prices").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("Larger screens retain the comparison table and tablet scrolling keeps vehicle labels visible", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Table and tablet layout");
  await page.goto("/#prices");
  const region = page.getByRole("region", { name: "Vehicle prices, scroll horizontally for all services" });
  for (const width of [768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(region).toBeVisible();
    await region.scrollIntoViewIfNeeded();
    await expect(page.locator(".mobile-price-list")).not.toBeVisible();
    await expect(region.getByRole("columnheader")).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    const bounds = (await region.boundingBox())!;
    const vehicle = (await region.getByRole("rowheader").first().boundingBox())!;
    expect(Math.abs(vehicle.x - bounds.x)).toBeLessThan(3);
    await expect(region.getByRole("cell", { name: "US$15", exact: true })).toBeInViewport();
    await region.evaluate((element) => { element.scrollLeft = 0; });
    if (width < 1101) await expect(page.locator(".price-scroll-hint")).toBeVisible();
    await region.screenshot({ path: `${captures}/table-${width}.png`, animations: "disabled" });
  }
  await page.setViewportSize({ width: 768, height: 1000 });
  await region.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
});
