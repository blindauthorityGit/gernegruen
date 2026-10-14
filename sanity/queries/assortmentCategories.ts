import {defineQuery} from "next-sanity";

export const ASSORTMENT_CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_id == "assortmentPage" && isVisible != false][0] {
    _id,
    seoTitle, seoDescription, seoKeywords,
    heroTitle, heroDescription, badgeVisible, badgeTitle, badgeText, brandsHeading,
    productWish {isVisible, eyebrow, heading, description, disclaimer, buttonLabel, imageAlt, "imageSrc": image.asset->url},
    gallery {isVisible, eyebrow, heading, description, "images": images[]{_key, altText, caption, "image": image{crop, hotspot, "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}},
    "groups": groups[isVisible != false] {
      key, title,
      "categories": (categories[]->)[isVisible != false] | order(sortOrder asc) {
        _id, title, "slug": slug.current, description, examples, badgeText, imageAlt, ctaLabel, ctaHref,
        "iconUrl": icon.asset->url,
        "imageUrl": image.asset->url
      }
    }
  }
`);

export const PRODUCT_WISH_QUERY = defineQuery(/* groq */ `
  *[_id == "assortmentPage" && _type == "assortmentPage"][0] {
    _id,
    productWish {
      isVisible,
      eyebrow,
      heading,
      description,
      disclaimer,
      buttonLabel,
      imageAlt,
      "imageSrc": image.asset->url
    }
  }
`);
