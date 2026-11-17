import type { Metadata } from "next";
import { LegalContent } from "@/components/legal-content";
export const metadata: Metadata = { title: "Booking Terms", description: "Read the terms for chauffeur quotes, payment, booking confirmation, cancellation and changes.", alternates: { canonical: "/terms" } };
export default function Terms() { return <LegalContent kind="terms" />; }
