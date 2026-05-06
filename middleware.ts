import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/dashboard/landlord") && token?.role !== "LANDLORD") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/dashboard/investor") && token?.role !== "INVESTOR") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/dashboard/developer") && token?.role !== "DEVELOPER") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = { matcher: ["/dashboard/:path*"] };
