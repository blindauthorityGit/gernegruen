import {createDataAttribute} from "next-sanity";

export function sanityDataAttribute(id: string, type: string, path: string) {
  return createDataAttribute({
    projectId: "zqaggz4f",
    dataset: "production",
    id,
    type,
    path,
  }).toString();
}
