/**
 * Next.js Middleware to enable Clerk authentication on server routes.
 *
 * This ensures server-side `auth()` can detect clerk middleware usage.
 * See: https://clerk.com/docs
 */
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Apply the middleware to API routes and all app pages (excluding next internals)
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
