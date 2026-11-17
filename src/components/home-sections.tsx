import Image from "next/image";
import Link from "next/link";
import { howItWorks, itineraries } from "@/lib/content";
import { allowances, usd, vehicles } from "@/lib/prices";
import { Arrow, LineIcon } from "./icons";
import { ItineraryEnquiry } from "./itinerary-enquiry";
import { ExploreLink } from "./explore-link";
import { Artwork, type ArtworkName } from "./artwork";
import { TrustIcon } from "./trust-icon";

export function TrustStrip() {
  const items = [
    { icon: "price", title: "Fixed USD prices", body: "Receive your written quote before you pay." },
    { icon: "advance", title: "A small advance to book", body: "Pay by secure link or bank transfer. Pay the rest at pickup." },
    { icon: "cancellation", title: "Free cancellation", body: "Up to 24 hours before your trip. See Booking terms for the details." },
    { icon: "chauffeur", title: "One chauffeur, start to finish", body: "We check driver and vehicle availability before confirming your trip." },
  ] as const;
  return <section className="trust-strip container" aria-label="Travel with confidence"><div className="trust-grid">{items.map((item) => <div className="trust-item" key={item.title}><TrustIcon name={item.icon} /><div><h2>{item.title}</h2><p>{item.body}</p></div></div>)}</div></section>;
}

export function HowItWorks() {
  const artwork: ArtworkName[] = ["planning-lavender", "quote-warm", "document-lavender", "chauffeur-stylized-light"];
  return <section className="how-section container section-space">
    <div className="how-content"><div className="section-heading" data-reveal><h2>From first message to your chauffeur at arrivals, in four steps.</h2></div>
    <div className="steps">{howItWorks.map((step, index) => <article className="step" key={step.title} data-reveal><Artwork name={artwork[index]} /><div className="step-top"><span className="step-number">0{index + 1}</span>{index < 3 ? <Arrow /> : <LineIcon name="check" />}</div><h3>{step.title}</h3><p>{step.body}</p></article>)}</div></div>
  </section>;
}

export function Itineraries() {
  const comfort = vehicles.find((v) => v.id === "comfort")!;
  return <section className="itinerary-section section-space"><div className="container">
    <div className="section-heading split-heading" data-reveal><div><h2>Start from a classic route,<br />then make it yours.</h2></div><p>Starting prices are per vehicle for a Comfort Sedan. Hotels and entrance tickets are paid separately.</p></div>
    <div className="itinerary-grid">{itineraries.map((item) => <article key={item.name} className={`itinerary-card ${item.image ? "has-photo" : "compact-itinerary"}`} data-reveal>
      {item.image ? <div className="itinerary-photo"><Image src={item.image} alt={item.alt} fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="photo-tag">{item.duration}</span></div> : <span className="eyebrow compact-itinerary-duration">{item.duration}</span>}
      <div className="itinerary-content"><h3>{item.name}</h3><p className="itinerary-route">{item.route}</p><p>{item.body}</p>
        <span className="itinerary-inclusion">{item.kind === "tour" ? `${item.days * allowances.multiDayKm} km · Comfort Sedan` : item.kind === "day" ? `${allowances.dayKm} km · ${allowances.dayHours} hours · Comfort Sedan` : "Your airport. Your hotel. A fixed written quote."}</span>
        <div className="itinerary-bottom"><div>{item.kind !== "airport" ? <><span className="small-note">From, per vehicle</span><strong>{usd(item.kind === "tour" ? item.days * comfort.multiDay! : comfort.day)}</strong></> : <span className="transfer-price">Ask for a<br />transfer quote.</span>}</div><ItineraryEnquiry name={item.name} route={item.route} days={item.days} kind={item.kind} /></div>
      </div>
    </article>)}</div>
  </div></section>;
}

export function ExploreCards() {
  return <section className="explore-section container section-space" aria-label="Find your Sri Lanka">
    <ExploreLink href="/destinations" className="explore-card explore-destinations"><Image src="/images/destinations-travel-stickers.webp" fill sizes="(max-width: 700px) 100vw, 50vw" alt="" /><div><h2>Where to go,<br />and how long<br />the drive takes.</h2><span className="explore-action">Explore destinations <Arrow diagonal /></span></div></ExploreLink>
    <ExploreLink href="/things-to-do" className="explore-card explore-experiences"><Image src="/images/experiences-stickered-beach.webp" fill sizes="(max-width: 700px) 100vw, 50vw" alt="" /><div><h2>Safaris, train rides,<br />temples and<br />tea country.</h2><span className="explore-action">See things to do <Arrow diagonal /></span></div></ExploreLink>
  </section>;
}

