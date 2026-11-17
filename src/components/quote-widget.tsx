"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { allowances, services, usd, vehicles, type Service } from "@/lib/prices";
import { estimateTrip, numberInRange, quoteMessage, tripReview, type Trip } from "@/lib/quote";
import { track } from "@/lib/analytics";
import { DatePicker } from "./date-picker";
import { VehicleSelect } from "./vehicle-select";
import { LocationInput } from "./location-input";
import { EnquiryButton } from "./enquiry";

export function QuoteWidget() {
  const search = useSearchParams();
  const initial = search.get("service");
  return <Planner key={initial} initial={services.some((s) => s.id === initial) ? initial as Service : "multi-day"} />;
}

function Planner({ initial }: { initial: Service }) {
  const id = useId();
  const [service, setService] = useState<Service>(initial);
  const [vehicleId, setVehicleId] = useState("comfort");
  const [days, setDays] = useState("5");
  const [travellers, setTravellers] = useState("2");
  const [pickup, setPickup] = useState("");
  const [airport, setAirport] = useState("Colombo airport (CMB)");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const vehicle = vehicles.find((v) => v.id === vehicleId)!;
  const estimate = estimateTrip(service, vehicle, days);
  const validDays = numberInRange(days, 2, 30);
  const validTravellers = numberInRange(travellers, 1, 10);
  function select(next: Service) { setService(next); track("widget_service_select", { service: next }); }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % services.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + services.length - 1) % services.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = services.length - 1;
    else return;
    event.preventDefault(); select(services[next].id);
    document.getElementById(`${id}-${services[next].id}`)?.focus();
  }
  const trip = { service, vehicle, pickup: service === "airport" ? airport : pickup, destination, date, days, travellers };
  const message = quoteMessage(trip);
  function saveTrip(next: Trip) {
    setService(next.service); setVehicleId(next.vehicle.id); setDays(next.days);
    setTravellers(next.travellers); setDestination(next.destination); setDate(next.date);
    if (next.service === "airport") setAirport(next.pickup); else setPickup(next.pickup);
  }
  return <div className="quote-widget" id="services" aria-labelledby={`${id}-title`} data-lenis-prevent>
    <div className="widget-lead">
    <h2 id={`${id}-title`}>Plan your ride.</h2>
    <p className="widget-intro">Tell us the basics. We reply on WhatsApp with a fixed written quote.</p>
    <div className="service-tabs" role="tablist" aria-label="Choose your service">{services.map((s, index) => <button key={s.id} id={`${id}-${s.id}`} role="tab" aria-selected={service === s.id} aria-controls={`${id}-panel`} tabIndex={service === s.id ? 0 : -1} onKeyDown={(e) => keyboard(e, index)} onClick={() => select(s.id)}>{s.label}</button>)}</div>
    </div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${service}`}>
      <div className="widget-fields">
        <LocationInput label={service === "airport" ? "Pickup airport" : "Pickup"} value={service === "airport" ? airport : pickup} onChange={service === "airport" ? setAirport : setPickup} placeholder="Hotel, city or airport" airport={service === "airport"} />
        <LocationInput key={service} label={service === "multi-day" ? "Places you want to see" : service === "airport" ? "Drop-off hotel or area" : "Destination"} value={destination} onChange={setDestination} placeholder={service === "multi-day" ? "e.g. Sigiriya, Kandy, Ella" : "Hotel, city or area"} multiple={service === "multi-day"} nearby={service === "airport" ? airport : pickup} />
        <DatePicker className={service !== "multi-day" ? "field-date" : ""} label={service === "multi-day" ? "Start date" : "Date"} value={date} onChange={setDate} />
        {service === "multi-day" ? <label className="field field-small">Days<input type="number" min="2" max="30" inputMode="numeric" value={days} aria-invalid={!validDays} aria-describedby={!validDays ? `${id}-days-error` : undefined} onChange={(e) => setDays(e.target.value)} /></label> : null}
        <label className="field field-small">Travellers<input type="number" min="1" max="10" inputMode="numeric" value={travellers} aria-invalid={!validTravellers} aria-describedby={!validTravellers ? `${id}-travellers-error` : undefined} onChange={(e) => setTravellers(e.target.value)} /></label>
        <div className="field field-full"><label htmlFor={`${id}-vehicle`}>Vehicle</label><VehicleSelect id={`${id}-vehicle`} value={vehicleId} onChange={setVehicleId} /></div>
      </div>
      {service === "multi-day" && !validDays ? <p id={`${id}-days-error`} className="field-error">Choose 2–30 whole days for an estimate. You can still enquire.</p> : null}
      {!validTravellers ? <p id={`${id}-travellers-error`} className="field-error">Enter 1–10 travellers, or discuss your group with us.</p> : null}
      <div className="quote-estimate" aria-live="polite" aria-atomic="true">
        <div><span className="estimate-detail">{service === "multi-day" ? `${validDays ? days : "Your"} days · ${estimate.km ?? "—"} km included` : service === "day" ? `${allowances.dayKm} km · ${allowances.dayHours} hours` : service === "airport" ? "CMB → Central Colombo reference fare" : "Minimum fare · Route quoted by our team"}</span><strong>{service === "point-to-point" && estimate.amount !== null ? "From " : ""}{usd(estimate.amount)}</strong></div>
        <span className="estimate-payment">Small advance to book.<br />Rest at pickup.</span>
      </div>
      <EnquiryButton className="action widget-submit" location="widget" message={message} review={tripReview(trip)} trip={trip} onSaveTrip={saveTrip} lead={{ service, vehicle: vehicle.name, days: service === "multi-day" && validDays ? Number(days) : null, estimate_usd: estimate.amount }}>Review my ride</EnquiryButton>
      <p className="widget-disclaimer">Indicative price per vehicle, not per person. Your written quote is final. Opening WhatsApp doesn’t book anything.</p>
    </div>
  </div>;
}
