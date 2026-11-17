import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const captures = "/private/tmp/gochauffeur-preview";

for (const catalog of [
  { path: "/destinations", card: ".destination-card", photo: ".destination-photo", count: 13, name: "destinations" },
  { path: "/things-to-do", card: ".experience-card", photo: ".experience-photo", count: 12, name: "experiences" },
]) {
  test(`Every ${catalog.name} card has a loaded photograph without credit labels`, async ({ page }, info) => {
    await page.goto(catalog.path);
    const cards = page.locator(catalog.card);
    await expect(cards).toHaveCount(catalog.count);
    const sources = new Set<string>();
    for (const card of await cards.all()) {
      const image = card.locator(`${catalog.photo} img`);
      await expect(image).toHaveCount(1);
      await expect(image).toHaveAttribute("alt", /\S/);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => {
        const photo = element as HTMLImageElement;
        return photo.complete && photo.naturalWidth > 0;
      })).toBe(true);
      sources.add((await image.getAttribute("src"))!);
      await expect(card).not.toContainText(/Photo by|Photo credit|Creative Commons|CC0/);
    }
    expect(sources.size).toBe(catalog.count);
    await mkdir(captures, { recursive: true });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `${captures}/${catalog.name}-photos-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  });
}

test("Home hero shows the welcome illustration and keeps the planner on the right", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Your own chauffeur/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Multi-day tour", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".quote-estimate strong")).toHaveText("US$325");
  const artwork = page.locator(".hero-art img");
  await expect(artwork).toBeVisible();
  await expect(artwork).toHaveAttribute("src", /home-chauffeur-welcome/);
  await artwork.evaluate((element) => (element as HTMLImageElement).decode());
  if (info.project.name === "desktop") {
    const copy = (await page.locator(".hero-editorial").boundingBox())!;
    const planner = (await page.locator(".hero-booking-form").boundingBox())!;
    expect(planner.x).toBeGreaterThanOrEqual(copy.x + copy.width);
  }
  await expect(page.locator("canvas")).toHaveCount(0);
  await mkdir(captures, { recursive: true });
  await page.screenshot({ path: `${captures}/home-top-${info.project.name}.png` });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 30)); }
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: `${captures}/home-${info.project.name}.png`, fullPage: true });
  await expect(page.locator("#chauffeurs")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("Desktop planner fits below the header within one viewport", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "Phones use the normal stacked form.");
  await page.goto("/");
  await page.getByRole("tab", { name: "Multi-day tour", exact: true }).click();
  const planner = page.locator(".hero-booking-form .quote-widget");
  const submit = planner.getByRole("button", { name: "Review my ride", exact: true });
  for (const width of [1024, 1440, 1920]) {
    for (const height of [640, 768, 900]) {
      await page.setViewportSize({ width, height });
      await planner.evaluate((element) => { element.scrollTop = 0; });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const bounds = (await planner.boundingBox())!;
      const header = (await page.locator(".site-header").boundingBox())!;
      expect(bounds.y).toBeGreaterThanOrEqual(header.y + header.height);
      expect(bounds.y + bounds.height, `${width} × ${height}`).toBeLessThanOrEqual(height - 16);
      expect(await page.getByLabel("Pickup", { exact: true }).evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
      await submit.scrollIntoViewIfNeeded();
      await expect(submit).toBeInViewport();
      if (width === 1440) {
        await mkdir(captures, { recursive: true });
        await page.screenshot({ path: `${captures}/hero-fit-${height}.png` });
      }
    }
  }
});

test("Chauffeur tips greet once in view and respect reduced motion", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/things-to-do");
  const avatar = page.locator(".chauffeur-avatar").first();
  await avatar.scrollIntoViewIfNeeded();
  await expect(avatar).toHaveClass(/has-greeted/);
  await expect(avatar).toHaveCSS("animation-name", "chauffeur-greeting");
  await expect(avatar).toHaveCSS("animation-iteration-count", "1");
  await expect(avatar).toHaveCSS("mask-image", /linear-gradient/);
  await avatar.evaluate((element) => (element as HTMLImageElement).decode());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(avatar).toHaveCSS("animation-name", "none");
  await page.locator(".chauffeur-tip").first().screenshot({ path: `${captures}/chauffeur-tip-${info.project.name}.png`, animations: "disabled" });
  await page.reload();
  await avatar.scrollIntoViewIfNeeded();
  await expect(avatar).not.toHaveClass(/has-greeted/);
});

test("Planner recalculates every service and allows incomplete enquiries", async ({ page }) => {
  await page.goto("/");
  const pickup = page.getByRole("combobox", { name: "Pickup", exact: true });
  await pickup.click();
  await expect(pickup).toHaveAttribute("aria-expanded", "true");
  await pickup.press("Escape");
  await page.getByLabel("Days", { exact: true }).fill("6");
  await expect(page.locator(".quote-estimate strong")).toHaveText("US$390");
  await expect(page.locator(".estimate-detail")).toContainText("720 km");
  await page.getByRole("tab", { name: "Chauffeur for a day", exact: true }).click();
  await expect(page.locator(".quote-estimate strong")).toHaveText("US$72");
  await expect(page.locator(".estimate-detail")).toHaveText("100 km · 10 hours");
  await page.getByRole("tab", { name: "Airport transfer", exact: true }).click();
  await expect(page.getByLabel("Pickup airport", { exact: true })).toHaveValue("Colombo airport (CMB)");
  await expect(page.locator(".quote-estimate strong")).toHaveText("US$35");
  await page.getByRole("tab", { name: "Point-to-point", exact: true }).click();
  await expect(page.locator(".quote-estimate strong")).toHaveText("From US$20");
  await page.getByRole("combobox", { name: "Vehicle", exact: true }).click();
  await page.getByRole("option", { name: /Executive \/ Luxury/ }).click();
  await expect(page.locator(".quote-estimate strong")).toHaveText("On request");
  await page.getByRole("button", { name: "Review my ride", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".ride-review")).toContainText("Point-to-point");
  await expect(page.locator(".ride-review")).toContainText("To discuss");
  await expect(page.locator(".ride-review dt").filter({ hasText: /^Days$/ })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Original campaign survives navigation and region filtering", async ({ page }, info) => {
  await page.goto("/?utm_source=google&utm_medium=cpc&utm_campaign=uk-travel");
  await page.locator(".explore-destinations").click();
  await expect(page).toHaveURL(/destinations/);
  await expect(page.locator(".destination-card")).toHaveCount(13);
  await page.getByRole("button", { name: "Hill country", exact: true }).click();
  await expect(page.locator(".destination-card")).toHaveCount(3);
  const ella = page.locator(".destination-card").filter({ has: page.getByRole("heading", { name: "Ella", exact: true }) });
  await ella.getByRole("button", { name: "Add to my trip" }).click();
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My trip, 1 saved places" }).click();
  await expect(page.locator(".trip-place-list")).toContainText("Ella");
  expect(new URL((await page.getByRole("dialog").getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")).toContain("web-destinations-trip_wallet / google / cpc / uk-travel");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".destination-card")).toHaveCount(13);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: `${captures}/destinations-${info.project.name}.png`, fullPage: true, animations: "disabled" });
});

test("Experience filters, itinerary messages and exclusive FAQs work", async ({ page }, info) => {
  await page.goto("/things-to-do");
  await expect(page.locator(".experience-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Wildlife", exact: true }).click();
  await expect(page.locator(".experience-card")).toHaveCount(2);
  await page.locator(".experience-card").first().getByRole("button", { name: "Add to my trip" }).click();
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My trip, 1 saved places" }).click();
  await expect(page.locator(".trip-place-list")).toContainText("Leopard safari in Yala");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo({ top: 0, behavior: "instant" }); });
  await page.screenshot({ path: `${captures}/experiences-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.goto("/");
  await expect(page.locator(".itinerary-card.has-photo h3")).toHaveText(["Hills, wildlife and the south coast", "Cultural Triangle"]);
  await page.locator(".itinerary-card").first().getByRole("button", { name: "Customise" }).click();
  await expect(page.locator(".ride-review")).toContainText("Nuwara Eliya → Ella → Yala → Galle → Airport");
  await page.keyboard.press("Escape");
  const first = page.getByRole("button", { name: /Is the price per person/ });
  const second = page.getByRole("button", { name: /How do I pay/ });
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
});

