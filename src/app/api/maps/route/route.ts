import { googleMaps, mapsResponse, validPlaceId, reportMapsError } from "@/lib/google-maps";

export async function POST(request: Request) {
  try {
    const { origin, destination } = await request.json();
    if (!validPlaceId(origin) || !validPlaceId(destination) || origin === destination) return mapsResponse({ error: "Choose two different Sri Lankan locations." }, 400);
    // Validate country server-side, including calls made outside our autocomplete UI.
    const places = await Promise.all([origin, destination].map(id => googleMaps(`https://places.googleapis.com/v1/places/${id}`, undefined, "addressComponents")));
    if (places.some(place => !place.addressComponents?.some((c: { types: string[]; shortText: string }) => c.types.includes("country") && c.shortText === "LK"))) return mapsResponse({ error: "Choose locations within Sri Lanka." }, 400);
    const data = await googleMaps("https://routes.googleapis.com/directions/v2:computeRoutes", {
      origin: { placeId: origin }, destination: { placeId: destination }, travelMode: "DRIVE", routingPreference: "TRAFFIC_UNAWARE", units: "METRIC",
    }, "routes.distanceMeters,routes.duration");
    const route = data.routes?.[0];
    if (!route || !Number.isFinite(route.distanceMeters) || route.distanceMeters <= 0) return mapsResponse({ error: "No driving route found. Request a quotation from our team." }, 404);
    return mapsResponse({ distanceKm: route.distanceMeters / 1000, durationMinutes: Math.ceil(parseFloat(route.duration) / 60) });
  } catch (error) {
    reportMapsError(error);
    return mapsResponse({ error: "Driving distance is unavailable. Our team can quote this route." }, 503);
  }
}
