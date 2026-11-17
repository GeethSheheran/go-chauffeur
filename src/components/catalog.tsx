"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { destinations, experiences, regions, interests } from "@/lib/content";
import { track } from "@/lib/analytics";
import { AddToTripButton } from "./trip-wallet";
import { EnquiryButton } from "./enquiry";
import { LineIcon } from "./icons";
import { Artwork } from "./artwork";

export function Catalog({ kind }: { kind: "destinations" | "experiences" }) {
  const id = useId();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const isPlaces = kind === "destinations";
  const filters = isPlaces ? regions : interests;
  const search = query.trim().toLocaleLowerCase();
  const places = destinations.filter((d) => (filter === "All" || d.region === filter) && `${d.name} ${d.region} ${d.highlights} ${d.description}`.toLocaleLowerCase().includes(search));
  const things = experiences.filter((e) => (filter === "All" || e.interest === filter) && `${e.title} ${e.place} ${e.interest} ${e.description}`.toLocaleLowerCase().includes(search));
  const count = isPlaces ? places.length : things.length;
  useEffect(() => {
    if (isPlaces || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("has-greeted");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.6 });
    document.querySelectorAll(".chauffeur-avatar:not(.has-greeted)").forEach((avatar) => observer.observe(avatar));
    return () => observer.disconnect();
  }, [isPlaces, filter, query]);
  function select(value: string) { setFilter(value); track("filter_select", { filter: isPlaces ? "region" : "interest", value }); }
  return <section className="container catalog-section">
    <div className="catalog-search-row"><label className="catalog-search" htmlFor={`${id}-search`}><span>Find {isPlaces ? "a destination" : "an experience"}</span><input id={`${id}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isPlaces ? "Try Ella, beaches or tea country" : "Try a safari, train ride or surfing"} aria-controls={`${id}-results`} /></label><span className="result-count" aria-live="polite">{count} {isPlaces ? count === 1 ? "place" : "places" : count === 1 ? "experience" : "experiences"}</span></div>
    <div className="catalog-toolbar"><div className="filters" role="group" aria-label={`Filter by ${isPlaces ? "region" : "interest"}`}>{filters.map((label) => <button key={label} aria-pressed={filter === label} aria-controls={`${id}-results`} onClick={() => select(label)}>{label}</button>)}</div></div>
    <div className="catalog-grid" id={`${id}-results`}>
      {count === 0 ? <div className="catalog-empty" role="status"><Artwork name="empty" /><span className="eyebrow">Let’s try another route</span><h2>No {isPlaces ? "places" : "experiences"} match this search.</h2><p>Try another name or a broader filter. Our team can also help plan a stop you don’t see here.</p><div className="empty-actions"><button className="action action-dark" onClick={() => { setQuery(""); select("All"); document.getElementById(`${id}-search`)?.focus(); }}>Reset search and filters</button><EnquiryButton className="text-action" location="empty_search" message={`Hello GoChauffeur, I’d like help finding ${isPlaces ? "a destination" : "an experience"}${query.trim() ? `: ${query.trim()}` : " for my trip"}.`} icon={false}>Ask us for ideas</EnquiryButton></div></div> : null}
      {isPlaces ? places.map((place) => <article className="destination-card" key={place.name} data-reveal>
        <div className="destination-photo"><Image src={place.photo.src} alt={place.photo.alt} fill sizes="(max-width: 520px) 100vw, (max-width: 760px) 50vw, 33vw" style={{ objectPosition: place.photo.position || "50% 50%" }} /></div>
        <div className="destination-card-head"><div className="card-meta"><span className="eyebrow">{place.region}</span><span className="drive-time"><LineIcon name="clock" />About {place.drive}</span></div><h2>{place.name}</h2></div>
        <div className="destination-card-body"><p>{place.description}</p><dl><div><dt>Best time</dt><dd>{place.season}</dd></div><div><dt>Stay</dt><dd>{place.stay}</dd></div><div><dt>Highlights</dt><dd>{place.highlights}</dd></div></dl><AddToTripButton name={place.name} image={place.photo.src} category={place.region} /></div>
      </article>) : things.map((experience) => <article className="experience-card" key={experience.title} data-reveal>
        <div className="experience-photo"><Image src={experience.photo.src} alt={experience.photo.alt} fill sizes="(max-width: 520px) 100vw, (max-width: 760px) 50vw, 33vw" style={{ objectPosition: experience.photo.position || "50% 50%" }} /></div>
        <div className="experience-card-body"><div className="card-meta"><span className="eyebrow">{experience.interest}</span><span>{experience.place}</span></div><h2>{experience.title}</h2><p>{experience.description}</p><div className="experience-tags"><span>{experience.season}</span><span>{experience.duration}</span></div><div className="chauffeur-tip"><Image className="chauffeur-avatar" src="/images/illustrations/chauffeur-guide.webp" width={48} height={48} alt="" aria-hidden="true" /><p><strong>Chauffeur tip</strong>{experience.tip}</p></div><AddToTripButton name={experience.title} image={experience.photo.src} category={experience.interest} /></div>
      </article>)}
    </div>
    {!isPlaces ? <p className="catalog-note">Entrance tickets, safari jeeps, boat trips and train tickets are paid separately. Seasons are a guide. We confirm conditions when we plan your trip.</p> : <p className="catalog-note">Drive times are approximate, by road from Colombo airport (CMB), and change with traffic and stops.</p>}
  </section>;
}
