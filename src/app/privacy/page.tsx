import type { Metadata } from "next";
import { LegalContent } from "@/components/legal-content";
export const metadata: Metadata = { title: "Privacy Notice", description: "Read how GoChauffeur handles website use, WhatsApp enquiries, cookies and analytics.", alternates: { canonical: "/privacy" } };
export default function Privacy() { return <LegalContent kind="privacy" />; }
