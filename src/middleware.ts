import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow access to login page
    if (req.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check if user is authenticated for admin routes
    const token = req.nextauth.token;
    if (!token && req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login page without auth
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // Require auth for other admin routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
