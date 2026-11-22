"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createAnalyticsEvent, trackAnalytics, type AnalyticsEventName, type AnalyticsPlacement } from "@/lib/analytics";

/** An integration point for one approved analytics provider; nothing is sent or stored by this component. */
export function AnalyticsEvents() {
  const pathname = usePathname();
  const previousPage = useRef<string | null>(null);
  useEffect(() => {
    if (previousPage.current === pathname) return;
    previousPage.current = pathname;
    trackAnalytics("page_view", "page");
    if (pathname === "/request") trackAnalytics("booking_start", "booking");
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>("[data-analytics-event]");
      if (!target) return;
      const name = target.dataset.analyticsEvent;
      const placement = target.dataset.analyticsPlacement;
      if (createAnalyticsEvent(name, window.location.pathname, placement)) {
        trackAnalytics(name as AnalyticsEventName, placement as AnalyticsPlacement);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
