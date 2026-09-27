import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/api/chat(.*)", "/api/character(.*)", "/api/web3(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) { const authState = await auth() as { protect?: () => void }; authState.protect?.(); }
});

export const config = { matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"] };
