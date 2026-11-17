"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    const observeReveals = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.reveal-ready):not(.is-visible)").forEach((el) => {
        el.classList.add("reveal-ready");
        observer.observe(el);
      });
    };
    observeReveals();
    const updates = new MutationObserver(observeReveals);
    const main = document.querySelector("main");
    if (main) updates.observe(main, { childList: true, subtree: true });
    return () => { updates.disconnect(); observer.disconnect(); document.querySelectorAll(".reveal-ready").forEach((el) => el.classList.remove("reveal-ready")); };
  }, [path]);
  return null;
}