test("Mobile navigation, service links and legal/recovery routes work", async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Navigation" })).toBeVisible();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Destinations", exact: true }).click();
    await expect(page).toHaveURL(/destinations/);
    await expect(page.getByRole("dialog", { name: "Navigation" })).not.toBeVisible();
  }
  await page.locator(".footer-column").first().getByRole("link", { name: "Airport transfer", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Airport transfer", exact: true })).toHaveAttribute("aria-selected", "true");
  for (const path of ["/privacy", "/terms"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator(".legal-preview, .legal-hero .section-label")).toHaveCount(0);
    const hero = (await page.locator(".legal-hero h1").boundingBox())!;
    const content = (await page.locator(".legal-body section").first().boundingBox())!;
    expect(content.x).toBeCloseTo(hero.x, 0);
    expect(content.width).toBeCloseTo(page.viewportSize()!.width - hero.x * 2, 0);
    await page.screenshot({ path: `${captures}/${path.slice(1)}-${info.project.name}.png`, animations: "disabled" });
  }
  const missing = await page.goto("/this-route-does-not-exist");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /couldn’t find/ })).toBeVisible();
});

test("No page overflow; phone pricing shows all rates without horizontal scrolling", async ({ page }) => {
  for (const width of [360, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/destinations", "/things-to-do"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.locator(".price-scroll")).not.toBeVisible();
  await expect(page.locator(".mobile-price-card")).toHaveCount(6);
  await expect(page.locator(".mobile-price-card").first()).toBeVisible();
});

test("Pages meet automated WCAG AA checks; reduced motion keeps content readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/destinations", "/things-to-do", "/privacy", "/terms"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))).toEqual([]);
  }
});
