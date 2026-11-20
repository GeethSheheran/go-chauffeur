import Image from "next/image";
import { EnquiryButton } from "./enquiry";

export function PageCta({ variant = "destinations" }: { variant?: "home" | "destinations" | "experiences" }) {
  const home = variant === "home";
  const experiences = variant === "experiences";
  return <section className="container page-cta-wrap">
    <div className="page-cta" data-reveal>
      <div className="page-cta-copy">
        <h2>{home ? "Your trip, with the driving sorted." : experiences ? "Pick a few, we’ll plan the days." : "Not sure how to fit it all in?"}</h2>
        <p>{home ? "Tell us your dates and what you’d like to see. We’ll plan sensible driving days, suggest a vehicle and send you a confirmed quotation." : experiences ? "Send us your picks and dates. We’ll suggest a route and vehicle, then send you a confirmed quotation." : "Send us the places you like and your dates. We’ll suggest a route with sensible driving days and a confirmed quotation."}</p>
        <EnquiryButton direct className="action action-dark" location="page_cta" message="Hello GoChauffeur, I’d like help planning my route.">{home ? "Plan my trip on WhatsApp" : experiences ? "Plan it on WhatsApp" : "Plan my route on WhatsApp"}</EnquiryButton>
      </div>
      <div className={`page-cta-art${home ? " page-cta-art-home" : experiences ? " page-cta-art-experiences" : ""}`} aria-hidden="true">
        {home ? <Image src="/images/illustrations/home-route-planning.webp" alt="" width={1152} height={768} sizes="(max-width: 760px) 300px, 520px" /> : experiences ? <>
          <Image src="/images/illustrations/experiences-companion.webp" alt="" width={768} height={768} sizes="(max-width: 760px) 192px, 333px" />
          <Image src="/images/illustrations/experiences-planning.webp" alt="" width={768} height={768} sizes="(max-width: 760px) 192px, 333px" />
        </> : <>
          <Image src="/images/illustrations/concierge-phone.webp" alt="" width={768} height={768} sizes="(max-width: 760px) 168px, 290px" />
          <Image src="/images/illustrations/travel-planner-stylized.webp" alt="" width={768} height={768} sizes="(max-width: 760px) 168px, 290px" />
        </>}
      </div>
    </div>
  </section>;
}
