import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthState } from "./lib/admin-auth";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function proxy(request: NextRequest) {
  const state = getAdminAuthState(request.headers.get("authorization"));
  let response: NextResponse;

  if (state === "authorized") {
    response = NextResponse.next();
  } else if (state === "unconfigured") {
    response = new NextResponse("Admin access is not configured.", { status: 503 });
  } else {
    response = new NextResponse("Authentication required.", {
      headers: { "WWW-Authenticate": 'Basic realm="OncoExperts Admin", charset="UTF-8"' },
      status: 401,
    });
  }

  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
