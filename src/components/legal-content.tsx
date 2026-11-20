import Link from "next/link";
import { Arrow } from "./icons";

export function LegalContent({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  const sections = privacy ? [
    { title: "Using the website and quote widget", body: "The website calculates indicative prices in your browser. When you choose to enquire, your trip summary opens in WhatsApp. This website has no customer account, document upload or booking database." },
    { title: "WhatsApp enquiries", body: "Your enquiry continues with the GoChauffeur team in WhatsApp. The final notice will explain who handles enquiry information, how it is used and how long it is retained." },
    { title: "Cookies and measurement", body: "Analytics and advertising services are not enabled in this frontend preview. Approved cookie wording and consent choices must be in place before GA4, Google Ads or Meta tracking is enabled." },
    { title: "Contact", body: "Go Technologies will supply the confirmed business identity and privacy contact for the published notice." },
  ] : [
    { title: "Your quote and confirmation", body: "Website prices are indicative, in US dollars per vehicle. The team checks availability and sends a confirmed quotation. You accept that quotation before paying a 10% booking deposit. We confirm your booking after verifying payment, then send your voucher with chauffeur and vehicle details." },
    { title: "Payment and inclusions", body: "Settle the balance at pickup. The confirmed quotation confirms payment methods, included distance, hours and other inclusions. Entrance tickets, safari jeeps, boat trips and train tickets are paid separately." },
    { title: "Cancellations and changes", body: "Cancel more than 24 hours before your trip for a full refund of your deposit. The final booking terms will confirm the exact cancellation cutoff, refunds, changes, flight delays and no-show conditions." },
  ];
  return <main id="main"><div className="legal-hero"><div className="container"><h1>{privacy ? "Privacy notice." : "Booking terms."}</h1><p>{privacy ? "This notice explains what happens when you visit GoChauffeur, use the trip planner or contact our team on WhatsApp." : "These terms explain how to accept your confirmed quotation, secure your booking with a booking deposit, pay for your trip and request a change or cancellation."}</p></div></div><div className="container legal-body">{sections.map((s) => <section key={s.title}><h2>{s.title}</h2><p>{s.body}</p></section>)}<Link href="/" className="text-action">Back to planning your trip <Arrow diagonal /></Link></div></main>;
}
