"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { track } from "@/lib/analytics";

export function ExploreLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  return <Link href={href} className={className} onClick={() => track("select_content", { content_type: "explore", item: href.slice(1) })}>{children}</Link>;
}
