"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { configureAnalytics, CONSENT_KEY } from "@/lib/analytics";

let choice: string | null = null;
function snapshot() {
  try { return localStorage.getItem(CONSENT_KEY) || choice; } catch { return choice; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("analytics-consent", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("analytics-consent", callback);
  };
}

export function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribe, snapshot, () => "pending");
  const [editing, setEditing] = useState(false);
  useEffect(() => { configureAnalytics(consent === "accepted"); }, [consent]);
  function choose(value: "accepted" | "declined") {
    choice = value;
    configureAnalytics(value === "accepted");
    try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Keep the choice for this visit. */ }
    window.dispatchEvent(new Event("analytics-consent"));
    setEditing(false);
  }
  return <>
    <button className="analytics-settings" type="button" onClick={() => setEditing(true)}>Cookie settings</button>
    {(consent === null || editing) && createPortal(<section className="analytics-consent" aria-label="Analytics cookie preferences">
      <p>May we use Google Analytics cookies to understand visits and improve this website? You can change your choice in Cookie settings. <Link href="/privacy">Privacy notice</Link></p>
      <div><button type="button" onClick={() => choose("declined")}>Decline analytics</button><button type="button" onClick={() => choose("accepted")}>Accept analytics</button></div>
    </section>, document.body)}
  </>;
}
