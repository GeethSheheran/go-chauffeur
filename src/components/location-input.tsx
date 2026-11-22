"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = { label: string; value: string; onChange: (value: string, placeId?: string) => void; placeholder: string; multiple?: boolean; autoSelectAirport?: boolean; id?: string; hideLabel?: boolean };

export function LocationInput({ label, value, onChange, placeholder, multiple = false, autoSelectAirport = false, id: suppliedId, hideLabel = false }: Props) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latest = useRef({ value, onChange });
  useEffect(() => { latest.current = { value, onChange }; }, [value, onChange]);
  useEffect(() => {
    if (!autoSelectAirport) return;
    latest.current.onChange("Bandaranaike International Airport (CMB), Airport and Aviation Services (Sri Lanka) (Private) Limited, Canada Friendship Rd, Katunayake");
    const controller = new AbortController();
    async function selectAirport() {
      try {
        const response = await fetch("/api/maps/places", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: "Bandaranaike International Airport (CMB), Katunayake" }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json();
        const airport = data.suggestions?.find((place: { id: string; label: string }) =>
          /^Bandaranaike International Airport\b/i.test(place.label));
        if (airport && !controller.signal.aborted) {
          latest.current.onChange(airport.label, airport.id);
        }
      } catch {
        // Keep the fixed airport label if Google cannot resolve its place ID.
      }
    }
    void selectAirport();
    return () => controller.abort();
  }, [autoSelectAirport]);
  useEffect(() => { if (open && active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, id]);
  // Semicolons separate stops so place names may contain commas.
  const parts = multiple ? value.split(";") : [value];
  const query = parts.at(-1)!.trim();
  const selected = multiple ? parts.slice(0, -1).map((part) => part.trim()).filter(Boolean) : [];
  const [remote, setRemote] = useState<{ query: string; options: { id: string; label: string }[]; error?: string } | null>(null);
  useEffect(() => {
    if (autoSelectAirport || !open || query.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/maps/places", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: query }), signal: controller.signal });
        const data = await response.json();
        if (!controller.signal.aborted) setRemote({ query, options: data.suggestions ?? [], error: response.ok ? undefined : data.error });
      } catch {
        if (!controller.signal.aborted) setRemote({ query, options: [], error: "Google Maps search is unavailable. Please try again or request a quotation." });
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, open, autoSelectAirport]);
  const googleOptions = remote?.query === query ? remote.options : [];
  const choices = googleOptions.filter(place => !selected.includes(place.label));
  function choose(place: { id: string; label: string }) {
    onChange(multiple ? [...selected, place.label, ""].join("; ") : place.label, multiple ? undefined : place.id);
    setActive(-1); setOpen(false);
  }
  return <div className="field location-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); } }}>
    {!hideLabel && <label htmlFor={id}>{label}</label>}
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={!autoSelectAirport && open} aria-controls={`${id}-options`} aria-activedescendant={open && active >= 0 && choices[active] ? `${id}-option-${active}` : undefined} aria-describedby={multiple ? `${id}-hint` : undefined} autoComplete="off" readOnly={autoSelectAirport} value={value} placeholder={placeholder}
      onFocus={() => { if (!autoSelectAirport) setOpen(true); }} onChange={(event) => { if (autoSelectAirport) return; onChange(event.target.value); setOpen(true); setActive(-1); }}
      onKeyDown={(event) => {
        if (autoSelectAirport) return;
        if (event.key === "Escape") { if (open) event.stopPropagation(); setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((current) => choices.length ? Math.max(0, Math.min(choices.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))) : -1); }
        if (event.key === "Enter" && open) { event.preventDefault(); if (active >= 0 && choices[active]) choose(choices[active]);  }
      }} />
    {multiple && <span className="location-hint" id={`${id}-hint`}>Search Google Maps and select stops one by one.</span>}
    {!autoSelectAirport && open && <div className="location-menu" data-lenis-prevent><span className="location-menu-title">Sri Lanka · Google Maps</span>
      <span role="status" className="location-hint">{query.length < 2 ? "Type at least 2 characters to search." : remote?.query !== query ? "Searching Sri Lanka…" : remote.error ?? (choices.length ? "" : "No Google Maps locations found. Try a more specific search.")}</span><div id={`${id}-options`} role="listbox" aria-label={`${label} suggestions`}>{choices.map((place, index) => <button type="button" role="option" tabIndex={-1} aria-selected={active === index} id={`${id}-option-${index}`} key={place.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)}>{place.label}<span>Sri Lanka</span></button>)}</div>
      {googleOptions.length > 0 && <span className="location-menu-title">Google Maps</span>}
    </div>}
  </div>;
}
