/** Anonymous browser events only. No transport, cookies, storage, or external analytics SDK. */
const publicPages = new Set(["/", "/about", "/request", "/terms", "/privacy", "/consent"]);
const eventNames = new Set(["page_view", "cta_click", "booking_start", "contact_click", "booking_form_submit", "payment_redirect", "payment_success"]);
const placements = new Set(["page", "hero", "service", "doctor", "faq", "closing", "sticky", "navigation", "booking", "status", "footer"]);

export type AnalyticsEventName = "page_view" | "cta_click" | "booking_start" | "contact_click" | "booking_form_submit" | "payment_redirect" | "payment_success";
export type AnalyticsPlacement = "page" | "hero" | "service" | "doctor" | "faq" | "closing" | "sticky" | "navigation" | "booking" | "status" | "footer";
export type AnalyticsEvent = { event: AnalyticsEventName; page: string; placement: AnalyticsPlacement };

export function createAnalyticsEvent(event: unknown, page: unknown, placement: unknown): AnalyticsEvent | null {
  if (typeof event !== "string" || !eventNames.has(event) || typeof page !== "string" || typeof placement !== "string" || !placements.has(placement)) return null;
  // A token-bearing payment URL is never included. Only the literal route is permitted for its verified result.
  if (!publicPages.has(page) && !(page === "/success" && event === "payment_success" && placement === "status")) return null;
  if (["booking_form_submit", "payment_redirect"].includes(event) && page !== "/request") return null;
  if (event === "payment_success" && (page !== "/success" || placement !== "status")) return null;
  return { event: event as AnalyticsEventName, page, placement: placement as AnalyticsPlacement };
}

export function trackAnalytics(event: AnalyticsEventName, placement: AnalyticsPlacement) {
  if (typeof window === "undefined") return;
  const detail = createAnalyticsEvent(event, window.location.pathname, placement);
  if (detail) window.dispatchEvent(new CustomEvent<AnalyticsEvent>("oncoexperts:analytics", { detail }));
}
