"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { faqs } from "@/lib/content";
import { track } from "@/lib/analytics";

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return <section className="faq-section container section-space" id="faq">
    <div className="faq-heading" data-reveal><h2>Good to know.</h2><p>A few answers before you go.<br />Your plans can start with a question, too.</p><Image className="faq-guide-art" src="/images/illustrations/faq-travel-guide.webp" alt="" aria-hidden="true" width={512} height={512} sizes="(max-width: 760px) 144px, 220px" /></div>
    <div className="faq-list">{faqs.map((faq, i) => <div className={`faq-item ${open === i ? "is-open" : ""}`} key={faq.question}>
      <h3><button aria-expanded={open === i} aria-controls={`faq-answer-${i}`} onClick={() => { if (open !== i) track("faq_open", { question: faq.question }); setOpen(open === i ? null : i); }}>{faq.question}<span aria-hidden="true">{open === i ? "−" : "+"}</span></button></h3>
      <div className="faq-answer" id={`faq-answer-${i}`} hidden={open !== i}><p>{faq.answer}{i === 2 ? <> <Link href="/terms">Read booking terms <span aria-hidden="true">↗</span></Link></> : null}</p></div>
    </div>)}</div>
  </section>;
}
