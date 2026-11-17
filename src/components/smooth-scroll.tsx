"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      stopInertiaOnNavigate: true,
    });
    // Handle same-page anchors before Next.js applies its own scroll position.
    const scrollToAnchor = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      if (location.hash !== url.hash) history.pushState(null, "", url.href);
      // Native focus scrolling can change the position before Lenis receives its scroll event.
      lenis.scrollTo(window.scrollY, { immediate: true });
      lenis.scrollTo(target, {
        immediate: event.detail === 0,
        onComplete: () => {
          if (link.classList.contains("skip-link")) {
            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
          }
        },
      });
    };
    document.addEventListener("click", scrollToAnchor, true);
    const content = document.getElementById("site-content");
    const syncScrolling = () => {
      if (content?.inert || document.querySelector("dialog[open]")) lenis.stop();
      else lenis.start();
    };
    const observer = new MutationObserver(syncScrolling);
    if (content) observer.observe(content, { attributes: true, attributeFilter: ["inert"] });
    document.querySelectorAll("dialog").forEach((dialog) => {
      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });
    syncScrolling();
    return () => { document.removeEventListener("click", scrollToAnchor, true); observer.disconnect(); lenis.destroy(); };
  }, []);
  return null;
}
