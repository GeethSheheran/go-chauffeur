"use client";

import { useEffect, useId, useRef, useState } from "react";
import { vehicles } from "@/lib/prices";
import { LineIcon } from "./icons";

export function VehicleSelect({ id, value, onChange }: { id?: string; value: string; onChange: (id: string) => void }) {
  const generatedId = useId();
  const listId = `${generatedId}-vehicles`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const vehicle = vehicles.find((v) => v.id === value)!;
  useEffect(() => { if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" }); }, [active, open, listId]);
  function show() { const rect = button.current?.getBoundingClientRect(); setAbove(!!rect && window.innerHeight - rect.bottom < 280 && rect.top > 280); setActive(vehicles.findIndex((v) => v.id === value)); setOpen(true); }
  function choose(index: number) { onChange(vehicles[index].id); setOpen(false); button.current?.focus(); }
  return <div className="vehicle-picker" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <button ref={button} id={id} type="button" className="vehicle-picker-trigger" role="combobox" aria-label="Vehicle" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open ? `${listId}-${active}` : undefined}
      onClick={() => open ? setOpen(false) : show()} onKeyDown={(e) => {
        if (e.key === "Escape") { if (open) e.stopPropagation(); setOpen(false); }
        else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) { e.preventDefault(); if (!open) show(); else setActive(e.key === "Home" ? 0 : e.key === "End" ? vehicles.length - 1 : (active + (e.key === "ArrowDown" ? 1 : -1) + vehicles.length) % vehicles.length); }
        else if (open && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); choose(active); }
      }}><LineIcon name="car" /><span><strong>{vehicle.name}</strong><small>{vehicle.seats}{vehicle.id === "luxury" ? "" : " passengers"}</small></span><span className="vehicle-chevron" aria-hidden="true">⌄</span></button>
    {open && <div id={listId} role="listbox" aria-label="Vehicle types" className="vehicle-options" data-lenis-prevent data-above={above}>{vehicles.map((v, index) => <button type="button" role="option" tabIndex={-1} aria-selected={v.id === value} data-active={active === index} id={`${listId}-${index}`} key={v.id} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(index)}><LineIcon name="car" /><span><strong>{v.name}</strong><small>{v.seats}{v.id === "luxury" ? "" : " passengers"}</small></span>{v.id === value && <LineIcon name="check" />}</button>)}</div>}
  </div>;
}
