import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/home", req.url));
}

export const config = {
  matcher: "/:path*",
};
