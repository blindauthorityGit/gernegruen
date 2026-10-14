import {draftMode} from "next/headers";
import {NextResponse} from "next/server";

export async function GET() {
  (await draftMode()).disable();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", siteUrl));
}
