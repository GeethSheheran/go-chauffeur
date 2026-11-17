"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TripButton } from "./trip-wallet";
import { Brand } from "./brand";
import { EnquiryButton } from "./enquiry";
import { Arrow } from "./icons";

const homeLinks = [["Services", "/#services"], ["Destinations", "/destinations"], ["Things to do", "/things-to-do"], ["Prices", "/#prices"], ["FAQ", "/#faq"]];
const compactLinks = [["Home", "/"], ["Destinations", "/destinations"], ["Things to do", "/things-to-do"], ["Prices", "/#prices"]];

export function Header() {
  const pathname = usePathname();
  const links = pathname === "/" ? homeLinks : compactLinks;
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { menu.current?.close(); setOpen(false); trigger.current?.focus(); }
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const media = matchMedia("(min-width: 1101px)");
    const wide = () => { if (media.matches) { menu.current?.close(); setOpen(false); } };
    media.addEventListener("change", wide);
    return () => { document.body.style.overflow = previous; media.removeEventListener("change", wide); };
  }, [open]);
  return <>
    <div className="announcement"><span>Free cancellation up to 24 hours before your trip.</span><Link href="/terms">Booking terms <Arrow diagonal /></Link></div>
    <header className="site-header">
      <div className="header-inner container">
        <div className="header-brand"><Brand /></div>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={label} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav>
        <TripButton />
        <EnquiryButton direct className="action header-action" location="header" />
        <button ref={trigger} className="menu-trigger" aria-label="Open navigation" aria-controls="mobile-menu" aria-expanded={open} onClick={() => { menu.current?.showModal(); setOpen(true); }}><span /><span /></button>
      </div>
    </header>
    <dialog id="mobile-menu" ref={menu} className="mobile-menu" data-lenis-prevent aria-label="Navigation" onClose={() => setOpen(false)} onClick={(event) => { if (event.target === menu.current) close(); }}>
      <div className="mobile-menu-top"><Brand /><button className="dialog-close" aria-label="Close navigation" onClick={close}>×</button></div>
      <nav aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={close}>{label}<Arrow diagonal /></Link>)}</nav>
      <TripButton mobile beforeOpen={close} />
      <div onClick={close}><EnquiryButton direct location="header" /></div>
      <span className="small-note">Built to Move. Made to Connect.</span>
    </dialog>
  </>;
}
