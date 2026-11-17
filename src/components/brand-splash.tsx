"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./brand-splash.module.css";

export function BrandSplash() {
  const splash = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const overlay = splash.current;
    const content = document.getElementById("site-content");
    if (!overlay || !content) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const previousOverflow = document.body.style.overflow;
    const previousInert = content.inert;
    let finished = false;
    // Release the page even if the browser never delivers animationend.
    const timeout = window.setTimeout(() => finish(), 4500);
    const restore = () => {
      document.body.style.overflow = previousOverflow;
      content.inert = previousInert;
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      overlay.hidden = true;
      restore();
    };
    const skip = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") finish();
    };
    const motionChanged = () => { if (motion.matches) finish(); };
    const animationEnded = (event: AnimationEvent) => {
      if (event.target === overlay) finish();
    };

    overlay.hidden = false;
    if (motion.matches || window.location.hash) {
      finish();
      return;
    }

    content.inert = true;
    document.body.style.overflow = "hidden";
    overlay.dataset.playing = "true";
    window.addEventListener("keydown", skip);
    motion.addEventListener("change", motionChanged);
    overlay.addEventListener("animationend", animationEnded);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", skip);
      motion.removeEventListener("change", motionChanged);
      overlay.removeEventListener("animationend", animationEnded);
      delete overlay.dataset.playing;
      restore();
    };
  }, []);

  return <>
    <div ref={splash} className={`brand-splash ${styles.splash}`} aria-hidden="true" data-lenis-prevent>
      <div className={styles.artwork}>
        <svg viewBox="-20 -70 1560 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <mask id="chauffeur-splash-build" maskUnits="userSpaceOnUse" x="-10" y="-10" width="440" height="210">
              <g fill="none" stroke="white" strokeWidth="56" strokeLinecap="butt" strokeLinejoin="miter">
                <path className={`${styles.stroke} ${styles.loop}`} pathLength="1" d="M326 20H89C50 20 19 51 19 90S50 160 89 160C110 160 128 149 144 133L195 81" />
                <path className={`${styles.stroke} ${styles.arrow}`} pathLength="1" d="M96 81H195V181" />
                <path className={`${styles.stroke} ${styles.ring}`} pathLength="1" d="M326 21A71 71 0 1 1 325.99 21" />
              </g>
              <rect className={styles.complete} x="-10" y="-10" width="440" height="210" fill="white" />
            </mask>
            <clipPath id="chauffeur-splash-wordmark"><rect x="440" y="-10" width="1100" height="230" /></clipPath>
          </defs>
          <g className={styles.mark}>
            <path fill="#4dba67" mask="url(#chauffeur-splash-build)" d="M326.42,1.63v-.09l-110.58-.71h-.36L86.15,0c-22.65.9-44.21,11.61-59.94,27.35-35.18,35.22-34.93,91.56.61,126.37,17.83,17.47,41.77,26.7,66.82,25.38,19.65-1.04,38.4-8.38,52.9-21.73l14.28-14.35,15.23-15.29-.11,19.89h-.19v32.22h39.04v-16.29l.63-102.73-118.02-.79-.27,39.55,51.32.37-28.53,28.02c-4.89,4.81-10.72,7.75-17.11,9.91-12.13,3.52-24.97,2.53-36.28-3.14-14.34-7.19-24.54-20.93-27.03-36.57-4.98-31.25,18.95-59.16,50.52-59.35l125.57.78h0s36.97.23,36.97.23c-10.19,14.53-16.17,32.24-16.17,51.34,0,49.44,40.08,89.53,89.52,89.53s89.53-40.09,89.53-89.53S375.63,1.91,326.42,1.63ZM325.9,142.88c-28.13,0-50.94-22.81-50.94-50.95s22.81-50.94,50.94-50.94,50.95,22.81,50.95,50.94-22.81,50.95-50.95,50.95Z" />
          </g>
          <g clipPath="url(#chauffeur-splash-wordmark)">
            <image className={styles.wordmark} href="/brand/chauffeur-primary.png" x="0" y="-27" width="1517" height="247.5" />
          </g>
        </svg>
      </div>
      <p className={styles.copyright}>GoChauffeur is a Go Technologies product.<br />© {new Date().getFullYear()} Go Technologies. All rights reserved.</p>
    </div>
    <noscript><style>{".brand-splash { display: none !important; }"}</style></noscript>
  </>;
}
