import {defineLive} from "next-sanity/live";
import {liveClient} from "@/sanity/lib/liveClient";

const serverToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;
const browserToken = process.env.SANITY_API_READ_TOKEN;

export const {sanityFetch, SanityLive} = defineLive({
  client: liveClient,
  serverToken,
  browserToken,
});

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: {stega?: boolean} = {},
): Promise<T> {
  const result = await sanityFetch({query, params, ...options});
  return result.data as T;
}
