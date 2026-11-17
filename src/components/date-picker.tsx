"use client";

import { useId, useRef, useState } from "react";

const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [above, setAbove] = useState(false);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  function moveMonth(delta: number) { const date = new Date(year, month + delta, 1); setMonth(date.getMonth()); setYear(date.getFullYear()); }
  function close() { setOpen(false); trigger.current?.focus(); }
  return <div className="field date-picker" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={(e) => { if (open && e.key === "Escape") { e.stopPropagation(); close(); } }}>
    <label htmlFor={id}>Start date</label>
    <div className="date-picker-input"><input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} /><button ref={trigger} type="button" aria-label="Choose start date" aria-expanded={open} aria-controls={`${id}-calendar`} onClick={() => { if (!open) {
      const rect = trigger.current?.getBoundingClientRect();
      const container = trigger.current?.closest(".review-content")?.getBoundingClientRect();
      const bottom = Math.min(window.innerHeight, container?.bottom ?? window.innerHeight);
      setAbove(!!rect && bottom - rect.bottom < 320 && rect.top > 320);
      const date = value ? new Date(`${value}T12:00:00`) : new Date(); setMonth(date.getMonth()); setYear(date.getFullYear()); } setOpen(!open); }}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3M7 18h3" /></svg></button></div>
    {open && <div id={`${id}-calendar`} className="trip-calendar" data-above={above} role="group" aria-label="Choose a date">
      <div className="calendar-heading"><button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button><span aria-live="polite">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span><button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>›</button></div>
      <div className="calendar-days">{["M", "T", "W", "T", "F", "S", "S"].map((d, index) => <span key={index} className="calendar-weekday" aria-hidden="true">{d}</span>)}{Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: count }, (_, index) => {
        const date = new Date(year, month, index + 1); const iso = isoDate(date);
        return <button type="button" key={iso} aria-label={date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} aria-pressed={iso === value} onClick={() => { onChange(iso); close(); }} onKeyDown={(e) => { const delta = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 } as Record<string, number>)[e.key]; if (delta) { e.preventDefault(); const next = new Date(year, month, index + 1 + delta); if (next.getMonth() === month) document.getElementById(`${id}-${isoDate(next)}`)?.focus(); } }} id={`${id}-${iso}`}>{index + 1}</button>;
      })}</div><div className="calendar-footer"><button type="button" onClick={() => { onChange(""); close(); }}>Clear date</button><button type="button" onClick={close}>Done</button></div>
    </div>}
  </div>;
}
