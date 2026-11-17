import Image from "next/image";
import Link from "next/link";
import { EnquiryButton } from "@/components/enquiry";
import { Arrow } from "@/components/icons";

export default function NotFound() {
  return <main id="main" className="not-found">
    <div className="container not-found-layout">
      <div className="not-found-scene" aria-hidden="true">
        <span className="not-found-code">404</span>
        <Image className="travel-art not-found-travellers" src="/images/illustrations/off-route-travellers.webp" width={1200} height={800} sizes="(max-width: 760px) 90vw, 720px" alt="" priority draggable={false} />
      </div>
      <div className="not-found-copy">
        <h1><span className="sr-only">Error 404. </span>We couldn’t find that page.</h1>
        <p>Looks like we’ve taken a little detour. Let’s get you back to planning your Sri Lanka trip.</p>
        <div className="not-found-actions">
          <Link className="action action-dark" href="/">Back to home <Arrow diagonal /></Link>
          <EnquiryButton className="outline-action" location="404" icon={false}>Ask us for help</EnquiryButton>
        </div>
      </div>
    </div>
  </main>;
}
