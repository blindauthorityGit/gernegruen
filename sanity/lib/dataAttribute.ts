import {createDataAttribute} from "next-sanity";

const studioBaseUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio";

export function sanityDataAttribute(id: string, type: string, path: string) {
  return createDataAttribute({
    projectId: "zqaggz4f",
    dataset: "production",
    id,
    type,
    path,
    baseUrl: studioBaseUrl,
  }).toString();
}
