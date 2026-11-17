"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { destinations } from "@/lib/content";
import { Brand } from "./brand";
import { Arrow, LineIcon, WhatsAppIcon } from "./icons";
import { VehicleSelect } from "./vehicle-select";
import { DatePicker } from "./date-picker";
import { ServiceSelect } from "./service-select";
import { LocationInput } from "./location-input";
import { services, vehicles, type Service } from "@/lib/prices";
import { numberInRange, whatsappUrl } from "@/lib/quote";
import { usePathname } from "next/navigation";
import { campaignReference, track } from "@/lib/analytics";

type Place = { name: string; image: string; category: string };
const TripContext = createContext<{ places: Place[]; toggle: (place: Place) => void; open: () => void }>({ places: [], toggle: () => {}, open: () => {} });

export function TripWalletProvider({ children }: { children: ReactNode }) {
  // Keep the shortlist across client-side navigation, without storing personal trip data on disk.
  const [places, setPlaces] = useState<Place[]>([]);
  const [date, setDate] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(false);
  const [service, setService] = useState<Service>("multi-day");
  const [pickup, setPickup] = useState("");
  const [days, setDays] = useState("");
  const [travellers, setTravellers] = useState("");
  const [vehicleId, setVehicleId] = useState("comfort");
  const validDays = !days || numberInRange(days, 2, 30);
  const validTravellers = !travellers || numberInRange(travellers, 1, 10);
  const validDetails = !includeDetails || ((service !== "multi-day" || validDays) && validTravellers);
  const [notice, setNotice] = useState("");
  const [reference, setReference] = useState("");
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  function toggle(place: Place) {
    const exists = places.some((p) => p.name === place.name);
    setPlaces((previous) => exists ? previous.filter((p) => p.name !== place.name) : [...previous, place]);
    setNotice(`${place.name} ${exists ? "removed from" : "added to"} your trip.`);
  }
  const message = ["Hello GoChauffeur, I’d like help planning my Sri Lanka trip.", "", "*MY PLACES TO VISIT*", ...places.map((place, index) => `${index + 1}. ${place.name}`), "", ...(includeDetails ? ["*TRIP DETAILS*", `Service: ${services.find((s) => s.id === service)!.label}`, `Pickup: ${pickup.trim() || "To discuss"}`, `Start date: ${date || "To discuss"}`, ...(service === "multi-day" ? [`Days: ${days || "To discuss"}`] : []), `Travellers: ${travellers || "To discuss"}`, `Vehicle: ${vehicles.find((v) => v.id === vehicleId)!.name}`, ""] : []), "Please help plan my route and share a written quote. Thank you!", "", reference].join("\n");
  const url = whatsappUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "", message);
  return <TripContext.Provider value={{ places, toggle, open: () => { setReference(`Ref: web-${pathname === "/" ? "home" : pathname.slice(1)}-trip_wallet / ${campaignReference()}`); dialog.current?.showModal(); } }}>
    {children}
    <span className="sr-only" role="status">{notice}</span>
    <dialog ref={dialog} className="enquiry-dialog ride-review-dialog trip-wallet-dialog" aria-labelledby="trip-wallet-title" data-lenis-prevent onClick={(e) => { if (e.target === dialog.current) dialog.current.close(); }}>
      <div className="trip-dialog-toolbar"><button type="button" className="dialog-close" aria-label="Close my trip" onClick={() => dialog.current?.close()}>×</button></div>
      <div className="review-layout"><aside className="review-story"><Brand /><h2 id="trip-wallet-title">Your wish list.<br />Our local know-how.</h2><Image className="trip-wallet-art" src="/images/illustrations/trip-map-postcards.png" width={768} height={768} alt="" /></aside>
      <div className="review-content"><div className="review-content-heading" hidden={!places.length}><span className="review-eyebrow">WANT TO VISIT · {places.length} {places.length === 1 ? "PLACE" : "PLACES"}</span><p>Choose the places you love. We’ll help plan the journey.</p></div>
        {places.length ? <><ul className="trip-place-list">{places.map((place) => <li key={place.name}><Image src={place.image} width={64} height={64} alt="" /><div><span className="review-eyebrow">WOULD LOVE TO VISIT</span><strong>{place.name}</strong></div><button type="button" aria-label={`Remove ${place.name}`} onClick={() => toggle(place)}>×</button></li>)}</ul>
        <div className="trip-extra-details"><button type="button" className="outline-action trip-details-toggle" aria-expanded={showDetails} aria-controls="trip-extra-fields" onClick={() => { setShowDetails(!showDetails); setIncludeDetails(true); }}>{showDetails ? "Hide details" : "Add more details (optional)"}</button>
        <div id="trip-extra-fields" className="trip-extra-fields" hidden={!showDetails}>
          <p>A few details help us plan your ride. Leave anything undecided blank.</p>
          <ServiceSelect value={service} onChange={setService} />
          <LocationInput label={service === "airport" ? "Pickup airport" : "Pickup"} value={pickup} onChange={setPickup} placeholder="Hotel, city or airport" airport={service === "airport"} />
          <DatePicker value={date} onChange={setDate} />
          {service === "multi-day" && <label className="field">Days<input type="number" min="2" max="30" value={days} placeholder="To discuss" aria-invalid={!validDays} onChange={(e) => setDays(e.target.value)} />{!validDays && <span className="field-error">Enter 2–30 whole days.</span>}</label>}
          <div className="trip-passenger-row"><label className="field">Travellers<input type="number" min="1" max="10" value={travellers} placeholder="To discuss" aria-invalid={!validTravellers} onChange={(e) => setTravellers(e.target.value)} />{!validTravellers && <span className="field-error">Enter 1–10 travellers.</span>}</label>
          <div className="field trip-extra-vehicle"><label htmlFor="trip-extra-vehicle">Vehicle</label><VehicleSelect id="trip-extra-vehicle" value={vehicleId} onChange={setVehicleId} /></div></div>
        </div></div>
        {url && validDetails ? <div className="enquiry-actions review-actions"><a className="action action-dark" href={url} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { location: "trip_wallet", stops: places.length })}><WhatsAppIcon /><span>Send to WhatsApp</span><Arrow diagonal /></a></div> : url ? <p role="alert">Check the days and travellers before sending your enquiry.</p> : <p>WhatsApp enquiries are not connected yet.</p>}<p className="small-note enquiry-footnote">We’ll confirm your route and quote together. Sending an enquiry doesn’t book your trip.</p></> : <div className="trip-empty"><h3>Where would you love to go?</h3><p>Add destinations and experiences to start your shortlist.</p><Link className="action" href="/destinations" onClick={() => dialog.current?.close()}>Explore destinations <Arrow diagonal /></Link><ul className="trip-suggestions" aria-label="Destinations to add">{destinations.map((destination) => <li key={destination.name}><Image src={destination.photo.src} width={64} height={64} alt="" /><div><span className="review-eyebrow">{destination.region}</span><strong>{destination.name}</strong></div><button type="button" className="outline-action" aria-label={`Add ${destination.name} to my trip`} onClick={() => { toggle({ name: destination.name, image: destination.photo.src, category: destination.region }); requestAnimationFrame(() => dialog.current?.querySelector<HTMLButtonElement>(".trip-place-list button")?.focus()); }}><LineIcon name="plus" /></button></li>)}</ul></div>}
      </div></div>
    </dialog>
  </TripContext.Provider>;
}

export function TripButton({ mobile = false, beforeOpen }: { mobile?: boolean; beforeOpen?: () => void }) {
  const { places, open } = useContext(TripContext);
  return <button type="button" className={mobile ? "trip-menu-button" : "trip-nav-button"} aria-label={`My trip, ${places.length} saved places`} aria-haspopup="dialog" onClick={() => { beforeOpen?.(); open(); }}><svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5ZM9 3v16M15 5v16" /></svg>{mobile && <span className="trip-menu-label"><strong>Places I’d love to visit</strong><small>{places.length ? `${places.length} saved · View my trip` : "Your Sri Lanka wish list"}</small></span>}{places.length > 0 && <span className="trip-count" aria-hidden="true">{places.length}</span>}</button>;
}

export function AddToTripButton({ name, image, category }: Place) {
  const { places, toggle } = useContext(TripContext);
  const added = places.some((place) => place.name === name);
  return <button type="button" className="outline-action trip-toggle" aria-pressed={added} onClick={() => toggle({ name, image, category })}><span>{added ? "Added to my trip" : "Add to my trip"}</span><LineIcon name={added ? "check" : "plus"} /></button>;
}
