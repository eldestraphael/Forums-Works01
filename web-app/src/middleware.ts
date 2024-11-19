export { default } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = req.headers.get("authorization");
  const next_auth_session = await getToken({ req });
  var path = req.nextUrl.pathname;
  const isPublic = path == "/sign-in" || path === "/reset-password";
  if (req.url.includes("/api")) {
    if (next_auth_session || isPublicAPI(req.url)) {
      return NextResponse.next();
    }
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else {
    if (isPublic && next_auth_session) {
      if (isPublic) {
        return NextResponse.redirect(new URL("/forums", req.url));
      }
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!isPublic && !next_auth_session) {
      // return NextResponse.redirect(new URL("/sign-in", req.url));
      return NextResponse.redirect(
        new URL(
          `/sign-in?path_name=${req.nextUrl.pathname}&params=${req.nextUrl.search}`,
          req.url
        )
      );
    }
  }
}

function isPublicAPI(url: any) {
  const publicAPIEndpoints = [
    "/api/auth/providers",
    "/api/auth/csrf",
    "/api/auth/callback/credentials",
    "/api/auth/session",
    "/api/auth/sign-in",
    "/report",
    "/request-reset-password",
    "/set-new-password",
  ];
  return publicAPIEndpoints.some((endpoint) => url.includes(endpoint));
}

export const config = {
  matcher: [
    "/home",
    "/users/:path*",
    "/companies/:path*",
    "/forums/:path*",
    "/courses/:path*",
    // "/admin/:path*",
    "/sign-in",
    "/sign-up",
    "/api/admin/:path*",
    "/forum_experience",
    "/zoom_video",
    "/api/:path*",
  ],
};
