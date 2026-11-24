export type AnalyticsEvent = "whatsapp_click" | "generate_lead" | "widget_service_select" | "select_content" | "faq_open" | "filter_select";

export const GA_ID = "G-S7JNWFEMBM";
export const CONSENT_KEY = "gochauffeur:analytics-consent:v1";
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Partial<Record<`ga-disable-${string}`, boolean>>;

export function configureAnalytics(accepted: boolean) {
  const browser = window as unknown as AnalyticsWindow;
  browser[`ga-disable-${GA_ID}`] = !accepted;
  if (!accepted) return;
  if (browser.gtag) return;
  browser.dataLayer = browser.dataLayer || [];
  // Google tag's command queue expects an Arguments object, not an array.
  // eslint-disable-next-line prefer-rest-params
  browser.gtag = function () { browser.dataLayer!.push(arguments); };
  browser.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  browser.gtag("js", new Date());
  browser.gtag("config", GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

export function track(event: AnalyticsEvent, parameters: Record<string, string | number | null> = {}) {
  window.dispatchEvent(new CustomEvent("gochauffeur:analytics", { detail: { event, ...parameters } }));
  const browser = window as unknown as AnalyticsWindow;
  if (browser[`ga-disable-${GA_ID}`] === false) {
    // A WhatsApp handoff is an enquiry attempt, not a confirmed lead.
    if (event === "generate_lead") return;
    browser.gtag?.("event", event, parameters);
  }
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
