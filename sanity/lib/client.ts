import "server-only";
import { createClient } from "next-sanity";

const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN;

export const sanityClient = createClient({
  projectId: "zqaggz4f",
  dataset: "production",
  apiVersion: "2026-09-17",
  token,
  useCdn: !token,
});
