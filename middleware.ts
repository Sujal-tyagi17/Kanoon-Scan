import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedPage = createRouteMatcher([
  "/dashboard(.*)",
  "/vault(.*)",
  "/scan(.*)",
  "/analysis(.*)",
]);

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// Webhooks are authenticated by their own signature, not a Clerk session.
const isPublicApi = createRouteMatcher(["/api/webhooks(.*)"]);
const isApi = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

export default clerkMiddleware(
  (auth, req) => {
    const { userId } = auth();

    // Signed-in users hitting /sign-in or /sign-up go straight to the app.
    if (userId && isAuthPage(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // API routes answer with JSON 401 instead of an HTML redirect.
    if (isApi(req) && !isPublicApi(req) && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isProtectedPage(req)) {
      // Sends signed-out visitors to our own /sign-in page (not Clerk's hosted one)
      // and brings them back to the page they asked for afterwards.
      auth().protect();
    }
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
