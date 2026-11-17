import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const captures = "/private/tmp/gochauffeur-illustrated-states";
test.use({ reducedMotion: "reduce" });

async function artworkLoaded(image: Locator) {
  await expect.poll(() => image.evaluate((element) => {
    const image = element as HTMLImageElement;
    return image.complete && image.naturalWidth > 0;
  })).toBe(true);
}

test("Search and filter empty states offer real recovery and relevant enquiries", async ({ page }, info) => {
  await mkdir(captures, { recursive: true });
  await page.goto("/destinations");
  const search = page.getByRole("searchbox", { name: "Find a destination", exact: true });
  await search.fill("Ella");
  await expect(page.locator(".destination-card")).toHaveCount(1);
  await expect(page.locator(".result-count")).toHaveText("1 place");
  await page.getByRole("button", { name: "West coast", exact: true }).click();
  const empty = page.locator(".catalog-empty");
  await expect(empty).toBeVisible();
  await expect(page.locator(".destination-card")).toHaveCount(0);
  await artworkLoaded(empty.locator(".travel-art"));
  const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await empty.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${captures}/empty-search-${info.project.name}.png`, animations: "disabled" });
  await empty.getByRole("button", { name: "Reset search and filters", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".destination-card")).toHaveCount(13);
  await page.goto("/things-to-do");
  await page.getByRole("searchbox", { name: "Find an experience", exact: true }).fill("a quiet cooking class");
  await expect(page.locator(".catalog-empty")).toBeVisible();
  await page.getByRole("button", { name: "Ask us for ideas", exact: true }).click();
  await expect(page.locator(".enquiry-dialog pre")).toContainText("a quiet cooking class");
  expect(new URL((await page.getByRole("dialog").getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")).toContain("web-things-to-do-empty_search");
  await page.keyboard.press("Escape");
  const response = await page.goto("/a-little-off-route");
  expect(response?.status()).toBe(404);
  await artworkLoaded(page.locator(".not-found .travel-art"));
  await page.screenshot({ path: `${captures}/off-route-${info.project.name}.png`, animations: "disabled" });
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
