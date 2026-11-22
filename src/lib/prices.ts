export const PRICING_VERSION = "2026-11-22.1";

export const services = [
  { id: "airport", label: "Airport transfer", short: "Airport transfer" },
  { id: "point-to-point", label: "Point-to-point", short: "Point-to-point" },
  { id: "day", label: "Chauffeur for a day", short: "Day hire" },
  { id: "multi-day", label: "Multi-day tour", short: "Multi-day tour" },
] as const;

export type Service = (typeof services)[number]["id"];

export type Vehicle = {
  id: string;
  name: string;
  seats: string;
  suitability: string;
  maxTravellers: number | null;
  multiDay: number | null;
  day: number | null;
  airport: number | null;
  pointToPoint: number | null;
  transferBase: number | null;
  perKm: number | null;
  minimum: number | null;
  tourExcessPerKm: number | null;
  overtimePerHour: number | null;
  airportWaitingPer30Min: number | null;
};

export const allowances = {
  multiDayKm: 120,
  dayKm: 100,
  dayHours: 10,
  airportWaitingFreeMinutes: 60,
};

export const vehicles: Vehicle[] = [
  {
    id: "economy",
    name: "Economy",
    seats: "1–2",
    suitability: "1–2 guests; about 2 medium suitcases",
    maxTravellers: 2,
    multiDay: 60,
    day: 65,
    airport: 30,
    pointToPoint: 15,
    transferBase: 7,
    perKm: 0.50,
    minimum: 15,
    tourExcessPerKm: 0.45,
    overtimePerHour: 5,
    airportWaitingPer30Min: 3,
  },
  {
    id: "comfort",
    name: "Comfort Sedan",
    seats: "1–3",
    suitability: "1–3, depending on luggage",
    maxTravellers: 3,
    multiDay: 70,
    day: 80,
    airport: 40,
    pointToPoint: 20,
    transferBase: 9,
    perKm: 0.60,
    minimum: 20,
    tourExcessPerKm: 0.55,
    overtimePerHour: 5,
    airportWaitingPer30Min: 3,
  },
  {
    id: "suv",
    name: "Comfort SUV",
    seats: "1–3",
    suitability: "1–3 with luggage",
    maxTravellers: 3,
    multiDay: 95,
    day: 100,
    airport: 50,
    pointToPoint: 25,
    transferBase: 12,
    perKm: 0.75,
    minimum: 25,
    tourExcessPerKm: 0.65,
    overtimePerHour: 7,
    airportWaitingPer30Min: 3,
  },
  {
    id: "family",
    name: "Family MPV / Van",
    seats: "4–6",
    suitability: "4–6, depending on seating/luggage",
    maxTravellers: 6,
    multiDay: 105,
    day: 110,
    airport: 60,
    pointToPoint: 30,
    transferBase: 13,
    perKm: 0.80,
    minimum: 30,
    tourExcessPerKm: 0.70,
    overtimePerHour: 7,
    airportWaitingPer30Min: 5,
  },
  {
    id: "group",
    name: "Group Van",
    seats: "7–10",
    suitability: "7–10, depending on seating/luggage",
    maxTravellers: 10,
    multiDay: 130,
    day: 135,
    airport: 70,
    pointToPoint: 40,
    transferBase: 16,
    perKm: 1.00,
    minimum: 40,
    tourExcessPerKm: 0.85,
    overtimePerHour: 7,
    airportWaitingPer30Min: 5,
  },
  {
    id: "luxury",
    name: "Executive / Luxury",
    seats: "On request",
    suitability: "Custom verified capacity",
    maxTravellers: null,
    multiDay: null,
    day: null,
    airport: null,
    pointToPoint: null,
    transferBase: null,
    perKm: null,
    minimum: null,
    tourExcessPerKm: null,
    overtimePerHour: null,
    airportWaitingPer30Min: null,
  },
];

export function usd(amount: number | null) {
  return amount === null ? "On request" : `US$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function isVehicleSuitable(vehicle: Vehicle, travellerCount: number): { suitable: boolean; reason?: string } {
  if (vehicle.id === "luxury") {
    return { suitable: true };
  }
  if (travellerCount > 10) {
    return { suitable: false, reason: `Not suitable for ${travellerCount} travellers (Groups above 10 require custom quote)` };
  }
  if (vehicle.maxTravellers !== null && travellerCount > vehicle.maxTravellers) {
    return { suitable: false, reason: `Not suitable for ${travellerCount} travellers` };
  }
  return { suitable: true };
}

export function getSmallestSuitableVehicle(travellerCount: number): Vehicle | null {
  if (travellerCount > 10) return null;
  const standardVehicles = vehicles.filter((v) => v.maxTravellers !== null);
  for (const v of standardVehicles) {
    if (v.maxTravellers !== null && travellerCount <= v.maxTravellers) {
      return v;
    }
  }
  return null;
}
