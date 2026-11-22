import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
test("Google selections calculate a road fare and edits invalidate it", async ({ page }) => {
  await page.route("**/api/maps/places", route => {
    const { input } = route.request().postDataJSON();
    return route.fulfill({ json: { suggestions: [{ id: `place_${input}`, label: `${input}, Sri Lanka` }] } });
  });
  await page.route("**/api/maps/route", route => route.fulfill({ json: { distanceKm: 50.75, durationMinutes: 70 } }));
  await page.goto("/?service=point-to-point");
  const pickup = page.getByRole("combobox", { name: "Pickup", exact: true });
  const destination = page.getByRole("combobox", { name: "Destination", exact: true });
  await pickup.fill("Colombo");
  await page.getByRole("option", { name: "Colombo, Sri Lanka Sri Lanka", exact: true }).click();
  await destination.fill("Galle");
  await page.getByRole("option", { name: "Galle, Sri Lanka Sri Lanka", exact: true }).click();
  await expect(page.locator(".quote-estimate")).toContainText("US$39.45");
  await expect(page.locator(".quote-estimate")).not.toContainText("From");
  await page.getByRole("button", { name: "Review my ride", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".ride-review")).toContainText("50.8 km");
  expect(new URL((await dialog.getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")).toContain("US$39.45");
  await dialog.getByRole("button", { name: "Edit my ride" }).click();
  await dialog.getByRole("combobox", { name: "Drop-off", exact: true }).fill("Private hotel");
  await expect(dialog.locator(".review-price")).toContainText("From US$20");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  expect(new URL((await dialog.getByRole("link", { name: "Send to WhatsApp" }).getAttribute("href"))!).searchParams.get("text")).not.toContain("Driving distance:");
});

test("route errors leave a clearly labelled minimum fare", async ({ page }) => {
  await page.route("**/api/maps/places", route => {
    const { input } = route.request().postDataJSON();
    return route.fulfill({ json: { suggestions: [{ id: `place_${input}`, label: `${input}, Sri Lanka` }] } });
  });
  await page.route("**/api/maps/route", route => route.fulfill({ status: 503, json: { error: "Driving distance is unavailable. Our team can quote this route." } }));
  await page.goto("/?service=point-to-point");
  for (const [field, value] of [["Pickup", "Colombo"], ["Destination", "Galle"]]) {
    await page.getByRole("combobox", { name: field, exact: true }).fill(value);
    await page.getByRole("option", { name: `${value}, Sri Lanka Sri Lanka`, exact: true }).click();
  }
  await expect(page.locator(".quote-estimate")).toContainText("From US$20");
  await expect(page.getByRole("button", { name: "Review my ride", exact: true })).toBeEnabled();
});


test("location fields never offer predefined or custom fallback suggestions", async ({ page }) => {
  await page.route("**/api/maps/places", route => route.fulfill({ json: { suggestions: [] } }));
  await page.goto("/?service=point-to-point");
  const pickup = page.getByRole("combobox", { name: "Pickup", exact: true });
  await expect(pickup).toHaveValue("");
  await pickup.focus();
  await expect(page.getByRole("option")).toHaveCount(0);
  await pickup.fill("Colombo");
  await expect(page.getByText("No Google Maps locations found. Try a more specific search.")).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
  await pickup.press("Enter");
  await expect(page.getByRole("option")).toHaveCount(0);
  await page.route("**/api/maps/places", route => route.fulfill({ status: 503, json: { error: "Google Maps search is unavailable. Please try again or request a quotation." } }));
  await pickup.fill("Kandy");
  await expect(page.getByText("Google Maps search is unavailable. Please try again or request a quotation.")).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
});

test("airport transfers lock the Google CMB pickup in the planner and review", async ({ page }) => {
  const airport = "Bandaranaike International Airport (CMB), Airport and Aviation Services (Sri Lanka) (Private) Limited, Canada Friendship Rd, Katunayake";
  await page.route("**/api/maps/places", route => route.fulfill({ json: { suggestions: [{ id: "google_cmb_airport", label: airport }] } }));
  await page.goto("/?service=airport");
  const pickup = page.getByRole("combobox", { name: "Pickup airport", exact: true });
  await expect(pickup).toHaveValue(airport);
  await expect(page.getByText("Search and select a Sri Lankan location from Google Maps.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Review my ride", exact: true }).click();
  await expect(page.getByRole("dialog").locator(".ride-review")).toContainText(airport);
  await page.getByRole("dialog").getByRole("button", { name: "Edit my ride" }).click();
  await expect(page.getByRole("dialog").getByRole("combobox", { name: "Pickup", exact: true })).toHaveAttribute("readonly", "");
  await page.keyboard.press("Escape");
  await expect(pickup).toHaveAttribute("readonly", "");
  await pickup.focus();
  await pickup.press("Backspace");
  await pickup.press("ArrowDown");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(pickup).toHaveValue(airport);
  await page.getByRole("tab", { name: "Point-to-point", exact: true }).click();
  await page.getByRole("tab", { name: "Airport transfer", exact: true }).click();
  await expect(pickup).toHaveValue(airport);
});
