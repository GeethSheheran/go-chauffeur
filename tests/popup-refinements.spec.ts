import { test, expect } from "@playwright/test";

test("Marked WhatsApp buttons hand off directly without a review popup", async ({ page }, info) => {
  await page.context().route("https://wa.me/**", (route) => route.fulfill({ body: "WhatsApp handoff" }));
  await page.goto("/");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click();
  const popupPromise = page.waitForEvent("popup");
  await (info.project.name === "mobile" ? page.getByRole("dialog", { name: "Navigation" }) : page.getByRole("banner")).getByRole("button", { name: "Chat on WhatsApp", exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(new URL(popup.url()).searchParams.get("text")).toContain("web-home-header");
  await expect(page.locator(".enquiry-dialog[open]")).toHaveCount(0);
  await popup.close();
  const ctaPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Plan my trip on WhatsApp", exact: true }).click();
  const cta = await ctaPromise;
  await cta.waitForLoadState();
  expect(new URL(cta.url()).searchParams.get("text")).toContain("web-home-page_cta");
  await expect(page.locator(".enquiry-dialog[open]")).toHaveCount(0);
  await cta.close();
  const footerPromise = page.waitForEvent("popup");
  await page.locator(".footer-chat").click();
  const footer = await footerPromise;
  await footer.waitForLoadState();
  expect(new URL(footer.url()).searchParams.get("text")).toContain("web-home-footer");
  await expect(page.locator(".enquiry-dialog[open]")).toHaveCount(0);
  await footer.close();
});

test("Every itinerary opens editable Trip Details with its own service and pickup", async ({ page }) => {
  await page.goto("/");
  const cases = [
    ["Hills, wildlife and the south coast", "Multi-day tour", "Kandy", "Nuwara Eliya → Ella → Yala → Galle → Airport"],
    ["Cultural Triangle", "Multi-day tour", "Colombo", "Sigiriya → Dambulla → Polonnaruwa → Kandy"],
    ["Colombo with your own driver", "Chauffeur for a day", "Colombo", "City sights → Markets → Galle Face"],
    ["Airport to Negombo or Colombo", "Airport transfer", "Colombo airport (CMB)", "Your hotel in Negombo or Colombo"],
  ];
  for (const [title, service, pickup, destination] of cases) {
    await page.locator(".itinerary-card").filter({ has: page.getByRole("heading", { name: title, exact: true }) }).getByRole("button", { name: "Customise" }).click();
    const dialog = page.getByRole("dialog", { name: "Your ride, at a glance." });
    await expect(dialog.locator(".ride-review")).toContainText(service);
    await expect(dialog.locator(".ride-review")).toContainText(pickup);
    await expect(dialog.locator(".ride-review")).toContainText(destination);
    await dialog.getByRole("button", { name: "Edit my ride" }).click();
    await dialog.getByLabel("Pickup", { exact: true }).fill("My custom hotel");
    await dialog.getByRole("button", { name: "Save changes" }).click();
    const message = new URL((await dialog.getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")!;
    expect(message).toContain("Pickup: My custom hotel");
    expect(message).toContain(`Itinerary: ${title}`);
    await dialog.getByRole("button", { name: "Close enquiry preview" }).click();
    await expect(dialog).not.toBeVisible();
  }
});

test("Dialogs animate in and out and respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "Review my ride", exact: true }).click();
  const dialog = page.locator('.enquiry-dialog[aria-labelledby="enquiry-title"]');
  await expect(dialog).toHaveCSS("opacity", "1");
  expect(await dialog.evaluate((el) => getComputedStyle(el).transitionProperty)).toContain("display");
  await dialog.evaluate((el) => (el as HTMLDialogElement).close());
  const leaving = await dialog.evaluate((el) => ({ display: getComputedStyle(el).display, animations: el.getAnimations().length }));
  expect(leaving.display).not.toBe("none");
  expect(leaving.animations).toBeGreaterThan(0);
  await expect(dialog).not.toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Review my ride", exact: true }).click();
  await expect(dialog).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});


test("Empty wish list offers destinations and switches to the selected place", async ({ page }, info) => {
  await page.goto("/destinations");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "My trip, 0 saved ideas" }).click();
  const dialog = page.locator(".trip-wallet-dialog");
  await expect(dialog.locator(".review-content-heading")).toBeHidden();
  await expect(dialog.locator(".review-intro")).toHaveCount(0);
  await expect(dialog).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  const explore = await dialog.getByRole("link", { name: "Explore destinations" }).boundingBox();
  const empty = await dialog.locator(".trip-empty").boundingBox();
  expect(explore!.width).toBeCloseTo(empty!.width, 0);
  await dialog.getByRole("button", { name: "Add Colombo to my trip", exact: true }).click();
  await expect(dialog.locator(".trip-suggestions")).toHaveCount(0);
  await expect(dialog.locator(".trip-place-list li")).toHaveCount(1);
  await expect(dialog.locator(".review-content-heading")).toContainText("1 IDEA");
  await expect(dialog.getByRole("button", { name: "Remove Colombo" })).toBeFocused();
  await dialog.getByRole("button", { name: "Remove Colombo" }).click();
  await expect(dialog.getByRole("button", { name: "Add Colombo to my trip", exact: true })).toBeVisible();
  await expect(dialog.locator(".review-content-heading")).toBeHidden();
});
