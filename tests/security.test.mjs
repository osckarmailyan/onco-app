import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { getAdminAuthState } from "../lib/admin-auth.ts";
import { POST as sendLegacyEmail } from "../app/api/send-email/route.ts";
import { POST as submitLegacyRequest } from "../app/api/submit-request/route.ts";

const originalUser = process.env.ADMIN_USER;
const originalPassword = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_USER = "test-admin";
  process.env.ADMIN_PASSWORD = "test-password:with-colon";
});

after(() => {
  if (originalUser === undefined) delete process.env.ADMIN_USER;
  else process.env.ADMIN_USER = originalUser;
  if (originalPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalPassword;
});

function basic(value) {
  return `Basic ${Buffer.from(value).toString("base64")}`;
}

test("admin requires exact credentials and handles passwords containing colons", () => {
  assert.equal(getAdminAuthState(basic("test-admin:test-password:with-colon")), "authorized");
  assert.equal(getAdminAuthState(basic("test-admin:wrong")), "unauthorized");
  assert.equal(getAdminAuthState(basic("other:test-password:with-colon")), "unauthorized");
});

test("malformed and missing authorization fail closed without throwing", () => {
  for (const value of [null, "", "Basic %invalid", "Bearer token", "Basic A===", "Basic AAA", "Basic " + "A".repeat(9000)]) {
    assert.equal(getAdminAuthState(value), "unauthorized");
  }
});

test("admin stays closed when its configuration is missing", () => {
  delete process.env.ADMIN_PASSWORD;
  assert.equal(getAdminAuthState(basic("test-admin:")), "unconfigured");
});

test("legacy document and mail endpoints are retired without processing input", async () => {
  for (const handler of [sendLegacyEmail, submitLegacyRequest]) {
    const response = await handler();
    assert.equal(response.status, 410);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).bookingUrl, "/request");
  }
});
