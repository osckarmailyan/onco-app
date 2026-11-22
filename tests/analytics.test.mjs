import assert from "node:assert/strict";
import test from "node:test";
import { createAnalyticsEvent } from "../lib/analytics.ts";

test("analytics exposes only fixed event, route and placement fields", () => {
  assert.deepEqual(createAnalyticsEvent("cta_click", "/", "hero"), {event:"cta_click", page:"/", placement:"hero"});
  assert.deepEqual(createAnalyticsEvent("payment_success", "/success", "status"), {event:"payment_success", page:"/success", placement:"status"});
});

test("analytics rejects private routes, tokens, complete URLs and personal text", () => {
  for (const page of ["/admin", "/api/booking/status", "/result/private-id", "/success?token=private", "/request?email=user@example.com", "https://www.oncoexperts.ru/request", null]) {
    assert.equal(createAnalyticsEvent("page_view", page, "page"), null);
  }
  for (const placement of ["user@example.com", "Переживания о диагнозе", {email:"user@example.com"}, undefined]) {
    assert.equal(createAnalyticsEvent("contact_click", "/request", placement), null);
  }
  assert.equal(createAnalyticsEvent("diagnosis_submitted", "/request", "booking"), null);
});

test("visiting a result route does not count as a page view or a paid conversion", () => {
  assert.equal(createAnalyticsEvent("page_view", "/success", "page"), null);
  assert.equal(createAnalyticsEvent("payment_success", "/request", "booking"), null);
  assert.equal(createAnalyticsEvent("payment_redirect", "/", "hero"), null);
});
