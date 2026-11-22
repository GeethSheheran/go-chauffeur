// Server-only helper. Never import this module into client components.
export async function googleMaps(path: string, body?: unknown, fields?: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Maps is not configured");
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, ...(fields ? { "X-Goog-FieldMask": fields } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Maps service returned ${response.status}`);
  return response.json();
}

export function mapsResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function validPlaceId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{5,250}$/.test(value);
}
