import {createClient} from "next-sanity";

const siteUrl = process.env.NEXT_PUBLIC_SANITY_PREVIEW_URL || (
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL || "https://gernegruen.de"
);

export const liveClient = createClient({
  projectId: "zqaggz4f",
  dataset: "production",
  apiVersion: "2026-09-17",
  useCdn: true,
  stega: {studioUrl: `${siteUrl.replace(/\/$/, "")}/studio`},
});
