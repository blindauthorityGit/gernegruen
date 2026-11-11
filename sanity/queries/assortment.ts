import {defineQuery} from "next-sanity"

export const CURRENT_ASSORTMENT_QUERY = defineQuery(/* groq */ `
  *[_id == "startPage"][0].assortmentSection {
    enabled,
    "edition": ((editions[]->)[
      isEnabled == true
    ] | order(_updatedAt desc, _id asc))[0] {
      "id": _id,
      _type,
      topline, heading, description, cta,
      bakeryHighlights {
        bread {_key, title, description, ingredients, price},
        cake {_key, title, description, ingredients, price}
      },
      promotionPreview {
        title, intro, cta,
        entries[] {_key, title, description, ingredients, price}
      }
    }
  }
`)
