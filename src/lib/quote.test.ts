import test from "node:test";
import assert from "node:assert/strict";
import { vehicles, services, isVehicleSuitable, getSmallestSuitableVehicle } from "./prices.ts";
import { estimateTrip, numberInRange, isPositiveInteger, quoteMessage, whatsappUrl, businessWhatsappUrl } from "./quote.ts";

const economy = vehicles.find((v) => v.id === "economy")!;
const comfort = vehicles.find((v) => v.id === "comfort")!;
const suv = vehicles.find((v) => v.id === "suv")!;
const family = vehicles.find((v) => v.id === "family")!;
const group = vehicles.find((v) => v.id === "group")!;
const luxury = vehicles.find((v) => v.id === "luxury")!;

test("approved concierge rate card: multi-day, day hire, airport, and point-to-point", () => {
  assert.deepEqual(estimateTrip("multi-day", comfort, "5"), { amount: 350, km: 600 });
  assert.deepEqual(estimateTrip("multi-day", comfort, "6"), { amount: 420, km: 720 });
  assert.deepEqual(estimateTrip("day", comfort, "1"), { amount: 80, km: 100 });
  assert.deepEqual(estimateTrip("airport", comfort, "1"), { amount: 40, km: null });
  assert.deepEqual(estimateTrip("point-to-point", comfort, "1"), { amount: 20, km: null });
});

test("Section 07 Acceptance Test: 5 days / Sedan / 2 travellers -> US$350; 600 km included", () => {
  const result = estimateTrip("multi-day", comfort, "5", "2");
  assert.deepEqual(result, { amount: 350, km: 600 });
});

test("Section 07 Acceptance Test: 4 travellers selects Family Van -> US$525 for 5 days", () => {
  assert.equal(isVehicleSuitable(comfort, 4).suitable, false);
  const recommended = getSmallestSuitableVehicle(4)!;
  assert.equal(recommended.id, "family");
  const result = estimateTrip("multi-day", recommended, "5", "4");
  assert.deepEqual(result, { amount: 525, km: 600 });
});

test("Section 07 Acceptance Test: Decrease travellers from 4 to 2 retains existing suitable Family Van", () => {
  assert.equal(isVehicleSuitable(family, 2).suitable, true);
});

test("Section 07 Acceptance Test: 3 travellers -> Economy disabled; Sedan recommended", () => {
  assert.equal(isVehicleSuitable(economy, 3).suitable, false);
  assert.equal(isVehicleSuitable(comfort, 3).suitable, true);
  assert.equal(getSmallestSuitableVehicle(3)!.id, "comfort");
});

test("Section 07 Acceptance Test: 7-10 travellers -> Only Group Van among standard categories", () => {
  for (const count of [7, 8, 9, 10]) {
    assert.equal(isVehicleSuitable(economy, count).suitable, false);
    assert.equal(isVehicleSuitable(comfort, count).suitable, false);
    assert.equal(isVehicleSuitable(suv, count).suitable, false);
    assert.equal(isVehicleSuitable(family, count).suitable, false);
    assert.equal(isVehicleSuitable(group, count).suitable, true);
    assert.equal(getSmallestSuitableVehicle(count)!.id, "group");
  }
});

test("Section 07 Acceptance Test: 11+ travellers -> All standard categories disabled; custom quotation", () => {
  for (const v of [economy, comfort, suv, family, group]) {
    assert.equal(isVehicleSuitable(v, 11).suitable, false);
  }
  assert.equal(getSmallestSuitableVehicle(11), null);
  assert.equal(estimateTrip("multi-day", comfort, "5", "11").amount, null);
});

test("Section 07 Acceptance Test: 0, negative or fractional travellers -> Validation error", () => {
  for (const val of ["0", "-1", "-5", "2.5", "abc", ""]) {
    assert.equal(isPositiveInteger(val), false);
    assert.equal(estimateTrip("multi-day", comfort, "5", val).amount, null);
  }
  for (const val of ["1", "2", "10"]) {
    assert.equal(isPositiveInteger(val), true);
  }
});

test("Section 07 Acceptance Test: 50 km Sedan transfer -> US$39 before approved supplements", () => {
  // Transfer base $9 + (50 km * $0.60/km) = $39; minimum is $20 -> max(20, 39) = 39
  const result = estimateTrip("point-to-point", comfort, "1", "2", 50);
  assert.deepEqual(result, { amount: 39, km: 50 });
});

test("Section 07 Acceptance Test: CMB <-> Central Colombo / SUV -> US$50 one way", () => {
  const result = estimateTrip("airport", suv, "1", "2");
  assert.deepEqual(result, { amount: 50, km: null });
});

test("Section 07 Acceptance Test: Executive / Luxury -> No automatic fare; custom capacity and quotation", () => {
  for (const s of services) {
    assert.equal(estimateTrip(s.id, luxury, "5", "2").amount, null);
  }
  assert.equal(isVehicleSuitable(luxury, 15).suitable, true);
});

test("Section 07 Acceptance Test: Multi-day duration = 1 -> Require at least 2 days", () => {
  assert.equal(estimateTrip("multi-day", comfort, "1").amount, null);
});

test("numeric boundaries reject fractions, blank, infinite and out-of-range values", () => {
  for (const value of ["", " ", "1", "31", "2.5", "Infinity", "NaN"]) {
    assert.equal(numberInRange(value, 2, 30), false);
    assert.equal(estimateTrip("multi-day", comfort, value).amount, null);
  }
  for (const value of ["2", "30"]) assert.equal(numberInRange(value, 2, 30), true);
});

test("partial enquiries stay usable; confirmed quotation wording used", () => {
  const trip = { service: "multi-day" as const, vehicle: comfort, pickup: "", destination: "Ella & Kandy", date: "", days: "5", travellers: "2" };
  const text = quoteMessage(trip);
  assert.match(text, /Pickup: To discuss\nPlaces to visit: Ella & Kandy/);
  assert.match(text, /Start date: To discuss\nDays: 5\nTravellers: 2/);
  assert.match(text, /confirmed quotation/i);
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
