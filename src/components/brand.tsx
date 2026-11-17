import Image from "next/image";
import Link from "next/link";

export function Brand({ light = false }: { light?: boolean }) {
  return <Link href="/" className="brand" aria-label="GoChauffeur home"><Image src={`/brand/chauffeur-${light ? "reversed" : "primary"}.png`} alt="GoChauffeur" width={3586} height={585} priority={!light} /></Link>;
}
