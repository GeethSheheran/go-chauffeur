import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { TripWalletProvider } from "@/components/trip-wallet";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EnquiryProvider } from "@/components/enquiry";
import { Reveal } from "@/components/reveal";
import { SmoothScroll } from "@/components/smooth-scroll";
import { BrandSplash } from "@/components/brand-splash";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./typography.css";
import "./hero.css";
import "./mobile.css";
import "./illustrations.css";

const cal = localFont({ src: "../../public/fonts/cal-sans.ttf", variable: "--font-cal", display: "swap", weight: "400" });
const dm = localFont({ src: [{ path: "../../public/fonts/dm-sans.ttf", weight: "400" }, { path: "../../public/fonts/dm-sans-semibold.ttf", weight: "600" }], variable: "--font-dm", display: "swap" });
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://gochauffeur.lk"),
  title: { default: "Private Chauffeurs in Sri Lanka | GoChauffeur", template: "%s | GoChauffeur" },
  description: "Plan an airport transfer, day hire or multi-day tour in Sri Lanka. See prices per vehicle and request a written chauffeur quote on WhatsApp.",
  robots: { index: false, follow: false },
  openGraph: { type: "website", siteName: "GoChauffeur", locale: "en_GB", images: [{ url: "/images/sigiriya.webp", width: 1920, height: 1056, alt: "Sigiriya, Sri Lanka" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body id="top" className={`${cal.variable} ${dm.variable}`}><BrandSplash /><div id="site-content"><EnquiryProvider><TripWalletProvider><a className="skip-link" href="#main">Skip to content</a><Header />{children}<Footer /><Reveal /><SmoothScroll /></TripWalletProvider></EnquiryProvider></div></body></html>;
}
