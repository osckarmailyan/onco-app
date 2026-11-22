import { createHash, timingSafeEqual } from "node:crypto";

export type AdminAuthState = "authorized" | "unauthorized" | "unconfigured";

/** Shared by the route boundary and server-rendered admin page. */
export function getAdminAuthState(authorization: string | null): AdminAuthState {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) return "unconfigured";
  if (!authorization || authorization.length > 8192) return "unauthorized";

  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization);
  if (!match || match[1].length % 4 !== 0) return "unauthorized";

  try {
    const encoded = match[1];
    const credentials = Buffer.from(encoded, "base64");
    if (credentials.toString("base64") !== encoded) return "unauthorized";

    const suppliedHash = createHash("sha256").update(credentials).digest();
    const expectedHash = createHash("sha256").update(`${user}:${password}`).digest();

    return timingSafeEqual(suppliedHash, expectedHash) ? "authorized" : "unauthorized";
  } catch {
    return "unauthorized";
  }
}
