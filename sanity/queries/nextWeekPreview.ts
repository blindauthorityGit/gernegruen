import {defineQuery} from "next-sanity"

export const NEXT_WEEK_PREVIEWS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "nextWeekPreview" &&
    isEnabled == true &&
    offerWeek == $offerWeek &&
    defined(title) &&
    defined(description) &&
    count(products[defined(name) && defined(image.asset)]) > 0
  ] | order(publicationDate desc, _updatedAt desc, _id asc) {
    _id,
    _updatedAt,
    title,
    description,
    offerWeek,
    publicationDate,
    products[defined(name) && defined(image.asset)] {
      _key,
      name,
      label,
      additionalText,
      "image": {
        "src": image.asset->url,
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height,
        "lqip": image.asset->metadata.lqip
      }
    }
  }
`)
