import {defineQuery} from "next-sanity";

export const ABOUT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "aboutPage" && _type == "aboutPage" && isVisible != false][0] {
    seoTitle, seoDescription,
    hero {headline, headlineAccent, description, ctaLabel, ctaHref, imageAlt, "image": image.asset->url},
    timeline {isVisible, heading, "milestones": milestones[defined(year)] | order(sortOrder asc) {_key, year, title, description, imageAlt, "image": image.asset->url}},
    gallery {isVisible, eyebrow, heading, description, "images": images[isVisible != false] | order(sortOrder asc) {_key, title, caption, altText, "image": image{crop, hotspot, "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}},
    benefits {isVisible, heading, "items": items[isVisible != false] | order(sortOrder asc) {_key, title, description, iconAlt, "icon": icon.asset->url}},
    contact {heading, description, ctaLabel, ctaHref, imageAlt, "image": image.asset->url}
  }
`);
