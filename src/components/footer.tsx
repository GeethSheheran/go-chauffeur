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
          <nav className="footer-socials" aria-label="Social media">
            <a href="https://web.facebook.com/profile.php?id=61594671584124" target="_blank" rel="noopener noreferrer" aria-label="GoChauffeur on Facebook (opens in a new tab)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.931-1.956 1.887v2.263h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" /></svg>
            </a>
            <a href="https://www.instagram.com/go_chauffeur/" target="_blank" rel="noopener noreferrer" aria-label="GoChauffeur on Instagram (opens in a new tab)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.linkedin.com/company/go-chauffeur/" target="_blank" rel="noopener noreferrer" aria-label="GoChauffeur on LinkedIn (opens in a new tab)">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" /></svg>
            </a>
          </nav>
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
