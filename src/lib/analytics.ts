export type AnalyticsEvent = "whatsapp_click" | "generate_lead" | "widget_service_select" | "select_content" | "faq_open" | "filter_select";

// Frontend review: emit consent-neutral local events. Connect approved tags after policy sign-off.
export function track(event: AnalyticsEvent, parameters: Record<string, string | number | null> = {}) {
  window.dispatchEvent(new CustomEvent("gochauffeur:analytics", { detail: { event, ...parameters } }));
}

export function campaignReference() {
  const key = "gochauffeur:landing:v1";
  try {
    const stored = sessionStorage.getItem(key);
    if (stored) return stored;
    const search = new URLSearchParams(window.location.search);
    const reference = ["utm_source", "utm_medium", "utm_campaign"]
      .map((name) => search.get(name)?.replace(/[\r\n]/g, " ").slice(0, 100) || "-")
      .join(" / ");
    const value = reference === "- / - / -" ? "direct" : reference;
    sessionStorage.setItem(key, value);
    return value;
  } catch { return "direct"; }
}
