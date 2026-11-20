import Link from "next/link";
import { services } from "@/lib/prices";
import { Brand } from "./brand";
import { Arrow } from "./icons";
import { EnquiryButton } from "./enquiry";
import { FooterDrive } from "./footer-drive";

export function Footer() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return <footer className="site-footer">
    <FooterDrive />
    <div className="container">
      <div className="footer-contact">
        <div className="footer-brand">
          <Brand />
          <p>Private chauffeurs for travellers in Sri Lanka.</p>
          <span>Built to Move. Made to Connect.</span>
        </div>
        <div className="footer-callout">
          <h2>Let’s plan your trip.</h2>
          <div className="footer-contact-actions">
            <EnquiryButton direct className="action footer-chat" location="footer" />
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
          </div>
        </div>
      </div>
      <div className="footer-main">
        <div className="footer-intro-copy">
          <p>Share your dates and the places you’d like to see. We’ll help plan the route and send a confirmed quotation.</p>
          <div className="footer-brand-notes">
            <span>GoChauffeur is a Go Technologies product.</span>
            <span>Built in Sri Lanka. Designed for the world.</span>
          </div>
        </div>
        <div className="footer-column">
          <span className="eyebrow">Services</span>
          {services.map((service) => <Link key={service.id} href={`/?service=${service.id}#services`}>{service.label}</Link>)}
        </div>
        <div className="footer-column">
          <span className="eyebrow">Explore</span>
          <Link href="/destinations">Destinations</Link>
          <Link href="/things-to-do">Things to do</Link>
        </div>
        <div className="footer-column footer-company">
          <span className="eyebrow">Good to know</span>
          <Link href="/#prices">Prices and terms</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/privacy">Privacy notice</Link>
          <Link href="/terms">Booking terms</Link>
        </div>
      </div>
      <div className="footer-baseline">
        <div className="footer-credits">
          <span>© {new Date().getFullYear()} Go Technologies (Private) Limited.</span>
          <span>Designed and built by <a href="https://www.tourithm.lk/" target="_blank" rel="noopener noreferrer">Tourithm</a></span>
        </div>
        <a href="#top" aria-label="Back to top"><Arrow /></a>
      </div>
    </div>
  </footer>;
}
