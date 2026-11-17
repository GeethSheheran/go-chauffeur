import Image from "next/image";
import { CampaignGoBadge } from "./campaign-go-badge";

export function ExperienceHero() {
  return <section className="page-hero experiences-campaign" aria-labelledby="experiences-title">
    <div className="experiences-campaign-art">
      <div className="experiences-campaign-canvas">
        <Image src="/images/experiences-stickered-beach.webp" alt="Illustrated traveller in a sunhat with tiny travel stickers beside the turquoise Sri Lankan sea." fill priority sizes="(max-width: 760px) 900px, 100vw" />
        <CampaignGoBadge placement="hat" />
      </div>
    </div>
    <div className="container experiences-campaign-copy">
      <h1 id="experiences-title">The experiences worth<br />building your route around.</h1>
      <p>Tell us which ones you like. Your chauffeur plans the drive, waits while you explore and looks after your luggage between stops.</p>
    </div>
  </section>;
}
