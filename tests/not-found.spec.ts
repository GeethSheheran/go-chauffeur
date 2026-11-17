import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.use({ reducedMotion: "reduce" });

test("Branded 404 uses our travellers and offers working recovery actions", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("/a-little-off-route");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Error 404. We couldn’t find that page.");
  const artwork = page.locator(".not-found-travellers");
  await expect(artwork).toHaveAttribute("src", /off-route-travellers/);
  await artwork.evaluate((element) => (element as HTMLImageElement).decode());
  const widths = info.project.name === "mobile" ? [320, 390, 760] : [768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: info.project.name === "mobile" ? 844 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(artwork).toBeInViewport();
    await expect(page.getByRole("link", { name: "Back to home", exact: true })).toBeInViewport();
    await page.screenshot({ path: `/private/tmp/gochauffeur-not-found/${width}.png`, animations: "disabled" });
  }
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("button", { name: "Ask us for help", exact: true }).click();
  await expect(page.locator(".enquiry-dialog")).toBeVisible();
  expect(new URL((await page.getByRole("dialog").getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")).toContain("web-a-little-off-route-404");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: /Your own chauffeur/ })).toBeVisible();
  expect(errors).toEqual([]);
});
