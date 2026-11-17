import Image from "next/image";

export type ArtworkName = "planning-lavender" | "quote-warm" | "chauffeur-stylized-light" | "explore" | "document-lavender" | "empty" | "airport" | "enquiry" | "copied" | "enquiry-ready" | "enquiry-copied";

export function Artwork({ name, className = "" }: { name: ArtworkName; className?: string }) {
  return <Image className={`travel-art ${className}`} src={`/images/illustrations/${name}.webp`} width={768} height={768} sizes="(max-width: 760px) 240px, 320px" alt="" aria-hidden="true" draggable={false} />;
}
