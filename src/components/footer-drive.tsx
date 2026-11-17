"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CampaignGoBadge } from "./campaign-go-badge";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeToMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const reducedMotion = () => window.matchMedia(motionQuery).matches;

export function FooterDrive() {
  const scene = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduce = useSyncExternalStore(subscribeToMotion, reducedMotion, () => true);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (scene.current) observer.observe(scene.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={scene} className="footer-drive" data-running={visible && !reduce}>
    <div className="footer-drive-window" aria-hidden="true">
      <div className="footer-drive-track">
        {[0, 1, 2, 3].map((copy) => <div className="footer-drive-tile" key={copy}>
          <Image className="footer-drive-landscape" src="/images/illustrations/footer-panorama-soft.webp" alt="" fill unoptimized loading="eager" />
          {copy === 0 ? <Image className="footer-drive-tower" src="/images/illustrations/footer-tower-soft.webp" alt="" width={512} height={768} unoptimized loading="eager" sizes="150px" /> : null}
          {copy === 1 ? <Image className="footer-drive-temple" src="/images/illustrations/footer-temple-soft.webp" alt="" width={768} height={512} unoptimized loading="eager" sizes="180px" /> : null}
          {copy === 0 ? <Image className="footer-drive-elephants" src="/images/illustrations/footer-elephants-soft.webp" alt="" width={768} height={512} unoptimized loading="eager" sizes="250px" /> : null}
          <div className="footer-drive-road" />
        </div>)}
      </div>
    </div>
    <div className="footer-drive-car" aria-hidden="true">
      <div className="footer-exhaust"><span /><span /><span /></div>
      <Image src="/images/illustrations/footer-go-coupe-soft.webp" alt="" fill unoptimized sizes="240px" />
      <CampaignGoBadge placement="car" />
    </div>
  </div>;
}
