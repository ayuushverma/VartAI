import { auth } from "@/auth";
import { NextResponse } from "next/server";

const privatePaths = ["/practice", "/progress", "/settings", "/conversation", "/session"];

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isPrivate = privatePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (isPrivate && !request.auth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.auth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};