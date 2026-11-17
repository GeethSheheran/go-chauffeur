"use client";

import { vehicles } from "@/lib/prices";
import { quoteMessage, tripReview, type Trip } from "@/lib/quote";
import { EnquiryButton } from "./enquiry";

export function ItineraryEnquiry({ name, route, days, kind }: { name: string; route: string; days: number; kind: string }) {
  const tour = kind === "tour";
  const trip: Trip = {
    service: tour ? "multi-day" : kind === "day" ? "day" : "airport",
    pickup: kind === "airport" ? "Colombo airport (CMB)" : tour && route.startsWith("Kandy") ? "Kandy" : "Colombo",
    destination: tour ? route.split("→").slice(1).map((place) => place.trim()).join("; ") : kind === "day" ? "City sights; Markets; Galle Face" : "Your hotel in Negombo or Colombo",
    date: "", days: tour ? String(days) : "", travellers: "", vehicle: vehicles.find((v) => v.id === "comfort")!,
  };
  return <EnquiryButton className="outline-action" location="itinerary" item={name} icon={false} trip={trip} review={tripReview(trip)} message={`${quoteMessage(trip)}\nItinerary: ${name}`}>Customise</EnquiryButton>;
}
