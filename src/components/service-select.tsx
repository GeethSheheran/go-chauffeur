"use client";

import { useId, useState } from "react";
import { services, type Service } from "@/lib/prices";

export function ServiceSelect({ value, onChange }: { value: Service; onChange: (value: Service) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  function choose(index: number) { onChange(services[index].id); setOpen(false); }
  return <div className="field service-picker" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <label id={`${id}-label`} htmlFor={id}>Service</label>
    <button id={id} className="service-picker-trigger" type="button" role="combobox" aria-labelledby={`${id}-label`} aria-expanded={open} aria-controls={`${id}-options`} aria-haspopup="listbox" aria-activedescendant={open ? `${id}-${active}` : undefined} onClick={() => { setOpen(!open); setActive(services.findIndex((s) => s.id === value)); }} onKeyDown={(e) => {
      if (e.key === "Escape" && open) { e.stopPropagation(); setOpen(false); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + services.length) % services.length); }
      else if (open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choose(active); }
      else if (open && (e.key === "Home" || e.key === "End")) { e.preventDefault(); setActive(e.key === "Home" ? 0 : services.length - 1); }
    }}><span>{services.find((s) => s.id === value)!.label}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>
    {open && <div className="service-options" role="listbox" aria-label="Services" id={`${id}-options`}>{services.map((s, index) => <button type="button" role="option" tabIndex={-1} id={`${id}-${index}`} aria-selected={s.id === value} data-active={index === active} key={s.id} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(index)}>{s.label}<span aria-hidden="true">{s.id === value ? "✓" : ""}</span></button>)}</div>}
  </div>;
}
