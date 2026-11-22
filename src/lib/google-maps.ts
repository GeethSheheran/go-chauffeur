// Server-only helper. Never import this module into client components.
export class MapsServiceError extends Error {
  constructor(public code: string, public upstreamStatus?: number) {
    super(code);
  }
}

export function reportMapsError(error: unknown) {
  // Log only our diagnostic code and HTTP status, never credentials or locations.
  const code = error instanceof MapsServiceError ? error.code
    : error instanceof Error && error.name === "TimeoutError" ? "MAPS_TIMEOUT"
    : "MAPS_REQUEST_FAILED";
  console.error("[Google Maps]", { code, upstreamStatus: error instanceof MapsServiceError ? error.upstreamStatus : undefined });
  return code;
}

export async function googleMaps(path: string, body?: unknown, fields?: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  if (!key) throw new MapsServiceError("MAPS_NOT_CONFIGURED");
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, ...(fields ? { "X-Goog-FieldMask": fields } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    const code = response.status === 403 ? "MAPS_ACCESS_DENIED"
      : response.status === 429 ? "MAPS_QUOTA_EXCEEDED"
      : response.status === 400 ? "MAPS_INVALID_REQUEST_OR_KEY"
      : "MAPS_UPSTREAM_ERROR";
    throw new MapsServiceError(code, response.status);
  }
  return response.json();
}

export function mapsResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function validPlaceId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{5,250}$/.test(value);
}
