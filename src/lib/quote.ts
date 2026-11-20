import { allowances, services, type Service, type Vehicle, usd } from "./prices.ts";

export type Trip = {
  service: Service;
  vehicle: Vehicle;
  pickup: string;
  destination: string;
  date: string;
  days: string;
  travellers: string;
  distanceKm?: number | null;
};

export function numberInRange(value: string, min: number, max: number) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n >= min && n <= max;
}

export function isPositiveInteger(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isInteger(n) && n > 0;
}

export function estimateTrip(
  service: Service,
  vehicle: Vehicle,
  days: string,
  travellers?: string,
  distanceKm?: number | null
) {
  if (travellers !== undefined) {
    const t = Number(travellers);
    const validTravellerNumber = travellers.trim() !== "" && Number.isInteger(t) && t > 0;
    if (!validTravellerNumber) {
      return { amount: null, km: null };
    }
    if (t > 10 && vehicle.id !== "luxury") {
      return { amount: null, km: null };
    }
    if (vehicle.maxTravellers !== null && t > vehicle.maxTravellers) {
      return { amount: null, km: null };
    }
  }

  if (vehicle.id === "luxury") {
    return { amount: null, km: null };
  }

  switch (service) {
    case "multi-day": {
      const valid = numberInRange(days, 2, 30);
      return {
        amount: vehicle.multiDay === null || !valid ? null : Math.round(Number(days) * vehicle.multiDay),
        km: valid ? Number(days) * allowances.multiDayKm : null,
      };
    }
    case "day":
      return {
        amount: vehicle.day === null ? null : Math.round(vehicle.day),
        km: allowances.dayKm,
      };
    case "airport":
      return {
        amount: vehicle.airport === null ? null : Math.round(vehicle.airport),
        km: null,
      };
    case "point-to-point": {
      if (typeof distanceKm === "number" && !isNaN(distanceKm) && distanceKm > 0) {
        if (vehicle.transferBase !== null && vehicle.perKm !== null && vehicle.minimum !== null) {
          const calculated = vehicle.transferBase + vehicle.perKm * distanceKm;
          return { amount: Math.round(Math.max(vehicle.minimum, calculated)), km: Math.round(distanceKm) };
        }
      }
      return { amount: vehicle.pointToPoint === null ? null : Math.round(vehicle.pointToPoint), km: null };
    }
  }
}

export function tripReview(trip: Trip) {
  const value = (s: string) => s.trim() || "To discuss";
  const estimate = estimateTrip(trip.service, trip.vehicle, trip.days, trip.travellers, trip.distanceKm);
  const destination = trip.destination.split(";").map((s) => s.trim()).filter(Boolean).join(" → ");
  const t = Number(trip.travellers);
  const validTravellerInt = trip.travellers.trim() !== "" && Number.isInteger(t) && t > 0;
  const isLargeGroup = validTravellerInt && t > 10;

  return [
    { label: "Service", value: services.find((s) => s.id === trip.service)!.label },
    { label: "Pickup", value: value(trip.pickup) },
    { label: trip.service === "multi-day" ? "Places to visit" : "Drop-off", value: value(destination) },
    { label: trip.service === "multi-day" ? "Start date" : "Date", value: value(trip.date) },
    ...(trip.service === "multi-day" ? [{ label: "Days", value: numberInRange(trip.days, 2, 30) ? trip.days : "To discuss" }] : []),
    {
      label: "Travellers",
      value: validTravellerInt
        ? isLargeGroup
          ? `${trip.travellers} (Custom quotation)`
          : trip.travellers
        : "To discuss",
    },
    { label: "Vehicle", value: trip.vehicle.name },
    ...(trip.service === "airport" ? [{ label: "Fare basis", value: "CMB to Central Colombo zone reference fare; other routes quoted separately" }] : []),
    {
      label: "Indicative price",
      value: isLargeGroup
        ? "On request (Custom quotation)"
        : estimate.amount !== null
        ? `${trip.service === "point-to-point" && !trip.distanceKm ? "From " : ""}${usd(estimate.amount)} per vehicle`
        : "On request",
    },
  ];
}

export function quoteMessage(trip: Trip) {
  return [
    "Hello GoChauffeur, I would like a confirmed quotation for my ride.",
    "",
    "*MY TRIP*",
    ...tripReview(trip).map(({ label, value }) => `${label}: ${value}`),
    "",
    "Please confirm availability and the confirmed quotation. Thank you!",
  ].join("\n");
}

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/[\s+()-]/g, "");
  if (!/^[1-9]\d{6,14}$/.test(digits)) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Confirmed public business contact; deployments do not receive .env.local.
export function businessWhatsappUrl(message: string, number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
  return whatsappUrl(number?.trim() || "94762196201", message);
}
