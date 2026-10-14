import {defineQuery} from "next-sanity";

export const CONTACT_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "contactPage" && _type == "contactPage" && isVisible != false][0] {
    seoTitle, seoDescription, seoKeywords,
    hero {headline, headlineAccent, description, imageAlt, "image": image.asset->url},
    cards {isVisible, openingHoursHeading, contactHeading},
    directions {isVisible, heading, description, mapZoom, routeLabel},
    "travelBenefits": *[_id == "aboutPage" && _type == "aboutPage"][0].benefits.items[
      title in ["Fahrradstellplätze", "Freie Parkplätze", "Parkplätze"]
    ] {title, description, iconAlt, "icon": icon.asset->url}
  }
`);
