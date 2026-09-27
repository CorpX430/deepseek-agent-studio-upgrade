import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/api/chat(.*)", "/api/character(.*)", "/api/web3(.*)"]);

export default clerkMiddleware(async (_auth, request) => {
  if (!isPublicRoute(request)) {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) return NextResponse.redirect(new URL("/", request.url));
  }
});

export const config = { matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"] };
