import test from "node:test";
import assert from "node:assert/strict";
import { vehicles, services } from "./prices.ts";
import { estimateTrip, numberInRange, quoteMessage, whatsappUrl, businessWhatsappUrl } from "./quote.ts";

const comfort = vehicles.find((v) => v.id === "comfort")!;
test("brief examples: five/six-day touring and day hire use their own allowances", () => {
  assert.deepEqual(estimateTrip("multi-day", comfort, "5"), { amount: 325, km: 600 });
  assert.deepEqual(estimateTrip("multi-day", comfort, "6"), { amount: 390, km: 720 });
  assert.deepEqual(estimateTrip("day", comfort, "6"), { amount: 72, km: 100 });
  assert.deepEqual(estimateTrip("airport", comfort, "6"), { amount: 35, km: null });
  assert.deepEqual(estimateTrip("point-to-point", comfort, "6"), { amount: 20, km: null });
});
test("luxury remains on request in every service", () => {
  for (const s of services) assert.equal(estimateTrip(s.id, vehicles[5], "5").amount, null);
});
test("numeric boundaries reject fractions, blank, infinite and out-of-range values", () => {
  for (const value of ["", " ", "1", "31", "2.5", "Infinity", "NaN"]) {
    assert.equal(numberInRange(value, 2, 30), false);
    assert.equal(estimateTrip("multi-day", comfort, value).amount, null);
  }
  for (const value of ["2", "30"]) assert.equal(numberInRange(value, 2, 30), true);
});
test("partial enquiries stay usable; days only appear for multi-day tours", () => {
  const trip = { service: "multi-day" as const, vehicle: comfort, pickup: "", destination: "Ella & Kandy", date: "", days: "5", travellers: "2" };
  const text = quoteMessage(trip);
  assert.match(text, /Pickup: To discuss\nPlaces to visit: Ella & Kandy/);
  assert.match(text, /Start date: To discuss\nDays: 5\nTravellers: 2/);
  assert.doesNotMatch(quoteMessage({ ...trip, service: "day" }), /Days:/);
  assert.match(quoteMessage({ ...trip, days: "31", travellers: "0" }), /Days: To discuss\nTravellers: To discuss/);
});
test("WhatsApp messages preserve Unicode and reserved characters; missing numbers do not redirect", () => {
  const message = "Ella & Kandy / traveller’s plans\nRef: google / search / sri-lanka";
  const url = whatsappUrl("+94 (77) 123-4567", message)!;
  assert.equal(new URL(url).searchParams.get("text"), message);
  assert.equal(new URL(url).pathname, "/94771234567");
  for (const number of ["", "YOUR_NUMBER", "0771234567", "javascript:alert(1)"]) assert.equal(whatsappUrl(number, message), null);
});

test("business WhatsApp handoff works without deployment configuration and respects overrides", () => {
  const message = "Hello, I'd like to visit Ella & Kandy.";
  const previous = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  try {
    delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    for (const number of [undefined, "", "   "]) {
      const url = new URL(businessWhatsappUrl(message, number)!);
      assert.equal(url.pathname, "/94762196201");
      assert.equal(url.searchParams.get("text"), message);
    }
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "+94 (77) 123-4567";
    assert.equal(new URL(businessWhatsappUrl(message)!).pathname, "/94771234567");
    assert.equal(businessWhatsappUrl(message, "YOUR_NUMBER"), null);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    else process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = previous;
  }
});
