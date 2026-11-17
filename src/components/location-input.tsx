"use client";

import { useEffect, useId, useState } from "react";
import { airports, attractions, sriLankaPlaces, towns } from "@/lib/locations";

type Props = { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiple?: boolean; nearby?: string; airport?: boolean; id?: string; hideLabel?: boolean };

export function LocationInput({ label, value, onChange, placeholder, multiple = false, nearby = "", airport = false, id: suppliedId, hideLabel = false }: Props) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  useEffect(() => { if (open && active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, id]);
  // Semicolons separate stops so place names may contain commas.
  const parts = multiple ? value.split(";") : [value];
  const query = parts.at(-1)!.trim();
  const selected = multiple ? parts.slice(0, -1).map((part) => part.trim()).filter(Boolean) : [];
  const local = sriLankaPlaces.find(({ area }) => `${nearby} ${selected.join(" ")}`.toLowerCase().includes(area.toLowerCase()));
  const options = [...new Set(airport ? [...airports, ...towns] : [...(local?.places ?? []), ...towns, ...airports, ...attractions])]
    .filter((place) => place.toLowerCase().includes(query.toLowerCase()) && !selected.includes(place)).slice(0, 7);
  const custom = query && !options.some((place) => place.toLowerCase() === query.toLowerCase());
  const choices = [...options, ...(custom ? [query] : [])];
  function choose(place: string) {
    onChange(multiple ? [...selected, place, ""].join("; ") : place);
    setActive(-1); setOpen(false);
  }
  return <div className="field location-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(-1); } }}>
    {!hideLabel && <label htmlFor={id}>{label}</label>}
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`} aria-activedescendant={open && active >= 0 ? `${id}-option-${active}` : undefined} aria-describedby={`${id}-hint`} autoComplete="off" value={value} placeholder={placeholder}
      onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true); setActive(-1); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { if (open) event.stopPropagation(); setOpen(false); setActive(-1); }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((current) => Math.max(0, Math.min(choices.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)))); }
        if (event.key === "Enter" && open) { event.preventDefault(); if (active >= 0 && choices[active]) choose(choices[active]); else if (query) choose(query); }
      }} />
    <span className="location-hint" id={`${id}-hint`}>{multiple ? "Add stops one by one, or type your own." : "Choose a suggestion or enter any location."}</span>
    {open && <div className="location-menu" data-lenis-prevent><span className="location-menu-title">{query ? "Matching places" : local && !airport ? `Explore ${local.area}` : "Sri Lanka · suggested places"}</span>
      <div id={`${id}-options`} role="listbox" aria-label={`${label} suggestions`}>{choices.map((place, index) => <button type="button" role="option" tabIndex={-1} aria-selected={active === index} id={`${id}-option-${index}`} key={place} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)}>{index === options.length && custom ? `Use “${place}”` : place}<span>{index === options.length && custom ? "Custom location" : "Sri Lanka"}</span></button>)}</div>
    </div>}
  </div>;
}
