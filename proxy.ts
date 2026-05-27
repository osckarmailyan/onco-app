import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/admin/:path*",
};

export function proxy(request: NextRequest) {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return new NextResponse("Admin access is not configured.", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const providedUser = decoded.slice(0, separatorIndex);
      const providedPassword = decoded.slice(separatorIndex + 1);

      if (providedUser === user && providedPassword === password) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    headers: {
      "WWW-Authenticate": 'Basic realm="OncoExperts Admin"',
    },
    status: 401,
  });
}
