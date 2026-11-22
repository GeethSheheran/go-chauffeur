"use client";
import { useEffect, useState } from "react";

type Result = { key: string; distanceKm?: number; durationMinutes?: number; error?: string };
export function useRouteDistance(enabled: boolean, origin?: string, destination?: string) {
  const key = enabled && origin && destination ? `${origin}:${destination}` : "";
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/maps/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ origin, destination }), signal: controller.signal });
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ key, ...(response.ok ? data : { error: data.error }) });
      } catch {
        if (!controller.signal.aborted) setResult({ key, error: "Driving distance is unavailable. Our team can quote this route." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key, origin, destination]);
  const current = result?.key === key ? result : null;
  return { distanceKm: current?.distanceKm ?? null, durationMinutes: current?.durationMinutes,
    loading: !!key && !current,
    status: !key ? "Select Google Maps suggestions for both locations to calculate driving distance." : !current ? "Calculating driving distance…" : current.error ?? `${current.distanceKm?.toFixed(1)} km by road · About ${current.durationMinutes} min · Google Maps` };
}
