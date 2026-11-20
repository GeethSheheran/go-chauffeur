"use client";

import { useEffect, useId, useRef, useState } from "react";
import { vehicles, isVehicleSuitable } from "@/lib/prices";
import { LineIcon } from "./icons";

export function VehicleSelect({
  id,
  value,
  onChange,
  travellers,
}: {
  id?: string;
  value: string;
  onChange: (id: string) => void;
  travellers?: string;
}) {
  const generatedId = useId();
  const listId = `${generatedId}-vehicles`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const vehicle = vehicles.find((v) => v.id === value) || vehicles[0];

  const t = Number(travellers);
  const hasTravellerCount = travellers !== undefined && travellers.trim() !== "" && Number.isInteger(t) && t > 0;

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  function show() {
    const rect = button.current?.getBoundingClientRect();
    setAbove(!!rect && window.innerHeight - rect.bottom < 280 && rect.top > 280);
    const currentIndex = vehicles.findIndex((v) => v.id === value);
    setActive(currentIndex >= 0 ? currentIndex : 0);
    setOpen(true);
  }

  function choose(index: number) {
    const v = vehicles[index];
    if (hasTravellerCount) {
      const check = isVehicleSuitable(v, t);
      if (!check.suitable) return;
    }
    onChange(v.id);
    setOpen(false);
    button.current?.focus();
  }

  function nextSuitableIndex(current: number, direction: 1 | -1) {
    let idx = current;
    for (let step = 0; step < vehicles.length; step++) {
      idx = (idx + direction + vehicles.length) % vehicles.length;
      if (!hasTravellerCount || isVehicleSuitable(vehicles[idx], t).suitable) {
        return idx;
      }
    }
    return current;
  }

  return (
    <div
      className="vehicle-picker"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        id={id}
        type="button"
        className="vehicle-picker-trigger"
        role="combobox"
        aria-label="Vehicle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (open) e.stopPropagation();
            setOpen(false);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!open) show();
            else setActive(nextSuitableIndex(active, 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) show();
            else setActive(nextSuitableIndex(active, -1));
          } else if (e.key === "Home") {
            e.preventDefault();
            if (!open) show();
            else setActive(nextSuitableIndex(vehicles.length - 1, 1));
          } else if (e.key === "End") {
            e.preventDefault();
            if (!open) show();
            else setActive(nextSuitableIndex(0, -1));
          } else if (open && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            choose(active);
          }
        }}
      >
        <LineIcon name="car" />
        <span>
          <strong>{vehicle.name}</strong>
          <small>{vehicle.seats}{vehicle.id === "luxury" ? "" : " passengers"}</small>
        </span>
        <span className="vehicle-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && (
        <div id={listId} role="listbox" aria-label="Vehicle types" className="vehicle-options" data-lenis-prevent data-above={above}>
          {vehicles.map((v, index) => {
            const check = hasTravellerCount ? isVehicleSuitable(v, t) : { suitable: true };
            const disabled = !check.suitable;
            return (
              <button
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={v.id === value}
                aria-disabled={disabled}
                disabled={disabled}
                data-active={active === index}
                id={`${listId}-${index}`}
                key={v.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(index)}
                className={disabled ? "vehicle-option-disabled" : ""}
              >
                <LineIcon name="car" />
                <span>
                  <strong>{v.name}</strong>
                  <small>
                    {v.seats}{v.id === "luxury" ? "" : " passengers"}
                    {disabled && check.reason ? <span className="vehicle-unsuitable-note"> · {check.reason}</span> : null}
                  </small>
                </span>
                {v.id === value && <LineIcon name="check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
