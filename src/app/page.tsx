import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import { QuoteWidget } from "@/components/quote-widget";
import { Faq } from "@/components/faq";
import { TrustStrip, HowItWorks, Itineraries, ExploreCards, Prices, FutureTeaser } from "@/components/home-sections";
import { PageCta } from "@/components/page-cta";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <main id="main">
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-booking-grid">
        <div className="hero-editorial">
          <h1 id="hero-title">Explore Sri Lanka.<br />Your journey.<br />Your own chauffeur<span className="green-period">.</span></h1>
          <p>From airport transfers to islandwide day trips and multi-day tours, discover Sri Lanka at your own pace with a
            dedicated chauffeur and vehicle. Receive a confirmed quotation in US dollars and plan your journey with a
            real person on WhatsApp.</p>
          <div className="hero-art"><Image src="/images/illustrations/home-chauffeur-welcome.webp" alt="Our illustrated chauffeur welcoming a traveller beside an ivory car" width={1536} height={864} priority sizes="(max-width: 960px) 100vw, 55vw" /></div>
        </div>
        <div className="hero-booking-form"><Suspense fallback={<div className="quote-widget widget-loading"><h2>Plan your ride.</h2><p>Preparing your trip planner…</p></div>}><QuoteWidget /></Suspense></div>
      </div>
    </section>
    <TrustStrip />
    <div id="how-it-works"><HowItWorks /></div>
    <Itineraries />
    <ExploreCards />
    <Prices />
    <Faq />
    <FutureTeaser />
    <PageCta variant="home" />
  </main>;
}
