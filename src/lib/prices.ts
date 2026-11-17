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
  multiDay: number | null;
  day: number | null;
  airport: number | null;
  pointToPoint: number | null;
};

export const allowances = { multiDayKm: 120, dayKm: 100, dayHours: 10 };

export const vehicles: Vehicle[] = [
  { id: "economy", name: "Economy", seats: "1–3", multiDay: 55, day: 60, airport: 28, pointToPoint: 15 },
  { id: "comfort", name: "Comfort Sedan", seats: "1–3", multiDay: 65, day: 72, airport: 35, pointToPoint: 20 },
  { id: "suv", name: "Comfort SUV", seats: "1–3 + luggage", multiDay: 85, day: 92, airport: 45, pointToPoint: 25 },
  { id: "family", name: "Family MPV / Van", seats: "4–6", multiDay: 95, day: 100, airport: 55, pointToPoint: 28 },
  { id: "group", name: "Group Van", seats: "7–10", multiDay: 120, day: 125, airport: 65, pointToPoint: 36 },
  { id: "luxury", name: "Executive / Luxury", seats: "On request", multiDay: null, day: null, airport: null, pointToPoint: null },
];

export function usd(amount: number | null) {
  return amount === null ? "On request" : `US$${amount.toLocaleString("en-US")}`;
}