export function Prices() {
  return <section className="prices-section section-space" id="prices"><div className="container">
    <div className="section-heading split-heading" data-reveal><div><h2>Clear prices, per vehicle,<br />in US dollars.</h2></div><p>Your price includes your chauffeur, vehicle, fuel for the included distance, ordinary airport tolls and parking. On multi-day trips, your chauffeur’s meals and lodging are included.</p></div>
    <p className="price-scroll-hint" aria-hidden="true">Scroll to see all services <Arrow /></p>
    <div className="price-scroll" role="region" aria-label="Vehicle prices, scroll horizontally for all services" tabIndex={0}>
      <table className="price-table"><caption className="sr-only">Prices in US dollars per vehicle</caption><thead><tr><th scope="col">Vehicle</th><th scope="col">Travellers</th><th scope="col">Multi-day tour<span>Per day · {allowances.multiDayKm} km / day</span></th><th scope="col">Chauffeur for a day<span>{allowances.dayKm} km · {allowances.dayHours} hours</span></th><th scope="col">CMB → Colombo<span>Central Colombo reference</span></th><th scope="col">Point-to-point<span>Minimum fare from</span></th></tr></thead><tbody>{vehicles.map((v) => <tr key={v.id}><th scope="row"><div className="price-vehicle"><span className="price-vehicle-art" data-vehicle={v.id} aria-hidden="true" /><span>{v.name}{v.id === "comfort" ? <span className="table-note">The classic touring choice</span> : null}</span></div></th><td>{v.seats}</td><td>{usd(v.multiDay)}</td><td>{usd(v.day)}</td><td>{usd(v.airport)}</td><td>{usd(v.pointToPoint)}</td></tr>)}</tbody></table>
    </div>
    <ul className="mobile-price-list" aria-label="Vehicle prices in US dollars, per vehicle">
      {vehicles.map((v) => <li className="mobile-price-card" key={v.id}>
        <div className="mobile-price-heading">
          <span className="price-vehicle-art" data-vehicle={v.id} aria-hidden="true" />
          <div><h3>{v.name}</h3>{v.id === "comfort" ? <p className="table-note">The classic touring choice</p> : null}<dl className="mobile-price-capacity"><dt>Travellers</dt><dd>{v.seats}</dd></dl></div>
        </div>
        <dl className="mobile-price-rates">
          <div><dt>Multi-day tour<span>Per day · {allowances.multiDayKm} km</span></dt><dd>{usd(v.multiDay)}</dd></div>
          <div><dt>Chauffeur for a day<span>{allowances.dayKm} km · {allowances.dayHours} hours</span></dt><dd>{usd(v.day)}</dd></div>
          <div><dt>CMB → Colombo<span>Central Colombo reference</span></dt><dd>{usd(v.airport)}</dd></div>
          <div><dt>Point-to-point<span>Minimum fare from</span></dt><dd>{usd(v.pointToPoint)}</dd></div>
        </dl>
      </li>)}
    </ul>
    <p className="price-note">Multi-day rates include 120 km per day. Single-day hire includes 100 km and 10 hours. For other transfer routes, ask us for a fixed quote.</p>
    <div className="terms-cards"><article data-reveal><h3>Paying for your trip.</h3><p>After you accept the written quote, pay a small advance through the secure link we send on WhatsApp or by transfer to our business account. We confirm your booking after verifying the payment.</p><p>Pay the rest at pickup by link, transfer or cash and receive a receipt.</p></article><article data-reveal><h3>Cancellations and changes.</h3><p>Free cancellation up to 24 hours before your trip. Read the booking terms for refunds, changes and flight delays.</p><Link href="/terms" className="action action-dark">Read booking terms <Arrow diagonal /></Link></article></div>
  </div></section>;
}

export function FutureTeaser() {
  return <aside className="container"><div className="future-teaser"><p>Online booking is on its way. For now, every trip is planned with a person on WhatsApp, so you get a quote that fits your plans.</p><Arrow diagonal /></div></aside>;
}
