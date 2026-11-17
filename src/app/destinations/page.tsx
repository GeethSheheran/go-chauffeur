import type { Metadata } from "next";
import Image from "next/image";
import { Catalog } from "@/components/catalog";
import { PageCta } from "@/components/page-cta";
import { CampaignGoBadge } from "@/components/campaign-go-badge";
import "./destination-hero.css";

export const metadata: Metadata = { title: "Sri Lanka Destinations and Drive Times", description: "Explore 13 Sri Lankan destinations with approximate drive times from Colombo airport, suggested stays and highlights for your route.", alternates: { canonical: "/destinations" } };

export default function Destinations() {
  return <main id="main">
    <section className="page-hero destination-campaign" aria-labelledby="destinations-title">
      <div className="container destination-campaign-layout">
        <div className="destination-campaign-copy">
          <h1 id="destinations-title">Where to go in <span>Sri Lanka,</span><br />and how long the drive takes.</h1>
          <p>Drive times are approximate, by road from Colombo airport (CMB), and change with traffic and stops. Your chauffeur plans the route with you.</p>
        </div>
        <div className="destination-campaign-art">
          <Image src="/images/destinations-travel-stickers.webp" alt="Illustrated traveller with luggage above Sri Lanka’s hills and coast." fill priority sizes="(max-width: 760px) 100vw, 75vw" />
          <CampaignGoBadge placement="suitcase" />
        </div>
      </div>
    </section>
    <Catalog kind="destinations" />
    <PageCta />
  </main>;
}
