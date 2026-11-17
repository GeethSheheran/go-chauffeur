import { allowances, services, type Service, type Vehicle, usd } from "./prices.ts";

export type Trip = {
  service: Service;
  vehicle: Vehicle;
  pickup: string;
  destination: string;
  date: string;
  days: string;
  travellers: string;
};

export function numberInRange(value: string, min: number, max: number) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= min && n <= max;
}

export function estimateTrip(service: Service, vehicle: Vehicle, days: string) {
  switch (service) {
    case "multi-day":
      return {
        amount: vehicle.multiDay === null || !numberInRange(days, 2, 30) ? null : Number(days) * vehicle.multiDay,
        km: numberInRange(days, 2, 30) ? Number(days) * allowances.multiDayKm : null,
      };
    case "day": return { amount: vehicle.day, km: allowances.dayKm };
    case "airport": return { amount: vehicle.airport, km: null };
    case "point-to-point": return { amount: vehicle.pointToPoint, km: null };
  }
}

export function tripReview(trip: Trip) {
  const value = (s: string) => s.trim() || "To discuss";
  const estimate = estimateTrip(trip.service, trip.vehicle, trip.days);
  const destination = trip.destination.split(";").map((s) => s.trim()).filter(Boolean).join(" → ");
  return [
    { label: "Service", value: services.find((s) => s.id === trip.service)!.label },
    { label: "Pickup", value: value(trip.pickup) },
    { label: trip.service === "multi-day" ? "Places to visit" : "Drop-off", value: value(destination) },
    { label: trip.service === "multi-day" ? "Start date" : "Date", value: value(trip.date) },
    ...(trip.service === "multi-day" ? [{ label: "Days", value: numberInRange(trip.days, 2, 30) ? trip.days : "To discuss" }] : []),
    { label: "Travellers", value: numberInRange(trip.travellers, 1, 10) ? trip.travellers : "To discuss" },
    { label: "Vehicle", value: trip.vehicle.name },
    ...(trip.service === "airport" ? [{ label: "Fare basis", value: "CMB to central Colombo reference fare; other routes quoted separately" }] : []),
    { label: "Indicative price", value: `${trip.service === "point-to-point" && estimate.amount !== null ? "From " : ""}${usd(estimate.amount)} per vehicle` },
  ];
}

export function quoteMessage(trip: Trip) {
  return [
    "Hello GoChauffeur, I would like a quote for my ride.",
    "",
    "*MY TRIP*",
    ...tripReview(trip).map(({ label, value }) => `${label}: ${value}`),
    "",
    "Please confirm availability and the final written quote. Thank you!",
  ].join("\n");
}

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/[\s+()-]/g, "");
  if (!/^[1-9]\d{6,14}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
