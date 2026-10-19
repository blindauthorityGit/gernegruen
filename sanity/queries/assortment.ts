import {defineQuery} from "next-sanity"

export const CURRENT_ASSORTMENT_QUERY = defineQuery(/* groq */ `
  *[_id == "startPage"][0].assortmentSection {
    enabled,
    "edition": ((editions[]->)[
      isEnabled == true
    ] | order(_updatedAt desc, _id asc))[0] {
      "id": _id,
      _type,
      topline, heading, description, callout, cta,
      cards[] {
        _key, title, intro, note, marker, cta,
        "image": {
          "src": image.asset->url,
          "alt": imageAlt,
          "crop": image.crop,
          "hotspot": image.hotspot
        },
        entries[] {_key, title, description}
      }
    }
  }
`)
