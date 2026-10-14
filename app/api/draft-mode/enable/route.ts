import {defineEnableDraftMode} from "next-sanity/draft-mode";
import {sanityClient} from "@/sanity/lib/client";

const serverToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

export const GET = serverToken
  ? defineEnableDraftMode({client: sanityClient.withConfig({token: serverToken})}).GET
  : async () => new Response("Für die Vorschau fehlt ein Sanity-API-Token mit Leserechten.", {status: 503});
