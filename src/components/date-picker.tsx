"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DatePicker({ value, onChange, label = "Start date", id: suppliedId, hideLabel = false, className = "" }: { value: string; onChange: (value: string) => void; label?: string; id?: string; hideLabel?: boolean; className?: string }) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  function moveMonth(delta: number) { const date = new Date(year, month + delta, 1); setMonth(date.getMonth()); setYear(date.getFullYear()); }
  const position = useCallback(() => {
    const panel = dialog.current;
    const anchor = trigger.current?.parentElement;
    if (!panel || !anchor || !panel.matches(":popover-open")) return;
    const rect = anchor.getBoundingClientRect();
    const gap = 6;
    const edge = 12;
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const below = window.innerHeight - rect.bottom - edge;
    const above = rect.top - edge;
    const top = below >= height || below >= above ? rect.bottom + gap : rect.top - height - gap;
    panel.style.left = `${Math.max(edge, Math.min(rect.right - width, window.innerWidth - width - edge))}px`;
    panel.style.top = `${Math.max(edge, Math.min(top, window.innerHeight - height - edge))}px`;
  }, []);
  useLayoutEffect(() => { if (open) position(); }, [open, month, year, position]);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => { window.removeEventListener("resize", position); window.removeEventListener("scroll", position, true); };
  }, [open, position]);
  function close() { dialog.current?.hidePopover(); setOpen(false); trigger.current?.focus(); }
  function show() {
    const date = value ? new Date(`${value}T12:00:00`) : new Date();
    setMonth(date.getMonth()); setYear(date.getFullYear()); setOpen(true);
    dialog.current?.showPopover();
    position();
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"], [data-today="true"]')?.focus({ preventScroll: true }));
  }
  return <div className={`field date-picker ${className}`}>
    {!hideLabel && <label htmlFor={id}>{label}</label>}
    <div className="date-picker-input"><input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} onClick={(e) => { e.preventDefault(); show(); }} onKeyDown={(e) => { if (e.key === " " || (e.altKey && e.key === "ArrowDown")) { e.preventDefault(); show(); } }} /><button ref={trigger} type="button" aria-label={`Choose ${label.toLowerCase()}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-calendar`} onClick={() => open ? close() : show()}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 2v6M17 2v6M3 10h18M7 14h3M14 14h3M7 18h3" /></svg></button></div>
    <div ref={dialog} popover="auto" role="dialog" aria-modal="false" id={`${id}-calendar`} className="calendar-dialog" data-lenis-prevent aria-labelledby={`${id}-title`} onToggle={(e) => setOpen(e.newState === "open")} onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } }}>
      <span id={`${id}-title`} className="sr-only">Choose your {label.toLowerCase()}.</span>
      <div className="trip-calendar" role="group" aria-label="Choose a date">
      <div className="calendar-heading"><button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button><span aria-live="polite">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span><button type="button" aria-label="Next month" onClick={() => moveMonth(1)}>›</button></div>
      <div className="calendar-days">{["M", "T", "W", "T", "F", "S", "S"].map((d, index) => <span key={index} className="calendar-weekday" aria-hidden="true">{d}</span>)}{Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}{Array.from({ length: count }, (_, index) => {
        const date = new Date(year, month, index + 1); const iso = isoDate(date);
        return <button type="button" key={iso} aria-label={date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} data-today={iso === isoDate(new Date())} aria-current={iso === isoDate(new Date()) ? "date" : undefined} aria-pressed={iso === value} onClick={() => { onChange(iso); close(); }} onKeyDown={(e) => { const delta = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 } as Record<string, number>)[e.key]; if (delta) { e.preventDefault(); const next = new Date(year, month, index + 1 + delta); setMonth(next.getMonth()); setYear(next.getFullYear()); requestAnimationFrame(() => document.getElementById(`${id}-${isoDate(next)}`)?.focus({ preventScroll: true })); } }} id={`${id}-${iso}`}>{index + 1}</button>;
      })}</div><div className="calendar-footer"><button type="button" onClick={() => { onChange(""); close(); }}>Clear date</button><button type="button" onClick={close}>Done</button></div>
    </div></div>
  </div>;
}
