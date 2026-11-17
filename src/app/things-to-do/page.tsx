import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { PageCta } from "@/components/page-cta";
import { ExperienceHero } from "@/components/experience-hero";
import "./experience-hero.css";

export const metadata: Metadata = { title: "Things to Do in Sri Lanka by Chauffeur", description: "Explore 12 cultural, wildlife, hill-country and coastal experiences. Choose your favourites and plan the driving days with our team.", alternates: { canonical: "/things-to-do" } };

export default function ThingsToDo() {
  return <main id="main"><ExperienceHero /><Catalog kind="experiences" /><PageCta variant="experiences" /></main>;
}
