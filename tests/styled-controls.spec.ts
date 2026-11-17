import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("Calendar overlays the planner, selects across months, and restores focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Airport transfer", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Airport transfer", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Multi-day tour", exact: true }).click();
  await page.getByLabel("Start date", { exact: true }).fill("2026-12-31");
  const trigger = page.getByRole("button", { name: "Choose start date", exact: true }).first();
  await trigger.click();
  const calendar = page.getByRole("dialog", { name: "Choose your start date." });
  await expect(calendar).toBeVisible();
  const anchor = await trigger.boundingBox();
  const panel = await calendar.boundingBox();
  expect(panel!.width).toBeLessThanOrEqual(308);
  expect(Math.min(Math.abs(panel!.y - (anchor!.y + anchor!.height)), Math.abs(panel!.y + panel!.height - anchor!.y))).toBeLessThan(12);
  await expect(calendar).toHaveAttribute("aria-modal", "false");
  await expect(page.getByLabel("Days", { exact: true })).toBeEnabled();
  await calendar.getByRole("button", { name: "31 December 2026", exact: true }).press("ArrowRight");
  await expect(calendar.getByRole("button", { name: "1 January 2027", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(calendar).not.toBeVisible();
  await expect(page.getByLabel("Start date", { exact: true })).toHaveValue("2027-01-01");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(calendar).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByLabel("Days", { exact: true }).click();
  await expect(calendar).not.toBeVisible();
});

test("Choice lists show three and a half rows and scroll to keyboard selection", async ({ page }) => {
  await page.goto("/");
  const vehicle = page.getByRole("combobox", { name: "Vehicle", exact: true });
  await vehicle.click();
  const list = page.getByRole("listbox", { name: "Vehicle types" });
  const heights = await list.evaluate((el) => ({ list: el.clientHeight, row: el.firstElementChild!.getBoundingClientRect().height, total: el.scrollHeight }));
  expect(heights.list / heights.row).toBeCloseTo(3.5, 1);
  expect(heights.total).toBeGreaterThan(heights.list);
  await vehicle.press("End");
  await expect(list.getByRole("option").last()).toBeInViewport();
  await vehicle.press("Enter");
  await expect(vehicle).toContainText("Executive / Luxury");
  const pickup = page.getByRole("combobox", { name: "Pickup", exact: true });
  await pickup.fill("");
  const locations = page.getByRole("listbox", { name: "Pickup suggestions" });
  const locationHeights = await locations.evaluate((el) => ({ list: el.clientHeight, row: el.firstElementChild!.getBoundingClientRect().height }));
  expect(locationHeights.list / locationHeights.row).toBeCloseTo(3.5, 1);
});
