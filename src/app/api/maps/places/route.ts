import { googleMaps, mapsResponse } from "@/lib/google-maps";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();
    if (typeof input !== "string" || input.trim().length < 2 || input.length > 200) return mapsResponse({ error: "Enter 2–200 characters." }, 400);
    const data = await googleMaps("https://places.googleapis.com/v1/places:autocomplete", {
      input: input.trim(), includedRegionCodes: ["lk"], languageCode: "en", regionCode: "lk",
    }, "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text");
    const suggestions = (data.suggestions ?? []).flatMap((s: { placePrediction?: { placeId: string; text: { text: string } } }) =>
      s.placePrediction ? [{ id: s.placePrediction.placeId, label: s.placePrediction.text.text }] : []);
    return mapsResponse({ suggestions });
  } catch {
    return mapsResponse({ error: "Google Maps search is unavailable. Please try again or request a quotation." }, 503);
  }
}
