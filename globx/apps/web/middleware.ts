import type { NextMiddleware } from "next/server";
import { auth } from "./auth-middleware";

const publicPaths = ["/", "/auth/signin", "/auth/signup", "/auth/error"];

const middleware = auth((req: any) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isPublic = publicPaths.includes(path) || path.startsWith("/api/auth");

  if (isPublic) {
    if (path.startsWith("/api/")) return;
    if (path.startsWith("/auth/") && isLoggedIn) {
      return Response.redirect(new URL("/dashboard", req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    const signIn = new URL("/auth/signin", req.nextUrl.origin);
    signIn.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return Response.redirect(signIn);
  }
});

export default middleware as unknown as NextMiddleware;
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
