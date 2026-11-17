"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { campaignReference, track } from "@/lib/analytics";
import { businessWhatsappUrl, quoteMessage, tripReview, estimateTrip, numberInRange, type Trip } from "@/lib/quote";
import { Arrow, WhatsAppIcon } from "./icons";
import { vehicles } from "@/lib/prices";
import { DatePicker } from "./date-picker";
import { ServiceSelect } from "./service-select";
import { LocationInput } from "./location-input";
import { Brand } from "./brand";
import { VehicleSelect } from "./vehicle-select";
import { Artwork } from "./artwork";

type Enquiry = { trip?: Trip; onSaveTrip?: (trip: Trip) => void; message: string; location: string; item?: string; lead?: Record<string, string | number | null>; review?: { label: string; value: string }[] };
const Context = createContext<(enquiry: Enquiry) => void>(() => {});

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [reference, setReference] = useState("");
  const [draft, setDraft] = useState<Trip | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const editor = useRef<HTMLFormElement>(null);
  const message = enquiry ? `${enquiry.message}\n\n${reference}` : "";
  const handoffUrl = businessWhatsappUrl(message);
  const editing = draft !== null;
  useEffect(() => {
    if (editing) editor.current?.querySelector<HTMLElement>("[role=combobox], input")?.focus();
    else if (dialog.current?.open) editButton.current?.focus();
  }, [editing]);
  useEffect(() => { campaignReference(); }, []);
  function enquire(next: Enquiry) {
    setReference(`Ref: web-${pathname === "/" ? "home" : pathname.slice(1)}-${next.location} / ${campaignReference()}`);
    setDraft(null);
    setEnquiry(next);

    dialog.current?.showModal();
  }
  function send() {
    if (!enquiry) return;
    track("whatsapp_click", { location: enquiry.location, page: pathname, ...(enquiry.item ? { item: enquiry.item } : {}) });
    if (enquiry.lead) track("generate_lead", enquiry.lead);
  }
  return <Context.Provider value={enquire}>
    {children}
    <dialog ref={dialog} className="enquiry-dialog ride-review-dialog" data-lenis-prevent aria-labelledby="enquiry-title" aria-describedby="enquiry-description" onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="trip-dialog-toolbar"><button type="button" className="dialog-close" aria-label="Close enquiry preview" onClick={() => dialog.current?.close()}>×</button></div>
      <div className="review-layout">
      <aside className="review-story">
        <Brand />
        <h2 id="enquiry-title">{enquiry?.review ? <>Your ride,<br />at a glance<span className="green-period">.</span></> : "Your plans, ready to send."}</h2>
        <Artwork name="enquiry-ready" className="review-art" />
      </aside>
      <div className="review-content">
      <div className="review-content-heading"><span className="review-eyebrow">{draft ? "MAKE IT YOURS" : "TRIP DETAILS"}</span><p id="enquiry-description">{draft ? "Update your ride below." : "Check your details. We’ll confirm availability and your quote on WhatsApp."}</p></div>
      {enquiry?.review ? <form ref={editor} onSubmit={(event) => {
        event.preventDefault();
        if (!draft) return;
        enquiry.onSaveTrip?.(draft);
        setEnquiry({ ...enquiry, trip: draft, message: `${quoteMessage(draft)}${enquiry.location === "itinerary" && enquiry.item ? `\nItinerary: ${enquiry.item}` : ""}`, review: tripReview(draft), lead: { service: draft.service, vehicle: draft.vehicle.name, days: draft.service === "multi-day" && numberInRange(draft.days, 2, 30) ? Number(draft.days) : null, estimate_usd: estimateTrip(draft.service, draft.vehicle, draft.days).amount } });
        setDraft(null); editButton.current?.focus();
      }}>
        <dl className="ride-review" data-editing={!!draft} key={draft ? "editing" : "review"}>
          {(draft ? tripReview(draft) : enquiry.review).map(({ label, value }) => {
            const field = ({ Service: "service", Pickup: "pickup", "Places to visit": "destination", "Drop-off": "destination", "Start date": "date", Date: "date", Days: "days", Travellers: "travellers", Vehicle: "vehicle" } as Record<string, "service" | "pickup" | "destination" | "date" | "days" | "travellers" | "vehicle">)[label];
            const id = `review-${field}`;
            return <div key={label} className={label === "Indicative price" ? "review-price" : ""}>
              <dt>{draft && field ? <label htmlFor={id}>{label}</label> : label}</dt>
              <dd>{draft && field ? field === "service" ? <ServiceSelect id={id} hideLabel value={draft.service} onChange={(service) => setDraft({ ...draft, service })} />
                : field === "vehicle" ? <VehicleSelect id={id} value={draft.vehicle.id} onChange={(value) => setDraft({ ...draft, vehicle: vehicles.find((v) => v.id === value)! })} />
                : field === "date" ? <DatePicker id={id} hideLabel label={label} value={draft.date} onChange={(date) => setDraft({ ...draft, date })} />
                : field === "pickup" || field === "destination" ? <LocationInput id={id} hideLabel label={label} placeholder="Hotel, city or area" multiple={field === "destination" && draft.service === "multi-day"} value={draft[field]} onChange={(value) => setDraft({ ...draft, [field]: value })} />
                : <input id={id} type={field === "days" || field === "travellers" ? "number" : "text"} min={field === "days" ? 2 : field === "travellers" ? 1 : undefined} max={field === "days" ? 30 : field === "travellers" ? 10 : undefined} step={field === "days" || field === "travellers" ? 1 : undefined} value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} />
                : value}</dd>
            </div>;
          })}
        </dl>
        {draft && <><p className="review-edit-note">Enter any location. Separate multiple stops with a semicolon.</p><div className="review-edit-actions"><button className="action action-dark" type="submit">Save changes <Arrow diagonal /></button><button className="outline-action" type="button" onClick={() => { setDraft(null); editButton.current?.focus(); }}>Discard changes</button></div></>}
      </form> : <pre className="review-message">{enquiry?.message}</pre>}
      <div className="enquiry-actions review-actions" hidden={!!draft}>
        {handoffUrl ? <a className="action action-dark" href={handoffUrl} onClick={send} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /><span>Send to WhatsApp</span><Arrow diagonal /></a> : <><button className="action action-dark" disabled>Send to WhatsApp</button><p role="status">WhatsApp enquiries are not connected yet. Please try again later.</p></>}
        <button ref={editButton} type="button" className="text-action" onClick={() => { if (enquiry?.trip) setDraft({ ...enquiry.trip }); else dialog.current?.close(); }}>{enquiry?.review ? "Edit my ride" : "Back to planning"}</button>
      </div>
      <p className="small-note enquiry-footnote">You’ll send the message in WhatsApp. Your booking is confirmed only after you accept our written quote.</p>
      </div>
      </div>
    </dialog>
  </Context.Provider>;
}

export function EnquiryButton({ children = "Chat on WhatsApp", message = "Hello GoChauffeur, I’d like help planning a trip in Sri Lanka.", location = "general", item, lead, review, trip, onSaveTrip, direct = false, className = "action", icon = true, trailingIcon = <Arrow diagonal /> }: Partial<Enquiry> & { children?: ReactNode; direct?: boolean; className?: string; icon?: ReactNode; trailingIcon?: ReactNode }) {
  const enquire = useContext(Context);
  const pathname = usePathname();
  return <button type="button" className={className} onClick={() => {
    if (direct) {
      const url = businessWhatsappUrl(`${message}\n\nRef: web-${pathname === "/" ? "home" : pathname.slice(1)}-${location} / ${campaignReference()}`);
      if (url) { track("whatsapp_click", { location, page: pathname }); window.open(url, "_blank", "noopener,noreferrer"); return; }
    }
    enquire({ message, location, item, lead, review, trip, onSaveTrip });
  }}>{icon === true ? <WhatsAppIcon /> : icon}<span>{children}</span>{trailingIcon}</button>;
}
